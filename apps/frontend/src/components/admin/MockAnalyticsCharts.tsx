'use client';

import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { AdminStatCard } from '@/components/admin/AdminPageShell';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import type { MockAnalyticsResponse } from '@/types/admin';

export interface MockAnalyticsChartsProps {
    data: MockAnalyticsResponse;
}

export function MockAnalyticsCharts({ data }: MockAnalyticsChartsProps) {
    const { stats, hiringBandDistribution } = data;

    const averageScore =
        stats.averageInterviewScore == null
            ? '—'
            : stats.averageInterviewScore.toFixed(1);

    return (
        <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
                <AdminStatCard
                    label="Premium Users"
                    value={String(stats.premiumUsers)}
                    hint="Paid plan with ≥1 completed mock interview"
                />
                <AdminStatCard
                    label="Total Mock Interviews"
                    value={String(stats.totalMockInterviews)}
                    hint="Completed mock interviews only"
                />
                <AdminStatCard
                    label="Average Interview Score of all the users"
                    value={averageScore}
                />
            </div>

            <Card className="overflow-hidden border-emerald-200/60 shadow-soft">
                <CardHeader>
                    <CardTitle>Hiring Band Distribution</CardTitle>
                    <CardDescription>
                        Based on each user’s average interview score
                    </CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={hiringBandDistribution}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                            <XAxis
                                dataKey="label"
                                interval={0}
                                angle={-20}
                                textAnchor="end"
                                height={70}
                                tick={{ fontSize: 11 }}
                            />
                            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                            <Tooltip />
                            <Bar dataKey="count" name="Users" fill="#059669" radius={4} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <Card className="overflow-hidden border-emerald-200/60 shadow-soft">
                <CardHeader>
                    <CardTitle>Band counts</CardTitle>
                    <CardDescription>Textual breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {hiringBandDistribution.map((band) => (
                            <li
                                key={band.label}
                                className="flex items-center justify-between rounded-2xl border border-emerald-200/60 bg-gradient-to-br from-white to-emerald-50/50 px-4 py-3 text-sm shadow-soft"
                            >
                                <span className="text-zinc-700">{band.label}</span>
                                <span className="font-semibold text-zinc-900">
                                    {band.count}
                                </span>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
        </div>
    );
}
