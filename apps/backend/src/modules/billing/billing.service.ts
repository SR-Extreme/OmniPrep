import type Stripe from 'stripe';
import { prisma } from '../../config/db.js';
import { getUserPremiumStatus } from '../../middleware/premium.middleware.js';
import {
    createPremiumCheckoutSession,
    constructStripeWebhookEvent,
    retrieveCheckoutSession,
    StripeError,
} from '../../services/StripeService.js';
import {
    BILLING_CURRENCY,
    PLAN_AMOUNTS_INR,
    PLAN_CATALOG,
    getPlanExpiresAt,
    isBillingPlan,
    type BillingPlan,
} from '../../types/billing.types.js';
import type { CreateCheckoutSessionBody } from './billing.validation.js';

export class BillingError extends Error {
    constructor(
        message: string,
        public readonly code:
            | 'NOT_FOUND'
            | 'INVALID_STATE'
            | 'ALREADY_PREMIUM'
            | 'CONFIG_ERROR'
            | 'CHECKOUT_FAILED'
            | 'WEBHOOK_FAILED',
    ) {
        super(message);
        this.name = 'BillingError';
    }
}

export interface CheckoutSessionResponse {
    sessionId: string;
    url: string;
}

export interface PremiumStatusResponse {
    isPremium: boolean;
    premiumFrom: Date | null;
    premiumTill: Date | null;
    activePlan: BillingPlan | null;
    canSubscribe: boolean;
    planCatalog: typeof PLAN_CATALOG;
}

async function getActiveSubscriptionPlan(
    userId: string,
): Promise<BillingPlan | null> {
    const now = new Date();

    const active = await prisma.subscription.findFirst({
        where: {
            userId,
            status: 'ACTIVE',
            expiresAt: { gt: now },
        },
        orderBy: { expiresAt: 'desc' },
        select: { plan: true },
    });

    return active?.plan ?? null;
}

function mapStripeError(err: unknown): never {
    if (err instanceof StripeError) {
        throw new BillingError(err.message, err.code);
    }

    console.error(err);
    throw new BillingError('Billing operation failed', 'CHECKOUT_FAILED');
}

function extractPaymentIntentId(
    session: Stripe.Checkout.Session,
): string | null {
    const paymentIntent = session.payment_intent;

    if (!paymentIntent) {
        return null;
    }

    if (typeof paymentIntent === 'string') {
        return paymentIntent;
    }

    return paymentIntent.id;
}

async function activatePremiumFromCheckoutSession(
    session: Stripe.Checkout.Session,
): Promise<void> {
    const sessionId = session.id;
    const userId = session.metadata?.userId;
    const planRaw = session.metadata?.plan;

    if (!userId || !isBillingPlan(planRaw)) {
        throw new BillingError(
            'Checkout session is missing valid user or plan metadata',
            'INVALID_STATE',
        );
    }

    const plan: BillingPlan = planRaw;
    const existing = await prisma.subscription.findUnique({
        where: { stripeSessionId: sessionId },
    });

    if (existing?.status === 'ACTIVE') {
        return;
    }

    const startsAt = new Date();
    const expiresAt = getPlanExpiresAt(plan, startsAt);
    const paymentIntentId = extractPaymentIntentId(session);
    const amountInr = PLAN_AMOUNTS_INR[plan];

    await prisma.$transaction(async (tx) => {
        await tx.subscription.updateMany({
            where: {
                userId,
                status: 'ACTIVE',
                ...(existing ? { id: { not: existing.id } } : {}),
            },
            data: {
                status: 'EXPIRED',
            },
        });

        if (existing) {
            await tx.subscription.update({
                where: { id: existing.id },
                data: {
                    status: 'ACTIVE',
                    stripePaymentIntentId: paymentIntentId,
                    startsAt,
                    expiresAt,
                    amount: amountInr,
                    currency: BILLING_CURRENCY,
                    plan,
                },
            });
        } else {
            await tx.subscription.create({
                data: {
                    userId,
                    plan,
                    amount: amountInr,
                    currency: BILLING_CURRENCY,
                    status: 'ACTIVE',
                    stripeSessionId: sessionId,
                    stripePaymentIntentId: paymentIntentId,
                    startsAt,
                    expiresAt,
                },
            });
        }

        await tx.user.update({
            where: { id: userId },
            data: {
                isPremium: true,
                premiumFrom: startsAt,
                premiumTill: expiresAt,
            },
        });
    });
}

export function getPlanCatalog() {
    return PLAN_CATALOG;
}

export async function getPremiumStatus(
    userId: string,
): Promise<PremiumStatusResponse> {
    const status = await getUserPremiumStatus(userId);
    const activePlan = status.isPremium
        ? await getActiveSubscriptionPlan(userId)
        : null;

    return {
        ...status,
        activePlan,
        canSubscribe: !status.isPremium,
        planCatalog: PLAN_CATALOG,
    };
}

export async function createCheckoutSession(
    userId: string,
    body: CreateCheckoutSessionBody,
): Promise<CheckoutSessionResponse> {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            email: true,
        },
    });

    if (!user) {
        throw new BillingError('User not found', 'NOT_FOUND');
    }

    const premiumStatus = await getUserPremiumStatus(userId);

    if (premiumStatus.isPremium) {
        throw new BillingError(
            'You already have an active premium plan. Only one plan can be active at a time.',
            'ALREADY_PREMIUM',
        );
    }

    try {
        return await createPremiumCheckoutSession({
            userId: user.id,
            email: user.email,
            plan: body.plan,
        });
    } catch (err) {
        mapStripeError(err);
    }
}

//webhook check
//called fn to update db accordingly
export async function handleStripeWebhook(
    rawBody: Buffer,
    signature: string,
): Promise<{ received: true }> {
    let event: Stripe.Event;

    try {
        event = constructStripeWebhookEvent(rawBody, signature);
    } catch (err) {
        if (err instanceof StripeError) {
            throw new BillingError(err.message, err.code);
        }

        throw new BillingError(
            'Invalid Stripe webhook signature',
            'WEBHOOK_FAILED',
        );
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;

        if (session.payment_status !== 'paid' && session.status !== 'complete') {
            return { received: true };
        }

        let fullSession = session;

        try {
            fullSession = await retrieveCheckoutSession(session.id);
        } catch (err) {
            // Prefer expanded session, fall back to webhook payload if retrieve fails
            console.error(err);
        }

        await activatePremiumFromCheckoutSession(fullSession);
    }

    return { received: true };
}