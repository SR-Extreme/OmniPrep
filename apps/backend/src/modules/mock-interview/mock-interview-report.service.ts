import { prisma } from '../../config/db.js';
import type { Role } from '@prisma/client';
import {
    SECTION_DURATION_MS,
    SECTION_ORDER,
    TOTAL_DURATION_MS,
    getSectionTimeTakenMs,
    getTotalTimeTakenMs,
    type MockInterviewEvalStatus,
    type MockInterviewReportDetail,
    type MockInterviewReportDsaQuestionScore,
    type MockInterviewSection,
    type MockInterviewSectionEvalStatus,
} from '../../types/mock-interview.types.js';
import type { BehavioralEvaluationDetail } from '../../types/behavioral.types.js';
import type { SystemDesignEvaluationDetail } from '../../types/system-design.types.js';
import { getBehavioralEvaluation } from '../behavioral/behavioral-evaluation.service.js';
import {
    EvaluationError,
    getDSAEvaluation,
    type DSAEvaluationDetail,
} from '../evaluations/evaluations.service.js';
import {
    SystemDesignEvaluationError,
    getSystemDesignEvaluation,
} from '../system-design/system-design-evaluation.service.js';
import {
    MockInterviewError,
    getOwnedInterviewOrThrow,
    toSessionDetail,
} from './mock-interview.service.js';
import type { MockInterviewSessionDetail } from '../../types/mock-interview.types.js';

type PipelineEvalStatus = 'completed' | 'pending' | 'failed';

export interface MockInterviewDsaQuestionReport
    extends MockInterviewReportDsaQuestionScore {
    evaluation?: DSAEvaluationDetail;
}

export interface MockInterviewSystemDesignReport {
    submissionId: string | null;
    overallScore: number;
    evalStatus: MockInterviewEvalStatus;
    message?: string;
    evaluation?: SystemDesignEvaluationDetail;
}

export interface MockInterviewBehavioralReport {
    sessionId: string | null;
    overallScore: number;
    evalStatus: MockInterviewEvalStatus;
    message?: string;
    evaluation?: BehavioralEvaluationDetail;
}

export interface MockInterviewReportResponse extends MockInterviewReportDetail {
    dsaQuestionReports: MockInterviewDsaQuestionReport[];
    systemDesignReport: MockInterviewSystemDesignReport | null;
    behavioralReport: MockInterviewBehavioralReport | null;
}

function mapPipelineStatus(status: PipelineEvalStatus): MockInterviewEvalStatus {
    if (status === 'completed') {
        return 'COMPLETED';
    }

    if (status === 'failed') {
        return 'FAILED';
    }

    return 'PENDING';
}

function aggregateSectionEvalStatus(
    statuses: MockInterviewEvalStatus[],
): MockInterviewEvalStatus {
    if (statuses.length === 0) {
        return 'NOT_REQUESTED';
    }

    if (statuses.some((status) => status === 'PENDING')) {
        return 'PENDING';
    }

    if (statuses.some((status) => status === 'FAILED')) {
        return 'FAILED';
    }

    if (statuses.every((status) => status === 'NOT_REQUESTED')) {
        return 'NOT_REQUESTED';
    }

    return 'COMPLETED';
}

function averageScores(scores: number[]): number | null {
    if (scores.length === 0) {
        return null;
    }

    const total = scores.reduce((sum, score) => sum + score, 0);
    return Math.round(total / scores.length);
}

function isFullyEvaluated(
    statuses: MockInterviewSectionEvalStatus[],
): boolean {
    return (
        statuses.length > 0 &&
        !statuses.some((row) => row.status === 'PENDING')
    );
}

async function syncUserAverageInterviewScore(
    userId: string,
    role?: Role,
): Promise<void> {
    const completed = await prisma.mockInterview.findMany({
        where: { userId, status: 'COMPLETED' },
        select: { id: true },
        orderBy: { finalizedAt: 'asc' },
    });
    const scores: number[] = [];
    for (const row of completed) {
        const report = await buildMockInterviewReport(userId, row.id, role);
        if (
            report.overallScore != null &&
            isFullyEvaluated(report.evaluationStatuses)
        ) {
            scores.push(report.overallScore);
        }
    }
    await prisma.user.update({
        where: { id: userId },
        data: {
            averageInterviewScore:
                scores.length === 0 ? null : averageScores(scores),
        },
    });
}

function assertReportReady(status: string): void {
    if (status !== 'COMPLETED') {
        throw new MockInterviewError(
            'Report is available after the interview is finalized',
            'INVALID_STATE',
        );
    }
}

function assertCanFinalize(status: string): void {
    if (status !== 'AWAITING_FINAL_SUBMIT') {
        throw new MockInterviewError(
            'Interview can only be finalized after all sections are submitted',
            'INVALID_STATE',
        );
    }
}

async function resolveDsaQuestionReport(
    slot: {
        slotIndex: number;
        problemId: string;
        submissionId: string | null;
    },
    sectionSubmitted: boolean,
    userId: string,
    role?: Role,
): Promise<MockInterviewDsaQuestionReport> {
    if (!sectionSubmitted || !slot.submissionId) {
        return {
            slotIndex: slot.slotIndex,
            problemId: slot.problemId,
            submissionId: slot.submissionId,
            overallScore: 0,
            evalStatus: 'NO_SUBMISSION',
            message: 'No submission for this problem',
        };
    }

    try {
        const result = await getDSAEvaluation(slot.submissionId, userId, role);
        const evalStatus = mapPipelineStatus(result.status);

        return {
            slotIndex: slot.slotIndex,
            problemId: slot.problemId,
            submissionId: slot.submissionId,
            overallScore:
                result.status === 'completed' && result.evaluation
                    ? result.evaluation.overallScore
                    : 0,
            evalStatus,
            evaluation: result.evaluation,
        };
    } catch (err) {
        if (err instanceof EvaluationError) {
            return {
                slotIndex: slot.slotIndex,
                problemId: slot.problemId,
                submissionId: slot.submissionId,
                overallScore: 0,
                evalStatus: 'FAILED',
            };
        }
        throw err;
    }
}

async function resolveSystemDesignReport(
    submissionId: string | null,
    sectionSubmitted: boolean,
    userId: string,
    role?: Role,
): Promise<MockInterviewSystemDesignReport> {
    if (!sectionSubmitted || !submissionId) {
        return {
            submissionId,
            overallScore: 0,
            evalStatus: 'NO_SUBMISSION',
            message: 'No submission for this section',
        };
    }

    try {
        const result = await getSystemDesignEvaluation(submissionId, userId, role);
        const evalStatus = mapPipelineStatus(result.status);

        return {
            submissionId,
            overallScore:
                result.status === 'completed' && result.evaluation
                    ? result.evaluation.overallScore
                    : 0,
            evalStatus,
            evaluation: result.evaluation,
        };
    } catch (err) {
        if (err instanceof SystemDesignEvaluationError) {
            return {
                submissionId,
                overallScore: 0,
                evalStatus: 'FAILED',
            };
        }
        throw err;
    }
}

async function resolveBehavioralReport(
    sessionId: string | null,
    sectionSubmitted: boolean,
    userId: string,
    role?: Role,
): Promise<MockInterviewBehavioralReport> {
    if (!sectionSubmitted || !sessionId) {
        return {
            sessionId,
            overallScore: 0,
            evalStatus: 'NO_SUBMISSION',
            message: 'No submission for the behavioral section',
        };
    }

    try {
        const result = await getBehavioralEvaluation(sessionId, userId, role);
        const evalStatus = mapPipelineStatus(result.status);

        return {
            sessionId,
            overallScore:
                result.status === 'completed' && result.evaluation
                    ? result.evaluation.evaluationMetrics.overallScore
                    : 0,
            evalStatus,
            evaluation: result.evaluation,
        };
    } catch {
        return {
            sessionId,
            overallScore: 0,
            evalStatus: 'FAILED',
        };
    }
}

//tells the actual report details calculation
export async function buildMockInterviewReport(
    userId: string,
    interviewId: string,
    role?: Role,
): Promise<MockInterviewReportResponse> {
    const interview = await getOwnedInterviewOrThrow(userId, interviewId);

    assertReportReady(interview.status);

    const now = new Date();
    const dsaSubmitted = interview.dsaSubmittedAt != null;
    const sdSubmitted = interview.systemDesignSubmittedAt != null;
    const behavioralSubmitted = interview.behavioralSubmittedAt != null;

    const dsaQuestionReports = await Promise.all(
        interview.dsaProblems.map((slot) =>
            resolveDsaQuestionReport(slot, dsaSubmitted, userId, role),
        ),
    );

    const systemDesignReport = await resolveSystemDesignReport(
        interview.systemDesign?.submissionId ?? null,
        sdSubmitted,
        userId,
        role,
    );

    const behavioralReport = await resolveBehavioralReport(
        interview.behavioral?.sessionId ?? null,
        behavioralSubmitted,
        userId,
        role,
    );

    const dsaSectionScore = averageScores(
        dsaQuestionReports.map((question) => question.overallScore),
    );

    const sdSectionScore = sdSubmitted ? systemDesignReport.overallScore : null;

    const behavioralSectionScore = behavioralSubmitted
        ? behavioralReport.overallScore
        : null;

    const sectionScores: Array<{
        section: MockInterviewSection;
        overallScore: number | null;
    }> = [
            { section: 'DSA', overallScore: dsaSectionScore },
            { section: 'SYSTEM_DESIGN', overallScore: sdSectionScore },
            { section: 'BEHAVIORAL', overallScore: behavioralSectionScore },
        ];

    const sections = SECTION_ORDER.map((section) => {
        const scoreRow = sectionScores.find((row) => row.section === section);
        return {
            section,
            overallScore: scoreRow?.overallScore ?? null,
            timeTakenMs: getSectionTimeTakenMs(interview, section, now),
            timeCapMs: SECTION_DURATION_MS,
        };
    });

    const evaluationStatuses: MockInterviewSectionEvalStatus[] = [
        {
            section: 'DSA',
            status: aggregateSectionEvalStatus(
                dsaQuestionReports.map((question) => question.evalStatus),
            ),
        },
        {
            section: 'SYSTEM_DESIGN',
            status: systemDesignReport.evalStatus,
        },
        {
            section: 'BEHAVIORAL',
            status: behavioralReport.evalStatus,
        },
    ];

    const overallScore = averageScores(
        sections
            .map((section) => section.overallScore)
            .filter((score): score is number => score != null),
    );

    return {
        id: interview.id,
        status: interview.status as MockInterviewReportDetail['status'],
        overallScore,
        totalTimeTakenMs: getTotalTimeTakenMs(interview, now),
        totalTimeCapMs: TOTAL_DURATION_MS,
        sections,
        dsaQuestions: dsaQuestionReports.map((question) => ({
            slotIndex: question.slotIndex,
            problemId: question.problemId,
            submissionId: question.submissionId,
            overallScore: question.overallScore,
            evalStatus: question.evalStatus,
            message: question.message,
        })),
        evaluationStatuses,
        finalizedAt: interview.finalizedAt,
        dsaQuestionReports,
        systemDesignReport,
        behavioralReport,
    };
}

export async function getMockInterviewReport(
    userId: string,
    interviewId: string,
    role?: Role,
): Promise<MockInterviewReportResponse> {
    const report = await buildMockInterviewReport(userId, interviewId, role);
    if (
        report.overallScore != null &&
        isFullyEvaluated(report.evaluationStatuses)
    ) {
        await syncUserAverageInterviewScore(userId, role);
    }
    return report;
}

//triggered when final submit button is clicked
export async function finalizeMockInterview(
    userId: string,
    interviewId: string,
): Promise<MockInterviewSessionDetail> {
    const interview = await getOwnedInterviewOrThrow(userId, interviewId);

    if (interview.status === 'COMPLETED' && interview.finalizedAt) {
        return toSessionDetail(interview);
    }

    assertCanFinalize(interview.status);

    const now = new Date();
    const updated = await prisma.mockInterview.update({
        where: { id: interviewId },
        data: {
            finalizedAt: now,
            status: 'COMPLETED',
        },
        include: {
            dsaProblems: { orderBy: { slotIndex: 'asc' } },
            systemDesign: true,
            behavioral: true,
        },
    });

    return toSessionDetail(updated, now);
}