'use client';

import { ClipboardList } from 'lucide-react';
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
        <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-soft sm:p-6">
            <div className="mb-4">
                <p className="section-label">Study plans</p>
                <h2 className="mt-1 text-lg font-semibold tracking-tight text-zinc-900">
                    History
                </h2>
                <p className="mt-1 text-sm text-zinc-500">
                    Plans generated from completed mock interviews
                </p>
            </div>

            <div className="space-y-3">
                {plans.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50/80 px-4 py-10 text-center">
                        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-400">
                            <ClipboardList className="h-5 w-5" aria-hidden="true" />
                        </div>
                        <p className="text-sm font-medium text-zinc-700">No study plans yet</p>
                        <p className="mt-1 text-sm text-zinc-500">
                            Finish a mock interview and generate one from the report.
                        </p>
                    </div>
                ) : (
                    plans.map((plan) => {
                        const isSelected = selectedPlanId === plan.id;
                        const isComplete = plan.completionPercent === 100;

                        return (
                            <div
                                key={plan.id}
                                className={`flex flex-col gap-3 rounded-2xl border px-4 py-3.5 transition sm:flex-row sm:items-center sm:justify-between ${
                                    isSelected
                                        ? 'border-emerald-300 bg-emerald-50/50 shadow-soft'
                                        : 'border-zinc-200 bg-white hover:border-emerald-200'
                                }`}
                            >
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <p className="font-medium text-zinc-900">
                                            Plan · {formatDate(plan.createdAt)}
                                        </p>
                                        {isComplete ? (
                                            <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                                                Completed
                                            </span>
                                        ) : (
                                            <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600 ring-1 ring-inset ring-zinc-500/15">
                                                {plan.completionPercent}%
                                            </span>
                                        )}
                                    </div>
                                    <p className="mt-1 text-sm text-zinc-500">
                                        {plan.completedTasks}/{plan.totalTasks} day tasks
                                        done
                                    </p>
                                    <div className="mt-2 h-1.5 w-full max-w-[180px] overflow-hidden rounded-full bg-zinc-100">
                                        <div
                                            className="h-full rounded-full bg-emerald-500 transition-all"
                                            style={{
                                                width: `${Math.min(100, Math.max(0, plan.completionPercent))}%`,
                                            }}
                                        />
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => onSelect(plan)}
                                    className={
                                        isSelected
                                            ? 'btn-primary !rounded-xl !px-3 !py-2 !text-xs'
                                            : 'btn-secondary !rounded-xl !px-3 !py-2 !text-xs'
                                    }
                                >
                                    {isSelected ? 'Selected' : 'View'}
                                </button>
                            </div>
                        );
                    })
                )}
            </div>
        </section>
    );
}
