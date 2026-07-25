'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { RevenueCharts } from '@/components/admin/RevenueCharts';
import { getRevenueDashboard } from '@/lib/api/admin';
import { ApiError } from '@/lib/api/client';
import { useAuthStore } from '@/store/authStore';
import {
    DEFAULT_REVENUE_TIME_RANGE,
    type RevenueDashboardResponse,
    type RevenueTimeRange,
} from '@/types/admin';

export default function AdminRevenuePage() {
    const router = useRouter();
    const { user, accessToken, logout, isLoading: authLoading } = useAuthStore();

    const [hydrated, setHydrated] = useState(false);
    const [range, setRange] = useState<RevenueTimeRange>(DEFAULT_REVENUE_TIME_RANGE);
    const [data, setData] = useState<RevenueDashboardResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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

    useEffect(() => {
        if (!hydrated || !accessToken || user?.role !== 'ADMIN') {
            return;
        }

        let cancelled = false;

        async function load() {
            setIsLoading(true);
            setError(null);

            try {
                const result = await getRevenueDashboard(accessToken as string, {
                    range,
                });
                if (!cancelled) {
                    setData(result);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(
                        err instanceof ApiError
                            ? err.message
                            : 'Failed to load revenue dashboard',
                    );
                }
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                }
            }
        }

        void load();

        return () => {
            cancelled = true;
        };
    }, [hydrated, accessToken, user, range]);

    if (!hydrated || !accessToken || !user || user.role !== 'ADMIN') {
        return (
            <div className="flex min-h-screen items-center justify-center bg-zinc-50 text-zinc-500">
                Loading…
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
                                className="rounded-md px-3 py-1.5 text-sm text-zinc-600 hover:bg-zinc-100"
                            >
                                Admin
                            </Link>
                            <span className="rounded-md bg-zinc-100 px-3 py-1.5 text-sm font-medium text-zinc-900">
                                Revenue
                            </span>
                        </nav>
                    </div>
                    <button
                        type="button"
                        onClick={() => logout()}
                        disabled={authLoading}
                        className="btn-secondary !py-2"
                    >
                        Sign out
                    </button>
                </div>
            </header>

            <main className="mx-auto max-w-6xl space-y-6 px-6 py-10">
                <div>
                    <p className="section-label">Analytics</p>
                    <h1 className="mt-1 text-3xl font-semibold tracking-tight text-zinc-900">
                        Revenue dashboard
                    </h1>
                    <p className="mt-2 text-sm text-zinc-600">
                        Subscription revenue, plan mix, and premium vs free users.
                    </p>
                </div>

                {error ? (
                    <p className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                        {error}
                    </p>
                ) : null}

                {data ? (
                    <RevenueCharts
                        data={data}
                        onRangeChange={setRange}
                        isLoading={isLoading}
                    />
                ) : isLoading ? (
                    <p className="text-sm text-zinc-500">Loading revenue data…</p>
                ) : null}
            </main>
        </div>
    );
}