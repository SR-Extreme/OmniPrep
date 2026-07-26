import type { BehavioralQuestion, Role } from '@prisma/client';
import { prisma } from '../../config/db.js';
import {
    CloudinaryError,
    uploadBehavioralResume,
    type UploadResumeInput,
} from '../../services/CloudinaryService.js';
import {
    ResumeParserError,
    extractResumeText,
} from '../../services/ResumeParserService.js';
import {
    parseBehavioralPhases,
    type BehavioralQuestionDetail,
    type BehavioralQuestionListItem,
    type BehavioralSessionDetail,
    type BehavioralSessionListItem,
    type BehavioralTurnDetail,
} from '../../types/behavioral.types.js';
import type {
    CreateBehavioralSessionBody,
    ListBehavioralQuestionsQuery,
    ListMyBehavioralSessionsQuery,
} from './behavioral.validation.js';

export class BehavioralError extends Error {
    constructor(
        message: string,
        public readonly code:
            | 'NOT_FOUND'
            | 'FORBIDDEN'
            | 'QUESTION_UNAVAILABLE'
            | 'INVALID_INPUT'
            | 'UPLOAD_FAILED'
            | 'CONFIG_ERROR'
            | 'PARSE_FAILED'
            | 'QUOTA_EXCEEDED',
    ) {
        super(message);
        this.name = 'BehavioralError';
    }
}

export interface BehavioralFilterOptions {
    companies: string[];
    roles: string[];
}

export interface ListBehavioralQuestionsResult {
    questions: BehavioralQuestionListItem[];
    filterOptions: BehavioralFilterOptions;
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface ListMyBehavioralSessionsResult {
    sessions: BehavioralSessionListItem[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

function isAdmin(role: Role | undefined): boolean {
    return role === 'ADMIN';
}

function publishedWhere(role: Role | undefined) {
    if (isAdmin(role)) {
        return {};
    }
    return { isPublished: true };
}

function toQuestionListItem(question: {
    id: string;
    slug: string;
    title: string;
    companyName: string;
    roleName: string;
    difficulty: string;
}): BehavioralQuestionListItem {
    return {
        id: question.id,
        slug: question.slug,
        title: question.title,
        companyName: question.companyName,
        roleName: question.roleName,
        difficulty: question.difficulty,
    };
}

function toQuestionDetail(question: BehavioralQuestion): BehavioralQuestionDetail {
    return {
        id: question.id,
        slug: question.slug,
        title: question.title,
        description: question.description,
        companyName: question.companyName,
        roleName: question.roleName,
        difficulty: question.difficulty,
        phases: parseBehavioralPhases(question.phases),
        isPublished: question.isPublished,
        createdAt: question.createdAt,
        updatedAt: question.updatedAt,
    };
}

export function toTurnDetail(turn: {
    id: string;
    sessionId: string;
    phaseType: string;
    orderIndex: number;
    questionIndexInPhase: number;
    questionText: string;
    candidateAnswerText: string | null;
    interviewerReplyText: string | null;
    isFollowUp: boolean;
    createdAt: Date;
    answeredAt: Date | null;
}): BehavioralTurnDetail {
    return {
        id: turn.id,
        sessionId: turn.sessionId,
        phaseType: turn.phaseType as BehavioralTurnDetail['phaseType'],
        orderIndex: turn.orderIndex,
        questionIndexInPhase: turn.questionIndexInPhase,
        questionText: turn.questionText,
        candidateAnswerText: turn.candidateAnswerText,
        interviewerReplyText: turn.interviewerReplyText,
        isFollowUp: turn.isFollowUp,
        createdAt: turn.createdAt,
        answeredAt: turn.answeredAt,
    };
}

export function toSessionDetail(session: {
    id: string;
    questionId: string;
    resumeUrl: string;
    resumeFileName: string;
    resumeMimeType: string;
    currentPhaseIndex: number;
    status: string;
    completedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    turns: Array<{
        id: string;
        sessionId: string;
        phaseType: string;
        orderIndex: number;
        questionIndexInPhase: number;
        questionText: string;
        candidateAnswerText: string | null;
        interviewerReplyText: string | null;
        isFollowUp: boolean;
        createdAt: Date;
        answeredAt: Date | null;
    }>;
}): BehavioralSessionDetail {
    return {
        id: session.id,
        questionId: session.questionId,
        resumeUrl: session.resumeUrl,
        resumeFileName: session.resumeFileName,
        resumeMimeType: session.resumeMimeType,
        currentPhaseIndex: session.currentPhaseIndex,
        status: session.status as BehavioralSessionDetail['status'],
        completedAt: session.completedAt,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
        turns: session.turns.map(toTurnDetail),
    };
}

//for dropDown we need distinct values
async function getBehavioralFilterOptions(
    role?: Role,
): Promise<BehavioralFilterOptions> {
    const where = publishedWhere(role);

    const [companies, roles] = await Promise.all([
        prisma.behavioralQuestion.findMany({
            where,
            select: { companyName: true },
            distinct: ['companyName'],
            orderBy: { companyName: 'asc' },
        }),
        prisma.behavioralQuestion.findMany({
            where,
            select: { roleName: true },
            distinct: ['roleName'],
            orderBy: { roleName: 'asc' },
        }),
    ]);

    return {
        companies: companies.map((row) => row.companyName),
        roles: roles.map((row) => row.roleName),
    };
}

function buildQuestionListWhere(
    query: ListBehavioralQuestionsQuery,
    role?: Role,
) {
    return {
        ...publishedWhere(role),

        ...(query.company
            ? {
                companyName: {
                    equals: query.company,
                    mode: 'insensitive' as const,
                },
            }
            : {}),

        ...(query.role
            ? {
                roleName: {
                    equals: query.role,
                    mode: 'insensitive' as const,
                },
            }
            : {}),

        ...(query.difficulty ? { difficulty: query.difficulty } : {}),

        ...(query.search
            ? {
                OR: [
                    { title: { contains: query.search, mode: 'insensitive' as const } },
                    { slug: { contains: query.search, mode: 'insensitive' as const } },
                    { companyName: { contains: query.search, mode: 'insensitive' as const } },
                    { roleName: { contains: query.search, mode: 'insensitive' as const } },
                ],
            }
            : {}),
    };
}

export async function listBehavioralQuestions(
    query: ListBehavioralQuestionsQuery,
    role?: Role,
): Promise<ListBehavioralQuestionsResult> {
    const where = buildQuestionListWhere(query, role);
    const skip = (query.page - 1) * query.limit;

    const [total, questions, filterOptions] = await Promise.all([
        prisma.behavioralQuestion.count({ where }),
        prisma.behavioralQuestion.findMany({
            where,
            orderBy: [
                { companyName: 'asc' },
                { roleName: 'asc' },
                { difficulty: 'asc' },
                { title: 'asc' },
            ],
            skip,
            take: query.limit,
            select: {
                id: true,
                slug: true,
                title: true,
                companyName: true,
                roleName: true,
                difficulty: true,
            },
        }),
        getBehavioralFilterOptions(role),
    ]);

    return {
        questions: questions.map(toQuestionListItem),
        filterOptions,
        pagination: {
            page: query.page,
            limit: query.limit,
            total,
            totalPages: total === 0 ? 0 : Math.ceil(total / query.limit),
        },
    };
}

export async function getBehavioralQuestionByIdOrSlug(
    idOrSlug: string,
    role?: Role,
): Promise<BehavioralQuestionDetail> {
    const question = await prisma.behavioralQuestion.findFirst({
        where: {
            ...publishedWhere(role),
            OR: [{ id: idOrSlug }, { slug: idOrSlug }],
        },
    });

    if (!question) {
        throw new BehavioralError('Behavioral question not found', 'NOT_FOUND');
    }

    return toQuestionDetail(question);
}

async function getPublishedQuestionForSession(
    questionId: string,
    role?: Role,
): Promise<{ id: string }> {
    const question = await prisma.behavioralQuestion.findFirst({
        where: {
            id: questionId,
            ...publishedWhere(role),
        },
        select: { id: true },
    });

    if (!question) {
        throw new BehavioralError(
            'Behavioral question not found or unavailable',
            'QUESTION_UNAVAILABLE',
        );
    }

    return question;
}

export async function createBehavioralSession(
    userId: string,
    input: CreateBehavioralSessionBody,
    resumeFile: UploadResumeInput,
    role?: Role,
): Promise<BehavioralSessionDetail> {
    await getPublishedQuestionForSession(input.questionId, role);

    let resumeText: string;

    try {
        resumeText = await extractResumeText(resumeFile);
    } catch (err) {
        if (err instanceof ResumeParserError) {
            const code =
                err.code === 'INVALID_FILE'
                    ? 'INVALID_INPUT'
                    : err.code === 'EMPTY_TEXT'
                        ? 'INVALID_INPUT'
                        : 'PARSE_FAILED';
            throw new BehavioralError(err.message, code);
        }
        throw err;
    }

    let resumeUrl: string;

    try {
        resumeUrl = await uploadBehavioralResume(resumeFile, userId);
    } catch (err) {
        if (err instanceof CloudinaryError) {
            const code =
                err.code === 'INVALID_FILE' ? 'INVALID_INPUT' : err.code;
            throw new BehavioralError(err.message, code);
        }
        throw err;
    }

    const session = await prisma.behavioralSession.create({
        data: {
            userId,
            questionId: input.questionId,
            resumeUrl,
            resumeFileName: resumeFile.originalname,
            resumeMimeType: resumeFile.mimetype,
            resumeText,
            currentPhaseIndex: 1,
            status: 'IN_PROGRESS',
        },
        include: {
            turns: {
                orderBy: { orderIndex: 'asc' },
            },
        },
    });

    return toSessionDetail(session);
}

export async function getBehavioralSessionById(
    sessionId: string,
    userId: string,
    role?: Role,
): Promise<BehavioralSessionDetail> {
    const session = await prisma.behavioralSession.findUnique({
        where: { id: sessionId },
        include: {
            turns: {
                orderBy: { orderIndex: 'asc' },
            },
        },
    });

    if (!session) {
        throw new BehavioralError('Session not found', 'NOT_FOUND');
    }

    if (!isAdmin(role) && session.userId !== userId) {
        throw new BehavioralError('Forbidden', 'FORBIDDEN');
    }

    return toSessionDetail(session);
}

export async function listMyBehavioralSessions(
    userId: string,
    query: ListMyBehavioralSessionsQuery,
): Promise<ListMyBehavioralSessionsResult> {
    const where = {
        userId,
        ...(query.questionId ? { questionId: query.questionId } : {}),
    };

    const skip = (query.page - 1) * query.limit;

    const [total, sessions] = await Promise.all([
        prisma.behavioralSession.count({ where }),
        prisma.behavioralSession.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            skip,
            take: query.limit,
            include: {
                evaluation: {
                    select: { id: true },
                },
            },
        }),
    ]);

    return {
        sessions: sessions.map((row) => ({
            id: row.id,
            questionId: row.questionId,
            status: row.status as BehavioralSessionListItem['status'],
            currentPhaseIndex: row.currentPhaseIndex,
            createdAt: row.createdAt,
            completedAt: row.completedAt,
            hasEvaluation: row.evaluation != null,
        })),
        pagination: {
            page: query.page,
            limit: query.limit,
            total,
            totalPages: total === 0 ? 0 : Math.ceil(total / query.limit),
        },
    };
}