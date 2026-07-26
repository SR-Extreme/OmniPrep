'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, Sparkles } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { PracticeAuthLoading } from '@/components/practice/PracticeListShell';
import { PricingCards } from '@/components/PricingCards';
import { createCheckoutSession, getPremiumStatus } from '@/lib/api/billing';
import { ApiError } from '@/lib/api/client';
import { useAuthStore } from '@/store/authStore';
import { PLAN_CATALOG, type BillingPlan, type PremiumStatusResponse } from '@/types/billing';

const HIGHLIGHTS = [
    'Full timed mock interviews with DSA, System Design, and Behavioral',
    'AI evaluation reports, hiring recommendations, and study plans',
    'One active plan at a time—choose the duration that fits your timeline',
] as const;

export default function PremiumPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { accessToken } = useAuthStore();

    const [hydrated, setHydrated] = useState(false);
    const [status, setStatus] = useState<PremiumStatusResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [loadingPlan, setLoadingPlan] = useState<BillingPlan | null>(null);
    const [error, setError] = useState<string | null>(null);

    const canceled = searchParams.get('checkout') === 'canceled';

    useEffect(() => {
        setHydrated(true);
    }, []);

    useEffect(() => {
        if (!hydrated) {
            return;
        }
        if (!accessToken) {
            router.replace('/login');
        }
    }, [hydrated, accessToken, router]);

    useEffect(() => {
        if (!hydrated || !accessToken) {
            return;
        }

        let cancelled = false;

        async function loadStatus() {
            setIsLoading(true);
            setError(null);

            try {
                const result = await getPremiumStatus(accessToken as string);
                if (!cancelled) {
                    setStatus(result);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(
                        err instanceof ApiError
                            ? err.message
                            : 'Failed to load premium status',
                    );
                }
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                }
            }
        }

        void loadStatus();

        return () => {
            cancelled = true;
        };
    }, [hydrated, accessToken]);

    async function handleSubscribe(plan: BillingPlan) {
        if (!accessToken) {
            return;
        }

        setLoadingPlan(plan);
        setError(null);

        try {
            const session = await createCheckoutSession(accessToken, { plan });
            window.location.href = session.url;
        } catch (err) {
            setError(
                err instanceof ApiError
                    ? err.message
                    : 'Failed to start checkout',
            );
            setLoadingPlan(null);
        }
    }

    if (!hydrated || !accessToken) {
        return <PracticeAuthLoading />;
    }

    const plans = status?.planCatalog?.length ? status.planCatalog : PLAN_CATALOG;

    return (
        <div className="overflow-x-hidden bg-zinc-50">
            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
                <motion.section
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, ease: 'easeOut' }}
                    className="relative overflow-hidden rounded-2xl border border-zinc-200/90 bg-white shadow-elevated"
                >
                    <div
                        className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-emerald-400 via-emerald-600 to-emerald-700"
                        aria-hidden="true"
                    />
                    <div className="relative p-5 sm:p-6 lg:p-8">
                        <h1 className="mt-3 text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl xl:text-4xl">
                            Unlock full mock interviews
                        </h1>
                        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-500 sm:text-base">
                            Choose one plan at a time. Mock interviews, AI reports, study
                            plans, and hiring recommendations are included.
                        </p>
                        <ul className="mt-6 grid gap-2.5 sm:grid-cols-1 lg:max-w-2xl">
                            {HIGHLIGHTS.map((point) => (
                                <li
                                    key={point}
                                    className="flex items-start gap-2.5 text-sm leading-relaxed text-zinc-700"
                                >
                                    <CheckCircle2
                                        className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600"
                                        aria-hidden="true"
                                    />
                                    {point}
                                </li>
                            ))}
                        </ul>
                    </div>
                </motion.section>

                {canceled ? (
                    <p className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                        Checkout was canceled. You can subscribe whenever you&apos;re ready.
                    </p>
                ) : null}

                {error ? (
                    <p className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                        {error}
                    </p>
                ) : null}

                {status?.isPremium ? (
                    <p className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                        You already have an active Premium plan. Only one plan can be active at a time.
                    </p>
                ) : null}

                <div className="mt-10 border-t border-zinc-200/80 pt-8 sm:pt-10">
                    <div className="mb-6">
                        <h2 className="text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl">
                            Choose a plan
                        </h2>
                        <p className="mt-1 text-sm text-zinc-500">
                            Subscribe to unlock the full interview preparation loop
                        </p>
                    </div>
                    {isLoading && !status ? (
                        <div className="flex items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white px-6 py-16 text-sm text-zinc-500 shadow-soft">
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-emerald-600" />
                            Loading plans…
                        </div>
                    ) : (
                        <PricingCards
                            plans={plans}
                            onSubscribe={handleSubscribe}
                            canSubscribe={status?.canSubscribe ?? true}
                            loadingPlan={loadingPlan}
                            activePlan={status?.activePlan ?? null}
                        />
                    )}
                </div>
            </main>
        </div>
    );
}
