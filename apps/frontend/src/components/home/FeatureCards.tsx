'use client';

import { motion } from 'framer-motion';
import {
    Code2,
    MessagesSquare,
    Network,
    Sparkles,
    type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';

interface FeatureCard {
    title: string;
    description: string;
    href: string;
    cta: string;
    icon: LucideIcon;
}

const FEATURES: FeatureCard[] = [
    {
        title: 'DSA',
        description:
            'Solve curated interview-style problems across arrays, trees, graphs, DP, and more—with instant judge feedback.',
        href: '/problems',
        cta: 'Practice DSA',
        icon: Code2,
    },
    {
        title: 'System Design',
        description:
            'Design scalable systems with diagrams, structured answers, and AI follow-ups that mirror real interviews.',
        href: '/system-design',
        cta: 'Start Designing',
        icon: Network,
    },
    {
        title: 'Behavioral',
        description:
            'Run resume-aware behavioral mocks with a full interview flow and STAR-based AI review.',
        href: '/behavioral',
        cta: 'Practice Behavioral',
        icon: MessagesSquare,
    },
    {
        title: 'Subscription',
        description:
            'Unlock premium mock interviews, deeper analytics, and the full interview loop when you are ready.',
        href: '/premium',
        cta: 'View Plans',
        icon: Sparkles,
    },
];

const container = {
    hidden: {},
    show: {
        transition: { staggerChildren: 0.08 },
    },
};

const item = {
    hidden: { opacity: 0, y: 24 },
    show: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.45, ease: 'easeOut' as const },
    },
};

export function FeatureCards() {
    return (
        <section id="features" className="scroll-mt-24 bg-zinc-50 py-16 sm:py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mx-auto mb-10 max-w-2xl text-center">
                    <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
                        Everything you need to prepare
                    </h2>
                    <p className="mt-3 text-sm leading-relaxed text-zinc-500 sm:text-base">
                        Focused practice tracks that map directly to what interviewers evaluate.
                    </p>
                </div>

                <motion.div
                    variants={container}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: '-60px' }}
                    className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-2 xl:gap-6"
                >
                    {FEATURES.map((feature) => {
                        const Icon = feature.icon;
                        return (
                            <motion.article
                                key={feature.title}
                                variants={item}
                                whileHover={{ y: -6 }}
                                className="group flex h-full flex-col rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-white via-white to-emerald-50/70 p-6 shadow-soft transition duration-300 hover:shadow-elevated sm:p-7"
                            >
                                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50 text-emerald-600">
                                    <Icon className="h-5 w-5" aria-hidden="true" />
                                </div>
                                <h3 className="text-lg font-semibold text-zinc-900">
                                    {feature.title}
                                </h3>
                                <p className="mt-2 flex-1 text-sm leading-relaxed text-zinc-500">
                                    {feature.description}
                                </p>
                                <Link
                                    href={feature.href}
                                    className="btn-primary mt-6 !rounded-xl self-start"
                                >
                                    {feature.cta}
                                </Link>
                            </motion.article>
                        );
                    })}
                </motion.div>
            </div>
        </section>
    );
}
