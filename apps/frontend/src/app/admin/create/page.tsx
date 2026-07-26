'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Code2, MessageSquare, Network } from 'lucide-react';
import { AdminFeatureCard } from '@/components/admin/AdminFeatureCard';
import {
    AdminAuthGate,
    AdminPageHeader,
    AdminPageShell,
} from '@/components/admin/AdminPageShell';
import { useAuthStore } from '@/store/authStore';

export default function AdminCreateHubPage() {
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
                    label="Create questions"
                    title="Choose a question type"
                    description="Fill every required field for the selected model, then publish now or save as draft."
                />

                <div className="grid gap-5 md:grid-cols-3 xl:gap-6">
                    <AdminFeatureCard
                        href="/admin/create/dsa"
                        title="DSA Question"
                        description="Slug, statement, difficulty, topics, starter/solution code, and test cases."
                        cta="Create DSA"
                        icon={Code2}
                    />
                    <AdminFeatureCard
                        href="/admin/create/system-design"
                        title="System Design Question"
                        description="Requirements, deliverables, constraints, scale factors, and evaluation metrics."
                        cta="Create System Design"
                        icon={Network}
                    />
                    <AdminFeatureCard
                        href="/admin/create/behavioral"
                        title="Behavioral Question"
                        description="Company, role, difficulty, and the fixed seven-phase interview schema."
                        cta="Create Behavioral"
                        icon={MessageSquare}
                    />
                </div>
            </motion.div>
        </AdminPageShell>
    );
}
