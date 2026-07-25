'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
    BarChart3,
    ClipboardList,
    LineChart,
    PlusCircle,
    Users,
} from 'lucide-react';
import { AdminFeatureCard } from '@/components/admin/AdminFeatureCard';
import { useAuthStore } from '@/store/authStore';

const FEATURES = [
    {
        href: '/admin/create',
        title: 'Create Questions',
        description: 'Add DSA or System Design questions with a Published toggle.',
        icon: <PlusCircle className="h-5 w-5" />,
    },
    {
        href: '/admin/questions',
        title: 'List Questions',
        description: 'Browse published and draft questions, edit, publish, or delete.',
        icon: <ClipboardList className="h-5 w-5" />,
    },
    {
        href: '/admin/revenue',
        title: 'Revenue Dashboard',
        description: 'Track subscriptions, revenue over time, and plan mix.',
        icon: <LineChart className="h-5 w-5" />,
    },
    {
        href: '/admin/mock-analytics',
        title: 'Mock Analytics',
        description: 'Premium mock usage and hiring-band distribution.',
        icon: <BarChart3 className="h-5 w-5" />,
    },
    {
        href: '/admin/users',
        title: 'User Management',
        description: 'Search candidates, view premium status, and remove accounts.',
        icon: <Users className="h-5 w-5" />,
    },
] as const;

export default function AdminHomePage() {
    const router = useRouter();
    const { user, accessToken, logout, isLoading: authLoading } = useAuthStore();
    const [hydrated, setHydrated] = useState(false);

    useEffect(() => {
        setHydrated(true);
    }, []);

    useEffect(() => {
        if (!hydrated) {
            return;
        }

        if (!accessToken) {
            router.replace('/login');
            return;
        }

        if (user && user.role !== 'ADMIN') {
            router.replace('/');
        }
    }, [hydrated, accessToken, user, router]);

    if (!hydrated || !accessToken || !user || user.role !== 'ADMIN') {
        return (
            <div className="flex min-h-screen items-center justify-center bg-zinc-50 text-zinc-500">
                <div className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-emerald-600" />
                    Loading…
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50">
            <header className="nav-header">
                <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3.5">
                    <div className="flex items-center gap-6">
                        <Link href="/" className="flex items-center gap-2.5">
                            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-600 text-sm font-bold text-white">
                                O
                            </span>
                            <span className="text-base font-semibold tracking-tight text-zinc-900">
                                OmniPrep
                            </span>
                        </Link>
                        <nav className="hidden items-center gap-1 sm:flex">
                            <Link
                                href="/admin"
                                className="rounded-md bg-zinc-100 px-3 py-1.5 text-sm font-medium text-zinc-900"
                            >
                                Admin
                            </Link>
                            <Link
                                href="/admin/profile"
                                className="rounded-md px-3 py-1.5 text-sm font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                            >
                                Profile
                            </Link>
                        </nav>
                    </div>
                    <div className="flex items-center gap-3">
                        <p className="hidden text-sm text-zinc-500 md:block">{user.name}</p>
                        <button
                            type="button"
                            onClick={() => logout()}
                            disabled={authLoading}
                            className="btn-secondary !py-2"
                        >
                            Sign out
                        </button>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-6xl px-6 py-10">
                <section className="mb-10 max-w-2xl">
                    <p className="section-label">Admin panel</p>
                    <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
                        Manage content, users, and revenue
                    </h1>
                    <p className="mt-3 text-base leading-relaxed text-zinc-600">
                        Create and publish questions, monitor Premium subscriptions, and
                        review mock-interview performance.
                    </p>
                </section>

                <section className="grid gap-4 md:grid-cols-3">
                    {FEATURES.slice(0, 3).map((feature) => (
                        <AdminFeatureCard key={feature.href} {...feature} />
                    ))}
                </section>

                <section className="mt-4 grid gap-4 md:grid-cols-2">
                    {FEATURES.slice(3).map((feature) => (
                        <AdminFeatureCard key={feature.href} {...feature} />
                    ))}
                </section>
            </main>
        </div>
    );
}