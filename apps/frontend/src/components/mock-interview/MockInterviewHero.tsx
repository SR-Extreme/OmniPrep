'use client';

import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, Clock3, Sparkles } from 'lucide-react';
import Image from 'next/image';

const HIGHLIGHTS = [
    'Three sequential rounds: DSA, System Design, and Behavioral',
    '60 minutes per round with automatic submit when time expires',
    'No going back once a round is submitted',
    'System Design and Behavioral rounds should be submitted manually to get its report before the time runs out, else evaluated as 0',
    'Hiring recommendation and personalized study plan at the end',
] as const;

export interface MockInterviewHeroProps {
    isCreating: boolean;
    isPremium: boolean;
    onStart: () => void;
}

export function MockInterviewHero({
    isCreating,
    isPremium,
    onStart,
}: MockInterviewHeroProps) {
    return (
        <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="relative overflow-hidden rounded-2xl border border-zinc-200/90 bg-white shadow-elevated"
        >
            <div
                className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-emerald-400 via-emerald-600 to-emerald-700"
                aria-hidden="true"
            />

            <div className="relative grid lg:grid-cols-[1.65fr_0.9fr]">
                <div className="min-w-0 p-5 sm:p-6 lg:p-7 xl:p-8">

                    <h1 className="mt-3 text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl xl:text-4xl">
                        Complete Mock Interview
                    </h1>

                    <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-500 sm:text-base">
                        Experience a realistic technical interview designed to simulate
                        actual hiring processes followed by leading technology companies.
                        Complete three sequential interview rounds and receive
                        comprehensive AI-generated feedback, hiring recommendations,
                        and a personalized improvement roadmap.
                    </p>

                    <ul className="mt-6 space-y-3">
                        {HIGHLIGHTS.map((point) => (
                            <li
                                key={point}
                                className="flex items-start gap-2.5 text-sm leading-relaxed text-zinc-700"
                            >
                                <CheckCircle2
                                    className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600"
                                    aria-hidden="true"
                                />
                                {point}
                            </li>
                        ))}
                    </ul>

                    <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-5">
                        <div>
                            <motion.button
                                type="button"
                                disabled={isCreating}
                                onClick={onStart}
                                whileHover={{ y: -2 }}
                                whileTap={{ scale: 0.98 }}
                                className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-elevated transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isCreating ? 'Starting…' : 'Start New Interview'}
                                <ArrowRight
                                    className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                                    aria-hidden="true"
                                />
                            </motion.button>
                            {!isPremium ? (
                                <p className="mt-2 text-xs font-medium text-emerald-700">
                                    Premium required to start a new mock interview.
                                </p>
                            ) : null}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-zinc-500 sm:pb-2">
                            <Clock3
                                className="h-3.5 w-3.5 text-emerald-600"
                                aria-hidden="true"
                            />
                            <span>
                                Estimated Duration{' '}
                                <span className="font-semibold text-zinc-800">3 Hours</span>
                            </span>
                        </div>
                    </div>
                </div>

                <div className="relative hidden min-h-[280px] overflow-hidden border-l border-zinc-100 lg:block">
                    <Image
                        src="/illustrations/mock-hero.png"
                        alt="Mock interview preparation illustration"
                        fill
                        priority
                        sizes="(max-width: 1024px) 0vw, 35vw"
                        className="object-cover object-right"
                    />
                </div>
            </div>
        </motion.section>
    );
}
