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
            <div className="grid gap-3 sm:grid-cols-3">
                <StatCard
                    label="Premium Users"
                    value={String(stats.premiumUsers)}
                    hint="Paid plan with ≥1 completed mock interview"
                />
                <StatCard
                    label="Total Mock Interviews"
                    value={String(stats.totalMockInterviews)}
                    hint="Completed mock interviews only"
                />
                <StatCard
                    label="Average Interview Score"
                    value={averageScore}
                />
            </div>

            <Card>
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

            <Card>
                <CardHeader>
                    <CardTitle>Band counts</CardTitle>
                    <CardDescription>Textual breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                    <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                        {hiringBandDistribution.map((band) => (
                            <li
                                key={band.label}
                                className="flex items-center justify-between rounded-md border border-zinc-200 bg-zinc-50/80 px-3 py-2 text-sm"
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

function StatCard({
    label,
    value,
    hint,
}: {
    label: string;
    value: string;
    hint?: string;
}) {
    return (
        <div className="rounded-lg border border-zinc-200 bg-white px-4 py-3 shadow-soft">
            <p className="section-label">{label}</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-zinc-900">
                {value}
            </p>
            {hint ? (
                <p className="mt-1 text-xs leading-relaxed text-zinc-500">{hint}</p>
            ) : null}
        </div>
    );
}