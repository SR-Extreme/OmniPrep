'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Code2, Network } from 'lucide-react';
import { AdminFeatureCard } from '@/components/admin/AdminFeatureCard';
import { useAuthStore } from '@/store/authStore';

export default function AdminQuestionsHubPage() {
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
                                className="rounded-md px-3 py-1.5 text-sm font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                            >
                                Admin
                            </Link>
                            <Link
                                href="/admin/questions"
                                className="rounded-md bg-zinc-100 px-3 py-1.5 text-sm font-medium text-zinc-900"
                            >
                                Questions
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
                    <p className="section-label">List questions</p>
                    <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900">
                        Choose a question bank
                    </h1>
                    <p className="mt-3 text-base leading-relaxed text-zinc-600">
                        Browse published and draft questions, then edit, publish, or delete.
                    </p>
                </section>

                <section className="grid gap-4 md:grid-cols-2">
                    <AdminFeatureCard
                        href="/admin/questions/dsa"
                        title="DSA Questions"
                        description="Published and draft coding problems sorted by submissions or last edit."
                        icon={<Code2 className="h-5 w-5" />}
                    />
                    <AdminFeatureCard
                        href="/admin/questions/system-design"
                        title="System Design Questions"
                        description="Published and draft design prompts with publish and delete actions."
                        icon={<Network className="h-5 w-5" />}
                    />
                </section>
            </main>
        </div>
    );
}