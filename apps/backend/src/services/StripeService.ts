import Stripe from 'stripe';
import { env, isStripeConfigured } from '../config/env.js';
import {
    PLAN_LABELS,
    type BillingPlan,
} from '../types/billing.types.js';

export class StripeError extends Error {
    constructor(
        message: string,
        public readonly code:
            | 'CONFIG_ERROR'
            | 'CHECKOUT_FAILED'
            | 'WEBHOOK_FAILED',
    ) {
        super(message);
        this.name = 'StripeError';
    }
}

let stripeClient: Stripe | null = null;

function ensureStripeReady(): Stripe {
    if (!isStripeConfigured()) {
        throw new StripeError(
            'Stripe is not configured',
            'CONFIG_ERROR',
        );
    }

    if (!stripeClient) {
        stripeClient = new Stripe(env.STRIPE_SECRET_KEY!);
    }

    return stripeClient;
}

function getPriceIdForPlan(plan: BillingPlan): string {
    const priceIds: Record<BillingPlan, string | undefined> = {
        MONTHLY: env.STRIPE_PRICE_MONTHLY,
        SIX_MONTHS: env.STRIPE_PRICE_SIX_MONTHS,
        YEARLY: env.STRIPE_PRICE_YEARLY,
    };

    const priceId = priceIds[plan];

    if (!priceId) {
        throw new StripeError(
            `Missing Stripe price id for ${plan}`,
            'CONFIG_ERROR',
        );
    }

    return priceId;
}

export interface CreateCheckoutSessionInput {
    userId: string;
    email: string;
    plan: BillingPlan;
}

export interface CreateCheckoutSessionResult {
    sessionId: string;
    url: string;
}

export async function createPremiumCheckoutSession(
    input: CreateCheckoutSessionInput,
): Promise<CreateCheckoutSessionResult> {
    const stripe = ensureStripeReady();
    const priceId = getPriceIdForPlan(input.plan);

    try {
        const session = await stripe.checkout.sessions.create({
            mode: 'payment',
            customer_email: input.email,
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            success_url: `${env.FRONTEND_URL}/?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${env.FRONTEND_URL}/premium?checkout=canceled`,
            metadata: {
                userId: input.userId,
                plan: input.plan,
            },
            payment_intent_data: {
                metadata: {
                    userId: input.userId,
                    plan: input.plan,
                },
            },
        });

        if (!session.id || !session.url) {
            throw new StripeError(
                'Stripe did not return a checkout session URL',
                'CHECKOUT_FAILED',
            );
        }

        return {
            sessionId: session.id,
            url: session.url,
        };
    } catch (err) {
        if (err instanceof StripeError) {
            throw err;
        }

        console.error(err);
        throw new StripeError(
            `Failed to create checkout session for ${PLAN_LABELS[input.plan]}`,
            'CHECKOUT_FAILED',
        );
    }
}

export function constructStripeWebhookEvent(
    rawBody: Buffer,
    signature: string,
): Stripe.Event {
    if (!isStripeConfigured()) {
        throw new StripeError(
            'Stripe is not configured',
            'CONFIG_ERROR',
        );
    }

    try {
        //returns stripe event object created by backend after validating incoming webhook
        return Stripe.webhooks.constructEvent(
            rawBody,
            signature,
            env.STRIPE_WEBHOOK_SECRET!,
        );
    } catch (err) {
        console.error(err);
        throw new StripeError(
            'Invalid Stripe webhook signature',
            'WEBHOOK_FAILED',
        );
    }
}

export async function retrieveCheckoutSession(
    sessionId: string,
): Promise<Stripe.Checkout.Session> {
    const stripe = ensureStripeReady();

    try {
        return await stripe.checkout.sessions.retrieve(sessionId, {
            expand: ['payment_intent'],
        });
    } catch (err) {
        console.error(err);
        throw new StripeError(
            'Failed to retrieve checkout session',
            'CHECKOUT_FAILED',
        );
    }
}

export function getStripeClient(): Stripe {
    return ensureStripeReady();
}