'use client';

import type { MockInterviewStudyPlanDetail } from '@/types/mock-interview';

export interface StudyPlanPanelProps {
    studyPlan: MockInterviewStudyPlanDetail | null;
    isLoading?: boolean;
    error?: string | null;
    onGenerate?: () => void;
    isGenerating?: boolean;
}

export function StudyPlanPanel({
    studyPlan,
    isLoading = false,
    error = null,
    onGenerate,
    isGenerating = false,
}: StudyPlanPanelProps) {
    if (isLoading) {
        return (
            <section className="card flex items-center justify-center gap-2 px-6 py-16 text-zinc-500">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-emerald-600" />
                Loading study plan…
            </section>
        );
    }

    if (!studyPlan) {
        return (
            <section className="card p-5 sm:p-6">
                <p className="section-label">Study plan</p>
                <h2 className="mt-1 text-lg font-semibold text-zinc-900">
                    No plan yet
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-600">
                    Generate a personalized 7-day plan from your full mock-interview
                    evaluations. This is the only AI step after the interview.
                </p>
                {error ? (
                    <p className="mt-3 text-sm text-rose-700" role="alert">
                        {error}
                    </p>
                ) : null}
                {onGenerate ? (
                    <button
                        type="button"
                        className="btn-primary mt-4"
                        disabled={isGenerating}
                        onClick={onGenerate}
                    >
                        {isGenerating ? 'Generating…' : 'Generate 7-day study plan'}
                    </button>
                ) : null}
            </section>
        );
    }

    return (
        <section className="card overflow-hidden">
            <div className="border-b border-zinc-200 bg-white px-5 py-5 sm:px-6">
                <p className="section-label">Study plan</p>
                <h2 className="mt-1 text-lg font-semibold text-zinc-900">
                    Your next 7 days
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-zinc-700">
                    {studyPlan.summary}
                </p>
                <p className="mt-3 text-xs text-zinc-500">
                    Created {new Date(studyPlan.createdAt).toLocaleString()}
                </p>
            </div>

            {error ? (
                <div className="border-b border-rose-100 bg-rose-50 px-5 py-3 text-sm text-rose-700 sm:px-6">
                    {error}
                </div>
            ) : null}

            <ol className="divide-y divide-zinc-100">
                {studyPlan.days.map((day) => (
                    <li
                        key={day.day}
                        className="flex gap-4 px-5 py-4 sm:px-6"
                    >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-emerald-50 text-sm font-semibold tabular-nums text-emerald-800">
                            {day.day}
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-semibold text-zinc-900">
                                Day {day.day}: {day.topic}
                            </p>
                            <p className="mt-1 text-sm leading-relaxed text-zinc-600">
                                {day.description}
                            </p>
                        </div>
                    </li>
                ))}
            </ol>
        </section>
    );
}