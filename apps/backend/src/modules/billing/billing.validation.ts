import { z } from 'zod';
import { SUBSCRIPTION_PLANS } from '../../types/billing.types.js';

export const createCheckoutSessionBodySchema = z.object({
    plan: z.enum(SUBSCRIPTION_PLANS, {
        message: 'Plan must be MONTHLY, SIX_MONTHS, or YEARLY',
    }),
});

export const checkoutSessionQuerySchema = z.object({
    sessionId: z
        .string()
        .trim()
        .min(1, 'Checkout session id is required'),
});

export const stripeWebhookHeadersSchema = z.object({
    'stripe-signature': z
        .string()
        .min(1, 'Stripe signature header is required'),
});

export type CreateCheckoutSessionBody = z.infer<
    typeof createCheckoutSessionBodySchema
>;

export type CheckoutSessionQuery = z.infer<
    typeof checkoutSessionQuerySchema
>;

export type StripeWebhookHeaders = z.infer<
    typeof stripeWebhookHeadersSchema
>;