'use client';

import { motion } from 'framer-motion';
import { Check, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { BillingPlan, PlanCatalogItem } from '@/types/billing';

export interface PricingCardsProps {
    plans: PlanCatalogItem[];
    onSubscribe: (plan: BillingPlan) => void;
    canSubscribe?: boolean;
    loadingPlan?: BillingPlan | null;
    activePlan?: BillingPlan | null;
}

function formatInr(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(amount);
}

export function PricingCards({
    plans,
    onSubscribe,
    canSubscribe = true,
    loadingPlan = null,
    activePlan = null,
}: PricingCardsProps) {
    return (
        <div className="grid gap-5 md:grid-cols-3">
            {plans.map((plan, index) => {
                const highlighted = plan.plan === 'SIX_MONTHS';
                const isActive = activePlan === plan.plan;
                const isLoading = loadingPlan === plan.plan;

                return (
                    <motion.article
                        key={plan.plan}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.06 }}
                        whileHover={{ y: -4 }}
                        className={cn(
                            'relative flex flex-col overflow-hidden rounded-2xl border bg-white p-5 shadow-soft transition hover:shadow-elevated sm:p-6',
                            highlighted
                                ? 'border-emerald-300 ring-1 ring-emerald-500/15'
                                : 'border-zinc-200',
                        )}
                    >
                        {highlighted ? (
                            <div
                                className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-emerald-400 via-emerald-600 to-emerald-700"
                                aria-hidden="true"
                            />
                        ) : null}

                        <div className="mb-4">
                            {highlighted ? (
                                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                                    <Sparkles className="h-3 w-3" aria-hidden="true" />
                                    Most popular
                                </span>
                            ) : (
                                <p className="section-label">Plan</p>
                            )}
                            <h3 className="mt-2 text-xl font-semibold tracking-tight text-zinc-900">
                                {plan.label}
                            </h3>
                            <p className="mt-1 text-sm text-zinc-500">
                                {plan.durationDays} days of Premium access
                            </p>
                            <p className="mt-4 text-3xl font-bold tracking-tight text-zinc-900">
                                {formatInr(plan.amountInr)}
                            </p>
                        </div>

                        <ul className="flex-1 space-y-2.5">
                            {plan.features.map((feature) => (
                                <li
                                    key={feature}
                                    className="flex items-start gap-2.5 text-sm text-zinc-700"
                                >
                                    <Check
                                        className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600"
                                        aria-hidden="true"
                                    />
                                    <span>{feature}</span>
                                </li>
                            ))}
                        </ul>

                        <button
                            type="button"
                            className={cn(
                                'mt-6 w-full !rounded-xl',
                                highlighted ? 'btn-primary' : 'btn-secondary',
                            )}
                            disabled={!canSubscribe || isLoading || Boolean(loadingPlan)}
                            onClick={() => onSubscribe(plan.plan)}
                        >
                            {isActive
                                ? 'Current plan'
                                : isLoading
                                  ? 'Redirecting…'
                                  : 'Subscribe'}
                        </button>
                    </motion.article>
                );
            })}
        </div>
    );
}
