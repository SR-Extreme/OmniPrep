'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { AdminAuthGate } from '@/components/admin/AdminPageShell';
import { AdminFeatureCards } from '@/components/admin/AdminFeatureCards';
import { AdminHero } from '@/components/admin/AdminHero';
import { useAuthStore } from '@/store/authStore';

export default function AdminHomePage() {
    const router = useRouter();
    const { user, accessToken, isReady: hydrated } = useAuthStore();

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
        return <AdminAuthGate hydrated={hydrated} />;
    }

    return (
        <div className="overflow-x-hidden bg-zinc-50">
            <AdminHero />
            <AdminFeatureCards />
        </div>
    );
}
