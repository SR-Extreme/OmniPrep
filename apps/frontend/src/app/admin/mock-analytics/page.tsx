'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { MockAnalyticsCharts } from '@/components/admin/MockAnalyticsCharts';
import {
    AdminEmptyState,
    AdminErrorAlert,
    AdminInlineLoading,
    AdminAuthGate,
    AdminPageHeader,
    AdminPageShell,
} from '@/components/admin/AdminPageShell';
import { getMockAnalytics } from '@/lib/api/admin';
import { ApiError } from '@/lib/api/client';
import { useAuthStore } from '@/store/authStore';
import type { MockAnalyticsResponse } from '@/types/admin';

export default function AdminMockAnalyticsPage() {
    const router = useRouter();
    const { user, accessToken, isReady: hydrated } = useAuthStore();

    const [data, setData] = useState<MockAnalyticsResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);


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
        return <AdminAuthGate hydrated={hydrated} />;
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
                    title="Mock analytics"
                    description="Premium mock usage and hiring-band distribution."
                />

                {error ? <AdminErrorAlert message={error} /> : null}

                {data ? (
                    <MockAnalyticsCharts data={data} />
                ) : isLoading ? (
                    <AdminInlineLoading label="Loading mock analytics…" />
                ) : (
                    <AdminEmptyState message="No mock analytics available." />
                )}
            </motion.div>
        </AdminPageShell>
    );
}
