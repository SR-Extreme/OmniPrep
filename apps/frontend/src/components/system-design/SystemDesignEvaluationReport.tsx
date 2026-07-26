'use client';

import {
    getScoreTier,
    ReportSection,
    ScoreBar,
} from '@/components/evaluations/score-ui';
import type {
    EvaluationMetric,
    SystemDesignEvaluationDetail,
} from '@/types/system-design';

function humanizeMetricId(id: string): string {
    return id
        .replace(/[_-]+/g, ' ')
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function SystemDesignEvaluationReport({
    evaluation,
    metrics,
}: {
    evaluation: SystemDesignEvaluationDetail;
    metrics?: EvaluationMetric[];
}) {
    const tier = getScoreTier(evaluation.overallScore);
    const reviewedAt = new Date(evaluation.createdAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });

    const rubricRows =
        metrics && metrics.length > 0
            ? metrics.map((metric) => ({
                  id: metric.id,
                  label: metric.title,
                  score: evaluation.metricScores[metric.id] ?? 0,
              }))
            : Object.entries(evaluation.metricScores).map(([id, score]) => ({
                  id,
                  label: humanizeMetricId(id),
                  score,
              }));

    return (
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-card">
            <div className={`border-b border-zinc-200 px-5 py-5 sm:px-6 ${tier.bg}`}>
                <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                            AI Review
                        </p>
                        <div className="mt-2 flex items-baseline gap-2">
                            <span className={`text-4xl font-bold tabular-nums ${tier.color}`}>
                                {evaluation.overallScore}
                            </span>
                            <span className="text-sm font-medium text-zinc-500">/ 100</span>
                        </div>
                        <p className={`mt-1 text-sm font-semibold ${tier.color}`}>{tier.label}</p>
                    </div>
                    <p className="text-xs text-zinc-500">Reviewed {reviewedAt}</p>
                </div>
            </div>
            <div className="space-y-6 p-5 sm:p-6">
                {rubricRows.length > 0 ? (
                    <ReportSection
                        title="Rubric scores"
                        subtitle="Weighted metrics from the question rubric."
                    >
                        <div className="grid gap-3 sm:grid-cols-2">
                            {rubricRows.map((row) => (
                                <ScoreBar key={row.id} label={row.label} score={row.score} />
                            ))}
                        </div>
                    </ReportSection>
                ) : null}
                <ReportSection title="Feedback">
                    <p className="ai-report-body rounded-lg border border-zinc-100 bg-zinc-50/60 px-4 py-3.5 text-zinc-700">
                        {evaluation.feedback}
                    </p>
                </ReportSection>
                {evaluation.strengths.length > 0 ? (
                    <ReportSection title="Strengths">
                        <ul className="space-y-2">
                            {evaluation.strengths.map((item, idx) => (
                                <li
                                    key={idx}
                                    className="ai-report-list-item rounded-lg border border-emerald-100 bg-emerald-50/50 px-3.5 py-2.5 text-emerald-900"
                                >
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </ReportSection>
                ) : null}
                {evaluation.weaknesses.length > 0 ? (
                    <ReportSection title="Areas to improve">
                        <ul className="space-y-2">
                            {evaluation.weaknesses.map((item, idx) => (
                                <li
                                    key={idx}
                                    className="ai-report-list-item rounded-lg border border-amber-100 bg-amber-50/50 px-3.5 py-2.5 text-amber-900"
                                >
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </ReportSection>
                ) : null}
                {evaluation.suggestions.length > 0 ? (
                    <ReportSection title="Suggestions">
                        <ul className="space-y-2">
                            {evaluation.suggestions.map((item, idx) => (
                                <li
                                    key={idx}
                                    className="ai-report-list-item rounded-lg border border-zinc-100 bg-white px-3.5 py-2.5 text-zinc-800"
                                >
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </ReportSection>
                ) : null}
                {evaluation.followUpQuestions.length > 0 ? (
                    <ReportSection
                        title="Follow-up questions"
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
