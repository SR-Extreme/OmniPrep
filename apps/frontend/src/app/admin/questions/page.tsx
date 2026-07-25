'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Code2, MessageSquare, Network } from 'lucide-react';
import { AdminFeatureCard } from '@/components/admin/AdminFeatureCard';
import { useAuthStore } from '@/store/authStore';

export default function AdminQuestionsHubPage() {
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

                <section className="grid gap-4 md:grid-cols-3">
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
                    <AdminFeatureCard
                        href="/admin/questions/behavioral"
                        title="Behavioral Questions"
                        description="Published and draft company/role interviews with session counts."
                        icon={<MessageSquare className="h-5 w-5" />}
                    />
                </section>
            </main>
        </div>
    );
}
