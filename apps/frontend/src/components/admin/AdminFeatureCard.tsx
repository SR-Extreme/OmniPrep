'use client';

import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export interface AdminFeatureCardProps {
    href: string;
    title: string;
    description: string;
    cta: string;
    icon: LucideIcon;
    className?: string;
}

export function AdminFeatureCard({
    href,
    title,
    description,
    cta,
    icon: Icon,
    className,
}: AdminFeatureCardProps) {
    return (
        <motion.article
            variants={{
                hidden: { opacity: 0, y: 24 },
                show: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.45, ease: 'easeOut' as const },
                },
            }}
            whileHover={{ y: -6 }}
            className={cn(
                'group relative flex h-full flex-col overflow-hidden rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-white via-white to-emerald-50/70 p-6 shadow-soft transition duration-300 hover:shadow-elevated sm:p-7',
                className,
            )}
        >
            <div
                className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-gradient-to-br from-emerald-200/40 to-transparent"
                aria-hidden="true"
            />
            <div className="relative mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50 text-emerald-600">
                <Icon className="h-5 w-5" aria-hidden="true" />
            </div>
            <h3 className="relative text-lg font-semibold text-zinc-900">{title}</h3>
            <p className="relative mt-2 flex-1 text-sm leading-relaxed text-zinc-500">
                {description}
            </p>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="relative mt-6 self-start">
                <Link href={href} className="btn-primary !rounded-xl">
                    {cta}
                </Link>
            </motion.div>
        </motion.article>
    );
}
