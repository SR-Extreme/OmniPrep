import type { MockInterview, Prisma } from '@prisma/client';
import { getUserPremiumStatus } from '../../middleware/premium.middleware.js';
import { prisma } from '../../config/db.js';
import {
    DSA_DIFFICULTY,
    DSA_PROBLEM_COUNT,
    SECTION_ORDER,
    getActiveSectionRemainingMs,
    getSectionDeadline,
    getSectionLockState,
    getSectionRemainingMs,
    getSectionStartedAt,
    getSectionSubmittedAt,
    getSectionTimeTakenMs,
    getTotalRemainingMs,
    getTotalTimeTakenMs,
    isSectionTimedOut,
    pickRandomItems,
    type MockInterviewListItem,
    type MockInterviewSectionState,
    type MockInterviewSessionDetail,
    type MockInterviewStatus,
} from '../../types/mock-interview.types.js';
import type { ListMyMockInterviewsQuery } from './mock-interview.validation.js';

export class MockInterviewError extends Error {
    constructor(
        message: string,
        public readonly code:
            | 'NOT_FOUND'
            | 'FORBIDDEN'
            | 'INVALID_STATE'
            | 'CONFIG_ERROR'
            | 'PREMIUM_REQUIRED',
    ) {
        super(message);
        this.name = 'MockInterviewError';
    }
}

export interface ListMyMockInterviewsResult {
    interviews: MockInterviewListItem[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export const mockInterviewInclude = {
    dsaProblems: {
        orderBy: { slotIndex: 'asc' as const },
    },
    systemDesign: true,
    behavioral: true,
} satisfies Prisma.MockInterviewInclude;

type MockInterviewWithRelations = Prisma.MockInterviewGetPayload<{
    include: typeof mockInterviewInclude;
}>;

function toListItem(interview: MockInterview): MockInterviewListItem {
    return {
        id: interview.id,
        status: interview.status as MockInterviewStatus,
        currentSection: interview.currentSection as MockInterviewSessionDetail['currentSection'],
        startTime: interview.startTime,
        createdAt: interview.createdAt,
        finalizedAt: interview.finalizedAt,
    };
}

function buildSectionStates(
    interview: MockInterviewWithRelations,
    now: Date = new Date(),
): MockInterviewSectionState[] {
    return SECTION_ORDER.map((section) => ({
        section,
        lockState: getSectionLockState(interview, section),
        startedAt: getSectionStartedAt(interview, section),
        submittedAt: getSectionSubmittedAt(interview, section),
        deadlineAt: getSectionDeadline(interview, section),
        remainingMs: getSectionRemainingMs(interview, section, now),
        timeTakenMs: getSectionTimeTakenMs(interview, section, now),
        timedOut: isSectionTimedOut(interview, section, now),
    }));
}

//***** IMPORTANT
export function toSessionDetail(
    interview: MockInterviewWithRelations,
    now: Date = new Date(),
): MockInterviewSessionDetail {
    return {
        id: interview.id,
        status: interview.status as MockInterviewStatus,
        currentSection: interview.currentSection as MockInterviewSessionDetail['currentSection'],
        startTime: interview.startTime,
        finalizedAt: interview.finalizedAt,
        createdAt: interview.createdAt,
        updatedAt: interview.updatedAt,
        dsaProblems: interview.dsaProblems.map((slot) => ({
            id: slot.id,
            slotIndex: slot.slotIndex,
            problemId: slot.problemId,
            submissionId: slot.submissionId,
        })),
        systemDesign: interview.systemDesign
            ? {
                id: interview.systemDesign.id,
                questionId: interview.systemDesign.questionId,
                submissionId: interview.systemDesign.submissionId,
            }
            : null,
        behavioral: interview.behavioral
            ? {
                id: interview.behavioral.id,
                roleName: interview.behavioral.roleName,
                questionId: interview.behavioral.questionId,
                sessionId: interview.behavioral.sessionId,
            }
            : null,
        sections: buildSectionStates(interview, now),
        activeSectionRemainingMs: getActiveSectionRemainingMs(interview, now),
        totalRemainingMs: getTotalRemainingMs(interview, now),
        totalTimeTakenMs: getTotalTimeTakenMs(interview, now),
    };
}

async function assertPremiumAccess(userId: string): Promise<void> {
    const status = await getUserPremiumStatus(userId);

    if (!status.isPremium) {
        throw new MockInterviewError(
            'Mock Interviews are available only for Premium users.',
            'PREMIUM_REQUIRED',
        );
    }
}

export async function getOwnedInterviewOrThrow(
    userId: string,
    interviewId: string,
): Promise<MockInterviewWithRelations> {
    const interview = await prisma.mockInterview.findUnique({
        where: { id: interviewId },
        include: mockInterviewInclude,
    });

    if (!interview) {
        throw new MockInterviewError('Mock interview not found', 'NOT_FOUND');
    }

    if (interview.userId !== userId) {
        throw new MockInterviewError('Mock interview not found', 'FORBIDDEN');
    }

    return interview;
}

export async function createMockInterview(
    userId: string,
): Promise<MockInterviewSessionDetail> {
    await assertPremiumAccess(userId);

    const [dsaPool, sdPool] = await Promise.all([
        prisma.problem.findMany({
            where: {
                isPublished: true,
                difficulty: DSA_DIFFICULTY,
            },
            select: { id: true },
        }),
        prisma.systemDesignQuestion.findMany({
            where: { isPublished: true },
            select: { id: true },
        }),
    ]);

    if (dsaPool.length < DSA_PROBLEM_COUNT) {
        throw new MockInterviewError(
            `Need at least ${DSA_PROBLEM_COUNT} published ${DSA_DIFFICULTY} DSA problems`,
            'CONFIG_ERROR',
        );
    }

    if (sdPool.length < 1) {
        throw new MockInterviewError(
            'Need at least 1 published system design question',
            'CONFIG_ERROR',
        );
    }

    const pickedProblems = pickRandomItems(dsaPool, DSA_PROBLEM_COUNT);
    const pickedSystemDesign = pickRandomItems(sdPool, 1)[0];

    if (!pickedSystemDesign) {
        throw new MockInterviewError(
            'Failed to select a system design question',
            'CONFIG_ERROR',
        );
    }

    const interview = await prisma.$transaction(async (tx) => {
        const created = await tx.mockInterview.create({
            data: {
                userId,
                status: 'NOT_STARTED',
                currentSection: 'DSA',
            },
        });

        await tx.mockInterviewDsaProblem.createMany({
            data: pickedProblems.map((problem, slotIndex) => ({
                mockInterviewId: created.id,
                problemId: problem.id,
                slotIndex,
            })),
        });

        await tx.mockInterviewSystemDesign.create({
            data: {
                mockInterviewId: created.id,
                questionId: pickedSystemDesign.id,
            },
        });

        await tx.mockInterviewBehavioral.create({
            data: {
                mockInterviewId: created.id,
            },
        });

        return tx.mockInterview.findUniqueOrThrow({
            where: { id: created.id },
            include: mockInterviewInclude,
        });
    });

    return toSessionDetail(interview);
}

export async function startMockInterview(
    userId: string,
    interviewId: string,
): Promise<MockInterviewSessionDetail> {
    await assertPremiumAccess(userId);

    const interview = await getOwnedInterviewOrThrow(userId, interviewId);

    if (interview.status !== 'NOT_STARTED') {
        throw new MockInterviewError(
            'Mock interview has already been started',
            'INVALID_STATE',
        );
    }

    const now = new Date();

    const updated = await prisma.mockInterview.update({
        where: { id: interviewId },
        data: {
            status: 'IN_PROGRESS',
            startTime: now,
            currentSection: 'DSA',
            dsaStartedAt: now,
        },
        include: mockInterviewInclude,
    });

    return toSessionDetail(updated, now);
}

export async function getMockInterview(
    userId: string,
    interviewId: string,
): Promise<MockInterviewSessionDetail> {
    const interview = await getOwnedInterviewOrThrow(userId, interviewId);
    return toSessionDetail(interview);
}

export async function listMyMockInterviews(
    userId: string,
    query: ListMyMockInterviewsQuery,
): Promise<ListMyMockInterviewsResult> {
    const skip = (query.page - 1) * query.limit;

    const [total, interviews] = await Promise.all([
        prisma.mockInterview.count({ where: { userId } }),
        prisma.mockInterview.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            skip,
            take: query.limit,
        }),
    ]);

    return {
        interviews: interviews.map(toListItem),
        pagination: {
            page: query.page,
            limit: query.limit,
            total,
            totalPages: total === 0 ? 0 : Math.ceil(total / query.limit),
        },
    };
}