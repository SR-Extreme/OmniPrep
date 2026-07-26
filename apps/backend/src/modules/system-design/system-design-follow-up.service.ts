import type { Role } from '@prisma/client';
import { prisma } from '../../config/db.js';
import { isGeminiConfigured } from '../../config/env.js';
import {
    AIError,
    generateSystemDesignFollowUps,
} from '../../services/AIService.js';
import {
    parseConstraints,
    parseDeliverables,
    parseFollowUpAnswers,
    parseFollowUpQuestions,
    parseRequirements,
    type SystemDesignSubmissionDetail,
} from '../../types/system-design.types.js';
import { SystemDesignError, toSubmissionDetail } from './system-design.service.js';
import type { SubmitFollowUpAnswersBody } from './system-design.validation.js';

function isAdmin(role: Role | undefined): boolean {
    return role === 'ADMIN';
}

function assertHasInitialAnswer(submission: {
    textAnswer: string | null;
    diagramUrl: string | null;
}): void {
    const hasText = submission.textAnswer != null && submission.textAnswer.trim().length > 0;
    const hasDiagram = submission.diagramUrl != null;

    if (!hasText && !hasDiagram) {
        throw new SystemDesignError(
            'Submit a text answer, diagram, or both before requesting follow-up questions.',
            'INVALID_INPUT',
        );
    }
}

async function loadOwnedSubmission(
    submissionId: string,
    userId: string,
    role?: Role,
) {
    const submission = await prisma.systemDesignSubmission.findUnique({
        where: { id: submissionId },
        include: {
            question: true,
            evaluation: { select: { id: true } },
        },
    });
    if (!submission) {
        throw new SystemDesignError('Submission not found', 'NOT_FOUND');
    }
    if (!isAdmin(role) && submission.userId !== userId) {
        throw new SystemDesignError('Forbidden', 'FORBIDDEN');
    }
    return submission;
}

function mapAIError(err: AIError): SystemDesignError {
    if (err.code === 'CONFIG_ERROR') {
        return new SystemDesignError(err.message, 'CONFIG_ERROR');
    }
    if (err.code === 'QUOTA_EXCEEDED') {
        return new SystemDesignError(err.message, 'QUOTA_EXCEEDED');
    }
    return new SystemDesignError(err.message, 'INVALID_INPUT');
}

export async function generateSystemDesignFollowUpQuestions(
    submissionId: string,
    userId: string,
    role?: Role,
): Promise<SystemDesignSubmissionDetail> {
    const submission = await loadOwnedSubmission(submissionId, userId, role);

    if (submission.evaluation) {
        throw new SystemDesignError(
            'Final evaluation already exists for this submission.',
            'INVALID_INPUT',
        );
    }

    if (submission.followUpQuestions != null) {
        return toSubmissionDetail(submission);
    }

    assertHasInitialAnswer(submission);

    if (!isGeminiConfigured()) {
        throw new SystemDesignError(
            'GEMINI_API_KEY is not configured',
            'CONFIG_ERROR',
        );
    }

    let followUpQuestions: string[];

    try {
        followUpQuestions = await generateSystemDesignFollowUps({
            questionTitle: submission.question.title,
            questionDescription: submission.question.description,
            requirements: parseRequirements(submission.question.requirements),
            deliverables: parseDeliverables(submission.question.deliverables),
            constraints: parseConstraints(submission.question.constraints),
            textAnswer: submission.textAnswer,
            diagramUrl: submission.diagramUrl,
        });
    } catch (err) {
        if (err instanceof AIError) {
            throw mapAIError(err);
        }
        throw new SystemDesignError(
            err instanceof Error ? err.message : 'AI request failed',
            'INVALID_INPUT',
        );
    }

    const updated = await prisma.systemDesignSubmission.update({
        where: { id: submissionId },
        data: {
            followUpQuestions,
        },
    });
    return toSubmissionDetail(updated);
}

export async function submitSystemDesignFollowUpAnswers(
    submissionId: string,
    userId: string,
    body: SubmitFollowUpAnswersBody,
    role?: Role,
): Promise<SystemDesignSubmissionDetail> {
    const submission = await loadOwnedSubmission(submissionId, userId, role);

    if (submission.evaluation) {
        throw new SystemDesignError(
            'Final evaluation already exists for this submission.',
            'INVALID_INPUT',
        );
    }

    if (submission.followUpQuestions == null) {
        throw new SystemDesignError(
            'Generate follow-up questions before submitting answers.',
            'INVALID_INPUT',
        );
    }

    if (submission.followUpAnswers != null) {
        throw new SystemDesignError(
            'Follow-up answers have already been submitted.',
            'INVALID_INPUT',
        );
    }

    const updated = await prisma.systemDesignSubmission.update({
        where: { id: submissionId },
        data: {
            followUpAnswers: body.answers,
        },
    });
    return toSubmissionDetail(updated);
}