import { prisma } from '../../config/db.js';
import type { Role } from '@prisma/client';
import {
    AIError,
    generateMockInterviewStudyPlan as generateStudyPlanWithAI,
    type GenerateMockInterviewStudyPlanInput,
} from '../../services/AIService.js';
import {
    parseStudyPlan,
    type StudyPlan,
    type StudyPlanDay,
} from '../../types/mock-interview.types.js';
import {
    MockInterviewError,
    getOwnedInterviewOrThrow,
} from './mock-interview.service.js';
import { getMockInterviewReport } from './mock-interview-report.service.js';

export interface MockInterviewStudyPlanDetail {
    id: string;
    mockInterviewId: string;
    days: StudyPlanDay[];
    summary: string;
    model: string;
    tokensUsed: number;
    createdAt: Date;
}

function assertStudyPlanReady(status: string): void {
    if (status !== 'COMPLETED') {
        throw new MockInterviewError(
            'Study plan is available after the interview is finalized',
            'INVALID_STATE',
        );
    }
}

function toStudyPlanDetail(row: {
    id: string;
    mockInterviewId: string;
    days: unknown;
    summary: string;
    model: string;
    tokensUsed: number;
    createdAt: Date;
}): MockInterviewStudyPlanDetail {
    const plan = parseStudyPlan({
        days: row.days,
        summary: row.summary,
    });

    return {
        id: row.id,
        mockInterviewId: row.mockInterviewId,
        days: plan.days,
        summary: plan.summary,
        model: row.model,
        tokensUsed: row.tokensUsed,
        createdAt: row.createdAt,
    };
}

function buildStudyPlanAiInput(
    report: Awaited<ReturnType<typeof getMockInterviewReport>>,
): GenerateMockInterviewStudyPlanInput {
    return {
        overallScore: report.overallScore,
        totalTimeTakenMs: report.totalTimeTakenMs,
        totalTimeCapMs: report.totalTimeCapMs,
        sections: report.sections.map((section) => ({
            section: section.section,
            overallScore: section.overallScore,
            timeTakenMs: section.timeTakenMs,
            timeCapMs: section.timeCapMs,
        })),
        evaluationStatuses: report.evaluationStatuses,
        dsaQuestions: report.dsaQuestionReports.map((question) => ({
            slotIndex: question.slotIndex,
            problemId: question.problemId,
            overallScore: question.overallScore,
            evalStatus: question.evalStatus,
            message: question.message,
            evaluation: question.evaluation
                ? {
                    correctnessScore: question.evaluation.correctnessScore,
                    efficiencyScore: question.evaluation.efficiencyScore,
                    codeQualityScore: question.evaluation.codeQualityScore,
                    explanationScore: question.evaluation.explanationScore,
                    complexityAnalysis: question.evaluation.complexityAnalysis,
                    feedback: question.evaluation.feedback,
                    suggestions: question.evaluation.suggestions,
                    followUpQuestions: question.evaluation.followUpQuestions,
                }
                : null,
        })),
        systemDesign: report.systemDesignReport
            ? {
                overallScore: report.systemDesignReport.overallScore,
                evalStatus: report.systemDesignReport.evalStatus,
                message: report.systemDesignReport.message,
                evaluation: report.systemDesignReport.evaluation
                    ? {
                        metricScores:
                            report.systemDesignReport.evaluation.metricScores,
                        strengths: report.systemDesignReport.evaluation.strengths,
                        weaknesses:
                            report.systemDesignReport.evaluation.weaknesses,
                        feedback: report.systemDesignReport.evaluation.feedback,
                        suggestions:
                            report.systemDesignReport.evaluation.suggestions,
                        followUpQuestions:
                            report.systemDesignReport.evaluation
                                .followUpQuestions,
                    }
                    : null,
            }
            : null,
        behavioral: report.behavioralReport
            ? {
                overallScore: report.behavioralReport.overallScore,
                evalStatus: report.behavioralReport.evalStatus,
                message: report.behavioralReport.message,
                evaluation: report.behavioralReport.evaluation
                    ? {
                        evaluationMetrics:
                            report.behavioralReport.evaluation
                                .evaluationMetrics,
                        strengths: report.behavioralReport.evaluation.strengths,
                        weaknesses:
                            report.behavioralReport.evaluation.weaknesses,
                        suggestions:
                            report.behavioralReport.evaluation.suggestions,
                        summary: report.behavioralReport.evaluation.summary,
                        strongestAnswer: {
                            phaseType:
                                report.behavioralReport.evaluation
                                    .strongestAnswer.phaseType,
                            question:
                                report.behavioralReport.evaluation
                                    .strongestAnswer.question,
                            explanation:
                                report.behavioralReport.evaluation
                                    .strongestAnswer.explanation,
                        },
                        weakestAnswer: {
                            phaseType:
                                report.behavioralReport.evaluation
                                    .weakestAnswer.phaseType,
                            question:
                                report.behavioralReport.evaluation
                                    .weakestAnswer.question,
                            explanation:
                                report.behavioralReport.evaluation
                                    .weakestAnswer.explanation,
                        },
                    }
                    : null,
            }
            : null,
    };
}

export async function getMockInterviewStudyPlan(
    userId: string,
    interviewId: string,
): Promise<MockInterviewStudyPlanDetail | null> {
    const interview = await getOwnedInterviewOrThrow(userId, interviewId);

    assertStudyPlanReady(interview.status);

    const existing = await prisma.mockInterviewStudyPlan.findUnique({
        where: { mockInterviewId: interviewId },
    });

    if (!existing) {
        return null;
    }

    return toStudyPlanDetail(existing);
}

export async function generateMockInterviewStudyPlan(
    userId: string,
    interviewId: string,
    role?: Role,
): Promise<MockInterviewStudyPlanDetail> {
    const interview = await getOwnedInterviewOrThrow(userId, interviewId);

    assertStudyPlanReady(interview.status);

    const existing = await prisma.mockInterviewStudyPlan.findUnique({
        where: { mockInterviewId: interviewId },
    });

    if (existing) {
        return toStudyPlanDetail(existing);
    }

    const report = await getMockInterviewReport(userId, interviewId, role);
    const aiInput = buildStudyPlanAiInput(report);

    let aiResult: {
        plan: StudyPlan;
        model: string;
        tokensUsed: number;
    };

    try {
        aiResult = await generateStudyPlanWithAI(aiInput);
    } catch (err) {
        if (err instanceof AIError) {
            throw new MockInterviewError(
                `Failed to generate study plan: ${err.message}`,
                'CONFIG_ERROR',
            );
        }
        throw err;
    }

    const plan = parseStudyPlan(aiResult.plan);

    const created = await prisma.mockInterviewStudyPlan.create({
        data: {
            mockInterviewId: interviewId,
            days: plan.days,
            summary: plan.summary,
            model: aiResult.model,
            tokensUsed: aiResult.tokensUsed,
        },
    });
    return toStudyPlanDetail(created);
}