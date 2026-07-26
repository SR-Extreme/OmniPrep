import { prisma } from '../../config/db.js';
import type { AdminQuestionListItem } from '../../types/admin.types.js';
import { parseBehavioralPhases } from '../../types/behavioral.types.js';
import type {
    CreateBehavioralQuestionBody,
    CreateDsaQuestionBody,
    CreateSystemDesignQuestionBody,
    ListAdminQuestionsQuery,
    PublishQuestionBody,
    UpdateBehavioralQuestionBody,
    UpdateDsaQuestionBody,
    UpdateSystemDesignQuestionBody,
} from './admin.validation.js';
import { Prisma } from '@prisma/client';

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
    filterOptions?: {
        companies?: string[];
        roles?: string[];
        topics?: string[];
    };
}

function uniqueSortedTopics(rows: Array<{ topics: string[] }>): string[] {
    return [...new Set(rows.flatMap((row) => row.topics))].sort((a, b) =>
        a.localeCompare(b),
    );
}

function buildTopicSearchWhere(query: ListAdminQuestionsQuery) {
    return {
        ...(query.difficulty ? { difficulty: query.difficulty } : {}),
        ...(query.topics && query.topics.length > 0
            ? { topics: { hasSome: query.topics } }
            : {}),
        ...(query.search
            ? {
                OR: [
                    {
                        title: {
                            contains: query.search,
                            mode: 'insensitive' as const,
                        },
                    },
                    {
                        slug: {
                            contains: query.search,
                            mode: 'insensitive' as const,
                        },
                    },
                ],
            }
            : {}),
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

async function assertBehavioralSlugAvailable(
    slug: string,
    excludeId?: string,
): Promise<void> {
    const existing = await prisma.behavioralQuestion.findUnique({
        where: { slug },
        select: { id: true },
    });

    if (existing && existing.id !== excludeId) {
        throw new AdminQuestionsError(
            'A behavioral question with this slug already exists',
            'CONFLICT',
        );
    }
}

export async function listDsaQuestions(
    query: ListAdminQuestionsQuery,
): Promise<AdminQuestionListResult> {
    const isPublished = query.status === 'published';
    const statusWhere = { isPublished };
    const where = {
        ...statusWhere,
        ...buildTopicSearchWhere(query),
    };

    const [total, rows, topicRows] = await Promise.all([
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
        prisma.problem.findMany({
            where: statusWhere,
            select: { topics: true },
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
        filterOptions: {
            topics: uniqueSortedTopics(topicRows),
        },
    };
}

export async function listSystemDesignQuestions(
    query: ListAdminQuestionsQuery,
): Promise<AdminQuestionListResult> {
    const isPublished = query.status === 'published';
    const statusWhere = { isPublished };
    const where = {
        ...statusWhere,
        ...buildTopicSearchWhere(query),
    };

    const [total, rows, topicRows] = await Promise.all([
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
        prisma.systemDesignQuestion.findMany({
            where: statusWhere,
            select: { topics: true },
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
        filterOptions: {
            topics: uniqueSortedTopics(topicRows),
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
    const existing = await prisma.problem.findUnique({
        where: { id: questionId },
        select: {
            id: true,
            _count: { select: { mockInterviewDsaSlots: true } },
        },
    });

    if (!existing) {
        throw new AdminQuestionsError('DSA question not found', 'NOT_FOUND');
    }

    if (existing._count.mockInterviewDsaSlots > 0) {
        throw new AdminQuestionsError(
            "This question has appeared in the mock interviews and thus can't be deleted",
            'CONFLICT',
        );
    }

    await prisma.problem.delete({ where: { id: questionId } });
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
    const existing = await prisma.systemDesignQuestion.findUnique({
        where: { id: questionId },
        select: {
            id: true,
            _count: { select: { mockInterviewAssignments: true } },
        },
    });

    if (!existing) {
        throw new AdminQuestionsError(
            'System design question not found',
            'NOT_FOUND',
        );
    }

    if (existing._count.mockInterviewAssignments > 0) {
        throw new AdminQuestionsError(
            "This question has appeared in the mock interviews and thus can't be deleted",
            'CONFLICT',
        );
    }

    await prisma.systemDesignQuestion.delete({ where: { id: questionId } });
}

export async function listBehavioralQuestions(
    query: ListAdminQuestionsQuery,
): Promise<AdminQuestionListResult> {
    const isPublished = query.status === 'published';
    const statusWhere = { isPublished };
    const where = {
        ...statusWhere,
        ...(query.difficulty ? { difficulty: query.difficulty } : {}),
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
        ...(query.search
            ? {
                OR: [
                    {
                        title: {
                            contains: query.search,
                            mode: 'insensitive' as const,
                        },
                    },
                    {
                        slug: {
                            contains: query.search,
                            mode: 'insensitive' as const,
                        },
                    },
                    {
                        companyName: {
                            contains: query.search,
                            mode: 'insensitive' as const,
                        },
                    },
                    {
                        roleName: {
                            contains: query.search,
                            mode: 'insensitive' as const,
                        },
                    },
                ],
            }
            : {}),
    };

    const [total, rows, companies, roles] = await Promise.all([
        prisma.behavioralQuestion.count({ where }),
        prisma.behavioralQuestion.findMany({
            where,
            select: {
                id: true,
                title: true,
                difficulty: true,
                companyName: true,
                roleName: true,
                isPublished: true,
                publishedAt: true,
                updatedAt: true,
                createdAt: true,
                _count: { select: { sessions: true } },
            },
            orderBy: isPublished
                ? [{ sessions: { _count: 'desc' } }, { publishedAt: 'desc' }]
                : [{ updatedAt: 'desc' }],
            skip: (query.page - 1) * query.limit,
            take: query.limit,
        }),
        prisma.behavioralQuestion.findMany({
            where: statusWhere,
            select: { companyName: true },
            distinct: ['companyName'],
            orderBy: { companyName: 'asc' },
        }),
        prisma.behavioralQuestion.findMany({
            where: statusWhere,
            select: { roleName: true },
            distinct: ['roleName'],
            orderBy: { roleName: 'asc' },
        }),
    ]);

    return {
        questions: rows.map((row) => ({
            id: row.id,
            title: row.title,
            difficulty: row.difficulty,
            topics: [row.companyName, row.roleName],
            totalSubmissions: row._count.sessions,
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
        filterOptions: {
            companies: companies.map((row) => row.companyName),
            roles: roles.map((row) => row.roleName),
        },
    };
}

export async function getBehavioralQuestion(questionId: string) {
    const question = await prisma.behavioralQuestion.findUnique({
        where: { id: questionId },
        include: {
            _count: { select: { sessions: true } },
        },
    });

    if (!question) {
        throw new AdminQuestionsError(
            'Behavioral question not found',
            'NOT_FOUND',
        );
    }

    return {
        ...question,
        phases: parseBehavioralPhases(question.phases),
    };
}

export async function createBehavioralQuestion(
    body: CreateBehavioralQuestionBody,
) {
    await assertBehavioralSlugAvailable(body.slug);

    const created = await prisma.behavioralQuestion.create({
        data: {
            slug: body.slug,
            title: body.title,
            description: body.description,
            companyName: body.companyName,
            roleName: body.roleName,
            difficulty: body.difficulty,
            phases: body.phases as unknown as Prisma.InputJsonValue,
            isPublished: body.isPublished,
            publishedAt: publishedAtFor(body.isPublished),
        },
    });

    return {
        ...created,
        phases: parseBehavioralPhases(created.phases),
    };
}

export async function updateBehavioralQuestion(
    questionId: string,
    body: UpdateBehavioralQuestionBody,
) {
    const existing = await prisma.behavioralQuestion.findUnique({
        where: { id: questionId },
        select: { id: true, publishedAt: true, isPublished: true },
    });

    if (!existing) {
        throw new AdminQuestionsError(
            'Behavioral question not found',
            'NOT_FOUND',
        );
    }

    if (body.slug) {
        await assertBehavioralSlugAvailable(body.slug, questionId);
    }

    const nextPublished =
        body.isPublished !== undefined
            ? body.isPublished
            : existing.isPublished;

    const updated = await prisma.behavioralQuestion.update({
        where: { id: questionId },
        data: {
            ...(body.slug !== undefined ? { slug: body.slug } : {}),
            ...(body.title !== undefined ? { title: body.title } : {}),
            ...(body.description !== undefined
                ? { description: body.description }
                : {}),
            ...(body.companyName !== undefined
                ? { companyName: body.companyName }
                : {}),
            ...(body.roleName !== undefined ? { roleName: body.roleName } : {}),
            ...(body.difficulty !== undefined
                ? { difficulty: body.difficulty }
                : {}),
            ...(body.phases !== undefined
                ? {
                    phases: body.phases as unknown as Prisma.InputJsonValue,
                }
                : {}),
            ...(body.isPublished !== undefined
                ? {
                    isPublished: body.isPublished,
                    publishedAt: publishedAtFor(
                        nextPublished,
                        existing.publishedAt,
                    ),
                }
                : {}),
        },
    });

    return {
        ...updated,
        phases: parseBehavioralPhases(updated.phases),
    };
}

export async function publishBehavioralQuestion(
    questionId: string,
    body: PublishQuestionBody,
) {
    const existing = await prisma.behavioralQuestion.findUnique({
        where: { id: questionId },
        select: { id: true, publishedAt: true },
    });

    if (!existing) {
        throw new AdminQuestionsError(
            'Behavioral question not found',
            'NOT_FOUND',
        );
    }

    const updated = await prisma.behavioralQuestion.update({
        where: { id: questionId },
        data: {
            isPublished: body.isPublished,
            publishedAt: publishedAtFor(body.isPublished, existing.publishedAt),
        },
    });

    return {
        ...updated,
        phases: parseBehavioralPhases(updated.phases),
    };
}

export async function deleteBehavioralQuestion(
    questionId: string,
): Promise<void> {
    const existing = await prisma.behavioralQuestion.findUnique({
        where: { id: questionId },
        select: {
            id: true,
            _count: { select: { mockInterviewAssignments: true } },
        },
    });

    if (!existing) {
        throw new AdminQuestionsError(
            'Behavioral question not found',
            'NOT_FOUND',
        );
    }

    if (existing._count.mockInterviewAssignments > 0) {
        throw new AdminQuestionsError(
            "This question has appeared in the mock interviews and thus can't be deleted",
            'CONFLICT',
        );
    }

    await prisma.behavioralQuestion.delete({ where: { id: questionId } });
}