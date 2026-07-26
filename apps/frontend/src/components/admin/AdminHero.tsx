'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export function AdminHero() {
    return (
        <section className="relative h-[520px] w-full overflow-hidden sm:h-[560px] lg:h-[600px]">
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: "url('/admin-hero.png')" }}
                aria-hidden="true"
            />
            <div
                className="absolute inset-0 bg-gradient-to-b from-zinc-950/75 via-zinc-950/65 to-zinc-950/80"
                aria-hidden="true"
            />

            <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col items-center justify-center px-4 text-center sm:px-6 lg:px-8">
                <motion.h1
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.55, ease: 'easeOut' }}
                    className="max-w-3xl text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl"
                >
                    Manage OmniPrep{' '}
                    <span className="text-emerald-300">With Confidence</span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.55, delay: 0.1, ease: 'easeOut' }}
                    className="mt-5 max-w-2xl text-base leading-relaxed text-zinc-200 sm:text-lg"
                >
                    The Admin Dashboard lets you manage questions, users, revenue, and
                    interview analytics—keeping the OmniPrep platform running smoothly.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.55, delay: 0.2, ease: 'easeOut' }}
                    className="mt-9 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center"
                >
                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                        <Link
                            href="/admin/create"
                            className="btn-primary !rounded-2xl !px-6 !py-3 !text-base shadow-elevated"
                        >
                            Create Question
                        </Link>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                        <Link
                            href="/admin#features"
                            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/25 bg-white/10 px-6 py-3 text-base font-medium text-white backdrop-blur-sm transition hover:bg-white/20"
                        >
                            View Dashboard
                        </Link>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}
