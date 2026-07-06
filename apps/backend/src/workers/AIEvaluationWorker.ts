import { Worker } from 'bullmq';
import type { Prisma } from '@prisma/client';
import { prisma } from '../config/db.js';
import { env } from '../config/env.js';
import {
    evaluateDSA,
    evaluateSystemDesign,
    evaluateBehavioral,
    type BehavioralTranscriptTurn,
    type SystemDesignEvaluationAIResult,
} from '../services/AIService.js';
import {
    buildEvaluationCacheKey,
    getCachedEvaluation,
    setCachedEvaluation,
    type DSAEvaluationCachePayload,
    buildSystemDesignEvaluationCacheKey,
    setCachedSystemDesignEvaluation,
    type SystemDesignEvaluationCachePayload,
    buildBehavioralEvaluationCacheKey,
    getCachedBehavioralEvaluation,
    setCachedBehavioralEvaluation,
    type BehavioralEvaluationCachePayload,
} from '../services/CacheService.js';
import {
    AI_EVAL_QUEUE_NAME,
    type AIEvalJobData,
    type SystemDesignEvalJobData,
    type BehavioralEvalJobData,
    type AIQueueJobData,
} from '../services/QueueService.js';
import {
    computeOverallScore,
    parseDeliverables,
    parseEvaluationMetrics,
    parseFollowUpAnswers,
    parseFollowUpQuestions,
    parseRequirements,
} from '../types/system-design.types.js';

let aiEvaluationWorker: Worker<AIQueueJobData> | undefined;

function getWorkerConnectionOptions() {
    if (!env.REDIS_URL) {
        throw new Error(
            'REDIS_URL is not configured.',
        );
    }
    return {
        url: env.REDIS_URL,
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
    } as const;
}

//if not exist -> create else update
async function persistEvaluation(
    data: AIEvalJobData,
    payload: DSAEvaluationCachePayload,
): Promise<void> {
    await prisma.dsaEvaluation.upsert({
        where: { submissionId: data.submissionId },
        create: {
            submissionId: data.submissionId,
            userId: data.userId,
            problemId: data.problemId,
            overallScore: payload.overallScore,
            correctnessScore: payload.correctnessScore,
            efficiencyScore: payload.efficiencyScore,
            codeQualityScore: payload.codeQualityScore,
            explanationScore: payload.explanationScore,
            complexityAnalysis: payload.complexityAnalysis as unknown as Prisma.InputJsonValue,
            followUpQuestions: payload.followUpQuestions as Prisma.InputJsonValue,
            feedback: payload.feedback,
            suggestions: payload.suggestions as Prisma.InputJsonValue,
            model: payload.model,
            tokensUsed: payload.tokensUsed,
        },
        update: {},
    });
}

async function persistSystemDesignEvaluation(
    data: SystemDesignEvalJobData,
    payload: SystemDesignEvaluationCachePayload,
): Promise<void> {
    const submission = await prisma.systemDesignSubmission.findUnique({
        where: { id: data.submissionId },
        include: { question: true },
    });

    if (!submission) {
        throw new Error(`System design submission ${data.submissionId} not found`);
    }

    if (submission.userId !== data.userId || submission.questionId !== data.questionId) {
        throw new Error('Job data does not match system design submission record');
    }

    const hasText = submission.textAnswer != null && submission.textAnswer.trim().length > 0;
    const hasDiagram = submission.diagramUrl != null;

    if (!hasText && !hasDiagram) {
        throw new Error(
            'Initial system design submission must include a text answer, diagram, or both.',
        );
    }

    if (submission.followUpQuestions == null || submission.followUpAnswers == null) {
        throw new Error('System design follow-ups must be generated and answered before evaluation');
    }

    const evaluationMetrics = parseEvaluationMetrics(
        submission.question.evaluationMetrics,
    );

    const overallScore = computeOverallScore(
        payload.metricScores,
        evaluationMetrics,
    );

    await prisma.systemDesignEvaluation.upsert({
        where: { submissionId: data.submissionId },
        create: {
            submissionId: data.submissionId,
            userId: data.userId,
            questionId: data.questionId,
            overallScore,
            metricScores: payload.metricScores as unknown as Prisma.InputJsonValue,
            strengths: payload.strengths as Prisma.InputJsonValue,
            weaknesses: payload.weaknesses as Prisma.InputJsonValue,
            followUpQuestions: payload.followUpQuestions as Prisma.InputJsonValue,
            feedback: payload.feedback,
            suggestions: payload.suggestions as Prisma.InputJsonValue,
            model: payload.model,
            tokensUsed: payload.tokensUsed,
        },
        update: {},
    });
}

async function persistBehavioralEvaluation(
    data: BehavioralEvalJobData,
    payload: BehavioralEvaluationCachePayload,
): Promise<void> {
    await prisma.behavioralEvaluation.upsert({
        where: { sessionId: data.sessionId },
        create: {
            sessionId: data.sessionId,
            userId: data.userId,
            questionId: data.questionId,
            evaluationMetrics: payload.evaluationMetrics as unknown as Prisma.InputJsonValue,
            strongestAnswer: payload.strongestAnswer as unknown as Prisma.InputJsonValue,
            weakestAnswer: payload.weakestAnswer as unknown as Prisma.InputJsonValue,
            strengths: payload.strengths as Prisma.InputJsonValue,
            weaknesses: payload.weaknesses as Prisma.InputJsonValue,
            suggestions: payload.suggestions as Prisma.InputJsonValue,
            summary: payload.summary,
            model: payload.model,
            tokensUsed: payload.tokensUsed,
        },
        update: {},
    });
}

//changes id->turnId
function buildBehavioralTranscript(
    turns: Array<{
        id: string;
        phaseType: string;
        orderIndex: number;
        questionIndexInPhase: number;
        questionText: string;
        candidateAnswerText: string | null;
        interviewerReplyText: string | null;
        isFollowUp: boolean;
    }>,
): BehavioralTranscriptTurn[] {
    return turns.map((turn) => ({
        turnId: turn.id,
        phaseType: turn.phaseType,
        orderIndex: turn.orderIndex,
        questionIndexInPhase: turn.questionIndexInPhase,
        questionText: turn.questionText,
        candidateAnswerText: turn.candidateAnswerText,
        interviewerReplyText: turn.interviewerReplyText,
        isFollowUp: turn.isFollowUp,
    }));
}

//checks dsaevalauation table
//if submission exists - return
//if not then get submission
//if not submission - error
//checks redis -> if not then evaluate -> update redis and db
async function processAIEvalJob(data: AIEvalJobData): Promise<void> {
    const existing = await prisma.dsaEvaluation.findUnique({
        where: { submissionId: data.submissionId },
    });

    if (existing) {
        return;
    }

    const submission = await prisma.submission.findUnique({
        where: { id: data.submissionId },
        include: { problem: true }, //fetches related problem
    });

    if (!submission) {
        throw new Error(`Submission ${data.submissionId} not found`);
    }

    if (
        submission.userId !== data.userId ||
        submission.problemId !== data.problemId
    ) {
        throw new Error('Job data does not match submission record');
    }

    const cacheKey = buildEvaluationCacheKey(
        data.problemId,
        submission.language,
        submission.sourceCode,
    );

    let payload = await getCachedEvaluation(cacheKey);

    if (!payload) {
        payload = await evaluateDSA({
            problemTitle: submission.problem.title,
            problemDescription: submission.problem.description,
            difficulty: submission.problem.difficulty,
            topics: submission.problem.topics,
            constraints: submission.problem.constraints,
            language: submission.language,
            sourceCode: submission.sourceCode,
            submissionStatus: submission.status,
            passedTests: submission.passedTests,
            totalTests: submission.totalTests,
        });

        await setCachedEvaluation(cacheKey, payload);
    }

    await persistEvaluation(data, payload);
}

async function processSystemDesignEvalJob(
    data: SystemDesignEvalJobData,
): Promise<void> {
    const existing = await prisma.systemDesignEvaluation.findUnique({
        where: { submissionId: data.submissionId },
    });

    if (existing) {
        return;
    }

    const submission = await prisma.systemDesignSubmission.findUnique({
        where: { id: data.submissionId },
        include: { question: true },
    });

    if (!submission) {
        throw new Error(`System design submission ${data.submissionId} not found`);
    }

    if (submission.userId !== data.userId || submission.questionId !== data.questionId) {
        throw new Error('Job data does not match system design submission record');
    }

    const followUpQuestions = parseFollowUpQuestions(submission.followUpQuestions);
    const followUpAnswers = parseFollowUpAnswers(submission.followUpAnswers);
    const requirements = parseRequirements(submission.question.requirements);
    const deliverables = parseDeliverables(submission.question.deliverables);
    const evaluationMetrics = parseEvaluationMetrics(
        submission.question.evaluationMetrics,
    );

    const cacheKey = buildSystemDesignEvaluationCacheKey({
        questionId: submission.questionId,
        textAnswer: submission.textAnswer,
        diagramUrl: submission.diagramUrl,
        followUpQuestions,
        followUpAnswers,
    });

    const aiResult: SystemDesignEvaluationAIResult = await evaluateSystemDesign({
        questionTitle: submission.question.title,
        questionDescription: submission.question.description,
        requirements,
        deliverables,
        constraints: submission.question.constraints,
        scaleFactors: submission.question.scaleFactors,
        evaluationMetrics,
        textAnswer: submission.textAnswer,
        diagramUrl: submission.diagramUrl,
        followUpQuestions,
        followUpAnswers,
    });

    const cachePayload: SystemDesignEvaluationCachePayload = {
        metricScores: aiResult.metricScores,
        strengths: aiResult.strengths,
        weaknesses: aiResult.weaknesses,
        followUpQuestions: aiResult.followUpQuestions,
        feedback: aiResult.feedback,
        suggestions: aiResult.suggestions,
        model: aiResult.model,
        tokensUsed: aiResult.tokensUsed,
    };

    await setCachedSystemDesignEvaluation(cacheKey, cachePayload);
    await persistSystemDesignEvaluation(data, cachePayload);
}

async function processBehavioralEvalJob(
    data: BehavioralEvalJobData,
): Promise<void> {
    const existing = await prisma.behavioralEvaluation.findUnique({
        where: { sessionId: data.sessionId },
    });

    if (existing) {
        return;
    }

    const session = await prisma.behavioralSession.findUnique({
        where: { id: data.sessionId },
        include: {
            question: true,
            turns: {
                orderBy: { orderIndex: 'asc' },
            },
        },
    });

    if (!session) {
        throw new Error(`Behavioral session ${data.sessionId} not found`);
    }

    if (session.userId !== data.userId || session.questionId !== data.questionId) {
        throw new Error('Job data does not match behavioral session record');
    }

    if (session.status !== 'COMPLETED') {
        throw new Error('Behavioral session must be completed before evaluation');
    }

    const transcript = buildBehavioralTranscript(session.turns);

    const cacheKey = buildBehavioralEvaluationCacheKey({
        questionId: session.questionId,
        resumeText: session.resumeText,
        transcript,
    });

    let payload = await getCachedBehavioralEvaluation(cacheKey);

    if (!payload) {
        const aiResult = await evaluateBehavioral({
            companyName: session.question.companyName,
            roleName: session.question.roleName,
            questionTitle: session.question.title,
            questionDescription: session.question.description,
            resumeText: session.resumeText,
            transcript,
        });

        payload = {
            evaluationMetrics: aiResult.evaluationMetrics,
            strongestAnswer: aiResult.strongestAnswer,
            weakestAnswer: aiResult.weakestAnswer,
            strengths: aiResult.strengths,
            weaknesses: aiResult.weaknesses,
            suggestions: aiResult.suggestions,
            summary: aiResult.summary,
            model: aiResult.model,
            tokensUsed: aiResult.tokensUsed,
        };

        await setCachedBehavioralEvaluation(cacheKey, payload);
    }
    await persistBehavioralEvaluation(data, payload);
}

//worker running (bullmq listening to redis continuosly for jobs)
export function startAIEvaluationWorker(): Worker<AIQueueJobData> {
    if (aiEvaluationWorker) {
        return aiEvaluationWorker;
    }

    aiEvaluationWorker = new Worker<AIQueueJobData>(
        AI_EVAL_QUEUE_NAME,
        async (job) => {
            if (job.name === 'evaluate-dsa') {
                await processAIEvalJob(job.data as AIEvalJobData);
                return;
            }

            if (job.name === 'evaluate-system-design') {
                await processSystemDesignEvalJob(job.data as SystemDesignEvalJobData);
                return;
            }

            if (job.name === 'evaluate-behavioral') {
                await processBehavioralEvalJob(job.data as BehavioralEvalJobData);
                return;
            }

            throw new Error(`Unknown AI evaluation job: ${job.name}`);
        },
        {
            connection: getWorkerConnectionOptions(),
            concurrency: 2,
        },
    );

    //inbuilt states: completed/failed
    aiEvaluationWorker.on('completed', (job) => {
        console.log(`AI evaluation job completed: ${job.id}`);
    });

    aiEvaluationWorker.on('failed', (job, err) => {
        console.error(`AI evaluation job failed: ${job?.id}`, err);
    });

    console.log(`AI evaluation worker listening on "${AI_EVAL_QUEUE_NAME}"`);

    return aiEvaluationWorker;
}

export async function stopAIEvaluationWorker(): Promise<void> {
    if (!aiEvaluationWorker) {
        return;
    }

    await aiEvaluationWorker.close();
    aiEvaluationWorker = undefined;
}

