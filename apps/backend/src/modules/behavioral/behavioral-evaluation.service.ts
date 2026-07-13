import type { Prisma, Role } from '@prisma/client';
import { prisma } from '../../config/db.js';
import {
    buildBehavioralEvaluationCacheKey,
    getCachedBehavioralEvaluation,
    type BehavioralEvaluationCachePayload,
} from '../../services/CacheService.js';
import {
    enqueueBehavioralEvaluation,
    getBehavioralEvalJobState,
} from '../../services/QueueService.js';
import {
    parseAnswerHighlight,
    parseBehavioralEvaluationMetrics,
    parseStringArray,
    type BehavioralEvaluationDetail,
} from '../../types/behavioral.types.js';

export class BehavioralEvaluationError extends Error {
    constructor(
        message: string,
        public readonly code:
            | 'NOT_FOUND'
            | 'FORBIDDEN'
            | 'INVALID_INPUT'
            | 'SERVICE_UNAVAILABLE',
    ) {
        super(message);
        this.name = 'BehavioralEvaluationError';
    }
}

export type BehavioralEvaluationStatus = 'completed' | 'pending' | 'failed';

export interface BehavioralEvaluationResult {
    status: BehavioralEvaluationStatus;
    evaluation?: BehavioralEvaluationDetail;
}

function isAdmin(role: Role | undefined): boolean {
    return role === 'ADMIN';
}

function toEvaluationDetail(row: {
    id: string;
    sessionId: string;
    questionId: string;
    evaluationMetrics: unknown;
    strongestAnswer: unknown;
    weakestAnswer: unknown;
    strengths: unknown;
    weaknesses: unknown;
    suggestions: unknown;
    summary: string;
    model: string;
    tokensUsed: number;
    createdAt: Date;
}): BehavioralEvaluationDetail {
    return {
        id: row.id,
        sessionId: row.sessionId,
        questionId: row.questionId,
        evaluationMetrics: parseBehavioralEvaluationMetrics(row.evaluationMetrics),
        strongestAnswer: parseAnswerHighlight(row.strongestAnswer),
        weakestAnswer: parseAnswerHighlight(row.weakestAnswer),
        strengths: parseStringArray(row.strengths),
        weaknesses: parseStringArray(row.weaknesses),
        suggestions: parseStringArray(row.suggestions),
        summary: row.summary,
        model: row.model,
        tokensUsed: row.tokensUsed,
        createdAt: row.createdAt,
    };
}

function buildTranscriptForCache(
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
) {
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

async function isMockInterviewSession(sessionId: string): Promise<boolean> {
    const assignment = await prisma.mockInterviewBehavioral.findFirst({
        where: { sessionId },
        select: { id: true },
    });

    return assignment != null;
}

async function loadSessionForEvaluation(
    sessionId: string,
    userId: string,
    role?: Role,
) {
    const session = await prisma.behavioralSession.findUnique({
        where: { id: sessionId },
        include: {
            turns: {
                orderBy: { orderIndex: 'asc' },
            },
        },
    });

    if (!session) {
        throw new BehavioralEvaluationError('Session not found', 'NOT_FOUND');
    }

    if (!isAdmin(role) && session.userId !== userId) {
        throw new BehavioralEvaluationError('Forbidden', 'FORBIDDEN');
    }

    if (session.status !== 'COMPLETED') {
        throw new BehavioralEvaluationError(
            'Complete the full interview before requesting AI review.',
            'INVALID_INPUT',
        );
    }

    const isMockInterview = await isMockInterviewSession(sessionId);

    if (!isMockInterview) {
        const hasCandidateQuestionsTurn = session.turns.some(
            (turn) => turn.phaseType === 'CANDIDATE_QUESTIONS',
        );

        if (!hasCandidateQuestionsTurn) {
            throw new BehavioralEvaluationError(
                'Submit candidate questions before requesting AI review.',
                'INVALID_INPUT',
            );
        }
    }

    return session;
}

async function findExistingEvaluation(
    sessionId: string,
): Promise<BehavioralEvaluationDetail | null> {
    const row = await prisma.behavioralEvaluation.findUnique({
        where: { sessionId },
    });

    return row ? toEvaluationDetail(row) : null;
}

async function persistEvaluationFromCache(
    sessionId: string,
    userId: string,
    questionId: string,
    payload: BehavioralEvaluationCachePayload,
): Promise<BehavioralEvaluationDetail> {
    const row = await prisma.behavioralEvaluation.upsert({
        where: { sessionId },
        create: {
            sessionId,
            userId,
            questionId,
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

    return toEvaluationDetail(row);
}

function mapJobStateToStatus(
    state: Awaited<ReturnType<typeof getBehavioralEvalJobState>>,
): BehavioralEvaluationStatus {
    if (state === 'failed') {
        return 'failed';
    }

    return 'pending';
}

export async function requestBehavioralEvaluation(
    sessionId: string,
    userId: string,
    role?: Role,
): Promise<BehavioralEvaluationResult> {
    const session = await loadSessionForEvaluation(sessionId, userId, role);

    const existing = await findExistingEvaluation(sessionId);

    if (existing) {
        return { status: 'completed', evaluation: existing };
    }

    const transcript = buildTranscriptForCache(session.turns);

    const cacheKey = buildBehavioralEvaluationCacheKey({
        questionId: session.questionId,
        resumeText: session.resumeText,
        transcript,
    });

    try {
        const cached = await getCachedBehavioralEvaluation(cacheKey);
        if (cached) {
            const evaluation = await persistEvaluationFromCache(
                sessionId,
                session.userId,
                session.questionId,
                cached,
            );
            return { status: 'completed', evaluation };
        }
    } catch {
        throw new BehavioralEvaluationError(
            'AI evaluation service is unavailable. Check REDIS_URL.',
            'SERVICE_UNAVAILABLE',
        );
    }

    try {
        await enqueueBehavioralEvaluation({
            sessionId,
            userId: session.userId,
            questionId: session.questionId,
        });
    } catch {
        throw new BehavioralEvaluationError(
            'AI evaluation service is unavailable. Check REDIS_URL.',
            'SERVICE_UNAVAILABLE',
        );
    }

    return { status: 'pending' };
}

export async function getBehavioralEvaluation(
    sessionId: string,
    userId: string,
    role?: Role,
): Promise<BehavioralEvaluationResult> {
    await loadSessionForEvaluation(sessionId, userId, role);

    const existing = await findExistingEvaluation(sessionId);

    if (existing) {
        return { status: 'completed', evaluation: existing };
    }

    try {
        const jobState = await getBehavioralEvalJobState(sessionId);
        return { status: mapJobStateToStatus(jobState) };
    } catch {
        throw new BehavioralEvaluationError(
            'AI evaluation service is unavailable. Check REDIS_URL.',
            'SERVICE_UNAVAILABLE',
        );
    }
}
