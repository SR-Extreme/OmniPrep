'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface InfoCard {
    title: string;
    description: string;
    href: string;
    cta: string;
    image: string;
    imageAlt: string;
    imageLeft: boolean;
}

const CARDS: InfoCard[] = [
    {
        title: 'Master Data Structures & Algorithms',
        description:
            'Solve curated interview-style problems across arrays, strings, trees, graphs, dynamic programming, and more—organized by topic and difficulty. Run sample tests, submit full solutions, and get instant judge feedback so you know exactly where you stand.',
        href: '/problems',
        cta: 'Browse DSA problems',
        image: '/illustrations/dsa.png',
        imageAlt: 'DSA practice illustration',
        imageLeft: true,
    },
    {
        title: 'System Design Challenges',
        description:
            'Practice real-world system design interview questions covering scalable architectures, databases, caching, load balancing, and distributed systems. Sketch diagrams, answer structured prompts, and refine your design with AI follow-ups.',
        href: '/system-design',
        cta: 'Explore system design',
        image: '/illustrations/system-design.png',
        imageAlt: 'System design illustration',
        imageLeft: false,
    },
    {
        title: 'Behavioral Interviews',
        description:
            'Run company- and role-specific mock interviews with resume-aware AI questions, a full 7-phase flow, and on-demand STAR-based review. Build clearer stories around leadership, conflict, ownership, and impact.',
        href: '/behavioral',
        cta: 'Start behavioral practice',
        image: '/illustrations/behavioral.png',
        imageAlt: 'Behavioral interview illustration',
        imageLeft: true,
    },
    {
        title: 'Full Mock Interviews',
        description:
            'Run a timed 3-hour loop — DSA, System Design, and Behavioral in order — then get a report, hiring band, and personalized 7-day study plan. Treat it like the real interview so the real one feels familiar.',
        href: '/mock-interview',
        cta: 'Start a mock interview',
        image: '/illustrations/mock-interview.png',
        imageAlt: 'Full mock interview illustration',
        imageLeft: false,
    },
];

export function InfoCards() {
    return (
        <section className="border-t border-zinc-200/80 bg-white py-16 sm:py-20">
            <div className="mx-auto max-w-7xl space-y-8 px-4 sm:px-6 lg:space-y-10 lg:px-8">
                <div className="mx-auto max-w-2xl text-center">
                    <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
                        How OmniPrep prepares you
                    </h2>
                    <p className="mt-3 text-sm leading-relaxed text-zinc-500 sm:text-base">
                        Deep practice for every interview round—designed to feel premium,
                        focused, and interview-real.
                    </p>
                </div>

                {CARDS.map((card) => (
                    <motion.article
                        key={card.title}
                        initial={{ opacity: 0, y: 28 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-80px' }}
                        transition={{ duration: 0.45, ease: 'easeOut' }}
                        whileHover={{ y: -4 }}
                        className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-soft transition duration-300 hover:shadow-elevated"
                    >
                        <div
                            className={cn(
                                'grid items-center gap-0 lg:grid-cols-2',
                                !card.imageLeft && 'lg:[&>*:first-child]:order-2',
                            )}
                        >
                            <div className="relative min-h-[240px] overflow-hidden bg-gradient-to-br from-emerald-50 to-zinc-50 sm:min-h-[280px] lg:min-h-[320px]">
                                <Image
                                    src={card.image}
                                    alt={card.imageAlt}
                                    fill
                                    sizes="(max-width: 1024px) 100vw, 50vw"
                                    className="object-cover object-center"
                                />
                            </div>
                            <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
                                <h3 className="text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl">
                                    {card.title}
                                </h3>
                                <p className="mt-3 text-sm leading-relaxed text-zinc-500 sm:text-base">
                                    {card.description}
                                </p>
                            </div>
                        </div>
                    </motion.article>
                ))}
            </div>
        </section>
    );
}
