import type { Role } from '@prisma/client';
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
    pickRandomItems,
    type MockInterviewSessionDetail,
} from '../../types/mock-interview.types.js';
import type { BehavioralSessionDetail } from '../../types/behavioral.types.js';
import {
    BehavioralEvaluationError,
    requestBehavioralEvaluation,
} from '../behavioral/behavioral-evaluation.service.js';
import {
    BehavioralError,
    toSessionDetail as toBehavioralSessionDetail,
} from '../behavioral/behavioral.service.js';
import {
    MockInterviewError,
    getOwnedInterviewOrThrow,
    toSessionDetail,
} from './mock-interview.service.js';
import type { SelectBehavioralRoleBody } from './mock-interview.validation.js';

export interface MockBehavioralRolesResult {
    roles: string[];
}

export interface CreateMockBehavioralSessionResult {
    interview: MockInterviewSessionDetail;
    session: BehavioralSessionDetail;
}

function mapResumeParserError(err: ResumeParserError): MockInterviewError {
    const code =
        err.code === 'INVALID_FILE' || err.code === 'EMPTY_TEXT'
            ? 'INVALID_STATE'
            : 'CONFIG_ERROR';
    return new MockInterviewError(err.message, code);
}

function mapCloudinaryError(err: CloudinaryError): MockInterviewError {
    const code = err.code === 'INVALID_FILE' ? 'INVALID_STATE' : 'CONFIG_ERROR';
    return new MockInterviewError(err.message, code);
}

function assertBehavioralSectionOpen(
    interview: Awaited<ReturnType<typeof getOwnedInterviewOrThrow>>,
): void {
    if (interview.status !== 'IN_PROGRESS') {
        throw new MockInterviewError(
            'Mock interview is not in progress',
            'INVALID_STATE',
        );
    }

    if (interview.currentSection !== 'BEHAVIORAL') {
        throw new MockInterviewError(
            'Behavioral section is not active',
            'INVALID_STATE',
        );
    }

    if (interview.behavioralSubmittedAt) {
        throw new MockInterviewError(
            'Behavioral section is already submitted',
            'INVALID_STATE',
        );
    }
}

//given a roleName -> choose random question
async function pickRandomQuestionForRole(roleName: string) {
    const pool = await prisma.behavioralQuestion.findMany({
        where: {
            isPublished: true,
            roleName: {
                equals: roleName,
                mode: 'insensitive',
            },
        },
        select: { id: true },
    });

    if (pool.length === 0) {
        throw new MockInterviewError(
            `No published behavioral questions found for role "${roleName}"`,
            'CONFIG_ERROR',
        );
    }

    const picked = pickRandomItems(pool, 1)[0];
    if (!picked) {
        throw new MockInterviewError(
            'Failed to select a behavioral question',
            'CONFIG_ERROR',
        );
    }

    return picked;
}

async function finalizeBehavioralSectionRecord(
    interviewId: string,
    now: Date,
): Promise<void> {
    await prisma.mockInterview.update({
        where: { id: interviewId },
        data: {
            behavioralSubmittedAt: now,
            status: 'AWAITING_FINAL_SUBMIT',
        },
    });
}

async function triggerBehavioralEvaluation(
    sessionId: string,
    userId: string,
    role?: Role,
): Promise<void> {
    try {
        await requestBehavioralEvaluation(sessionId, userId, role);
    } catch (err) {
        if (err instanceof BehavioralEvaluationError && err.code === 'INVALID_INPUT') {
            return;
        }
        // Interview flow continues
    }
}

export async function listMockBehavioralRoles(): Promise<MockBehavioralRolesResult> {
    const rows = await prisma.behavioralQuestion.findMany({
        where: { isPublished: true },
        select: { roleName: true },
        distinct: ['roleName'],
        orderBy: { roleName: 'asc' },
    });

    return {
        roles: rows.map((row) => row.roleName),
    };
}

export async function startMockBehavioralSection(
    userId: string,
    interviewId: string,
    body: SelectBehavioralRoleBody,
): Promise<MockInterviewSessionDetail> {
    const interview = await getOwnedInterviewOrThrow(userId, interviewId);

    assertBehavioralSectionOpen(interview);

    if (!interview.behavioral) {
        throw new MockInterviewError('Behavioral assignment not found', 'NOT_FOUND');
    }

    if (interview.behavioralStartedAt) {
        throw new MockInterviewError(
            'Behavioral section has already been started',
            'INVALID_STATE',
        );
    }

    if (interview.behavioral.sessionId) {
        throw new MockInterviewError(
            'Behavioral session already exists for this interview',
            'INVALID_STATE',
        );
    }

    const question = await pickRandomQuestionForRole(body.roleName);
    const now = new Date();

    await prisma.mockInterviewBehavioral.update({
        where: { id: interview.behavioral.id },
        data: {
            roleName: body.roleName,
            questionId: question.id,
        },
    });

    await prisma.mockInterview.update({
        where: { id: interviewId },
        data: {
            behavioralStartedAt: now,
        },
    });

    const updated = await getOwnedInterviewOrThrow(userId, interviewId);
    return toSessionDetail(updated, now);
}

//once resume is uploaded -> session will be created
export async function createMockBehavioralSession(
    userId: string,
    interviewId: string,
    resumeFile: UploadResumeInput,
): Promise<CreateMockBehavioralSessionResult> {
    const interview = await getOwnedInterviewOrThrow(userId, interviewId);

    assertBehavioralSectionOpen(interview);

    if (!interview.behavioral) {
        throw new MockInterviewError('Behavioral assignment not found', 'NOT_FOUND');
    }

    if (!interview.behavioralStartedAt) {
        throw new MockInterviewError(
            'Select a role to start the behavioral section first',
            'INVALID_STATE',
        );
    }

    if (!interview.behavioral.questionId) {
        throw new MockInterviewError(
            'Behavioral question has not been assigned',
            'INVALID_STATE',
        );
    }

    if (interview.behavioral.sessionId) {
        throw new MockInterviewError(
            'Behavioral session already exists for this interview',
            'INVALID_STATE',
        );
    }

    const question = await prisma.behavioralQuestion.findFirst({
        where: {
            id: interview.behavioral.questionId,
            isPublished: true,
        },
        select: { id: true },
    });

    if (!question) {
        throw new MockInterviewError(
            'Behavioral question not found or unavailable',
            'NOT_FOUND',
        );
    }

    let resumeText: string;
    try {
        resumeText = await extractResumeText(resumeFile);
    } catch (err) {
        if (err instanceof ResumeParserError) {
            throw mapResumeParserError(err);
        }
        throw err;
    }

    let resumeUrl: string;
    try {
        resumeUrl = await uploadBehavioralResume(resumeFile, userId);
    } catch (err) {
        if (err instanceof CloudinaryError) {
            throw mapCloudinaryError(err);
        }
        throw err;
    }

    const session = await prisma.behavioralSession.create({
        data: {
            userId,
            questionId: question.id,
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

    await prisma.mockInterviewBehavioral.update({
        where: { id: interview.behavioral.id },
        data: { sessionId: session.id },
    });

    const updatedInterview = await getOwnedInterviewOrThrow(userId, interviewId);
    return {
        interview: toSessionDetail(updatedInterview),
        session: toBehavioralSessionDetail(session),
    };
}

export async function finalizeMockBehavioralSection(
    userId: string,
    interviewId: string,
    role?: Role,
): Promise<MockInterviewSessionDetail> {
    const interview = await getOwnedInterviewOrThrow(userId, interviewId);

    if (interview.behavioralSubmittedAt) {
        return toSessionDetail(interview);
    }

    if (!interview.behavioral?.sessionId) {
        throw new MockInterviewError(
            'No behavioral session found for this interview',
            'INVALID_STATE',
        );
    }

    const session = await prisma.behavioralSession.findUnique({
        where: { id: interview.behavioral.sessionId },
        select: {
            userId: true,
            status: true,
        },
    });

    if (!session) {
        throw new MockInterviewError('Behavioral session not found', 'NOT_FOUND');
    }

    if (session.userId !== userId) {
        throw new MockInterviewError('Behavioral session not found', 'FORBIDDEN');
    }

    if (session.status !== 'COMPLETED') {
        throw new MockInterviewError(
            'Complete the behavioral interview before finalizing this section',
            'INVALID_STATE',
        );
    }

    const now = new Date();
    await finalizeBehavioralSectionRecord(interviewId, now);
    await triggerBehavioralEvaluation(interview.behavioral.sessionId, userId, role);
    const updated = await getOwnedInterviewOrThrow(userId, interviewId);
    return toSessionDetail(updated, now);
}


export async function autoSubmitMockBehavioralSection(
    userId: string,
    interviewId: string,
): Promise<MockInterviewSessionDetail> {
    const interview = await getOwnedInterviewOrThrow(userId, interviewId);

    assertBehavioralSectionOpen(interview);

    if (!interview.behavioralStartedAt) {
        return toSessionDetail(interview);
    }

    if (interview.behavioral?.sessionId) {
        const session = await prisma.behavioralSession.findUnique({
            where: { id: interview.behavioral.sessionId },
            select: { status: true },
        });

        if (session?.status === 'COMPLETED') {
            return finalizeMockBehavioralSection(userId, interviewId);
        }
    }

    const now = new Date();
    await finalizeBehavioralSectionRecord(interviewId, now);
    const updated = await getOwnedInterviewOrThrow(userId, interviewId);
    return toSessionDetail(updated, now);
}