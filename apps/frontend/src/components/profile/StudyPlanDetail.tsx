'use client';

import { useEffect, useMemo, useState } from 'react';
import type {
    StudyPlanDetailResponse,
    StudyPlanTaskKey,
} from '@/types/profile';

export interface StudyPlanDetailProps {
    plan: StudyPlanDetailResponse;
    onSubmit: (completedTaskKeys: StudyPlanTaskKey[]) => void;
    isSubmitting?: boolean;
}

function taskKeyForDay(day: number): StudyPlanTaskKey {
    return `day:${day}` as StudyPlanTaskKey;
}

export function StudyPlanDetail({
    plan,
    onSubmit,
    isSubmitting = false,
}: StudyPlanDetailProps) {
    const [selectedKeys, setSelectedKeys] = useState<StudyPlanTaskKey[]>(
        plan.completedTaskKeys,
    );

    useEffect(() => {
        setSelectedKeys(plan.completedTaskKeys);
    }, [plan.id, plan.completedTaskKeys]);

    const selectedSet = useMemo(() => new Set(selectedKeys), [selectedKeys]);
    const isComplete = plan.completionPercent === 100;

    function toggleDay(day: number): void {
        const key = taskKeyForDay(day);
        setSelectedKeys((current) =>
            current.includes(key)
                ? current.filter((item) => item !== key)
                : [...current, key],
        );
    }

    return (
        <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-soft sm:p-6">
            <div className="mb-4">
                <div className="flex flex-wrap items-center gap-2">
                    <p className="section-label">Selected plan</p>
                    {isComplete ? (
                        <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                            Completed
                        </span>
                    ) : (
                        <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600 ring-1 ring-inset ring-zinc-500/15">
                            {plan.completionPercent}% done
                        </span>
                    )}
                </div>
                <h2 className="mt-1 text-lg font-semibold tracking-tight text-zinc-900">
                    7-day study plan
                </h2>
                <p className="mt-1 text-sm leading-relaxed text-zinc-500">
                    {plan.summary}
                </p>
                <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-zinc-100">
                    <div
                        className="h-full rounded-full bg-emerald-500 transition-all"
                        style={{
                            width: `${Math.min(100, Math.max(0, plan.completionPercent))}%`,
                        }}
                    />
                </div>
            </div>

            <div className="space-y-3">
                {plan.days.map((day) => {
                    const key = taskKeyForDay(day.day);
                    const checked = selectedSet.has(key);

                    return (
                        <label
                            key={key}
                            className={`flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-3.5 transition ${
                                checked
                                    ? 'border-emerald-200 bg-emerald-50/40'
                                    : 'border-zinc-200 bg-zinc-50/60 hover:border-emerald-200'
                            }`}
                        >
                            <input
                                type="checkbox"
                                className="mt-1 h-4 w-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500/30"
                                checked={checked}
                                onChange={() => toggleDay(day.day)}
                                disabled={isSubmitting}
                            />
                            <span className="min-w-0">
                                <span className="block text-sm font-medium text-zinc-900">
                                    Day {day.day}: {day.topic}
                                </span>
                                <span className="mt-1 block text-sm leading-relaxed text-zinc-600">
                                    {day.description}
                                </span>
                            </span>
                        </label>
                    );
                })}
            </div>

            <div className="mt-5 flex justify-end border-t border-zinc-100 pt-4">
                <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => onSubmit(selectedKeys)}
                    className="btn-primary !rounded-xl"
                >
                    {isSubmitting ? 'Saving…' : 'Submit Progress'}
                </button>
            </div>
        </section>
    );
}
