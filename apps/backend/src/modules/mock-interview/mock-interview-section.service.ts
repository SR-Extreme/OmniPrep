import type { Role } from '@prisma/client';
import { prisma } from '../../config/db.js';
import {
    isSectionActive,
    isSectionSubmitted,
    isSectionTimedOut,
    type MockInterviewSection,
    type MockInterviewSessionDetail,
} from '../../types/mock-interview.types.js';
import { EvaluationError, requestDSAEvaluation } from '../evaluations/evaluations.service.js';
import {
    SystemDesignEvaluationError,
    requestSystemDesignEvaluation,
} from '../system-design/system-design-evaluation.service.js';
import {
    MockInterviewError,
    getOwnedInterviewOrThrow,
    mockInterviewInclude,
    toSessionDetail,
} from './mock-interview.service.js';
import type {
    LinkDsaSubmissionBody,
    LinkSystemDesignSubmissionBody,
} from './mock-interview.validation.js';

interface SubmitSectionOptions {
    auto?: boolean;
}

function assertInterviewInProgress(status: string): void {
    if (status !== 'IN_PROGRESS') {
        throw new MockInterviewError(
            'Mock interview is not in progress',
            'INVALID_STATE',
        );
    }
}

function assertSectionIsCurrent(
    currentSection: MockInterviewSection,
    section: MockInterviewSection,
): void {
    if (currentSection !== section) {
        throw new MockInterviewError(
            `${section} is not the active section`,
            'INVALID_STATE',
        );
    }
}

//taking last submission and submission id can be null
async function assertDsaReadyForSubmit(
    userId: string,
    interviewId: string,
    dsaStartedAt: Date | null,
): Promise<Array<{ slotIndex: number; problemId: string; submissionId: string | null }>> {
    const slots = await prisma.mockInterviewDsaProblem.findMany({
        where: { mockInterviewId: interviewId },
        orderBy: { slotIndex: 'asc' },
    });

    const resolved = await Promise.all(
        slots.map(async (slot) => {
            const latest = await prisma.submission.findFirst({
                where: {
                    userId,
                    problemId: slot.problemId,
                    isSampleRun: false,
                    ...(dsaStartedAt ? { createdAt: { gte: dsaStartedAt } } : {}),
                },
                orderBy: { createdAt: 'desc' },
                select: { id: true },
            });

            const submissionId = latest?.id ?? null;

            await prisma.mockInterviewDsaProblem.update({
                where: { id: slot.id },
                data: { submissionId },
            });

            return {
                slotIndex: slot.slotIndex,
                problemId: slot.problemId,
                submissionId,
            };
        }),
    );

    return resolved;
}

async function triggerDsaEvaluations(
    userId: string,
    submissionIds: Array<string | null>,
    role?: Role,
): Promise<void> {
    for (const submissionId of submissionIds) {
        if (!submissionId) {
            continue;
        }

        try {
            await requestDSAEvaluation(submissionId, userId, role);
        } catch (err) {
            continue;
        }
    }
}

async function triggerSystemDesignEvaluation(
    userId: string,
    submissionId: string | null,
    role?: Role,
): Promise<void> {
    if (!submissionId) {
        return;
    }

    try {
        await requestSystemDesignEvaluation(submissionId, userId, role);
    } catch (err) {
        if (
            err instanceof SystemDesignEvaluationError &&
            err.code === 'INVALID_INPUT'
        ) {
            return;
        }
    }
}

async function validateDsaSubmissionLink(
    userId: string,
    problemId: string,
    submissionId: string,
): Promise<void> {
    const submission = await prisma.submission.findUnique({
        where: { id: submissionId },
        select: {
            userId: true,
            problemId: true,
            isSampleRun: true,
        },
    });

    if (!submission) {
        throw new MockInterviewError('Submission not found', 'NOT_FOUND');
    }

    if (submission.userId !== userId) {
        throw new MockInterviewError('Submission not found', 'FORBIDDEN');
    }

    if (submission.problemId !== problemId) {
        throw new MockInterviewError(
            'Submission does not match the assigned problem',
            'INVALID_STATE',
        );
    }

    if (submission.isSampleRun) {
        throw new MockInterviewError(
            'Link a full submission, not a sample run',
            'INVALID_STATE',
        );
    }
}

async function validateSystemDesignSubmissionLink(
    userId: string,
    questionId: string,
    submissionId: string,
): Promise<void> {
    const submission = await prisma.systemDesignSubmission.findUnique({
        where: { id: submissionId },
        select: {
            userId: true,
            questionId: true,
        },
    });

    if (!submission) {
        throw new MockInterviewError('Submission not found', 'NOT_FOUND');
    }

    if (submission.userId !== userId) {
        throw new MockInterviewError('Submission not found', 'FORBIDDEN');
    }

    if (submission.questionId !== questionId) {
        throw new MockInterviewError(
            'Submission does not match the assigned question',
            'INVALID_STATE',
        );
    }
}


async function assertSystemDesignReadyForSubmit(
    submissionId: string | null,
    auto: boolean,
): Promise<void> {
    if (auto) {
        return;
    }

    if (!submissionId) {
        throw new MockInterviewError(
            'Link a system design submission before submitting',
            'INVALID_STATE',
        );
    }

    const submission = await prisma.systemDesignSubmission.findUnique({
        where: { id: submissionId },
        select: {
            followUpAnswers: true,
        },
    });

    if (!submission?.followUpAnswers) {
        throw new MockInterviewError(
            'Complete follow-up answers before submitting the system design section',
            'INVALID_STATE',
        );
    }
}

async function applySectionSubmit(
    interviewId: string,
    section: MockInterviewSection,
    now: Date,
): Promise<void> {
    if (section === 'DSA') {
        await prisma.mockInterview.update({
            where: { id: interviewId },
            data: {
                dsaSubmittedAt: now,
                currentSection: 'SYSTEM_DESIGN',
                systemDesignStartedAt: now,
            },
        });
        return;
    }

    if (section === 'SYSTEM_DESIGN') {
        await prisma.mockInterview.update({
            where: { id: interviewId },
            data: {
                systemDesignSubmittedAt: now,
                currentSection: 'BEHAVIORAL',
            },
        });
        return;
    }

    if (section === 'BEHAVIORAL') {
        await prisma.mockInterview.update({
            where: { id: interviewId },
            data: {
                behavioralSubmittedAt: now,
                status: 'AWAITING_FINAL_SUBMIT',
            },
        });
    }
}

//updates/attaches question with submission id
export async function linkDsaSubmission(
    userId: string,
    interviewId: string,
    slotIndex: number,
    body: LinkDsaSubmissionBody,
): Promise<MockInterviewSessionDetail> {
    const interview = await getOwnedInterviewOrThrow(userId, interviewId);

    assertInterviewInProgress(interview.status);
    assertSectionIsCurrent(interview.currentSection, 'DSA');

    if (isSectionSubmitted(interview, 'DSA')) {
        throw new MockInterviewError('DSA section is already submitted', 'INVALID_STATE');
    }

    const slot = interview.dsaProblems.find((row) => row.slotIndex === slotIndex);
    if (!slot) {
        throw new MockInterviewError('DSA slot not found', 'NOT_FOUND');
    }

    await validateDsaSubmissionLink(userId, slot.problemId, body.submissionId);

    await prisma.mockInterviewDsaProblem.update({
        where: { id: slot.id },
        data: { submissionId: body.submissionId },
    });

    const updated = await getOwnedInterviewOrThrow(userId, interviewId);
    return toSessionDetail(updated);
}

export async function linkSystemDesignSubmission(
    userId: string,
    interviewId: string,
    body: LinkSystemDesignSubmissionBody,
): Promise<MockInterviewSessionDetail> {
    const interview = await getOwnedInterviewOrThrow(userId, interviewId);

    assertInterviewInProgress(interview.status);
    assertSectionIsCurrent(interview.currentSection, 'SYSTEM_DESIGN');

    if (isSectionSubmitted(interview, 'SYSTEM_DESIGN')) {
        throw new MockInterviewError(
            'System design section is already submitted',
            'INVALID_STATE',
        );
    }

    if (!interview.systemDesign) {
        throw new MockInterviewError('System design assignment not found', 'NOT_FOUND');
    }

    await validateSystemDesignSubmissionLink(
        userId,
        interview.systemDesign.questionId,
        body.submissionId,
    );

    await prisma.mockInterviewSystemDesign.update({
        where: { id: interview.systemDesign.id },
        data: { submissionId: body.submissionId },
    });

    const updated = await getOwnedInterviewOrThrow(userId, interviewId);
    return toSessionDetail(updated);
}

//submit section and trigger evaluation
export async function submitSection(
    userId: string,
    interviewId: string,
    section: MockInterviewSection,
    role?: Role,
    options: SubmitSectionOptions = {},
): Promise<MockInterviewSessionDetail> {
    const interview = await getOwnedInterviewOrThrow(userId, interviewId);

    const auto = options.auto ?? false;

    assertInterviewInProgress(interview.status);
    assertSectionIsCurrent(interview.currentSection, section);

    if (isSectionSubmitted(interview, section)) {
        throw new MockInterviewError(
            `${section} section is already submitted`,
            'INVALID_STATE',
        );
    }

    if (!isSectionActive(interview, section) && !auto) {
        throw new MockInterviewError(
            `${section} section is not active`,
            'INVALID_STATE',
        );
    }

    if (section === 'BEHAVIORAL') {
        throw new MockInterviewError(
            'Use the behavioral mock-interview endpoints for this section',
            'INVALID_STATE',
        );
    }

    const now = new Date();

    if (section === 'DSA') {
        const resolved = await assertDsaReadyForSubmit(
            userId,
            interviewId,
            interview.dsaStartedAt,
        );

        await applySectionSubmit(interviewId, section, now);

        await triggerDsaEvaluations(
            userId,
            resolved.map((slot) => slot.submissionId),
            role,
        );
    }

    if (section === 'SYSTEM_DESIGN') {
        const submissionId = interview.systemDesign?.submissionId ?? null;
        await assertSystemDesignReadyForSubmit(submissionId, auto);
        await applySectionSubmit(interviewId, section, now);
        await triggerSystemDesignEvaluation(userId, submissionId, role);
    }

    const updated = await getOwnedInterviewOrThrow(userId, interviewId);
    return toSessionDetail(updated, now);
}

//after 1hr automatic submission happens
export async function syncInterviewTimeouts(
    userId: string,
    interviewId: string,
    role?: Role,
): Promise<MockInterviewSessionDetail | null> {
    const interview = await getOwnedInterviewOrThrow(userId, interviewId);

    if (interview.status !== 'IN_PROGRESS') {
        return null;
    }

    const section = interview.currentSection;
    if (section === 'BEHAVIORAL' && !interview.behavioralStartedAt) {
        return null;
    }

    if (!isSectionTimedOut(interview, section)) {
        return null;
    }

    if (section === 'BEHAVIORAL') {
        return null;
    }

    return submitSection(userId, interviewId, section, role, { auto: true });
}

export async function getMockInterviewSynced(
    userId: string,
    interviewId: string,
    role?: Role,
): Promise<MockInterviewSessionDetail> {
    await syncInterviewTimeouts(userId, interviewId, role);

    const interview = await prisma.mockInterview.findUniqueOrThrow({
        where: { id: interviewId },
        include: mockInterviewInclude,
    });

    if (interview.userId !== userId) {
        throw new MockInterviewError('Mock interview not found', 'FORBIDDEN');
    }

    return toSessionDetail(interview);
}