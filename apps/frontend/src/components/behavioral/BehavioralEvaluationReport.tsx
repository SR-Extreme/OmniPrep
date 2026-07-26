'use client';

import {
    getScoreTier,
    ScoreBar,
} from '@/components/evaluations/score-ui';
import type { BehavioralEvaluationDetail } from '@/types/behavioral';

export function BehavioralEvaluationReport({
    evaluation,
}: {
    evaluation: BehavioralEvaluationDetail;
}) {
    const m = evaluation.evaluationMetrics;
    const tier = getScoreTier(m.overallScore);
    const reviewedAt = new Date(evaluation.createdAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });

    return (
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-card">
            <div className={`border-b border-zinc-200 px-5 py-5 sm:px-6 ${tier.bg}`}>
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    AI Review
                </p>
                <div className="mt-2 flex items-baseline gap-2">
                    <span className={`text-4xl font-bold tabular-nums ${tier.color}`}>
                        {m.overallScore}
                    </span>
                    <span className="text-sm font-medium text-zinc-500">/ 100</span>
                </div>
                <p className={`mt-1 text-sm font-semibold ${tier.color}`}>{tier.label}</p>
                <p className="mt-2 text-xs text-zinc-500">Reviewed {reviewedAt}</p>
            </div>
            <div className="space-y-6 p-5 sm:p-6">
                <div>
                    <h3 className="mb-3 text-sm font-semibold text-zinc-900">Summary</h3>
                    <p className="rounded-lg border border-zinc-100 bg-zinc-50/60 px-4 py-3.5 text-sm leading-relaxed text-zinc-700">
                        {evaluation.summary}
                    </p>
                </div>
                <div>
                    <h3 className="mb-3 text-sm font-semibold text-zinc-900">Scores</h3>
                    <div className="grid gap-3 sm:grid-cols-2">
                        <ScoreBar label="Communication" score={m.communication} />
                        <ScoreBar label="Ownership" score={m.ownership} />
                        <ScoreBar label="Leadership" score={m.leadership} />
                        <ScoreBar label="Problem solving" score={m.problemSolving} />
                        <ScoreBar label="Technical depth" score={m.technicalDepth} />
                        <ScoreBar label="Impact" score={m.impact} />
                        <ScoreBar label="Authenticity" score={m.authenticity} />
                        <ScoreBar label="Confidence" score={m.confidence} />
                    </div>
                </div>
                <div>
                    <h3 className="mb-3 text-sm font-semibold text-zinc-900">STAR structure</h3>
                    <div className="grid gap-3 sm:grid-cols-2">
                        <ScoreBar label="Overall" score={m.starStructure.overall} />
                        <ScoreBar label="Situation" score={m.starStructure.situation} max={25} />
                        <ScoreBar label="Task" score={m.starStructure.task} max={25} />
                        <ScoreBar label="Action" score={m.starStructure.action} max={25} />
                        <ScoreBar label="Result" score={m.starStructure.result} max={25} />
                    </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-lg border border-emerald-100 bg-emerald-50/50 p-4">
                        <p className="text-xs font-semibold uppercase text-emerald-700">
                            Strongest answer
                        </p>
                        <p className="mt-2 text-sm font-medium text-zinc-900">
                            {evaluation.strongestAnswer.question}
                        </p>
                        <p className="mt-2 text-sm text-zinc-600">
                            {evaluation.strongestAnswer.explanation}
                        </p>
                    </div>
                    <div className="rounded-lg border border-amber-100 bg-amber-50/50 p-4">
                        <p className="text-xs font-semibold uppercase text-amber-700">
                            Weakest answer
                        </p>
                        <p className="mt-2 text-sm font-medium text-zinc-900">
                            {evaluation.weakestAnswer.question}
                        </p>
                        <p className="mt-2 text-sm text-zinc-600">
                            {evaluation.weakestAnswer.explanation}
                        </p>
                    </div>
                </div>
                {evaluation.strengths.length > 0 ? (
                    <div>
                        <h3 className="mb-2 text-sm font-semibold text-zinc-900">Strengths</h3>
                        <ul className="space-y-2">
                            {evaluation.strengths.map((item, i) => (
                                <li
                                    key={i}
                                    className="rounded-lg border border-emerald-100 bg-emerald-50/50 px-3.5 py-2.5 text-sm text-emerald-900"
                                >
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                ) : null}
                {evaluation.weaknesses.length > 0 ? (
                    <div>
                        <h3 className="mb-2 text-sm font-semibold text-zinc-900">
                            Areas to improve
                        </h3>
                        <ul className="space-y-2">
                            {evaluation.weaknesses.map((item, i) => (
                                <li
                                    key={i}
                                    className="rounded-lg border border-amber-100 bg-amber-50/50 px-3.5 py-2.5 text-sm text-amber-900"
                                >
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                ) : null}
                {evaluation.suggestions.length > 0 ? (
                    <div>
                        <h3 className="mb-2 text-sm font-semibold text-zinc-900">Suggestions</h3>
                        <ul className="space-y-2">
                            {evaluation.suggestions.map((item, i) => (
                                <li
                                    key={i}
                                    className="rounded-lg border border-zinc-100 bg-white px-3.5 py-2.5 text-sm text-zinc-800"
                                >
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                ) : null}
            </div>
        </div>
    );
}
