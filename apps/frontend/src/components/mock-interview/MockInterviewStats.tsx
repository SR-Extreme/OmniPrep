'use client';

import { motion } from 'framer-motion';
import {
    CheckCircle2,
    ClipboardList,
    TrendingUp,
    type LucideIcon,
} from 'lucide-react';

export interface MockInterviewStatsData {
    totalInterviews: number;
    completed: number;
    averageScore: number | null;
}

interface MockInterviewStatsProps {
    stats: MockInterviewStatsData;
    isLoading: boolean;
}

interface StatCard {
    title: string;
    icon: LucideIcon;
    value: string;
    emptyHint?: string;
}

export function MockInterviewStats({ stats, isLoading }: MockInterviewStatsProps) {
    const hasInterviews = stats.totalInterviews > 0;

    const cards: StatCard[] = [
        {
            title: 'Total Interviews',
            icon: ClipboardList,
            value: String(stats.totalInterviews),
            emptyHint: hasInterviews ? undefined : 'No interviews yet',
        },
        {
            title: 'Completed',
            icon: CheckCircle2,
            value: String(stats.completed),
            emptyHint: hasInterviews ? undefined : 'No interviews yet',
        },
        {
            title: 'Average Score',
            icon: TrendingUp,
            value:
                hasInterviews && stats.averageScore != null
                    ? stats.averageScore.toFixed(1)
                    : '0',
            emptyHint: hasInterviews ? undefined : 'No interviews yet',
        },
    ];

    return (
        <section className="py-2">
            <div className="mb-5">
                <h2 className="text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl">
                    Interview Statistics
                </h2>
                <p className="mt-1 text-sm text-zinc-500">
                    A quick snapshot of your mock interview progress
                </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {cards.map((card, index) => {
                    const Icon = card.icon;
                    return (
                        <motion.article
                            key={card.title}
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-40px' }}
                            transition={{ duration: 0.35, delay: index * 0.05 }}
                            whileHover={{ y: -4 }}
                            className="rounded-2xl border border-emerald-200/70 bg-white p-5 shadow-soft transition hover:shadow-elevated"
                        >
                            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-600">
                                <Icon className="h-5 w-5" aria-hidden="true" />
                            </div>
                            {isLoading ? (
                                <p className="text-3xl font-bold tracking-tight text-zinc-300">
                                    —
                                </p>
                            ) : (
                                <p className="text-3xl font-bold tracking-tight text-zinc-900">
                                    {card.value}
                                </p>
                            )}
                            <p className="mt-1.5 text-sm font-medium text-zinc-500">
                                {card.title}
                            </p>
                            {!isLoading && card.emptyHint ? (
                                <p className="mt-1 text-xs text-zinc-400">
                                    {card.emptyHint}
                                </p>
                            ) : null}
                            <div
                                className="mt-3 h-1 w-10 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-300"
                                aria-hidden="true"
                            />
                        </motion.article>
                    );
                })}
            </div>
        </section>
    );
}
