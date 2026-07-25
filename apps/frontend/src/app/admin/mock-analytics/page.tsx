'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { MockAnalyticsCharts } from '@/components/admin/MockAnalyticsCharts';
import { getMockAnalytics } from '@/lib/api/admin';
import { ApiError } from '@/lib/api/client';
import { useAuthStore } from '@/store/authStore';
import type { MockAnalyticsResponse } from '@/types/admin';

export default function AdminMockAnalyticsPage() {
    const router = useRouter();
    const { user, accessToken } = useAuthStore();

    const [hydrated, setHydrated] = useState(false);
    const [data, setData] = useState<MockAnalyticsResponse | null>(null);
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
                const result = await getMockAnalytics(accessToken as string);
                if (!cancelled) {
                    setData(result);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(
                        err instanceof ApiError
                            ? err.message
                            : 'Failed to load mock analytics',
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
    }, [hydrated, accessToken, user]);

    if (!hydrated || !accessToken || !user || user.role !== 'ADMIN') {
        return (
            <div className="flex min-h-screen items-center justify-center bg-zinc-50 text-zinc-500">
                Loading…
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50">
            <main className="mx-auto max-w-6xl space-y-6 px-6 py-10">
                <div>
                    <p className="section-label">Analytics</p>
                    <h1 className="mt-1 text-3xl font-semibold tracking-tight text-zinc-900">
                        Mock analytics
                    </h1>
                    <p className="mt-2 text-sm text-zinc-600">
                        Premium mock usage and hiring-band distribution.
                    </p>
                </div>

                {error ? (
                    <p className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                        {error}
                    </p>
                ) : null}

                {data ? (
                    <MockAnalyticsCharts data={data} />
                ) : isLoading ? (
                    <p className="text-sm text-zinc-500">Loading mock analytics…</p>
                ) : null}
            </main>
        </div>
    );
}