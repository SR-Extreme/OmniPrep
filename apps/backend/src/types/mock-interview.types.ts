import { z } from 'zod';

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

export const DSA_PROBLEM_COUNT = 2;
export const DSA_DIFFICULTY = 'MEDIUM' as const;
export const SECTION_DURATION_MS = 60 * 60 * 1000;
export const TOTAL_DURATION_MS = 3 * SECTION_DURATION_MS;

export const SECTION_ORDER: readonly MockInterviewSection[] = [
    'DSA',
    'SYSTEM_DESIGN',
    'BEHAVIORAL',
] as const;

//-------study Plan

export const studyPlanDaySchema = z.object({
    day: z.number().int().min(1).max(7),
    topic: z.string().min(1),
    description: z.string().min(1),
});

export const studyPlanDaysSchema = z
    .array(studyPlanDaySchema)
    .length(7)
    .superRefine((days, ctx) => {
        for (let i = 0; i < 7; i++) {
            if (days[i]?.day !== i + 1) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: `Study plan day at index ${i} must have day=${i + 1}`,
                });
            }
        }
    });

export const studyPlanSchema = z.object({
    days: studyPlanDaysSchema,
    summary: z.string().min(1),
});

export type StudyPlanDay = z.infer<typeof studyPlanDaySchema>;
export type StudyPlan = z.infer<typeof studyPlanSchema>;

export function parseStudyPlan(value: unknown): StudyPlan {
    return studyPlanSchema.parse(value);
}

//-------Timer


export interface MockInterviewTimingFields {
    status: MockInterviewStatus;
    currentSection: MockInterviewSection;
    startTime: Date | null;
    dsaStartedAt: Date | null;
    dsaSubmittedAt: Date | null;
    systemDesignStartedAt: Date | null;
    systemDesignSubmittedAt: Date | null;
    behavioralStartedAt: Date | null;
    behavioralSubmittedAt: Date | null;
    finalizedAt: Date | null;
}

export function getSectionIndex(section: MockInterviewSection): number {
    const index = SECTION_ORDER.indexOf(section);

    if (index === -1) {
        throw new Error(`Unknown section: ${section}`);
    }

    return index;
}

export function getNextSection(
    section: MockInterviewSection,
): MockInterviewSection | null {
    const index = getSectionIndex(section);
    return SECTION_ORDER[index + 1] ?? null;
}

export function getSectionStartedAt(
    interview: MockInterviewTimingFields,
    section: MockInterviewSection,
): Date | null {
    switch (section) {
        case 'DSA':
            return interview.dsaStartedAt;
        case 'SYSTEM_DESIGN':
            return interview.systemDesignStartedAt;
        case 'BEHAVIORAL':
            return interview.behavioralStartedAt;
        default:
            return null;
    }
}

export function getSectionSubmittedAt(
    interview: MockInterviewTimingFields,
    section: MockInterviewSection,
): Date | null {
    switch (section) {
        case 'DSA':
            return interview.dsaSubmittedAt;
        case 'SYSTEM_DESIGN':
            return interview.systemDesignSubmittedAt;
        case 'BEHAVIORAL':
            return interview.behavioralSubmittedAt;
        default:
            return null;
    }
}

export function isSectionSubmitted(
    interview: MockInterviewTimingFields,
    section: MockInterviewSection,
): boolean {
    return getSectionSubmittedAt(interview, section) !== null;
}

export function isSectionActive(
    interview: MockInterviewTimingFields,
    section: MockInterviewSection,
): boolean {
    if (interview.status !== 'IN_PROGRESS') {
        return false;
    }
    return interview.currentSection === section && !isSectionSubmitted(interview, section);
}

export function getSectionLockState(
    interview: MockInterviewTimingFields,
    section: MockInterviewSection,
): MockInterviewSectionLockState {
    if (isSectionSubmitted(interview, section)) {
        return 'SUBMITTED';
    }
    if (isSectionActive(interview, section)) {
        return 'ACTIVE';
    }
    return 'LOCKED';
}

export function getSectionDeadline(
    interview: MockInterviewTimingFields,
    section: MockInterviewSection,
): Date | null {
    const startedAt = getSectionStartedAt(interview, section);
    if (!startedAt) {
        return null;
    }
    return new Date(startedAt.getTime() + SECTION_DURATION_MS);
}

export function getSectionRemainingMs(
    interview: MockInterviewTimingFields,
    section: MockInterviewSection,
    now: Date = new Date(),
): number {
    if (isSectionSubmitted(interview, section)) {
        return 0;
    }

    const deadline = getSectionDeadline(interview, section);

    if (!deadline) {
        return SECTION_DURATION_MS;
    }

    return Math.max(0, deadline.getTime() - now.getTime());
}

export function isSectionTimedOut(
    interview: MockInterviewTimingFields,
    section: MockInterviewSection,
    now: Date = new Date(),
): boolean {
    if (isSectionSubmitted(interview, section)) {
        return false;
    }

    const deadline = getSectionDeadline(interview, section);

    if (!deadline) {
        return false;
    }

    return now.getTime() >= deadline.getTime();
}

export function getSectionTimeTakenMs(
    interview: MockInterviewTimingFields,
    section: MockInterviewSection,
    now: Date = new Date(),
): number {
    const startedAt = getSectionStartedAt(interview, section);

    if (!startedAt) {
        return 0;
    }

    const submittedAt = getSectionSubmittedAt(interview, section);
    const end = submittedAt ?? now;

    const elapsed = end.getTime() - startedAt.getTime();
    return Math.min(elapsed, SECTION_DURATION_MS);
}

export function getTotalTimeTakenMs(
    interview: MockInterviewTimingFields,
    now: Date = new Date(),
): number {
    return SECTION_ORDER.reduce(
        (total, section) => total + getSectionTimeTakenMs(interview, section, now),
        0,
    );
}

export function getTotalRemainingMs(
    interview: MockInterviewTimingFields,
    now: Date = new Date(),
): number {
    if (!interview.startTime) {
        return TOTAL_DURATION_MS;
    }

    if (interview.status === 'AWAITING_FINAL_SUBMIT' || interview.status === 'COMPLETED') {
        return 0;
    }

    const elapsed = now.getTime() - interview.startTime.getTime();
    return Math.max(0, TOTAL_DURATION_MS - elapsed);
}

export function getActiveSectionRemainingMs(
    interview: MockInterviewTimingFields,
    now: Date = new Date(),
): number {
    if (interview.status !== 'IN_PROGRESS') {
        return 0;
    }

    return getSectionRemainingMs(interview, interview.currentSection, now);
}

export function shuffleInPlace<T>(items: T[]): T[] {
    for (let i = items.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [items[i], items[j]] = [items[j], items[i]];
    }

    return items;
}

export function pickRandomItems<T>(items: T[], count: number): T[] {
    if (count > items.length) {
        throw new Error(`Cannot pick ${count} items from a pool of ${items.length}`);
    }

    const copy = [...items];
    shuffleInPlace(copy);
    return copy.slice(0, count);
}

//------

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

export interface MockInterviewSectionState {
    section: MockInterviewSection;
    lockState: MockInterviewSectionLockState;
    startedAt: Date | null;
    submittedAt: Date | null;
    deadlineAt: Date | null;
    remainingMs: number;
    timeTakenMs: number;
    timedOut: boolean;
}

export interface MockInterviewListItem {
    id: string;
    status: MockInterviewStatus;
    currentSection: MockInterviewSection;
    startTime: Date | null;
    createdAt: Date;
    finalizedAt: Date | null;
}

export interface MockInterviewSessionDetail {
    id: string;
    status: MockInterviewStatus;
    currentSection: MockInterviewSection;
    startTime: Date | null;
    finalizedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
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

export const DSA_SECTION_SUBMISSION_NOTE =
    'You can submit each problem multiple times. When you submit the DSA section, your most recent submission per problem will be evaluated.';

export interface MockInterviewReportDsaQuestionScore {
    slotIndex: number;
    problemId: string;
    submissionId: string | null;
    overallScore: number;
    evalStatus: MockInterviewEvalStatus;
    message?: string;
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
    finalizedAt: Date | null;
}