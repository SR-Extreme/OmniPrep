import type { Prisma, Role } from "@prisma/client";
import { prisma } from '../../config/db.js';
import {
    buildEvaluationCacheKey,
    getCachedEvaluation,
    type ComplexityAnalysis,
    type DSAEvaluationCachePayload,
} from '../../services/CacheService.js';
import {
    enqueueAIEvaluation,
    getAIEvalJobState,
} from '../../services/QueueService.js';

export class EvaluationError extends Error {
    constructor(
        message: string,
        public readonly code:
            | 'NOT_FOUND'
            | 'FORBIDDEN'
            | 'SAMPLE_RUN_NOT_ALLOWED'
            | 'SERVICE_UNAVAILABLE',
    ) {
        super(message);
        this.name = 'EvaluationError';
    }
}

export type EvaluationStatus = 'completed' | 'pending' | 'failed';

export interface DSAEvaluationDetail {
    id: string;
    submissionId: string;
    problemId: string;
    overallScore: number;
    correctnessScore: number;
    efficiencyScore: number;
    codeQualityScore: number;
    explanationScore: number;
    complexityAnalysis: ComplexityAnalysis;
    followUpQuestions: string[];
    feedback: string;
    suggestions: string[];
    model: string;
    tokensUsed: number;
    createdAt: Date;
}

/*
completed
The review is done. A DSAEvaluation row exists, and evaluation is included.
pending
The review isn’t ready yet — queued, running, or finished in the queue but not loaded from the DB on this request. evaluation is omitted.
failed
The background job failed (e.g. GPT/Redis/worker error). evaluation is omitted.

That's why completed => pending as it is done in the bullmq job queue but not updated in the db.
*/
export interface EvaluationResult {
    status: EvaluationStatus;
    evaluation?: DSAEvaluationDetail;
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

function parseComplexityAnalysis(value: unknown): ComplexityAnalysis {
    if (typeof value !== 'object' || value === null) {
        throw new EvaluationError('Invalid evaluation data', 'NOT_FOUND');
    }

    const row = value as Record<string, unknown>;
    const detected = row.detected as Record<string, unknown> | undefined;
    const optimal = row.optimal as Record<string, unknown> | undefined;

    return {
        detected: {
            time: String(detected?.time ?? 'Unknown'),
            space: String(detected?.space ?? 'Unknown'),
        },
        optimal: {
            time: String(optimal?.time ?? 'Unknown'),
            space: String(optimal?.space ?? 'Unknown'),
        },
        isOptimal: Boolean(row.isOptimal),
        notes: typeof row.notes === 'string' ? row.notes : undefined,
    };
}

function toEvaluationDetail(
    row: {
        id: string;
        submissionId: string;
        problemId: string;
        overallScore: number;
        correctnessScore: number;
        efficiencyScore: number;
        codeQualityScore: number;
        explanationScore: number;
        complexityAnalysis: unknown;
        followUpQuestions: unknown;
        feedback: string;
        suggestions: unknown;
        model: string;
        tokensUsed: number;
        createdAt: Date;
    },
): DSAEvaluationDetail {
    return {
        id: row.id,
        submissionId: row.submissionId,
        problemId: row.problemId,
        overallScore: row.overallScore,
        correctnessScore: row.correctnessScore,
        efficiencyScore: row.efficiencyScore,
        codeQualityScore: row.codeQualityScore,
        explanationScore: row.explanationScore,
        complexityAnalysis: parseComplexityAnalysis(row.complexityAnalysis),
        followUpQuestions: parseStringArray(row.followUpQuestions),
        feedback: row.feedback,
        suggestions: parseStringArray(row.suggestions),
        model: row.model,
        tokensUsed: row.tokensUsed,
        createdAt: row.createdAt,
    };
}

//loads result of any submission
async function loadSubmissionEvaluation(
    submissionId: string,
    userId: string,
    role?: Role,
) {
    const submission = await prisma.submission.findUnique({
        where: { id: submissionId },
    });

    if (!submission) {
        throw new EvaluationError('Submission not found', 'NOT_FOUND');
    }

    if (!isAdmin(role) && submission.userId !== userId) {
        throw new EvaluationError('Forbidden', 'FORBIDDEN');
    }

    if (submission.isSampleRun) {
        throw new EvaluationError(
            'AI review is only available for full submissions, not sample runs',
            'SAMPLE_RUN_NOT_ALLOWED',
        );
    }
    return submission;
}

async function persistEvaluationFromCache(
    submissionId: string,
    userId: string,
    problemId: string,
    payload: DSAEvaluationCachePayload,
): Promise<DSAEvaluationDetail> {
    const row = await prisma.dsaEvaluation.upsert({
        where: { submissionId },
        create: {
            submissionId,
            userId,
            problemId,
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
    return toEvaluationDetail(row);
}

async function findExistingEvaluation(
    submissionId: string,
): Promise<DSAEvaluationDetail | null> {
    const row = await prisma.dsaEvaluation.findUnique({
        where: { submissionId },
    });

    return row ? toEvaluationDetail(row) : null;
}

function mapJobStateToStatus(
    state: Awaited<ReturnType<typeof getAIEvalJobState>>,
): EvaluationStatus {
    if (state === 'failed') {
        return 'failed';
    }
    if (state === 'completed' || state === 'unknown') {
        return 'pending';
    }

    return 'pending';
}

//request an evaluation for gpt eval if required
export async function requestDSAEvaluation(
    submissionId: string,
    userId: string,
    role?: Role,
): Promise<EvaluationResult> {
    const submission = await loadSubmissionEvaluation(
        submissionId,
        userId,
        role,
    );

    const existing = await findExistingEvaluation(submissionId);
    if (existing) {
        return { status: 'completed', evaluation: existing };
    }

    const cacheKey = buildEvaluationCacheKey(
        submission.problemId,
        submission.language,
        submission.sourceCode,
    );

    try {
        const cached = await getCachedEvaluation(cacheKey);
        if (cached) {
            const evaluation = await persistEvaluationFromCache(
                submissionId,
                submission.userId,
                submission.problemId,
                cached,
            );

            return { status: 'completed', evaluation };
        }
    } catch {
        throw new EvaluationError(
            'AI evaluation service is unavailable. Check REDIS_URL.',
            'SERVICE_UNAVAILABLE',
        );
    }

    try {
        await enqueueAIEvaluation({
            submissionId,
            userId: submission.userId,
            problemId: submission.problemId,
        });
    } catch {
        throw new EvaluationError(
            'AI evaluation service is unavailable. Check REDIS_URL.',
            'SERVICE_UNAVAILABLE',
        );
    }

    return { status: 'pending' };
}

//Get evaluation status/result for a submission.
export async function getDSAEvaluation(
    submissionId: string,
    userId: string,
    role?: Role,
): Promise<EvaluationResult> {
    await loadSubmissionEvaluation(submissionId, userId, role);

    const existing = await findExistingEvaluation(submissionId);
    if (existing) {
        return { status: 'completed', evaluation: existing };
    }
    try {
        const jobState = await getAIEvalJobState(submissionId);
        return { status: mapJobStateToStatus(jobState) };
    } catch {
        throw new EvaluationError(
            'AI evaluation service is unavailable. Check REDIS_URL.',
            'SERVICE_UNAVAILABLE',
        );
    }
}