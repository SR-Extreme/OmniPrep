import { prisma } from '../../config/db.js';
import type { Role } from '@prisma/client';
import { getUserPremiumStatus } from '../../middleware/premium.middleware.js';
import {
    CloudinaryError,
    uploadProfileAvatar,
    type UploadAvatarInput,
} from '../../services/CloudinaryService.js';
import type {
    SubmitStudyPlanProgressBody,
    UpdateProfileBody,
} from './profile.validation.js';

export class ProfileError extends Error {
    constructor(
        message: string,
        public readonly code: 'NOT_FOUND' | 'FORBIDDEN' | 'INVALID_STATE' | 'INVALID_FILE' | 'CONFIG_ERROR',
    ) {
        super(message);
        this.name = 'ProfileError';
    }
}

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
    role: Role;
    image: string | null;
    phoneNo: string | null;
    createdAt: Date;
    recentLogin: Date | null;
    isPremium: boolean;
    premiumFrom: Date | null;
    premiumTill: Date | null;
    averageInterviewScore: number | null;
    stats: ProfileStats;
}

export interface StudyPlanHistoryItem {
    id: string;
    mockInterviewId: string;
    createdAt: Date;
    totalTasks: number;
    completedTasks: number;
    completionPercent: number;
    completedAt: Date | null;
}

export interface StudyPlanDetailResponse {
    id: string;
    mockInterviewId: string;
    days: unknown;
    summary: string;
    completedTaskKeys: string[];
    completionPercent: number;
    completedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

function countDays(days: unknown): number {
    return Array.isArray(days) ? days.length : 0;
}

function toCompletedTaskKeys(value: unknown): string[] {
    if (!Array.isArray(value)) {
        return [];
    }
    return value.filter((key): key is string => typeof key === 'string');
}

function mapCloudinaryError(err: CloudinaryError): ProfileError {
    if (err.code === 'CONFIG_ERROR') {
        return new ProfileError(err.message, 'CONFIG_ERROR');
    }
    if (err.code === 'INVALID_FILE') {
        return new ProfileError(err.message, 'INVALID_FILE');
    }
    return new ProfileError(err.message, 'INVALID_STATE');
}

async function getDsaStats(userId: string): Promise<DsaStats> {
    const submissionWhere = { userId, isSampleRun: false } as const;

    const [totalSubmissions, totalAccepted, distinctProblems] =
        await Promise.all([
            prisma.submission.count({ where: submissionWhere }),
            prisma.submission.count({
                where: { ...submissionWhere, status: 'ACCEPTED' },
            }),
            prisma.submission.groupBy({
                by: ['problemId'],
                where: submissionWhere,
            }),
        ]);

    return {
        totalQuestions: distinctProblems.length,
        totalSubmissions,
        totalAccepted,
    };
}

async function getSystemDesignStats(userId: string): Promise<SystemDesignStats> {
    const [totalSubmissions, distinctQuestions] = await Promise.all([
        prisma.systemDesignSubmission.count({ where: { userId } }),
        prisma.systemDesignSubmission.groupBy({
            by: ['questionId'],
            where: { userId },
        }),
    ]);

    return {
        totalQuestions: distinctQuestions.length,
        totalSubmissions,
    };
}

async function getBehavioralStats(userId: string): Promise<BehavioralStats> {
    const [totalAttempts, totalCompleted] = await Promise.all([
        prisma.behavioralSession.count({ where: { userId } }),
        prisma.behavioralSession.count({
            where: { userId, status: 'COMPLETED' },
        }),
    ]);

    return {
        totalAttempts,
        totalCompleted,
    };
}

export async function getProfileStats(userId: string): Promise<ProfileStats> {
    const [dsa, systemDesign, behavioral] = await Promise.all([
        getDsaStats(userId),
        getSystemDesignStats(userId),
        getBehavioralStats(userId),
    ]);

    return { dsa, systemDesign, behavioral };
}

export async function getProfile(userId: string): Promise<ProfileResponse> {
    const premiumStatus = await getUserPremiumStatus(userId);

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            image: true,
            phoneNo: true,
            createdAt: true,
            recentLogin: true,
            averageInterviewScore: true,
        },
    });

    if (!user) {
        throw new ProfileError('User not found', 'NOT_FOUND');
    }

    const stats = await getProfileStats(userId);

    return {
        ...user,
        isPremium: premiumStatus.isPremium,
        premiumFrom: premiumStatus.premiumFrom,
        premiumTill: premiumStatus.premiumTill,
        stats,
    };
}

export async function updateProfile(
    userId: string,
    body: UpdateProfileBody,
): Promise<ProfileResponse> {
    const existing = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true },
    });

    if (!existing) {
        throw new ProfileError('User not found', 'NOT_FOUND');
    }

    await prisma.user.update({
        where: { id: userId },
        data: {
            ...(body.name !== undefined ? { name: body.name } : {}),
            ...(body.phoneNo !== undefined ? { phoneNo: body.phoneNo } : {}),
            ...(body.image !== undefined ? { image: body.image } : {}),
        },
    });

    return getProfile(userId);
}

export async function uploadAvatar(
    userId: string,
    file: UploadAvatarInput,
): Promise<ProfileResponse> {
    const existing = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true },
    });

    if (!existing) {
        throw new ProfileError('User not found', 'NOT_FOUND');
    }

    let imageUrl: string;

    try {
        imageUrl = await uploadProfileAvatar(file, userId);
    } catch (err) {
        if (err instanceof CloudinaryError) {
            throw mapCloudinaryError(err);
        }
        throw err;
    }

    await prisma.user.update({
        where: { id: userId },
        data: { image: imageUrl },
    });

    return getProfile(userId);
}

export async function getStudyPlanHistory(
    userId: string,
): Promise<StudyPlanHistoryItem[]> {
    const plans = await prisma.mockInterviewStudyPlan.findMany({
        where: { mockInterview: { userId } },
        orderBy: { createdAt: 'desc' },
        select: {
            id: true,
            mockInterviewId: true,
            createdAt: true,
            days: true,
            completedTaskKeys: true,
            completionPercent: true,
            completedAt: true,
        },
    });

    return plans.map((plan) => ({
        id: plan.id,
        mockInterviewId: plan.mockInterviewId,
        createdAt: plan.createdAt,
        totalTasks: countDays(plan.days),
        completedTasks: toCompletedTaskKeys(plan.completedTaskKeys).length,
        completionPercent: plan.completionPercent,
        completedAt: plan.completedAt,
    }));
}

async function getOwnedStudyPlanOrThrow(userId: string, studyPlanId: string) {
    const plan = await prisma.mockInterviewStudyPlan.findUnique({
        where: { id: studyPlanId },
        include: {
            mockInterview: { select: { userId: true } },
        },
    });

    if (!plan || plan.mockInterview.userId !== userId) {
        throw new ProfileError('Study plan not found', 'NOT_FOUND');
    }

    return plan;
}

function toStudyPlanDetailResponse(plan: {
    id: string;
    mockInterviewId: string;
    days: unknown;
    summary: string;
    completedTaskKeys: unknown;
    completionPercent: number;
    completedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}): StudyPlanDetailResponse {
    return {
        id: plan.id,
        mockInterviewId: plan.mockInterviewId,
        days: plan.days,
        summary: plan.summary,
        completedTaskKeys: toCompletedTaskKeys(plan.completedTaskKeys),
        completionPercent: plan.completionPercent,
        completedAt: plan.completedAt,
        createdAt: plan.createdAt,
        updatedAt: plan.updatedAt,
    };
}

export async function getStudyPlanDetail(
    userId: string,
    studyPlanId: string,
): Promise<StudyPlanDetailResponse> {
    const plan = await getOwnedStudyPlanOrThrow(userId, studyPlanId);
    return toStudyPlanDetailResponse(plan);
}

export async function submitStudyPlanProgress(
    userId: string,
    studyPlanId: string,
    body: SubmitStudyPlanProgressBody,
): Promise<StudyPlanDetailResponse> {
    const plan = await getOwnedStudyPlanOrThrow(userId, studyPlanId);

    const totalTasks = countDays(plan.days);
    const validKeys = new Set(
        Array.from({ length: totalTasks }, (_, i) => `day:${i + 1}`),
    );

    const uniqueCompleted = Array.from(
        new Set(body.completedTaskKeys),
    ).filter((key) => validKeys.has(key));

    const completionPercent =
        totalTasks === 0
            ? 0
            : Math.round((uniqueCompleted.length / totalTasks) * 100);

    const completedAt = completionPercent === 100 ? new Date() : null;

    const updated = await prisma.mockInterviewStudyPlan.update({
        where: { id: plan.id },
        data: {
            completedTaskKeys: uniqueCompleted,
            completionPercent,
            completedAt,
        },
    });

    return toStudyPlanDetailResponse(updated);
}