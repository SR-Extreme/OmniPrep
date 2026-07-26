'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { RevenueCharts } from '@/components/admin/RevenueCharts';
import {
    AdminEmptyState,
    AdminErrorAlert,
    AdminInlineLoading,
    AdminLoading,
    AdminPageHeader,
    AdminPageShell,
} from '@/components/admin/AdminPageShell';
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
    const { user, accessToken } = useAuthStore();

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
        return <AdminLoading />;
    }

    return (
        <AdminPageShell>
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="space-y-6"
            >
                <AdminPageHeader
                    label="Analytics"
                    title="Revenue dashboard"
                    description="Subscription revenue, plan mix, and premium vs free users."
                />

                {error ? <AdminErrorAlert message={error} /> : null}

                {data ? (
                    <RevenueCharts
                        data={data}
                        onRangeChange={setRange}
                        isLoading={isLoading}
                    />
                ) : isLoading ? (
                    <AdminInlineLoading label="Loading revenue data…" />
                ) : (
                    <AdminEmptyState message="No revenue data available." />
                )}
            </motion.div>
        </AdminPageShell>
    );
}
