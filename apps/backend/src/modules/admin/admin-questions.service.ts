import { prisma } from '../../config/db.js';
import type { AdminQuestionListItem } from '../../types/admin.types.js';
import type {
    CreateDsaQuestionBody,
    CreateSystemDesignQuestionBody,
    ListAdminQuestionsQuery,
    PublishQuestionBody,
    UpdateDsaQuestionBody,
    UpdateSystemDesignQuestionBody,
} from './admin.validation.js';

export class AdminQuestionsError extends Error {
    constructor(
        message: string,
        public readonly code:
            | 'NOT_FOUND'
            | 'CONFLICT'
            | 'INVALID_STATE',
    ) {
        super(message);
        this.name = 'AdminQuestionsError';
    }
}

export interface AdminQuestionListResult {
    questions: AdminQuestionListItem[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

function publishedAtFor(isPublished: boolean, existing?: Date | null): Date | null {
    if (!isPublished) {
        return null;
    }
    return existing ?? new Date();
}

async function assertDsaSlugAvailable(
    slug: string,
    excludeId?: string,
): Promise<void> {
    const existing = await prisma.problem.findUnique({
        where: { slug },
        select: { id: true },
    });

    if (existing && existing.id !== excludeId) {
        throw new AdminQuestionsError(
            'A DSA question with this slug already exists',
            'CONFLICT',
        );
    }
}

async function assertSystemDesignSlugAvailable(
    slug: string,
    excludeId?: string,
): Promise<void> {
    const existing = await prisma.systemDesignQuestion.findUnique({
        where: { slug },
        select: { id: true },
    });

    if (existing && existing.id !== excludeId) {
        throw new AdminQuestionsError(
            'A system design question with this slug already exists',
            'CONFLICT',
        );
    }
}

export async function listDsaQuestions(
    query: ListAdminQuestionsQuery,
): Promise<AdminQuestionListResult> {
    const isPublished = query.status === 'published';
    const where = { isPublished };

    const [total, rows] = await Promise.all([
        prisma.problem.count({ where }),
        prisma.problem.findMany({
            where,
            select: {
                id: true,
                title: true,
                difficulty: true,
                topics: true,
                isPublished: true,
                publishedAt: true,
                updatedAt: true,
                createdAt: true,
                _count: { select: { submissions: true } },
            },
            orderBy: isPublished
                ? [{ submissions: { _count: 'desc' } }, { publishedAt: 'desc' }]
                : [{ updatedAt: 'desc' }],
            skip: (query.page - 1) * query.limit,
            take: query.limit,
        }),
    ]);

    return {
        questions: rows.map((row) => ({
            id: row.id,
            title: row.title,
            difficulty: row.difficulty,
            topics: row.topics,
            totalSubmissions: row._count.submissions,
            isPublished: row.isPublished,
            publishedAt: row.publishedAt,
            updatedAt: row.updatedAt,
            createdAt: row.createdAt,
        })),
        pagination: {
            page: query.page,
            limit: query.limit,
            total,
            totalPages: Math.max(1, Math.ceil(total / query.limit)),
        },
    };
}

export async function listSystemDesignQuestions(
    query: ListAdminQuestionsQuery,
): Promise<AdminQuestionListResult> {
    const isPublished = query.status === 'published';
    const where = { isPublished };

    const [total, rows] = await Promise.all([
        prisma.systemDesignQuestion.count({ where }),
        prisma.systemDesignQuestion.findMany({
            where,
            select: {
                id: true,
                title: true,
                difficulty: true,
                topics: true,
                isPublished: true,
                publishedAt: true,
                updatedAt: true,
                createdAt: true,
                _count: { select: { submissions: true } },
            },
            orderBy: isPublished
                ? [{ submissions: { _count: 'desc' } }, { publishedAt: 'desc' }]
                : [{ updatedAt: 'desc' }],
            skip: (query.page - 1) * query.limit,
            take: query.limit,
        }),
    ]);

    return {
        questions: rows.map((row) => ({
            id: row.id,
            title: row.title,
            difficulty: row.difficulty,
            topics: row.topics,
            totalSubmissions: row._count.submissions,
            isPublished: row.isPublished,
            publishedAt: row.publishedAt,
            updatedAt: row.updatedAt,
            createdAt: row.createdAt,
        })),
        pagination: {
            page: query.page,
            limit: query.limit,
            total,
            totalPages: Math.max(1, Math.ceil(total / query.limit)),
        },
    };
}

export async function getDsaQuestion(questionId: string) {
    const question = await prisma.problem.findUnique({
        where: { id: questionId },
        include: {
            testCases: { orderBy: { order: 'asc' } },
            _count: { select: { submissions: true } },
        },
    });

    if (!question) {
        throw new AdminQuestionsError('DSA question not found', 'NOT_FOUND');
    }

    return question;
}

export async function getSystemDesignQuestion(questionId: string) {
    const question = await prisma.systemDesignQuestion.findUnique({
        where: { id: questionId },
        include: {
            _count: { select: { submissions: true } },
        },
    });

    if (!question) {
        throw new AdminQuestionsError(
            'System design question not found',
            'NOT_FOUND',
        );
    }

    return question;
}

export async function createDsaQuestion(body: CreateDsaQuestionBody) {
    await assertDsaSlugAvailable(body.slug);

    const { testCases, ...problemData } = body;

    return prisma.problem.create({
        data: {
            ...problemData,
            publishedAt: publishedAtFor(body.isPublished),
            testCases: {
                create: testCases.map((testCase, index) => ({
                    input: testCase.input,
                    expectedOutput: testCase.expectedOutput,
                    explanation: testCase.explanation,
                    isHidden: testCase.isHidden,
                    order: testCase.order ?? index,
                })),
            },
        },
        include: {
            testCases: { orderBy: { order: 'asc' } },
        },
    });
}

export async function updateDsaQuestion(
    questionId: string,
    body: UpdateDsaQuestionBody,
) {
    const existing = await prisma.problem.findUnique({
        where: { id: questionId },
        select: { id: true, publishedAt: true, isPublished: true },
    });

    if (!existing) {
        throw new AdminQuestionsError('DSA question not found', 'NOT_FOUND');
    }

    if (body.slug) {
        await assertDsaSlugAvailable(body.slug, questionId);
    }

    const { testCases, ...problemData } = body;
    const nextPublished =
        body.isPublished !== undefined
            ? body.isPublished
            : existing.isPublished;

    return prisma.$transaction(async (tx) => {
        if (testCases) {
            await tx.testCase.deleteMany({ where: { problemId: questionId } });
            if (testCases.length > 0) {
                await tx.testCase.createMany({
                    data: testCases.map((testCase, index) => ({
                        problemId: questionId,
                        input: testCase.input,
                        expectedOutput: testCase.expectedOutput,
                        explanation: testCase.explanation,
                        isHidden: testCase.isHidden ?? true,
                        order: testCase.order ?? index,
                    })),
                });
            }
        }

        return tx.problem.update({
            where: { id: questionId },
            data: {
                ...problemData,
                ...(body.isPublished !== undefined
                    ? {
                        publishedAt: publishedAtFor(
                            nextPublished,
                            existing.publishedAt,
                        ),
                    }
                    : {}),
            },
            include: {
                testCases: { orderBy: { order: 'asc' } },
            },
        });
    });
}

export async function publishDsaQuestion(
    questionId: string,
    body: PublishQuestionBody,
) {
    const existing = await prisma.problem.findUnique({
        where: { id: questionId },
        select: { id: true, publishedAt: true },
    });

    if (!existing) {
        throw new AdminQuestionsError('DSA question not found', 'NOT_FOUND');
    }

    return prisma.problem.update({
        where: { id: questionId },
        data: {
            isPublished: body.isPublished,
            publishedAt: publishedAtFor(body.isPublished, existing.publishedAt),
        },
    });
}

export async function deleteDsaQuestion(questionId: string): Promise<void> {
    try {
        await prisma.problem.delete({ where: { id: questionId } });
    } catch {
        throw new AdminQuestionsError('DSA question not found', 'NOT_FOUND');
    }
}

export async function createSystemDesignQuestion(
    body: CreateSystemDesignQuestionBody,
) {
    await assertSystemDesignSlugAvailable(body.slug);

    return prisma.systemDesignQuestion.create({
        data: {
            ...body,
            publishedAt: publishedAtFor(body.isPublished),
        },
    });
}

export async function updateSystemDesignQuestion(
    questionId: string,
    body: UpdateSystemDesignQuestionBody,
) {
    const existing = await prisma.systemDesignQuestion.findUnique({
        where: { id: questionId },
        select: { id: true, publishedAt: true, isPublished: true },
    });

    if (!existing) {
        throw new AdminQuestionsError(
            'System design question not found',
            'NOT_FOUND',
        );
    }

    if (body.slug) {
        await assertSystemDesignSlugAvailable(body.slug, questionId);
    }

    const nextPublished =
        body.isPublished !== undefined
            ? body.isPublished
            : existing.isPublished;

    return prisma.systemDesignQuestion.update({
        where: { id: questionId },
        data: {
            ...body,
            ...(body.isPublished !== undefined
                ? {
                    publishedAt: publishedAtFor(
                        nextPublished,
                        existing.publishedAt,
                    ),
                }
                : {}),
        },
    });
}

export async function publishSystemDesignQuestion(
    questionId: string,
    body: PublishQuestionBody,
) {
    const existing = await prisma.systemDesignQuestion.findUnique({
        where: { id: questionId },
        select: { id: true, publishedAt: true },
    });

    if (!existing) {
        throw new AdminQuestionsError(
            'System design question not found',
            'NOT_FOUND',
        );
    }

    return prisma.systemDesignQuestion.update({
        where: { id: questionId },
        data: {
            isPublished: body.isPublished,
            publishedAt: publishedAtFor(body.isPublished, existing.publishedAt),
        },
    });
}

export async function deleteSystemDesignQuestion(
    questionId: string,
): Promise<void> {
    try {
        await prisma.systemDesignQuestion.delete({ where: { id: questionId } });
    } catch {
        throw new AdminQuestionsError(
            'System design question not found',
            'NOT_FOUND',
        );
    }
}