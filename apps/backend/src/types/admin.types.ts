export const ADMIN_HIRING_BANDS = [
    {
        key: 'STRONG_HIRE',
        label: 'Strong Hire',
        minScore: 85,
        maxScore: 100,
    },
    {
        key: 'HIRE',
        label: 'Hire',
        minScore: 70,
        maxScore: 84,
    },
    {
        key: 'LEAN_HIRE',
        label: 'Lean Hire',
        minScore: 55,
        maxScore: 69,
    },
    {
        key: 'BORDERLINE',
        label: 'Borderline',
        minScore: 45,
        maxScore: 54,
    },
    {
        key: 'LEAN_REJECT',
        label: 'Lean Reject',
        minScore: 30,
        maxScore: 44,
    },
    {
        key: 'REJECT',
        label: 'Reject',
        minScore: 20,
        maxScore: 29,
    },
    {
        key: 'STRONG_REJECT',
        label: 'Strong Reject',
        minScore: 0,
        maxScore: 19,
    },
] as const;

export type AdminHiringBandKey = (typeof ADMIN_HIRING_BANDS)[number]['key'];
export type AdminHiringBandLabel = (typeof ADMIN_HIRING_BANDS)[number]['label'];

export function getAdminHiringBandLabel(overallScore: number): AdminHiringBandLabel {
    const score = Math.max(0, Math.min(100, overallScore));
    const band =
        ADMIN_HIRING_BANDS.find((row) => score >= row.minScore)
        ?? ADMIN_HIRING_BANDS[ADMIN_HIRING_BANDS.length - 1];
    return band.label;
}

export const REVENUE_TIME_RANGES = ['1M', '6M', '1Y', 'ALL'] as const;

export type RevenueTimeRange = (typeof REVENUE_TIME_RANGES)[number];

export const DEFAULT_REVENUE_TIME_RANGE: RevenueTimeRange = '1M';

export const REVENUE_TIME_RANGE_LABELS: Record<RevenueTimeRange, string> = {
    '1M': 'Last 1 Month',
    '6M': 'Six Months',
    '1Y': '1 Year',
    'ALL': 'All',
};

export const REVENUE_TIME_RANGE_DAYS: Record<RevenueTimeRange, number | null> = {
    '1M': 30,
    '6M': 180,
    '1Y': 365,
    'ALL': null,
};

export function isRevenueTimeRange(value: unknown): value is RevenueTimeRange {
    return (
        typeof value === 'string'
        && (REVENUE_TIME_RANGES as readonly string[]).includes(value)
    );
}

export interface RevenueDashboardStats {
    totalUsers: number;
    totalPremiumUsers: number;
    totalRevenueInr: number;
    totalMonthlySubscriptions: number;
    totalSixMonthSubscriptions: number;
    totalYearlySubscriptions: number;
}

export interface RevenueTimePoint {
    date: string;
    revenueInr: number;
}

export interface PremiumVsFreePoint {
    label: 'Premium' | 'Free';
    count: number;
}

export interface SubscriptionDistributionPoint {
    label: 'Total Premium' | 'Monthly Plan' | 'Half-Yearly Plan' | 'Yearly Plan';
    count: number;
}

export interface RevenueDashboardSummaries {
    totalRevenueInr: number;
    premiumPercentage: number;
    averageRevenuePerUserInr: number;
    highestSellingPlan: 'MONTHLY' | 'SIX_MONTHS' | 'YEARLY' | null;
    monthlySalesInr: number;
    sixMonthSalesInr: number;
    annualSalesInr: number;
}

export interface RevenueDashboardResponse {
    range: RevenueTimeRange;
    stats: RevenueDashboardStats;
    revenueOverTime: RevenueTimePoint[];
    premiumVsFree: PremiumVsFreePoint[];
    subscriptionDistribution: SubscriptionDistributionPoint[];
    summaries: RevenueDashboardSummaries;
}

export interface MockAnalyticsStats {
    premiumUsers: number;
    totalMockInterviews: number;
    averageInterviewScore: number | null;
}

export interface HiringBandDistributionPoint {
    label: AdminHiringBandLabel;
    count: number;
}

export interface MockAnalyticsResponse {
    stats: MockAnalyticsStats;
    hiringBandDistribution: HiringBandDistributionPoint[];
}

export interface AdminUserListItem {
    id: string;
    name: string;
    email: string;
    image: string | null;
    isPremium: boolean;
    averageInterviewScore: number | null;
    createdAt: Date;
    recentLogin: Date | null;
}

export interface AdminQuestionListItem {
    id: string;
    title: string;
    difficulty: 'EASY' | 'MEDIUM' | 'HARD';
    topics: string[];
    totalSubmissions: number;
    isPublished: boolean;
    publishedAt: Date | null;
    updatedAt: Date;
    createdAt: Date;
}