'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
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
        <Card>
            <CardHeader>
                <div className="flex flex-wrap items-center gap-2">
                    <p className="section-label">Selected plan</p>
                    {isComplete ? (
                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                            Completed
                        </span>
                    ) : (
                        <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600 ring-1 ring-inset ring-zinc-500/15">
                            {plan.completionPercent}% done
                        </span>
                    )}
                </div>
                <CardTitle>7-day study plan</CardTitle>
                <CardDescription>{plan.summary}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-3">
                {plan.days.map((day) => {
                    const key = taskKeyForDay(day.day);
                    const checked = selectedSet.has(key);

                    return (
                        <label
                            key={key}
                            className="flex cursor-pointer items-start gap-3 rounded-lg border border-zinc-200 bg-zinc-50/60 px-4 py-3"
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
            </CardContent>

            <CardFooter className="justify-end">
                <Button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => onSubmit(selectedKeys)}
                >
                    {isSubmitting ? 'Saving…' : 'Submit Progress'}
                </Button>
            </CardFooter>
        </Card>
    );
}