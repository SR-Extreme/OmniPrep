import type { Prisma, Role } from '@prisma/client';
import { prisma } from '../../config/db.js';
import {
    buildSystemDesignEvaluationCacheKey,
    getCachedSystemDesignEvaluation,
    type SystemDesignEvaluationCachePayload,
} from '../../services/CacheService.js';
import {
    enqueueSystemDesignEvaluation,
    getSystemDesignEvalJobState,
} from '../../services/QueueService.js';
import {
    computeOverallScore,
    parseEvaluationMetrics,
    parseFollowUpAnswers,
    parseFollowUpQuestions,
    parseMetricScores,
    type SystemDesignEvaluationDetail,
} from '../../types/system-design.types.js';

export class SystemDesignEvaluationError extends Error {
    constructor(
        message: string,
        public readonly code:
            | 'NOT_FOUND'
            | 'FORBIDDEN'
            | 'INVALID_INPUT'
            | 'SERVICE_UNAVAILABLE',
    ) {
        super(message);
        this.name = 'SystemDesignEvaluationError';
    }
}

export type SystemDesignEvaluationStatus = 'completed' | 'pending' | 'failed';

export interface SystemDesignEvaluationResult {
    status: SystemDesignEvaluationStatus;
    evaluation?: SystemDesignEvaluationDetail;
}

function isAdmin(role: Role | undefined): boolean {
    return role === 'ADMIN';
}

function parseStringArray(value: unknown): string[] {
    if (!Array.isArray(value)) {
        return [];
    }
    return value.filter((item): item is string => typeof item === 'string');
}

function toEvaluationDetail(row: {
    id: string;
    submissionId: string;
    questionId: string;
    overallScore: number;
    metricScores: unknown;
    strengths: unknown;
    weaknesses: unknown;
    followUpQuestions: unknown;
    feedback: string;
    suggestions: unknown;
    model: string;
    tokensUsed: number;
    createdAt: Date;
}): SystemDesignEvaluationDetail {
    return {
        id: row.id,
        submissionId: row.submissionId,
        questionId: row.questionId,
        overallScore: row.overallScore,
        metricScores: parseMetricScores(row.metricScores),
        strengths: parseStringArray(row.strengths),
        weaknesses: parseStringArray(row.weaknesses),
        followUpQuestions: parseStringArray(row.followUpQuestions),
        feedback: row.feedback,
        suggestions: parseStringArray(row.suggestions),
        model: row.model,
        tokensUsed: row.tokensUsed,
        createdAt: row.createdAt,
    };
}

async function loadSubmissionForEvaluation(
    submissionId: string,
    userId: string,
    role?: Role,
) {
    const submission = await prisma.systemDesignSubmission.findUnique({
        where: { id: submissionId },
        include: { question: true },
    });

    if (!submission) {
        throw new SystemDesignEvaluationError('Submission not found', 'NOT_FOUND');
    }

    if (!isAdmin(role) && submission.userId !== userId) {
        throw new SystemDesignEvaluationError('Forbidden', 'FORBIDDEN');
    }

    const hasText = submission.textAnswer != null && submission.textAnswer.trim().length > 0;
    const hasDiagram = submission.diagramUrl != null;

    if (!hasText && !hasDiagram) {
        throw new SystemDesignEvaluationError(
            'Initial submission must include a text answer, diagram, or both.',
            'INVALID_INPUT',
        );
    }

    if (submission.followUpQuestions == null) {
        throw new SystemDesignEvaluationError(
            'Generate follow-up questions before requesting AI review.',
            'INVALID_INPUT',
        );
    }

    if (submission.followUpAnswers == null) {
        throw new SystemDesignEvaluationError(
            'Submit follow-up answers before requesting AI review.',
            'INVALID_INPUT',
        );
    }

    return submission;
}

async function findExistingEvaluation(
    submissionId: string,
): Promise<SystemDesignEvaluationDetail | null> {
    const row = await prisma.systemDesignEvaluation.findUnique({
        where: { submissionId },
    });
    return row ? toEvaluationDetail(row) : null;
}

async function persistEvaluationFromCache(
    submissionId: string,
    userId: string,
    questionId: string,
    evaluationMetrics: ReturnType<typeof parseEvaluationMetrics>,
    payload: SystemDesignEvaluationCachePayload,
): Promise<SystemDesignEvaluationDetail> {
    const overallScore = computeOverallScore(
        payload.metricScores,
        evaluationMetrics,
    );

    const row = await prisma.systemDesignEvaluation.upsert({
        where: { submissionId },
        create: {
            submissionId,
            userId,
            questionId,
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

    return toEvaluationDetail(row);
}

function mapJobStateToStatus(
    state: Awaited<ReturnType<typeof getSystemDesignEvalJobState>>,
): SystemDesignEvaluationStatus {
    if (state === 'failed') {
        return 'failed';
    }

    return 'pending';
}

export async function requestSystemDesignEvaluation(
    submissionId: string,
    userId: string,
    role?: Role,
): Promise<SystemDesignEvaluationResult> {
    const submission = await loadSubmissionForEvaluation(
        submissionId,
        userId,
        role,
    );

    const evaluationMetrics = parseEvaluationMetrics(
        submission.question.evaluationMetrics,
    );

    const followUpQuestions = parseFollowUpQuestions(submission.followUpQuestions);
    const followUpAnswers = parseFollowUpAnswers(submission.followUpAnswers);

    const cacheKey = buildSystemDesignEvaluationCacheKey({
        questionId: submission.questionId,
        textAnswer: submission.textAnswer,
        diagramUrl: submission.diagramUrl,
        followUpQuestions,
        followUpAnswers,
    });

    try {
        const cached = await getCachedSystemDesignEvaluation(cacheKey);
        if (cached) {
            const evaluation = await persistEvaluationFromCache(
                submissionId,
                submission.userId,
                submission.questionId,
                evaluationMetrics,
                cached,
            );

            return { status: 'completed', evaluation };
        }
    } catch (err) {
        throw new SystemDesignEvaluationError(
            'AI evaluation service is unavailable. Check REDIS_URL.',
            'SERVICE_UNAVAILABLE',
        );
    }

    try {
        await enqueueSystemDesignEvaluation({
            submissionId,
            userId: submission.userId,
            questionId: submission.questionId,
        });
    } catch (err) {
        throw new SystemDesignEvaluationError(
            'AI evaluation service is unavailable. Check REDIS_URL.',
            'SERVICE_UNAVAILABLE',
        );
    }

    return { status: 'pending' };
}

export async function getSystemDesignEvaluation(
    submissionId: string,
    userId: string,
    role?: Role,
): Promise<SystemDesignEvaluationResult> {
    await loadSubmissionForEvaluation(submissionId, userId, role);

    const existing = await findExistingEvaluation(submissionId);
    if (existing) {
        return { status: 'completed', evaluation: existing };
    }

    try {
        const jobState = await getSystemDesignEvalJobState(submissionId);
        return { status: mapJobStateToStatus(jobState) };
    } catch (err) {
        throw new SystemDesignEvaluationError(
            'AI evaluation service is unavailable. Check REDIS_URL.',
            'SERVICE_UNAVAILABLE',
        );
    }
}