'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, type LucideIcon } from 'lucide-react';
import Image from 'next/image';

export interface PracticePageHeroProps {
    title: string;
    description: string;
    highlights: readonly string[];
    imageSrc: string;
    imageAlt: string;
    icon: LucideIcon;
    eyebrow?: string;
}

export function PracticePageHero({
    title,
    description,
    highlights,
    imageSrc,
    imageAlt,
    icon: Icon,
    eyebrow,
}: PracticePageHeroProps) {
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
                    {eyebrow ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                            <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                            {eyebrow}
                        </span>
                    ) : (
                        <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-600">
                            <Icon className="h-5 w-5" aria-hidden="true" />
                        </div>
                    )}

                    <h1 className="mt-3 text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl xl:text-4xl">
                        {title}
                    </h1>

                    <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-500 sm:text-base">
                        {description}
                    </p>

                    <ul className="mt-6 space-y-3">
                        {highlights.map((point) => (
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
                </div>

                <div className="relative hidden min-h-[240px] overflow-hidden border-l border-zinc-100 lg:block">
                    <Image
                        src={imageSrc}
                        alt={imageAlt}
                        fill
                        priority
                        sizes="(max-width: 1024px) 0vw, 35vw"
                        className="object-cover object-center"
                    />
                </div>
            </div>
        </motion.section>
    );
}
