'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Code2, MessageSquare, Network } from 'lucide-react';
import { AdminFeatureCard } from '@/components/admin/AdminFeatureCard';
import {
    AdminAuthGate,
    AdminPageHeader,
    AdminPageShell,
} from '@/components/admin/AdminPageShell';
import { useAuthStore } from '@/store/authStore';

export default function AdminQuestionsHubPage() {
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
        <AdminPageShell>
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
            >
                <AdminPageHeader
                    label="List questions"
                    title="Choose a question bank"
                    description="Browse published and draft questions, then edit, publish, or delete."
                />

                <div className="grid gap-5 md:grid-cols-3 xl:gap-6">
                    <AdminFeatureCard
                        href="/admin/questions/dsa"
                        title="DSA Questions"
                        description="Published and draft coding problems sorted by submissions or last edit."
                        cta="Browse DSA"
                        icon={Code2}
                    />
                    <AdminFeatureCard
                        href="/admin/questions/system-design"
                        title="System Design Questions"
                        description="Published and draft design prompts with publish and delete actions."
                        cta="Browse System Design"
                        icon={Network}
                    />
                    <AdminFeatureCard
                        href="/admin/questions/behavioral"
                        title="Behavioral Questions"
                        description="Published and draft company/role interviews with session counts."
                        cta="Browse Behavioral"
                        icon={MessageSquare}
                    />
                </div>
            </motion.div>
        </AdminPageShell>
    );
}
