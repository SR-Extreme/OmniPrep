'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { PricingCards } from '@/components/PricingCards';
import { createCheckoutSession, getPremiumStatus } from '@/lib/api/billing';
import { ApiError } from '@/lib/api/client';
import { useAuthStore } from '@/store/authStore';
import { PLAN_CATALOG, type BillingPlan, type PremiumStatusResponse } from '@/types/billing';

export default function PremiumPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, accessToken, logout, isLoading: authLoading } = useAuthStore();

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
        return (
            <div className="flex min-h-screen items-center justify-center bg-zinc-50 text-zinc-500">
                <div className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-emerald-600" />
                    Loading…
                </div>
            </div>
        );
    }

    const plans = status?.planCatalog?.length ? status.planCatalog : PLAN_CATALOG;

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
                                href="/premium"
                                className="rounded-md bg-zinc-100 px-3 py-1.5 text-sm font-medium text-zinc-900"
                            >
                                Premium
                            </Link>
                        </nav>
                    </div>
                    <div className="flex items-center gap-3">
                        {user ? (
                            <p className="hidden text-sm text-zinc-500 md:block">
                                {user.name}
                            </p>
                        ) : null}
                        <button
                            type="button"
                            onClick={() => logout()}
                            disabled={authLoading}
                            className="btn-secondary !py-2"
                        >
                            Sign out
                        </button>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-6xl px-6 py-10">
                <div className="mx-auto max-w-2xl text-center">
                    <p className="section-label justify-center">OmniPrep Premium</p>
                    <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
                        Unlock full mock interviews
                    </h1>
                    <p className="mt-3 text-base leading-relaxed text-zinc-600">
                        Choose one plan at a time. Mock interviews, AI reports, study plans,
                        and hiring recommendations are included.
                    </p>
                </div>

                {canceled ? (
                    <p className="mx-auto mt-6 max-w-2xl rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                        Checkout was canceled. You can subscribe whenever you&apos;re ready.
                    </p>
                ) : null}

                {error ? (
                    <p className="mx-auto mt-6 max-w-2xl rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                        {error}
                    </p>
                ) : null}

                {status?.isPremium ? (
                    <p className="mx-auto mt-6 max-w-2xl rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                        You already have an active Premium plan
                        {status.activePlan ? ` (${status.activePlan})` : ''}. Only one plan
                        can be active at a time.
                    </p>
                ) : null}

                <div className="mt-10">
                    {isLoading && !status ? (
                        <p className="text-center text-sm text-zinc-500">Loading plans…</p>
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