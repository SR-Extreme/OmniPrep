import type { ReactNode } from 'react';

export function getScoreTier(score: number): {
    label: string;
    color: string;
    bg: string;
    ring: string;
    bar: string;
} {
    if (score >= 85) {
        return {
            label: 'Excellent',
            color: 'text-emerald-700',
            bg: 'bg-emerald-50',
            ring: 'ring-emerald-200',
            bar: 'bg-emerald-500',
        };
    }
    if (score >= 70) {
        return {
            label: 'Good',
            color: 'text-sky-700',
            bg: 'bg-sky-50',
            ring: 'ring-sky-200',
            bar: 'bg-sky-500',
        };
    }
    if (score >= 50) {
        return {
            label: 'Fair',
            color: 'text-amber-700',
            bg: 'bg-amber-50',
            ring: 'ring-amber-200',
            bar: 'bg-amber-500',
        };
    }
    return {
        label: 'Needs Work',
        color: 'text-rose-700',
        bg: 'bg-rose-50',
        ring: 'ring-rose-200',
        bar: 'bg-rose-500',
    };
}

export function ScoreBar({
    label,
    score,
    max = 100,
}: {
    label: string;
    score: number;
    max?: number;
}) {
    const tier = getScoreTier(max === 100 ? score : Math.round((score / max) * 100));

    return (
        <div className="rounded-lg border border-zinc-100 bg-white px-3.5 py-3 shadow-sm">
            <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-zinc-700">{label}</span>
                <span className="text-sm font-semibold tabular-nums text-zinc-900">
                    {score}
                    <span className="font-normal text-zinc-400">/{max}</span>
                </span>
            </div>
            <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-zinc-100">
                <div
                    className={`h-full rounded-full transition-all duration-500 ease-out ${tier.bar}`}
                    style={{
                        width: `${Math.min(100, Math.max(0, max === 100 ? score : (score / max) * 100))}%`,
                    }}
                />
            </div>
        </div>
    );
}

export function ReportSection({
    title,
    subtitle,
    children,
}: {
    title: string;
    subtitle?: string;
    children: ReactNode;
}) {
    return (
        <section>
            <div className="mb-3">
                <h3 className="text-sm font-semibold tracking-tight text-zinc-900">{title}</h3>
                {subtitle ? (
                    <p className="mt-0.5 text-xs font-normal leading-relaxed text-zinc-500">
                        {subtitle}
                    </p>
                ) : null}
            </div>
            {children}
        </section>
    );
}
