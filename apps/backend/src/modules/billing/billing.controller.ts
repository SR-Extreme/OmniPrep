import type { Request, Response } from 'express';
import type { AuthenticatedRequest } from '../../middleware/auth.middleware.js';
import {
    BillingError,
    createCheckoutSession,
    getPlanCatalog,
    getPremiumStatus,
    handleStripeWebhook,
} from './billing.service.js';
import {
    createCheckoutSessionBodySchema,
    stripeWebhookHeadersSchema,
} from './billing.validation.js';

function sendValidationError(res: Response, details: unknown): void {
    res.status(400).json({ error: 'Validation failed', details });
}

function handleBillingError(err: unknown, res: Response): void {
    if (err instanceof BillingError) {
        const statusByCode: Record<BillingError['code'], number> = {
            NOT_FOUND: 404,
            INVALID_STATE: 409,
            ALREADY_PREMIUM: 409,
            CONFIG_ERROR: 503,
            CHECKOUT_FAILED: 502,
            WEBHOOK_FAILED: 400,
        };

        res.status(statusByCode[err.code]).json({
            error: err.message,
            code: err.code,
        });
        return;
    }

    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
}

function requireUserId(
    req: AuthenticatedRequest,
    res: Response,
): string | null {
    if (!req.user?.sub) {
        res.status(401).json({ error: 'Unauthorized' });
        return null;
    }

    return req.user.sub;
}

export async function getPlanCatalogHandler(
    _req: Request,
    res: Response,
): Promise<void> {
    res.status(200).json({ plans: getPlanCatalog() });
}

export async function getPremiumStatusHandler(
    req: AuthenticatedRequest,
    res: Response,
): Promise<void> {
    const userId = requireUserId(req, res);
    if (!userId) {
        return;
    }

    try {
        const status = await getPremiumStatus(userId);
        res.status(200).json(status);
    } catch (err) {
        handleBillingError(err, res);
    }
}

export async function createCheckoutSessionHandler(
    req: AuthenticatedRequest,
    res: Response,
): Promise<void> {
    const userId = requireUserId(req, res);
    if (!userId) {
        return;
    }

    const parsed = createCheckoutSessionBodySchema.safeParse(req.body);

    if (!parsed.success) {
        sendValidationError(res, parsed.error.flatten().fieldErrors);
        return;
    }

    try {
        const session = await createCheckoutSession(userId, parsed.data);
        res.status(200).json(session);
    } catch (err) {
        handleBillingError(err, res);
    }
}

export async function stripeWebhookHandler(
    req: Request,
    res: Response,
): Promise<void> {
    const parsedHeaders = stripeWebhookHeadersSchema.safeParse(req.headers);

    if (!parsedHeaders.success) {
        sendValidationError(res, parsedHeaders.error.flatten().fieldErrors);
        return;
    }

    const signature = parsedHeaders.data['stripe-signature'];
    const rawBody = req.body;

    if (!Buffer.isBuffer(rawBody)) {
        res.status(400).json({
            error: 'Stripe webhook requires raw body',
            code: 'WEBHOOK_FAILED',
        });
        return;
    }

    try {
        const result = await handleStripeWebhook(rawBody, signature);
        res.status(200).json(result);
    } catch (err) {
        handleBillingError(err, res);
    }
}
