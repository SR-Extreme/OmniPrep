'use client';

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import type { ProfileStats as ProfileStatsData } from '@/types/profile';

export interface ProfileStatsProps {
    stats: ProfileStatsData;
}

export function ProfileStats({ stats }: ProfileStatsProps) {
    return (
        <div className="grid gap-4 lg:grid-cols-3">
            <Card>
                <CardHeader>
                    <p className="section-label">DSA</p>
                    <CardTitle>Problem practice</CardTitle>
                    <CardDescription>Submission activity</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-3 text-sm">
                    <StatRow label="Questions attempted" value={stats.dsa.totalQuestions} />
                    <StatRow label="Total submissions" value={stats.dsa.totalSubmissions} />
                    <StatRow label="Accepted" value={stats.dsa.totalAccepted} />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <p className="section-label">System Design</p>
                    <CardTitle>Design practice</CardTitle>
                    <CardDescription>Question coverage</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-3 text-sm">
                    <StatRow
                        label="Questions attempted"
                        value={stats.systemDesign.totalQuestions}
                    />
                    <StatRow
                        label="Total submissions"
                        value={stats.systemDesign.totalSubmissions}
                    />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <p className="section-label">Behavioral</p>
                    <CardTitle>Interview practice</CardTitle>
                    <CardDescription>Session progress</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-3 text-sm">
                    <StatRow label="Attempts" value={stats.behavioral.totalAttempts} />
                    <StatRow label="Completed" value={stats.behavioral.totalCompleted} />
                </CardContent>
            </Card>
        </div>
    );
}

function StatRow({ label, value }: { label: string; value: number }) {
    return (
        <div className="flex items-center justify-between gap-3 rounded-md border border-zinc-200 bg-zinc-50/80 px-3 py-2">
            <span className="text-zinc-600">{label}</span>
            <span className="font-semibold text-zinc-900">{value}</span>
        </div>
    );
}
