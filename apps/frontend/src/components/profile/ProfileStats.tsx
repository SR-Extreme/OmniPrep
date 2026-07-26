'use client';

import { motion } from 'framer-motion';
import {
    Code2,
    MessagesSquare,
    Network,
    type LucideIcon,
} from 'lucide-react';
import type { ProfileStats as ProfileStatsData } from '@/types/profile';

export interface ProfileStatsProps {
    stats: ProfileStatsData;
}

interface StatSection {
    label: string;
    title: string;
    description: string;
    icon: LucideIcon;
    rows: { label: string; value: number }[];
}

export function ProfileStats({ stats }: ProfileStatsProps) {
    const sections: StatSection[] = [
        {
            label: 'DSA',
            title: 'Problem practice',
            description: 'Submission activity',
            icon: Code2,
            rows: [
                { label: 'Questions attempted', value: stats.dsa.totalQuestions },
                { label: 'Total submissions', value: stats.dsa.totalSubmissions },
                { label: 'Accepted', value: stats.dsa.totalAccepted },
            ],
        },
        {
            label: 'System Design',
            title: 'Design practice',
            description: 'Question coverage',
            icon: Network,
            rows: [
                {
                    label: 'Questions attempted',
                    value: stats.systemDesign.totalQuestions,
                },
                {
                    label: 'Total submissions',
                    value: stats.systemDesign.totalSubmissions,
                },
            ],
        },
        {
            label: 'Behavioral',
            title: 'Interview practice',
            description: 'Session progress',
            icon: MessagesSquare,
            rows: [
                { label: 'Attempts', value: stats.behavioral.totalAttempts },
                { label: 'Completed', value: stats.behavioral.totalCompleted },
            ],
        },
    ];

    return (
        <section>
            <div className="mb-5">
                <h2 className="text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl">
                    Practice statistics
                </h2>
                <p className="mt-1 text-sm text-zinc-500">
                    A snapshot of your activity across every interview track
                </p>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
                {sections.map((section, index) => {
                    const Icon = section.icon;
                    return (
                        <motion.article
                            key={section.label}
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
                            <p className="section-label">{section.label}</p>
                            <h3 className="mt-1 text-base font-semibold text-zinc-900">
                                {section.title}
                            </h3>
                            <p className="mt-0.5 text-sm text-zinc-500">
                                {section.description}
                            </p>
                            <div className="mt-4 grid gap-2.5 text-sm">
                                {section.rows.map((row) => (
                                    <div
                                        key={row.label}
                                        className="flex items-center justify-between gap-3 rounded-xl border border-zinc-100 bg-zinc-50/80 px-3 py-2.5"
                                    >
                                        <span className="text-zinc-600">{row.label}</span>
                                        <span className="font-semibold tabular-nums text-zinc-900">
                                            {row.value}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <div
                                className="mt-4 h-1 w-10 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-300"
                                aria-hidden="true"
                            />
                        </motion.article>
                    );
                })}
            </div>
        </section>
    );
}
