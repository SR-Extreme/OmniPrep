'use client';

import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Line,
    LineChart,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
    REVENUE_TIME_RANGES,
    REVENUE_TIME_RANGE_LABELS,
    type RevenueDashboardResponse,
    type RevenueTimeRange,
} from '@/types/admin';

export interface RevenueChartsProps {
    data: RevenueDashboardResponse;
    onRangeChange: (range: RevenueTimeRange) => void;
    isLoading?: boolean;
}

const PIE_COLORS = {
    Premium: '#059669',
    Free: '#a1a1aa',
} as const;

function formatInr(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(amount);
}

export function RevenueCharts({
    data,
    onRangeChange,
    isLoading = false,
}: RevenueChartsProps) {
    const { stats, summaries, revenueOverTime, premiumVsFree, subscriptionDistribution } =
        data;

    return (
        <div className={cn('space-y-6', isLoading && 'opacity-70')}>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                <StatCard label="Total Users" value={String(stats.totalUsers)} />
                <StatCard
                    label="Total Revenue"
                    value={formatInr(stats.totalRevenueInr)}
                />
                <StatCard
                    label="Monthly Plans"
                    value={String(stats.totalMonthlySubscriptions)}
                />
                <StatCard
                    label="6-Month Plans"
                    value={String(stats.totalSixMonthSubscriptions)}
                />
                <StatCard
                    label="Yearly Plans"
                    value={String(stats.totalYearlySubscriptions)}
                />
            </div>

            <Card>
                <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <CardTitle>Revenue vs Time</CardTitle>
                        <CardDescription>
                            Cumulative revenue by date — default last 1 month
                        </CardDescription>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {REVENUE_TIME_RANGES.map((range) => (
                            <Button
                                key={range}
                                type="button"
                                size="sm"
                                variant={data.range === range ? 'default' : 'secondary'}
                                onClick={() => onRangeChange(range)}
                                disabled={isLoading}
                            >
                                {REVENUE_TIME_RANGE_LABELS[range]}
                            </Button>
                        ))}
                    </div>
                </CardHeader>
                <CardContent className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={revenueOverTime}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip
                                formatter={(value: number) => formatInr(value)}
                                labelFormatter={(label) => String(label)}
                            />
                            <Line
                                type="monotone"
                                dataKey="revenueInr"
                                name="Cumulative Revenue"
                                stroke="#059669"
                                strokeWidth={2}
                                dot={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <div className="grid gap-4 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Premium vs Free</CardTitle>
                        <CardDescription>Current user split</CardDescription>
                    </CardHeader>
                    <CardContent className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={premiumVsFree}
                                    dataKey="count"
                                    nameKey="label"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={90}
                                    label={({ label, count }) => `${label}: ${count}`}
                                >
                                    {premiumVsFree.map((entry) => (
                                        <Cell
                                            key={entry.label}
                                            fill={PIE_COLORS[entry.label]}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Subscription Distribution</CardTitle>
                        <CardDescription>
                            Total premium and plan counts
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={subscriptionDistribution}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                                <Tooltip />
                                <Bar dataKey="count" name="Count" fill="#059669" radius={4} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Summaries</CardTitle>
                    <CardDescription>Derived from paid subscription history</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <StatCard
                        label="Total Revenue"
                        value={formatInr(summaries.totalRevenueInr)}
                    />
                    <StatCard
                        label="Premium %"
                        value={`${summaries.premiumPercentage.toFixed(1)}%`}
                    />
                    <StatCard
                        label="Average Revenue Per User (ARPU)"
                        value={formatInr(summaries.averageRevenuePerUserInr)}
                    />
                    <StatCard
                        label="Highest Selling Plan"
                        value={summaries.highestSellingPlan ?? '—'}
                    />
                    <StatCard
                        label="Monthly Sales"
                        value={formatInr(summaries.monthlySalesInr)}
                    />
                    <StatCard
                        label="6-Month Sales"
                        value={formatInr(summaries.sixMonthSalesInr)}
                    />
                    <StatCard
                        label="Annual Sales"
                        value={formatInr(summaries.annualSalesInr)}
                    />
                </CardContent>
            </Card>
        </div>
    );
}

function StatCard({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-lg border border-zinc-200 bg-zinc-50/80 px-4 py-3">
            <p className="section-label">{label}</p>
            <p className="mt-1 text-lg font-semibold tracking-tight text-zinc-900">
                {value}
            </p>
        </div>
    );
}