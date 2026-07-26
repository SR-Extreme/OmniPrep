'use client';

import type { ComplexityAnalysis, DSAEvaluationDetail } from '@/lib/api/evaluations';
import {
    getScoreTier,
    ReportSection,
    ScoreBar,
} from '@/components/evaluations/score-ui';

function ComplexityMetric({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-md border border-zinc-100 bg-white px-3 py-2.5">
            <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-400">
                {label}
            </p>
            <p className="mt-1 font-mono text-sm font-medium text-zinc-900">{value}</p>
        </div>
    );
}

function ComplexityCard({ analysis }: { analysis: ComplexityAnalysis }) {
    return (
        <div className="space-y-4 rounded-xl border border-zinc-200 bg-gradient-to-br from-zinc-50 to-white p-4">
            <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                        Your Solution
                    </p>
                    <ComplexityMetric label="Time" value={analysis.detected.time} />
                    <ComplexityMetric label="Space" value={analysis.detected.space} />
                </div>
                <div className="space-y-2">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                        Optimal Target
                    </p>
                    <ComplexityMetric label="Time" value={analysis.optimal.time} />
                    <ComplexityMetric label="Space" value={analysis.optimal.space} />
                </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 border-t border-zinc-200/80 pt-4">
                {analysis.isOptimal ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/15">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        Optimal complexity
                    </span>
                ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-600/15">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                        Room for improvement
                    </span>
                )}
            </div>
            {analysis.notes ? (
                <p className="ai-report-body border-l-2 border-zinc-200 pl-3.5 text-zinc-600">
                    {analysis.notes}
                </p>
            ) : null}
        </div>
    );
}

export function AIEvaluationReport({ evaluation }: { evaluation: DSAEvaluationDetail }) {
    const tier = getScoreTier(evaluation.overallScore);
    const reviewedAt = new Date(evaluation.createdAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });

    return (
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-card">
            <div className="border-b border-zinc-100 bg-gradient-to-r from-zinc-50 via-white to-emerald-50/40 px-5 py-5 sm:px-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-700">
                            AI Interview Report
                        </p>
                        <p className="mt-1 text-xs text-zinc-500">
                            Reviewed {reviewedAt}
                            {evaluation.model ? (
                                <span className="text-zinc-400"> · {evaluation.model}</span>
                            ) : null}
                        </p>
                    </div>
                    <div
                        className={`flex h-[4.5rem] w-[4.5rem] shrink-0 flex-col items-center justify-center rounded-full ring-4 ${tier.bg} ${tier.ring}`}
                    >
                        <span className="text-2xl font-bold tabular-nums leading-none text-zinc-900">
                            {evaluation.overallScore}
                        </span>
                        <span className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-zinc-500">
                            / 100
                        </span>
                    </div>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                    <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${tier.bg} ${tier.color} ring-1 ring-inset ${tier.ring}`}
                    >
                        {tier.label}
                    </span>
                    <span className="text-xs text-zinc-500">Overall performance rating</span>
                </div>
            </div>

            <div className="space-y-6 px-5 py-6 sm:px-6">
                <ReportSection
                    title="Score Breakdown"
                    subtitle="How your submission performed across key dimensions."
                >
                    <div className="grid gap-2.5 sm:grid-cols-2">
                        <ScoreBar label="Correctness" score={evaluation.correctnessScore} />
                        <ScoreBar label="Efficiency" score={evaluation.efficiencyScore} />
                        <ScoreBar label="Code Quality" score={evaluation.codeQualityScore} />
                        <ScoreBar label="Explanation" score={evaluation.explanationScore} />
                    </div>
                </ReportSection>

                <ReportSection
                    title="Time & Space Complexity"
                    subtitle="Your approach compared to the optimal solution."
                >
                    <ComplexityCard analysis={evaluation.complexityAnalysis} />
                </ReportSection>

                <ReportSection
                    title="Interviewer Feedback"
                    subtitle="A summary of strengths and areas to refine."
                >
                    <div className="rounded-lg border border-zinc-100 bg-zinc-50/60 px-4 py-4">
                        <p className="ai-report-feedback">{evaluation.feedback}</p>
                    </div>
                </ReportSection>

                {evaluation.suggestions.length > 0 ? (
                    <ReportSection
                        title="Actionable Suggestions"
                        subtitle="Concrete steps to improve your solution."
                    >
                        <ul className="space-y-2.5">
                            {evaluation.suggestions.map((item, idx) => (
                                <li
                                    key={idx}
                                    className="flex gap-3 rounded-lg border border-zinc-100 bg-white px-3.5 py-3 shadow-sm"
                                >
                                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-[11px] font-bold text-emerald-700">
                                        {idx + 1}
                                    </span>
                                    <span className="ai-report-list-item">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </ReportSection>
                ) : null}

                {evaluation.followUpQuestions.length > 0 ? (
                    <ReportSection
                        title="Follow-up Questions"
                        subtitle="Questions an interviewer might ask you next."
                    >
                        <ol className="space-y-2.5">
                            {evaluation.followUpQuestions.map((question, idx) => (
                                <li
                                    key={idx}
                                    className="flex gap-3 rounded-lg border border-zinc-100 bg-gradient-to-r from-white to-zinc-50/80 px-3.5 py-3"
                                >
                                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-zinc-900 text-[10px] font-bold text-white">
                                        Q{idx + 1}
                                    </span>
                                    <span className="ai-report-list-item text-zinc-800">
                                        {question}
                                    </span>
                                </li>
                            ))}
                        </ol>
                    </ReportSection>
                ) : null}
            </div>
        </div>
    );
}
