'use client';

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import type { StudyPlanHistoryItem } from '@/types/profile';

export interface StudyPlanHistoryProps {
    plans: StudyPlanHistoryItem[];
    selectedPlanId?: string | null;
    onSelect: (plan: StudyPlanHistoryItem) => void;
}

function formatDate(value: string): string {
    return new Intl.DateTimeFormat('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    }).format(new Date(value));
}

export function StudyPlanHistory({
    plans,
    selectedPlanId = null,
    onSelect,
}: StudyPlanHistoryProps) {
    return (
        <Card>
            <CardHeader>
                <p className="section-label">Study plans</p>
                <CardTitle>History</CardTitle>
                <CardDescription>
                    Plans generated from completed mock interviews
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-3">
                {plans.length === 0 ? (
                    <p className="rounded-md border border-dashed border-zinc-300 bg-zinc-50 px-4 py-6 text-center text-sm text-zinc-600">
                        No study plans yet. Finish a mock interview and generate one from
                        the report.
                    </p>
                ) : (
                    plans.map((plan) => {
                        const isSelected = selectedPlanId === plan.id;
                        const isComplete = plan.completionPercent === 100;

                        return (
                            <div
                                key={plan.id}
                                className={`flex flex-col gap-3 rounded-lg border px-4 py-3 sm:flex-row sm:items-center sm:justify-between ${isSelected
                                        ? 'border-emerald-400 bg-emerald-50/40'
                                        : 'border-zinc-200 bg-white'
                                    }`}
                            >
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <p className="font-medium text-zinc-900">
                                            Plan · {formatDate(plan.createdAt)}
                                        </p>
                                        {isComplete ? (
                                            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                                                Completed
                                            </span>
                                        ) : (
                                            <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600 ring-1 ring-inset ring-zinc-500/15">
                                                {plan.completionPercent}%
                                            </span>
                                        )}
                                    </div>
                                    <p className="mt-1 text-sm text-zinc-600">
                                        {plan.completedTasks}/{plan.totalTasks} day tasks
                                        done
                                    </p>
                                </div>

                                <Button
                                    type="button"
                                    size="sm"
                                    variant={isSelected ? 'default' : 'secondary'}
                                    onClick={() => onSelect(plan)}
                                >
                                    {isSelected ? 'Selected' : 'View'}
                                </Button>
                            </div>
                        );
                    })
                )}
            </CardContent>
        </Card>
    );
}