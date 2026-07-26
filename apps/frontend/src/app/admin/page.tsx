'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AdminFeatureCards } from '@/components/admin/AdminFeatureCards';
import { AdminHero } from '@/components/admin/AdminHero';
import { useAuthStore } from '@/store/authStore';

export default function AdminHomePage() {
    const router = useRouter();
    const { user, accessToken } = useAuthStore();
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
            <div className="flex min-h-[50vh] items-center justify-center bg-zinc-50 text-zinc-500">
                <div className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-emerald-600" />
                    Loading…
                </div>
            </div>
        );
    }

    return (
        <div className="overflow-x-hidden bg-zinc-50">
            <AdminHero />
            <AdminFeatureCards />
        </div>
    );
}
