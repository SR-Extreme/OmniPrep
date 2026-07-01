import type { Role, SystemDesignQuestion } from '@prisma/client';
import { prisma } from '../../config/db.js';
import {
    CloudinaryError,
    uploadSystemDesignDiagram,
    type UploadDiagramInput,
} from '../../services/CloudinaryService.js';
import {
    parseConstraints,
    parseDeliverables,
    parseEvaluationMetrics,
    parseFollowUpAnswers,
    parseFollowUpQuestions,
    parseRequirements,
    parseScaleFactors,
    type SystemDesignQuestionDetail,
    type SystemDesignQuestionListItem,
    type SystemDesignSubmissionDetail,
} from '../../types/system-design.types.js';
import { normalizeInitialSubmissionContent } from './system-design.validation.js';
import type {
    CreateSystemDesignSubmissionBody,
    ListMySystemDesignSubmissionsQuery,
    ListSystemDesignQuestionsQuery,
} from './system-design.validation.js';

export class SystemDesignError extends Error {
    constructor(
        message: string,
        public readonly code:
            | 'NOT_FOUND'
            | 'FORBIDDEN'
            | 'QUESTION_UNAVAILABLE'
            | 'INVALID_INPUT'
            | 'UPLOAD_FAILED'
            | 'CONFIG_ERROR',
    ) {
        super(message);
        this.name = 'SystemDesignError';
    }
}

export interface ListSystemDesignQuestionsResult {
    questions: SystemDesignQuestionListItem[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface SystemDesignSubmissionListItem {
    id: string;
    questionId: string;
    questionTitle: string;
    questionSlug: string;
    hasTextAnswer: boolean;
    hasDiagram: boolean;
    hasFollowUpQuestions: boolean;
    hasFollowUpAnswers: boolean;
    hasEvaluation: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface ListMySystemDesignSubmissionsResult {
    submissions: SystemDesignSubmissionListItem[];
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
    difficulty: string;
    topics: string[];
}): SystemDesignQuestionListItem {
    return {
        id: question.id,
        slug: question.slug,
        title: question.title,
        difficulty: question.difficulty,
        topics: question.topics,
    };
}

function toQuestionDetail(question: SystemDesignQuestion): SystemDesignQuestionDetail {
    return {
        id: question.id,
        slug: question.slug,
        title: question.title,
        description: question.description,
        requirements: parseRequirements(question.requirements),
        deliverables: parseDeliverables(question.deliverables),
        constraints: parseConstraints(question.constraints),
        scaleFactors: parseScaleFactors(question.scaleFactors),
        difficulty: question.difficulty,
        topics: question.topics,
        hints: question.hints,
        evaluationMetrics: parseEvaluationMetrics(question.evaluationMetrics),
        isPublished: question.isPublished,
        createdAt: question.createdAt,
        updatedAt: question.updatedAt,
    };
}

export function toSubmissionDetail(submission: {
    id: string;
    questionId: string;
    textAnswer: string | null;
    diagramUrl: string | null;
    followUpQuestions: unknown;
    followUpAnswers: unknown;
    createdAt: Date;
    updatedAt: Date;
}): SystemDesignSubmissionDetail {
    return {
        id: submission.id,
        questionId: submission.questionId,
        textAnswer: submission.textAnswer,
        diagramUrl: submission.diagramUrl,
        followUpQuestions:
            submission.followUpQuestions == null
                ? null
                : parseFollowUpQuestions(submission.followUpQuestions),
        followUpAnswers:
            submission.followUpAnswers == null
                ? null
                : parseFollowUpAnswers(submission.followUpAnswers),
        createdAt: submission.createdAt,
        updatedAt: submission.updatedAt,
    };
}

export async function listSystemDesignQuestions(
    query: ListSystemDesignQuestionsQuery,
    role?: Role,
): Promise<ListSystemDesignQuestionsResult> {
    const where = {
        ...publishedWhere(role),
        ...(query.difficulty ? { difficulty: query.difficulty } : {}),
        ...(query.topic ? { topics: { has: query.topic } } : {}),
        ...(query.search
            ? {
                OR: [
                    { title: { contains: query.search, mode: 'insensitive' as const } },
                    { slug: { contains: query.search, mode: 'insensitive' as const } },
                ],
            }
            : {}
        ),
    };

    const skip = (query.page - 1) * query.limit;

    const [total, questions] = await Promise.all([
        prisma.systemDesignQuestion.count({ where }),
        prisma.systemDesignQuestion.findMany({
            where,
            orderBy: [{ difficulty: 'asc' }, { title: 'asc' }],
            skip,
            take: query.limit,
            select: {
                id: true,
                slug: true,
                title: true,
                difficulty: true,
                topics: true,
            },
        }),
    ]);

    return {
        questions: questions.map(toQuestionListItem),
        pagination: {
            page: query.page,
            limit: query.limit,
            total,
            totalPages: total === 0 ? 0 : Math.ceil(total / query.limit),
        },
    };
}

export async function getSystemDesignQuestionByIdOrSlug(
    idOrSlug: string,
    role?: Role,
): Promise<SystemDesignQuestionDetail> {
    const question = await prisma.systemDesignQuestion.findFirst({
        where: {
            ...publishedWhere(role),
            OR: [
                { id: idOrSlug }, { slug: idOrSlug }
            ],
        },
    });

    if (!question) {
        throw new SystemDesignError('System design question not found', 'NOT_FOUND');
    }

    return toQuestionDetail(question);
}

//gives id of question if the question is published
async function getPublishedQuestionForSubmission(
    questionId: string,
    role?: Role,
): Promise<{ id: string }> {
    const question = await prisma.systemDesignQuestion.findFirst({
        where: {
            id: questionId,
            ...publishedWhere(role),
        },
        select: { id: true },
    });
    if (!question) {
        throw new SystemDesignError(
            'System design question not found or unavailable',
            'QUESTION_UNAVAILABLE',
        );
    }
    return question;
}

//create a submission of system Design
export async function createSystemDesignSubmission(
    userId: string,
    input: CreateSystemDesignSubmissionBody,
    diagramFile: UploadDiagramInput | null,
    role?: Role,
): Promise<SystemDesignSubmissionDetail> {
    await getPublishedQuestionForSubmission(input.questionId, role);

    let normalized: { textAnswer: string | null };
    try {
        normalized = normalizeInitialSubmissionContent(
            input.textAnswer,
            diagramFile != null,
        );
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Invalid submission content';
        throw new SystemDesignError(message, 'INVALID_INPUT');
    }

    let diagramUrl: string | null = null;

    if (diagramFile) {
        try {
            diagramUrl = await uploadSystemDesignDiagram(diagramFile, userId);
        } catch (err) {
            if (err instanceof CloudinaryError) {
                const code =
                    err.code === 'INVALID_FILE' ? 'INVALID_INPUT' : err.code;
                throw new SystemDesignError(err.message, code);
            }
            throw err;
        }
    }

    const submission = await prisma.systemDesignSubmission.create({
        data: {
            userId,
            questionId: input.questionId,
            textAnswer: normalized.textAnswer,
            diagramUrl,
        },
    });

    return toSubmissionDetail(submission);
}

export async function getSystemDesignSubmissionById(
    submissionId: string,
    userId: string,
    role?: Role,
): Promise<SystemDesignSubmissionDetail> {
    const submission = await prisma.systemDesignSubmission.findUnique({
        where: { id: submissionId },
    });

    if (!submission) {
        throw new SystemDesignError('Submission not found', 'NOT_FOUND');
    }

    if (!isAdmin(role) && submission.userId !== userId) {
        throw new SystemDesignError('Forbidden', 'FORBIDDEN');
    }

    return toSubmissionDetail(submission);
}

export async function listMySystemDesignSubmissions(
    userId: string,
    query: ListMySystemDesignSubmissionsQuery,
): Promise<ListMySystemDesignSubmissionsResult> {
    const where = {
        userId,
        ...(query.questionId ? { questionId: query.questionId } : {})
    };

    const skip = (query.page - 1) * query.limit;

    const [total, submissions] = await Promise.all([
        prisma.systemDesignSubmission.count({ where }),
        prisma.systemDesignSubmission.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            skip,
            take: query.limit,
            include: {
                question: {
                    select: {
                        title: true,
                        slug: true,
                    },
                },
                evaluation: {
                    select: { id: true },
                },
            },
        }),
    ]);

    return {
        submissions: submissions.map((row) => ({
            id: row.id,
            questionId: row.questionId,
            questionTitle: row.question.title,
            questionSlug: row.question.slug,
            hasTextAnswer: row.textAnswer != null && row.textAnswer.length > 0,
            hasDiagram: row.diagramUrl != null,
            hasFollowUpQuestions: row.followUpQuestions != null,
            hasFollowUpAnswers: row.followUpAnswers != null,
            hasEvaluation: row.evaluation != null,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
        })),
        pagination: {
            page: query.page,
            limit: query.limit,
            total,
            totalPages: total === 0 ? 0 : Math.ceil(total / query.limit),
        },
    };
}


