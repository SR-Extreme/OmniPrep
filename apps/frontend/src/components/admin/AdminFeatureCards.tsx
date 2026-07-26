'use client';

import { motion } from 'framer-motion';
import {
    BarChart3,
    ClipboardList,
    LineChart,
    PlusCircle,
    Users,
    type LucideIcon,
} from 'lucide-react';
import { AdminFeatureCard } from '@/components/admin/AdminFeatureCard';
import { cn } from '@/lib/utils';

interface AdminFeature {
    href: string;
    title: string;
    description: string;
    cta: string;
    icon: LucideIcon;
}

const FEATURES: AdminFeature[] = [
    {
        href: '/admin/create',
        title: 'Create Questions',
        description: 'Create DSA, System Design and Behavioral interview questions.',
        cta: 'Create Questions',
        icon: PlusCircle,
    },
    {
        href: '/admin/questions',
        title: 'Question Lists',
        description: 'View, edit, publish and manage existing questions.',
        cta: 'Manage Questions',
        icon: ClipboardList,
    },
    {
        href: '/admin/revenue',
        title: 'Revenue Analytics',
        description: 'Monitor subscriptions, premium users and revenue analytics.',
        cta: 'View Revenue',
        icon: LineChart,
    },
    {
        href: '/admin/mock-analytics',
        title: 'Mock Analytics',
        description: 'Monitor mock interview performance, reports and analytics.',
        cta: 'View Analytics',
        icon: BarChart3,
    },
    {
        href: '/admin/users',
        title: 'User Management',
        description: 'Manage user accounts, permissions and subscription status.',
        cta: 'Manage Users',
        icon: Users,
    },
];

const container = {
    hidden: {},
    show: {
        transition: { staggerChildren: 0.08 },
    },
};

export function AdminFeatureCards() {
    return (
        <section id="features" className="scroll-mt-24 bg-zinc-50 py-16 sm:py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mx-auto mb-10 max-w-2xl text-center">
                    <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
                        Administration tools
                    </h2>
                    <p className="mt-3 text-sm leading-relaxed text-zinc-500 sm:text-base">
                        Everything you need to run OmniPrep—questions, users, revenue, and
                        interview insights.
                    </p>
                </div>

                <motion.div
                    variants={container}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: '-60px' }}
                    className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-6 xl:gap-6"
                >
                    {FEATURES.map((feature, index) => (
                        <AdminFeatureCard
                            key={feature.href}
                            {...feature}
                            className={cn(
                                'lg:col-span-2',
                                index === 3 && 'lg:col-start-2',
                            )}
                        />
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
