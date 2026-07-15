import type { Pagination } from './dsa';
import type { BehavioralEvaluationDetail, BehavioralSessionDetail } from './behavioral';
import type { SystemDesignEvaluationDetail } from './system-design';
import type { DSAEvaluationDetail } from '@/lib/api/evaluations';

export const MOCK_STATUSES = [
    'NOT_STARTED',
    'IN_PROGRESS',
    'AWAITING_FINAL_SUBMIT',
    'COMPLETED',
] as const;

export type MockInterviewStatus = (typeof MOCK_STATUSES)[number];

export const MOCK_SECTIONS = [
    'DSA',
    'SYSTEM_DESIGN',
    'BEHAVIORAL',
] as const;

export type MockInterviewSection = (typeof MOCK_SECTIONS)[number];

export const LOCK_STATES = [
    'LOCKED',
    'ACTIVE',
    'SUBMITTED',
] as const;

export type MockInterviewSectionLockState = (typeof LOCK_STATES)[number];

export const EVAL_STATUSES = [
    'NOT_REQUESTED',
    'PENDING',
    'COMPLETED',
    'FAILED',
    'NO_SUBMISSION',
] as const;

export type MockInterviewEvalStatus = (typeof EVAL_STATUSES)[number];

export const SECTION_ORDER: readonly MockInterviewSection[] = [
    'DSA',
    'SYSTEM_DESIGN',
    'BEHAVIORAL',
] as const;

export const SECTION_DURATION_MS = 60 * 60 * 1000;
export const TOTAL_DURATION_MS = 3 * SECTION_DURATION_MS;

export const DSA_SECTION_SUBMISSION_NOTE =
    'You can submit each problem multiple times. When you submit the DSA section, your most recent submission per problem will be evaluated.';

export const SYSTEM_DESIGN_SECTION_EVAL_NOTE =
    'System design evaluation runs only after you submit this section.';

export const BEHAVIORAL_SECTION_EVAL_NOTE =
    'Behavioral evaluation runs only after you submit this section.';

export const HIRING_BANDS = [
    {
        minScore: 85,
        label: 'Strong Hire',
        description: 'Ready for onsite loops at competitive companies.',
    },
    {
        minScore: 70,
        label: 'Hire',
        description: 'Solid foundation with a few polish items before interviews.',
    },
    {
        minScore: 55,
        label: 'Lean Hire',
        description: 'Promising signal — prioritize weak sections this week.',
    },
    {
        minScore: 45,
        label: 'Borderline',
        description: 'Close to interview-ready, but key weaknesses need improvement.',
    },
    {
        minScore: 30,
        label: 'Lean Reject',
        description: 'Some positive signals, but substantial gaps remain in core skills.',
    },
    {
        minScore: 20,
        label: 'Reject',
        description: 'Performance is below the expected hiring bar. Focus on fundamentals.',
    },
    {
        minScore: 0,
        label: 'Strong Reject',
        description: 'Significant improvement is needed before attempting similar interviews.',
    },
] as const;

export type HiringBand = (typeof HIRING_BANDS)[number];

export function getHiringBand(overallScore: number | null): HiringBand {
    const score = overallScore ?? 0;

    return (
        HIRING_BANDS.find((band) => score >= band.minScore) ??
        HIRING_BANDS[HIRING_BANDS.length - 1]
    );
}

export interface StudyPlanDay {
    day: number;
    topic: string;
    description: string;
}

export interface StudyPlan {
    days: StudyPlanDay[];
    summary: string;
}

export interface MockInterviewDsaSlotDetail {
    id: string;
    slotIndex: number;
    problemId: string;
    submissionId: string | null;
}

export interface MockInterviewSystemDesignDetail {
    id: string;
    questionId: string;
    submissionId: string | null;
}

export interface MockInterviewBehavioralDetail {
    id: string;
    roleName: string | null;
    questionId: string | null;
    sessionId: string | null;
}

//gives info about each section
export interface MockInterviewSectionState {
    section: MockInterviewSection;
    lockState: MockInterviewSectionLockState;
    startedAt: string | null;
    submittedAt: string | null;
    deadlineAt: string | null;
    remainingMs: number;
    timeTakenMs: number;
    timedOut: boolean;
}

export interface MockInterviewListItem {
    id: string;
    status: MockInterviewStatus;
    currentSection: MockInterviewSection;
    startTime: string | null;
    createdAt: string;
    finalizedAt: string | null;
}

export interface MockInterviewSessionDetail {
    id: string;
    status: MockInterviewStatus;
    currentSection: MockInterviewSection;
    startTime: string | null;
    finalizedAt: string | null;
    createdAt: string;
    updatedAt: string;
    dsaProblems: MockInterviewDsaSlotDetail[];
    systemDesign: MockInterviewSystemDesignDetail | null;
    behavioral: MockInterviewBehavioralDetail | null;
    sections: MockInterviewSectionState[];
    activeSectionRemainingMs: number;
    totalRemainingMs: number;
    totalTimeTakenMs: number;
}

export interface MockInterviewSectionEvalStatus {
    section: MockInterviewSection;
    status: MockInterviewEvalStatus;
}

export interface MockInterviewReportSectionScore {
    section: MockInterviewSection;
    overallScore: number | null;
    timeTakenMs: number;
    timeCapMs: number;
}

export interface MockInterviewReportDsaQuestionScore {
    slotIndex: number;
    problemId: string;
    submissionId: string | null;
    overallScore: number;
    evalStatus: MockInterviewEvalStatus;
    message?: string;
}

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

export interface MockInterviewReportDetail {
    id: string;
    status: MockInterviewStatus;
    overallScore: number | null;
    totalTimeTakenMs: number;
    totalTimeCapMs: number;
    sections: MockInterviewReportSectionScore[];
    dsaQuestions: MockInterviewReportDsaQuestionScore[];
    evaluationStatuses: MockInterviewSectionEvalStatus[];
    finalizedAt: string | null;
    dsaQuestionReports: MockInterviewDsaQuestionReport[];
    systemDesignReport: MockInterviewSystemDesignReport | null;
    behavioralReport: MockInterviewBehavioralReport | null;
}

export interface MockInterviewStudyPlanDetail {
    id: string;
    mockInterviewId: string;
    days: StudyPlanDay[];
    summary: string;
    model: string;
    tokensUsed: number;
    createdAt: string;
}

export interface GetMockInterviewResponse {
    interview: MockInterviewSessionDetail;
}

export interface ListMyMockInterviewsResult {
    interviews: MockInterviewListItem[];
    pagination: Pagination;
}

export interface ListMyMockInterviewsQuery {
    page?: number;
    limit?: number;
}

export interface LinkDsaSubmissionInput {
    submissionId: string;
}

export interface LinkSystemDesignSubmissionInput {
    submissionId: string;
}

export interface SelectBehavioralRoleInput {
    roleName: string;
}

export interface ListMockBehavioralRolesResult {
    roles: string[];
}

export interface CreateMockBehavioralSessionResponse {
    interview: MockInterviewSessionDetail;
    session: BehavioralSessionDetail;
}

export interface GetMockInterviewReportResponse {
    report: MockInterviewReportDetail;
}

export interface GetMockInterviewStudyPlanResponse {
    studyPlan: MockInterviewStudyPlanDetail | null;
}

export interface GenerateMockInterviewStudyPlanResponse {
    studyPlan: MockInterviewStudyPlanDetail;
}

export function getSectionLabel(section: MockInterviewSection): string {
    switch (section) {
        case 'DSA':
            return 'DSA';
        case 'SYSTEM_DESIGN':
            return 'System Design';
        case 'BEHAVIORAL':
            return 'Behavioral';
        default:
            return section;
    }
}
