'use client';

import {
    HIRING_BANDS,
    getHiringBand,
} from '@/types/mock-interview';

export interface HiringRecommendationProps {
    overallScore: number | null;
    onGenerateStudyPlan?: () => void;
    isGeneratingStudyPlan?: boolean;
}

const SCALE_BANDS = [...HIRING_BANDS].reverse();

function BandName({ label, active }: { label: string; active: boolean }) {
    const parts = label.split(' ');

    return (
        <span
            className={`flex flex-col items-center font-mono text-[10px] leading-tight sm:text-xs ${active ? 'font-semibold text-white' : 'text-zinc-500'
                }`}
        >
            {parts.map((part) => (
                <span key={part}>{part}</span>
            ))}
        </span>
    );
}

export function HiringRecommendation({
    overallScore,
    onGenerateStudyPlan,
    isGeneratingStudyPlan = false,
}: HiringRecommendationProps) {
    const band = getHiringBand(overallScore);
    const activeIndex = SCALE_BANDS.findIndex((row) => row.label === band.label);
    const scoreText = overallScore == null ? '—' : String(overallScore);

    return (
        <section className="card overflow-hidden p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <p className="section-label">Hiring recommendation</p>
                </div>
                {onGenerateStudyPlan ? (
                    <button
                        type="button"
                        className="btn-primary shrink-0 !py-2"
                        disabled={isGeneratingStudyPlan}
                        onClick={onGenerateStudyPlan}
                    >
                        {isGeneratingStudyPlan
                            ? 'Generating plan…'
                            : 'Generate 7-day study plan'}
                    </button>
                ) : null}
            </div>

            <div className="mt-5 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-6 text-zinc-100 sm:px-6">
                <p className="text-center font-mono text-2xl font-semibold tabular-nums tracking-tight">
                    {scoreText}
                    <span className="text-base font-medium text-zinc-500">/100</span>
                </p>

                <div className="mt-6 overflow-x-auto border-y border-zinc-700 py-5">
                    <div className="mx-auto min-w-[44rem]">
                        <div className="flex items-center justify-between gap-3 px-1 font-mono text-xs text-zinc-400">
                            <span>Strong Reject</span>
                            <span>Strong Hire</span>
                        </div>

                        <div
                            className="relative mt-3"
                            role="img"
                            aria-label={`Hiring band scale. Current: ${band.label}`}
                        >
                            <div className="flex h-3 items-center px-1">
                                {Array.from({ length: SCALE_BANDS.length + 1 }).map(
                                    (_, tickIndex) => (
                                        <div
                                            key={tickIndex}
                                            className="flex flex-1 items-center last:w-0 last:flex-none"
                                        >
                                            <span className="h-3 w-px shrink-0 bg-zinc-300" />
                                            {tickIndex < SCALE_BANDS.length ? (
                                                <span className="h-px w-full bg-zinc-500" />
                                            ) : null}
                                        </div>
                                    ),
                                )}
                            </div>

                            <div className="mt-3 grid grid-cols-7 gap-2">
                                {SCALE_BANDS.map((row, index) => {
                                    const active = index === activeIndex;
                                    return (
                                        <div
                                            key={row.label}
                                            className="flex flex-col items-center text-center"
                                        >
                                            <BandName label={row.label} active={active} />
                                            <div className="mt-2 flex h-9 flex-col items-center justify-start">
                                                {active ? (
                                                    <>
                                                        <span
                                                            className="text-[10px] leading-none text-white"
                                                            aria-hidden
                                                        >
                                                            ▲
                                                        </span>
                                                        <span className="mt-0.5 font-mono text-[10px] font-semibold tracking-wide text-white">
                                                            YOU
                                                        </span>
                                                    </>
                                                ) : null}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-5 text-center">
                    <p className="font-mono text-lg font-semibold tracking-tight text-white">
                        {band.label}
                    </p>
                    <p className="mx-auto mt-2 max-w-xl font-mono text-sm leading-relaxed text-zinc-400">
                        {band.description}
                    </p>
                </div>
            </div>
        </section>
    );
}
