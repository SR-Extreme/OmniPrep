import type { StudyPlanDay } from './mock-interview';

export type ProfileRole = 'ADMIN' | 'CANDIDATE';

export type StudyPlanTaskKey =
    | 'day:1'
    | 'day:2'
    | 'day:3'
    | 'day:4'
    | 'day:5'
    | 'day:6'
    | 'day:7';

export interface DsaStats {
    totalQuestions: number;
    totalSubmissions: number;
    totalAccepted: number;
}

export interface SystemDesignStats {
    totalQuestions: number;
    totalSubmissions: number;
}

export interface BehavioralStats {
    totalAttempts: number;
    totalCompleted: number;
}

export interface ProfileStats {
    dsa: DsaStats;
    systemDesign: SystemDesignStats;
    behavioral: BehavioralStats;
}

export interface ProfileResponse {
    id: string;
    name: string;
    email: string;
    role: ProfileRole;
    image: string | null;
    phoneNo: string | null;
    createdAt: string;
    recentLogin: string | null;
    isPremium: boolean;
    premiumFrom: string | null;
    premiumTill: string | null;
    averageInterviewScore: number | null;
    stats: ProfileStats;
}

export interface UpdateProfileBody {
    name?: string;
    phoneNo?: string;
    image?: string | null;
}

export interface StudyPlanHistoryItem {
    id: string;
    mockInterviewId: string;
    createdAt: string;
    totalTasks: number;
    completedTasks: number;
    completionPercent: number;
    completedAt: string | null;
}

export interface StudyPlanHistoryResponse {
    plans: StudyPlanHistoryItem[];
}

export interface StudyPlanDetailResponse {
    id: string;
    mockInterviewId: string;
    days: StudyPlanDay[];
    summary: string;
    completedTaskKeys: StudyPlanTaskKey[];
    completionPercent: number;
    completedAt: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface SubmitStudyPlanProgressBody {
    completedTaskKeys: StudyPlanTaskKey[];
}