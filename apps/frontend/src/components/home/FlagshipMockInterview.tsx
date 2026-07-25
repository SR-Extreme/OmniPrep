'use client';

import { motion } from 'framer-motion';
import {
    BarChart3,
    Brain,
    CheckCircle2,
    ClipboardList,
    Code2,
    MessagesSquare,
    Network,
    Sparkles,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const HIGHLIGHTS = [
    { label: 'DSA', icon: Code2 },
    { label: 'System Design', icon: Network },
    { label: 'Behavioral', icon: MessagesSquare },
    { label: 'AI Evaluation', icon: Brain },
    { label: 'Detailed Reports', icon: ClipboardList },
    { label: 'Performance Analytics', icon: BarChart3 },
] as const;

export function FlagshipMockInterview() {
    return (
        <section className="bg-zinc-50 pb-16 sm:pb-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <motion.article
                    initial={{ opacity: 0, y: 28 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-80px' }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="relative overflow-hidden rounded-2xl border border-emerald-200 bg-white shadow-elevated"
                >
                    <div
                        className="pointer-events-none absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b from-emerald-400 via-emerald-600 to-emerald-800"
                        aria-hidden="true"
                    />
                    <div
                        className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-400/20 blur-3xl"
                        aria-hidden="true"
                    />
                    <div
                        className="pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-emerald-500/10 blur-3xl"
                        aria-hidden="true"
                    />

                    <div className="relative grid items-center gap-8 p-6 sm:p-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-10 lg:p-10">
                        <div>
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-gradient-to-r from-emerald-50 to-emerald-100/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">
                                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                                Flagship feature
                            </span>

                            <h2 className="mt-4 text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
                                Mock Interview
                            </h2>
                            <p className="mt-3 max-w-xl text-sm leading-relaxed text-zinc-500 sm:text-base">
                                Run a timed, end-to-end interview that mirrors the real loop.
                                Complete DSA, System Design, and Behavioral in sequence, then
                                get AI evaluation, a detailed report, and performance analytics
                                you can act on.
                            </p>

                            <ul className="mt-6 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                                {HIGHLIGHTS.map(({ label, icon: Icon }) => (
                                    <li
                                        key={label}
                                        className="flex items-center gap-2.5 rounded-xl border border-emerald-100 bg-emerald-50/50 px-3 py-2.5 text-sm font-medium text-zinc-700"
                                    >
                                        <CheckCircle2
                                            className="h-4 w-4 shrink-0 text-emerald-600"
                                            aria-hidden="true"
                                        />
                                        <Icon
                                            className="h-4 w-4 shrink-0 text-emerald-600"
                                            aria-hidden="true"
                                        />
                                        {label}
                                    </li>
                                ))}
                            </ul>

                            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                                    <Link
                                        href="/mock-interview"
                                        className="btn-primary !rounded-2xl !px-5 !py-3"
                                    >
                                        Start Mock Interview
                                    </Link>
                                </motion.div>
                            </div>
                        </div>

                        <div className="relative mx-auto w-full max-w-md lg:max-w-none">
                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-400/30 via-emerald-600/20 to-transparent blur-xl" />
                            <div className="relative overflow-hidden rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-3 shadow-card">
                                <Image
                                    src="/illustrations/mock-interview.png"
                                    alt="Mock interview illustration"
                                    width={640}
                                    height={480}
                                    className="h-auto w-full rounded-xl object-cover"
                                />
                            </div>
                        </div>
                    </div>
                </motion.article>
            </div>
        </section>
    );
}
