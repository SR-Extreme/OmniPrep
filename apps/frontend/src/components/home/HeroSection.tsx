'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export function HeroSection() {
    return (
        <section className="relative h-[560px] w-full overflow-hidden sm:h-[600px]">
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: "url('/hero.png')" }}
                aria-hidden="true"
            />
            <div
                className="absolute inset-0 bg-gradient-to-b from-zinc-950/75 via-zinc-950/65 to-zinc-950/80"
                aria-hidden="true"
            />

            <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col items-center justify-center px-4 text-center sm:px-6 lg:px-8">
                <motion.p
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45 }}
                    className="mb-4 inline-flex items-center rounded-full border border-emerald-400/30 bg-emerald-500/15 px-3.5 py-1 text-xs font-medium text-emerald-200 backdrop-blur-sm"
                >
                    Interview preparation, end to end
                </motion.p>

                <motion.h1
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.55, delay: 0.08 }}
                    className="max-w-3xl text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl"
                >
                    Prepare with OmniPrep.
                    <span className="block text-emerald-300">Interview with confidence.</span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.55, delay: 0.16 }}
                    className="mt-5 max-w-2xl text-base leading-relaxed text-zinc-200 sm:text-lg"
                >
                    One platform for DSA, system design, and behavioral practice—plus timed
                    full mock interviews with AI evaluation, detailed reports, and a clear
                    study plan.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.55, delay: 0.24 }}
                    className="mt-9 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center"
                >
                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                        <Link
                            href="/problems"
                            className="btn-primary !rounded-2xl !px-6 !py-3 !text-base shadow-elevated"
                        >
                            Start Practicing
                        </Link>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                        <Link
                            href="/#features"
                            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/25 bg-white/10 px-6 py-3 text-base font-medium text-white backdrop-blur-sm transition hover:bg-white/20"
                        >
                            Explore Features
                        </Link>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}
