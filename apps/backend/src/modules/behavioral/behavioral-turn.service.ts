import type { Role } from '@prisma/client';
import { prisma } from '../../config/db.js';
import { isGeminiConfigured } from '../../config/env.js';
import {
    AIError,
    answerCandidateQuestions,
    generateBehavioralQuestion,
    type BehavioralTranscriptTurn,
} from '../../services/AIService.js';
import {
    getPhaseAtIndex,
    isAiQuestionPhase,
    parseBehavioralPhases,
    type BehavioralPhase,
    type BehavioralPhaseType,
    type BehavioralSessionDetail,
} from '../../types/behavioral.types.js';
import {
    BehavioralError,
    toSessionDetail,
} from './behavioral.service.js';
import type {
    SubmitCandidateQuestionsBody,
    SubmitTurnAnswerBody,
} from './behavioral.validation.js';

function isAdmin(role: Role | undefined): boolean {
    return role === 'ADMIN';
}

function mapAIError(err: AIError): BehavioralError {
    if (err.code === 'CONFIG_ERROR') {
        return new BehavioralError(err.message, 'CONFIG_ERROR');
    }
    if (err.code === 'QUOTA_EXCEEDED') {
        return new BehavioralError(err.message, 'QUOTA_EXCEEDED');
    }
    return new BehavioralError(err.message, 'INVALID_INPUT');
}

function getStringArrayFromContent(
    content: Record<string, unknown>,
    key: string,
): string[] {
    const value = content[key];
    if (!Array.isArray(value)) {
        return [];
    }

    return value.filter((item): item is string => typeof item === 'string');
}

function getStringFromContent(
    content: Record<string, unknown>,
    key: string,
): string {
    const value = content[key];
    return typeof value === 'string' ? value : '';
}

async function loadOwnedSession(
    sessionId: string,
    userId: string,
    role?: Role,
) {
    const session = await prisma.behavioralSession.findUnique({
        where: { id: sessionId },
        include: {
            question: true,
            turns: {
                orderBy: { orderIndex: 'asc' },
            },
            evaluation: {
                select: { id: true },
            },
        },
    });

    if (!session) {
        throw new BehavioralError('Session not found', 'NOT_FOUND');
    }

    if (!isAdmin(role) && session.userId !== userId) {
        throw new BehavioralError('Forbidden', 'FORBIDDEN');
    }

    if (session.evaluation) {
        throw new BehavioralError(
            'Final evaluation already exists for this session.',
            'INVALID_INPUT',
        );
    }

    return session;
}

function buildTranscript(
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
): BehavioralTranscriptTurn[] {
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

function getPhaseTurns(
    turns: Array<{
        phaseType: string;
        candidateAnswerText: string | null;
    }>,
    phaseType: BehavioralPhaseType,
) {
    return turns.filter((turn) => turn.phaseType === phaseType);
}

function getAnsweredPhaseTurns(
    turns: Array<{
        phaseType: string;
        candidateAnswerText: string | null;
    }>,
    phaseType: BehavioralPhaseType,
) {
    return getPhaseTurns(turns, phaseType).filter(
        (turn) =>
            turn.candidateAnswerText != null &&
            turn.candidateAnswerText.trim().length > 0,
    );
}

function isAiPhaseComplete(
    turns: Array<{
        phaseType: string;
        candidateAnswerText: string | null;
    }>,
    phase: BehavioralPhase,
): boolean {
    if (!isAiQuestionPhase(phase.type)) {
        return true;
    }
    const answeredCount = getAnsweredPhaseTurns(turns, phase.type).length;
    return answeredCount >= phase.totalQuestions;
}

async function isMockInterviewSession(sessionId: string): Promise<boolean> {
    const assignment = await prisma.mockInterviewBehavioral.findFirst({
        where: { sessionId },
        select: { id: true },
    });

    return assignment != null;
}

function resolveActivePhaseIndex(
    phases: ReturnType<typeof parseBehavioralPhases>,
    currentPhaseIndex: number,
    turns: Array<{
        phaseType: string;
        candidateAnswerText: string | null;
    }>,
    skipCandidateQuestions = false,
): number {
    let index = currentPhaseIndex;

    while (index < phases.length) {
        const phase = getPhaseAtIndex(phases, index);

        if (phase.type === 'INTRODUCTION') {
            index += 1;
            continue;
        }

        if (phase.type === 'CANDIDATE_QUESTIONS') {
            if (skipCandidateQuestions) {
                index += 1;
                continue;
            }
            return index;
        }

        if (phase.type === 'WRAP_UP') {
            return index;
        }

        if (!isAiPhaseComplete(turns, phase)) {
            return index;
        }

        index += 1;
    }

    return phases.length - 1;
}

//update CPI in DB
async function syncSessionPhaseIndex(
    sessionId: string,
    phases: ReturnType<typeof parseBehavioralPhases>,
    currentPhaseIndex: number,
    turns: Array<{
        phaseType: string;
        candidateAnswerText: string | null;
    }>,
): Promise<number> {
    const skipCandidateQuestions = await isMockInterviewSession(sessionId);
    const nextIndex = resolveActivePhaseIndex(phases, currentPhaseIndex, turns, skipCandidateQuestions);

    const activePhase = getPhaseAtIndex(phases, nextIndex);
    const shouldCompleteMockSession =
        skipCandidateQuestions && activePhase.type === 'WRAP_UP';

    if (nextIndex !== currentPhaseIndex || shouldCompleteMockSession) {
        await prisma.behavioralSession.update({
            where: { id: sessionId },
            data: {
                currentPhaseIndex: nextIndex,
                ...(shouldCompleteMockSession
                    ? {
                        status: 'COMPLETED',
                        completedAt: new Date(),
                    }
                    : {}),
            },
        });
    }

    return nextIndex;
}

//*****
async function reloadSessionDetail(
    sessionId: string,
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

    return toSessionDetail(session);
}

export async function generateNextBehavioralQuestion(
    sessionId: string,
    userId: string,
    role?: Role,
): Promise<BehavioralSessionDetail> {
    const session = await loadOwnedSession(sessionId, userId, role);

    if (session.status === 'COMPLETED') {
        throw new BehavioralError('Session is already completed.', 'INVALID_INPUT');
    }

    const phases = parseBehavioralPhases(session.question.phases);

    const syncedPhaseIndex = await syncSessionPhaseIndex(
        session.id,
        phases,
        session.currentPhaseIndex,
        session.turns,
    );

    const currentPhase = getPhaseAtIndex(phases, syncedPhaseIndex);

    if (currentPhase.type === 'CANDIDATE_QUESTIONS') {
        throw new BehavioralError(
            'Submit your questions to the interviewer in the candidate questions phase.',
            'INVALID_INPUT',
        );
    }
    if (currentPhase.type === 'WRAP_UP') {
        throw new BehavioralError('Interview is complete.', 'INVALID_INPUT');
    }
    if (!isAiQuestionPhase(currentPhase.type)) {
        throw new BehavioralError('Current phase does not support AI questions.', 'INVALID_INPUT');
    }

    const phaseTurns = getPhaseTurns(session.turns, currentPhase.type);

    const unansweredTurn = phaseTurns.find(
        (turn) =>
            turn.candidateAnswerText == null ||
            turn.candidateAnswerText.trim().length === 0,
    );

    if (unansweredTurn) {
        throw new BehavioralError(
            'Answer the current question before requesting the next one.',
            'INVALID_INPUT',
        );
    }

    if (phaseTurns.length >= currentPhase.totalQuestions) {
        throw new BehavioralError(
            'Current phase is complete. Continue to the next phase.',
            'INVALID_INPUT',
        );
    }

    if (!isGeminiConfigured()) {
        throw new BehavioralError('GEMINI_API_KEY is not configured', 'CONFIG_ERROR');
    }

    const phaseContent = currentPhase.content ?? {};

    const generationGuidance = getStringArrayFromContent(
        phaseContent,
        'generationGuidance',
    );

    const transcript = buildTranscript(session.turns);
    const nextQuestionIndex = phaseTurns.length + 1;
    const nextOrderIndex =
        session.turns.length === 0
            ? 1
            : Math.max(...session.turns.map((turn) => turn.orderIndex)) + 1;

    let aiResult;
    try {
        aiResult = await generateBehavioralQuestion({
            companyName: session.question.companyName,
            roleName: session.question.roleName,
            phaseType: currentPhase.type,
            phaseTitle: currentPhase.title,
            phaseDescription: currentPhase.description,
            generationGuidance,
            resumeText: session.resumeText,
            transcript,
            questionIndexInPhase: nextQuestionIndex,
            totalQuestionsInPhase: currentPhase.totalQuestions,
        });
    } catch (err) {
        if (err instanceof AIError) {
            throw mapAIError(err);
        }
        throw new BehavioralError(
            err instanceof Error ? err.message : 'AI request failed',
            'INVALID_INPUT',
        );
    }

    await prisma.behavioralTurn.create({
        data: {
            sessionId: session.id,
            phaseType: currentPhase.type,
            orderIndex: nextOrderIndex,
            questionIndexInPhase: nextQuestionIndex,
            questionText: aiResult.questionText,
            isFollowUp: aiResult.isFollowUp,
        },
    });

    return reloadSessionDetail(session.id);
}

export async function submitTurnAnswer(
    sessionId: string,
    turnId: string,
    userId: string,
    body: SubmitTurnAnswerBody,
    role?: Role,
): Promise<BehavioralSessionDetail> {
    const session = await loadOwnedSession(sessionId, userId, role);

    if (session.status === 'COMPLETED') {
        throw new BehavioralError('Session is already completed.', 'INVALID_INPUT');
    }

    const turn = session.turns.find((row) => row.id === turnId);

    if (!turn) {
        throw new BehavioralError('Turn not found', 'NOT_FOUND');
    }

    if (turn.phaseType === 'CANDIDATE_QUESTIONS') {
        throw new BehavioralError(
            'Use the candidate questions endpoint for this phase.',
            'INVALID_INPUT',
        );
    }

    if (
        turn.candidateAnswerText != null &&
        turn.candidateAnswerText.trim().length > 0
    ) {
        throw new BehavioralError('This question has already been answered.', 'INVALID_INPUT');
    }

    await prisma.behavioralTurn.update({
        where: { id: turnId },
        data: {
            candidateAnswerText: body.answer,
            answeredAt: new Date(),
        },
    });

    const phases = parseBehavioralPhases(session.question.phases);

    const updatedTurns = session.turns.map((row) =>
        row.id === turnId
            ? { ...row, candidateAnswerText: body.answer }
            : row,
    );

    await syncSessionPhaseIndex(
        session.id,
        phases,
        session.currentPhaseIndex,
        updatedTurns,
    );

    return reloadSessionDetail(session.id);
}

//get cadidate questions
//generate ai answer
//create turn in db and update to the next phase i.e wrap up
export async function submitCandidateQuestions(
    sessionId: string,
    userId: string,
    body: SubmitCandidateQuestionsBody,
    role?: Role,
): Promise<BehavioralSessionDetail> {
    const session = await loadOwnedSession(sessionId, userId, role);

    if (await isMockInterviewSession(sessionId)) {
        throw new BehavioralError(
            'Candidate questions are not part of the mock interview behavioral section.',
            'INVALID_INPUT',
        );
    }

    if (session.status === 'COMPLETED') {
        throw new BehavioralError('Session is already completed.', 'INVALID_INPUT');
    }

    const phases = parseBehavioralPhases(session.question.phases);

    const syncedPhaseIndex = await syncSessionPhaseIndex(
        session.id,
        phases,
        session.currentPhaseIndex,
        session.turns,
    );

    const currentPhase = getPhaseAtIndex(phases, syncedPhaseIndex);

    if (currentPhase.type !== 'CANDIDATE_QUESTIONS') {
        throw new BehavioralError(
            'Candidate questions can only be submitted in the candidate questions phase.',
            'INVALID_INPUT',
        );
    }

    const existingCandidateTurn = getPhaseTurns(
        session.turns,
        'CANDIDATE_QUESTIONS',
    );

    if (existingCandidateTurn.length > 0) {
        throw new BehavioralError(
            'Candidate questions have already been submitted.',
            'INVALID_INPUT',
        );
    }


    if (!isGeminiConfigured()) {
        throw new BehavioralError('GEMINI_API_KEY is not configured', 'CONFIG_ERROR');
    }

    const phaseContent = currentPhase.content ?? {};

    const prompt =
        getStringFromContent(phaseContent, 'prompt') ||
        'Do you have any questions for me?';

    const answerStyle = getStringFromContent(phaseContent, 'answerStyle');

    const answerGuidance = getStringArrayFromContent(
        phaseContent,
        'answerGuidance',
    );

    const transcript = buildTranscript(session.turns);

    const nextOrderIndex =
        session.turns.length === 0
            ? 1
            : Math.max(...session.turns.map((turn) => turn.orderIndex)) + 1;

    let interviewerReplyText: string;

    try {
        const aiResult = await answerCandidateQuestions({
            companyName: session.question.companyName,
            roleName: session.question.roleName,
            answerStyle:
                answerStyle ||
                `Respond as a ${session.question.roleName} interviewer at ${session.question.companyName}.`,
            answerGuidance,
            candidateQuestions: body.questions,
            resumeText: session.resumeText,
            transcript,
        });

        interviewerReplyText = aiResult.interviewerReplyText;
    } catch (err) {
        if (err instanceof AIError) {
            throw mapAIError(err);
        }
        throw new BehavioralError(
            err instanceof Error ? err.message : 'AI request failed',
            'INVALID_INPUT',
        );
    }

    const wrapUpIndex = phases.findIndex((phase) => phase.type === 'WRAP_UP');

    await prisma.$transaction([
        prisma.behavioralTurn.create({
            data: {
                sessionId: session.id,
                phaseType: 'CANDIDATE_QUESTIONS',
                orderIndex: nextOrderIndex,
                questionIndexInPhase: 1,
                questionText: prompt,
                candidateAnswerText: body.questions,
                interviewerReplyText,
                answeredAt: new Date(),
            },
        }),
        prisma.behavioralSession.update({
            where: { id: session.id },
            data: {
                currentPhaseIndex: wrapUpIndex >= 0 ? wrapUpIndex : syncedPhaseIndex,
                status: 'COMPLETED',
                completedAt: new Date(),
            },
        }),
    ]);

    return reloadSessionDetail(session.id);
}