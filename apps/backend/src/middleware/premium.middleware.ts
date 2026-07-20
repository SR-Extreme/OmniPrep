import type { NextFunction, Response } from 'express';
import { prisma } from '../config/db.js';
import type { AuthenticatedRequest } from './auth.middleware.js';

export interface PremiumStatus {
    isPremium: boolean;
    premiumFrom: Date | null;
    premiumTill: Date | null;
}

export async function getUserPremiumStatus(userId: string): Promise<PremiumStatus> {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            isPremium: true,
            premiumFrom: true,
            premiumTill: true,
        },
    });

    if (!user) {
        return {
            isPremium: false,
            premiumFrom: null,
            premiumTill: null,
        };
    }

    const now = new Date();
    const isActive = user.isPremium && user.premiumTill != null && user.premiumTill.getTime() > now.getTime();

    if (user.isPremium && !isActive) {
        await prisma.user.update({
            where: { id: userId },
            data: {
                isPremium: false,
                premiumFrom: null,
                premiumTill: null,
            },
        });

        return {
            isPremium: false,
            premiumFrom: null,
            premiumTill: null,
        };
    }

    return {
        isPremium: isActive,
        premiumFrom: user.premiumFrom,
        premiumTill: user.premiumTill,
    };
}

export async function premiumMiddleware(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
): Promise<void> {
    if (!req.user?.sub) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }

    try {
        const status = await getUserPremiumStatus(req.user.sub);

        if (!status.isPremium) {
            res.status(403).json({
                error: 'Premium Required',
                code: 'PREMIUM_REQUIRED',
                message: 'Mock Interviews are available only for Premium users.',
            });
            return;
        }

        next();
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
}