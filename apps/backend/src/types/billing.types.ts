export const SUBSCRIPTION_PLANS = [
    'MONTHLY',
    'SIX_MONTHS',
    'YEARLY',
] as const;

export type BillingPlan = (typeof SUBSCRIPTION_PLANS)[number];

export const SUBSCRIPTION_STATUSES = [
    'PENDING',
    'ACTIVE',
    'EXPIRED',
    'FAILED',
    'REFUNDED',
] as const;

export type BillingSubscriptionStatus = (typeof SUBSCRIPTION_STATUSES)[number];

export const PLAN_AMOUNTS_INR: Record<BillingPlan, number> = {
    MONTHLY: 999,
    SIX_MONTHS: 3999,
    YEARLY: 5999,
};

export const PLAN_AMOUNTS_PAISE: Record<BillingPlan, number> = {
    MONTHLY: PLAN_AMOUNTS_INR.MONTHLY * 100,
    SIX_MONTHS: PLAN_AMOUNTS_INR.SIX_MONTHS * 100,
    YEARLY: PLAN_AMOUNTS_INR.YEARLY * 100,
};

export const PLAN_LABELS: Record<BillingPlan, string> = {
    MONTHLY: 'Monthly',
    SIX_MONTHS: '6 Months',
    YEARLY: '12 Months',
};

export const PLAN_DURATION_DAYS: Record<BillingPlan, number> = {
    MONTHLY: 30,
    SIX_MONTHS: 180,
    YEARLY: 365,
};

export const BILLING_CURRENCY = 'INR' as const;

export const ONE_ACTIVE_SUBSCRIPTION_RULE =
    'A user may be enrolled in only one premium plan at a time.';

export const PREMIUM_FEATURE_LIST = [
    'Unlimited Mock Interviews',
    'Personalized AI Reports',
    'Personalized Study Plans',
    'Hiring Recommendations',
    'Unlimited Individual Question Reports',
] as const;

export interface PlanCatalogItem {
    plan: BillingPlan;
    label: string;
    amountInr: number;
    amountPaise: number;
    durationDays: number;
    features: readonly string[];
}

export const PLAN_CATALOG: PlanCatalogItem[] = SUBSCRIPTION_PLANS.map((plan) => ({
    plan,
    label: PLAN_LABELS[plan],
    amountInr: PLAN_AMOUNTS_INR[plan],
    amountPaise: PLAN_AMOUNTS_PAISE[plan],
    durationDays: PLAN_DURATION_DAYS[plan],
    features: PREMIUM_FEATURE_LIST,
}));

//value is billingplan if fn returns true -> value is BillingPlan
export function isBillingPlan(value: unknown): value is BillingPlan {
    return (
        typeof value === 'string'
        && (SUBSCRIPTION_PLANS as readonly string[]).includes(value)
    );
}

export function getPlanExpiresAt(
    plan: BillingPlan,
    startsAt: Date = new Date(),
): Date {
    const expiresAt = new Date(startsAt);
    expiresAt.setUTCDate(expiresAt.getUTCDate() + PLAN_DURATION_DAYS[plan]);
    return expiresAt;
}