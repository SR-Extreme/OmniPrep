import { Worker } from 'bullmq';
import type { Prisma } from '@prisma/client';
import { prisma } from '../config/db.js';
import { env } from '../config/env.js';
import { evaluateDSA } from '../services/AIService.js';
import {
    buildEvaluationCacheKey,
    getCachedEvaluation,
    setCachedEvaluation,
    type DSAEvaluationCachePayload,
} from '../services/CacheService.js';
import {
    AI_EVAL_QUEUE_NAME,
    type AIEvalJobData,
} from '../services/QueueService.js';

let aiEvaluationWorker: Worker<AIEvalJobData> | undefined;

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

//worker running (bullmq listening to redis continuosly for jobs)
export function startAIEvaluationWorker(): Worker<AIEvalJobData> {
    if (aiEvaluationWorker) {
        return aiEvaluationWorker;
    }

    aiEvaluationWorker = new Worker<AIEvalJobData>(
        AI_EVAL_QUEUE_NAME,
        async (job) => {
            await processAIEvalJob(job.data);
        },
        {
            connection: getWorkerConnectionOptions(),
            concurrency: 2,
        },
    );

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

