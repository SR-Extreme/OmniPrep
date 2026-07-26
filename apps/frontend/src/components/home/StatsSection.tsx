'use client';

import { motion } from 'framer-motion';
import { BookOpen, Network, Users, Video } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AnimatedCounter } from '@/components/home/AnimatedCounter';
import { getPlatformStats } from '@/lib/api/platform';
import type { PlatformStats } from '@/types/platform';

const STAT_META = [
    {
        key: 'totalUsers' as const,
        title: 'Total Users',
        icon: Users,
    },
    {
        key: 'totalDsaQuestions' as const,
        title: 'Total DSA Questions',
        icon: BookOpen,
    },
    {
        key: 'totalSystemDesignQuestions' as const,
        title: 'Total System Design Questions',
        icon: Network,
    },
    {
        key: 'totalInterviewsTaken' as const,
        title: 'Total Interviews Taken',
        icon: Video,
    },
] as const;

const EMPTY_STATS: PlatformStats = {
    totalUsers: 0,
    totalDsaQuestions: 0,
    totalSystemDesignQuestions: 0,
    totalInterviewsTaken: 0,
};

export function StatsSection() {
    const [stats, setStats] = useState<PlatformStats>(EMPTY_STATS);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        let cancelled = false;

        void (async () => {
            try {
                const result = await getPlatformStats();
                if (!cancelled) {
                    setStats(result);
                }
            } catch (err) {
                console.error(err);
            } finally {
                if (!cancelled) {
                    setReady(true);
                }
            }
        })();

        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <section className="border-t border-zinc-200/80 bg-zinc-50 py-16 sm:py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mx-auto mb-10 max-w-2xl text-center">
                    <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
                        Trusted preparation at scale
                    </h2>
                    <p className="mt-3 text-sm leading-relaxed text-zinc-500 sm:text-base">
                        A growing library and community built around interview-ready practice.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {STAT_META.map((stat, index) => {
                        const Icon = stat.icon;
                        const value = stats[stat.key];
                        return (
                            <motion.article
                                key={stat.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.2 }}
                                transition={{ duration: 0.4, delay: index * 0.06 }}
                                whileHover={{ y: -4 }}
                                className="rounded-2xl border border-emerald-200/70 bg-white p-6 shadow-soft transition hover:shadow-elevated"
                            >
                                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-600">
                                    <Icon className="h-5 w-5" aria-hidden="true" />
                                </div>
                                <p className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
                                    {ready ? (
                                        <AnimatedCounter value={value} />
                                    ) : (
                                        <span className="tabular-nums text-zinc-300">—</span>
                                    )}
                                </p>
                                <p className="mt-2 text-sm font-medium text-zinc-500">
                                    {stat.title}
                                </p>
                                <div
                                    className="mt-4 h-1 w-12 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-300"
                                    aria-hidden="true"
                                />
                            </motion.article>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
