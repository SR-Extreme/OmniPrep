import { prisma } from '../../config/db.js';
import {
    ADMIN_HIRING_BANDS,
    REVENUE_TIME_RANGE_DAYS,
    getAdminHiringBandLabel,
    type MockAnalyticsResponse,
    type RevenueDashboardResponse,
    type RevenueTimePoint,
    type RevenueTimeRange,
} from '../../types/admin.types.js';
import type { BillingPlan } from '../../types/billing.types.js';

const PAID_SUBSCRIPTION_STATUSES = ['ACTIVE', 'EXPIRED'] as const;

function startDateForRange(range: RevenueTimeRange): Date | null {
    const days = REVENUE_TIME_RANGE_DAYS[range];
    if (days == null) {
        return null;
    }
    const start = new Date();
    start.setUTCHours(0, 0, 0, 0);
    start.setUTCDate(start.getUTCDate() - (days - 1));
    return start;
}

function toDateKey(date: Date): string {
    return date.toISOString().slice(0, 10);
}

function buildEmptyRevenueSeries(
    range: RevenueTimeRange,
    from: Date | null,
): RevenueTimePoint[] {
    if (range === 'ALL' || from == null) {
        return [];
    }

    const points: RevenueTimePoint[] = [];
    const cursor = new Date(from);
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    while (cursor.getTime() <= today.getTime()) {
        points.push({
            date: toDateKey(cursor),
            revenueInr: 0,
        });
        cursor.setUTCDate(cursor.getUTCDate() + 1);
    }

    return points;
}

export async function getRevenueDashboard(
    range: RevenueTimeRange,
): Promise<RevenueDashboardResponse> {
    const rangeStart = startDateForRange(range);
    const now = new Date();

    const paidWhere = {
        status: { in: [...PAID_SUBSCRIPTION_STATUSES] },
    };

    const [
        totalUsers,
        totalPremiumUsers,
        paidSubscriptions,
        planGroups,
        rangedPaidSubscriptions,
    ] = await Promise.all([
        prisma.user.count({
            where: { role: 'CANDIDATE' },
        }),
        prisma.user.count({
            where: {
                role: 'CANDIDATE',
                isPremium: true,
                premiumTill: { gt: now },
            },
        }),
        prisma.subscription.findMany({
            where: paidWhere,
            select: {
                plan: true,
                amount: true,
                createdAt: true,
            },
        }),
        prisma.subscription.groupBy({
            by: ['plan'],
            where: paidWhere,
            _count: { _all: true },
            _sum: { amount: true },
        }),
        prisma.subscription.findMany({
            where: {
                ...paidWhere,
                ...(rangeStart ? { createdAt: { gte: rangeStart } } : {}),
            },
            select: {
                amount: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'asc' },
        }),
    ]);

    const countByPlan: Record<BillingPlan, number> = {
        MONTHLY: 0,
        SIX_MONTHS: 0,
        YEARLY: 0,
    };
    const salesByPlan: Record<BillingPlan, number> = {
        MONTHLY: 0,
        SIX_MONTHS: 0,
        YEARLY: 0,
    };

    for (const group of planGroups) {
        countByPlan[group.plan] = group._count._all;
        salesByPlan[group.plan] = group._sum.amount ?? 0;
    }

    const totalRevenueInr = paidSubscriptions.reduce(
        (sum, row) => sum + row.amount,
        0,
    );

    const revenueMap = new Map<string, number>();
    for (const row of rangedPaidSubscriptions) {
        const key = toDateKey(row.createdAt);
        revenueMap.set(key, (revenueMap.get(key) ?? 0) + row.amount);
    }

    let revenueOverTime = buildEmptyRevenueSeries(range, rangeStart);

    if (revenueOverTime.length === 0) {
        // ALL range: emit only days that have revenue
        revenueOverTime = Array.from(revenueMap.entries())
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([date, revenueInr]) => ({ date, revenueInr }));
    } else {
        revenueOverTime = revenueOverTime.map((point) => ({
            ...point,
            revenueInr: revenueMap.get(point.date) ?? 0,
        }));
    }

    // Cumulative revenue through each date (not daily amount)
    let cumulativeRevenue = 0;
    revenueOverTime = revenueOverTime.map((point) => {
        cumulativeRevenue += point.revenueInr;
        return {
            date: point.date,
            revenueInr: cumulativeRevenue,
        };
    });

    const freeUsers = Math.max(0, totalUsers - totalPremiumUsers);
    const premiumPercentage =
        totalUsers === 0
            ? 0
            : Number(((totalPremiumUsers / totalUsers) * 100).toFixed(2));
    const averageRevenuePerUserInr =
        totalUsers === 0
            ? 0
            : Number((totalRevenueInr / totalUsers).toFixed(2));

    const highestSellingPlan =
        (Object.entries(countByPlan) as [BillingPlan, number][])
            .sort((a, b) => b[1] - a[1])
            .find(([, count]) => count > 0)?.[0] ?? null;

    const activePlanGroups = await prisma.subscription.groupBy({
        by: ['plan'],
        where: {
            status: 'ACTIVE',
            expiresAt: { gt: now },
        },
        _count: { _all: true },
    });

    const activeCountByPlan: Record<BillingPlan, number> = {
        MONTHLY: 0,
        SIX_MONTHS: 0,
        YEARLY: 0,
    };
    for (const group of activePlanGroups) {
        activeCountByPlan[group.plan] = group._count._all;
    }

    return {
        range,
        stats: {
            totalUsers,
            totalPremiumUsers,
            totalRevenueInr,
            totalMonthlySubscriptions: countByPlan.MONTHLY,
            totalSixMonthSubscriptions: countByPlan.SIX_MONTHS,
            totalYearlySubscriptions: countByPlan.YEARLY,
        },
        revenueOverTime,
        premiumVsFree: [
            { label: 'Premium', count: totalPremiumUsers },
            { label: 'Free', count: freeUsers },
        ],
        subscriptionDistribution: [
            { label: 'Total Premium', count: totalPremiumUsers },
            { label: 'Monthly Plan', count: activeCountByPlan.MONTHLY },
            { label: 'Half-Yearly Plan', count: activeCountByPlan.SIX_MONTHS },
            { label: 'Yearly Plan', count: activeCountByPlan.YEARLY },
        ],
        summaries: {
            totalRevenueInr,
            premiumPercentage,
            averageRevenuePerUserInr,
            highestSellingPlan,
            monthlySalesInr: salesByPlan.MONTHLY,
            sixMonthSalesInr: salesByPlan.SIX_MONTHS,
            annualSalesInr: salesByPlan.YEARLY,
        },
    };
}

export async function getMockAnalytics(): Promise<MockAnalyticsResponse> {
    const [premiumUsers, totalMockInterviews, scoreAgg, scoredUsers] =
        await Promise.all([
            prisma.user.count({
                where: {
                    role: 'CANDIDATE',
                    subscriptions: {
                        some: {
                            status: { in: [...PAID_SUBSCRIPTION_STATUSES] },
                        },
                    },
                    mockInterviews: {
                        some: {
                            status: 'COMPLETED',
                        },
                    },
                },
            }),
            prisma.mockInterview.count({
                where: { status: 'COMPLETED' },
            }),
            prisma.user.aggregate({
                where: {
                    role: 'CANDIDATE',
                    averageInterviewScore: { not: null },
                },
                _avg: { averageInterviewScore: true },
            }),
            prisma.user.findMany({
                where: {
                    role: 'CANDIDATE',
                    averageInterviewScore: { not: null },
                },
                select: { averageInterviewScore: true },
            }),
        ]);

    const bandCounts = new Map<string, number>(
        ADMIN_HIRING_BANDS.map((band) => [band.label, 0]),
    );

    for (const user of scoredUsers) {
        if (user.averageInterviewScore == null) {
            continue;
        }
        const label = getAdminHiringBandLabel(user.averageInterviewScore);
        bandCounts.set(label, (bandCounts.get(label) ?? 0) + 1);
    }

    return {
        stats: {
            premiumUsers,
            totalMockInterviews,
            averageInterviewScore:
                scoreAgg._avg.averageInterviewScore == null
                    ? null
                    : Number(scoreAgg._avg.averageInterviewScore.toFixed(2)),
        },
        hiringBandDistribution: ADMIN_HIRING_BANDS.map((band) => ({
            label: band.label,
            count: bandCounts.get(band.label) ?? 0,
        })),
    };
}