'use client';

import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
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
        <div className="grid gap-4 md:grid-cols-3">
            {plans.map((plan) => {
                const highlighted = plan.plan === 'SIX_MONTHS';
                const isActive = activePlan === plan.plan;
                const isLoading = loadingPlan === plan.plan;

                return (
                    <Card
                        key={plan.plan}
                        className={cn(
                            'flex flex-col',
                            highlighted && 'border-emerald-500 shadow-card ring-1 ring-emerald-500/20',
                        )}
                    >
                        <CardHeader>
                            {highlighted ? (
                                <p className="section-label text-emerald-700">Most popular</p>
                            ) : (
                                <p className="section-label">Plan</p>
                            )}
                            <CardTitle className="text-xl">{plan.label}</CardTitle>
                            <CardDescription>
                                {plan.durationDays} days of Premium access
                            </CardDescription>
                            <p className="pt-2 text-3xl font-semibold tracking-tight text-zinc-900">
                                {formatInr(plan.amountInr)}
                            </p>
                        </CardHeader>

                        <CardContent className="flex-1">
                            <ul className="space-y-2.5">
                                {plan.features.map((feature) => (
                                    <li
                                        key={feature}
                                        className="flex items-start gap-2 text-sm text-zinc-700"
                                    >
                                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>

                        <CardFooter>
                            <Button
                                className="w-full"
                                variant={highlighted ? 'default' : 'secondary'}
                                disabled={!canSubscribe || isLoading || Boolean(loadingPlan)}
                                onClick={() => onSubscribe(plan.plan)}
                            >
                                {isActive
                                    ? 'Current plan'
                                    : isLoading
                                        ? 'Redirecting…'
                                        : 'Subscribe'}
                            </Button>
                        </CardFooter>
                    </Card>
                );
            })}
        </div>
    );
}