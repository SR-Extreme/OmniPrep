import type { NextFunction, Request, Response } from 'express';
import type { Role } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { verifyAccessToken, type AccessTokenPayload } from '../modules/auth/auth.service.js';

export interface AuthenticatedRequest extends Request {
    user?: AccessTokenPayload;
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
    const header = req.headers.authorization;

    if (!header?.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Missing or invalid authorization header' });
        return;
    }

    const token = header.slice(7);

    try {
        req.user = verifyAccessToken(token);
        next();
    } catch (err) {
        if (err instanceof jwt.TokenExpiredError) {
            res.status(401).json({ error: 'Access token expired' });
            return;
        }

        if (err instanceof jwt.JsonWebTokenError) {
            res.status(401).json({ error: 'Invalid access token' });
            return;
        }

        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export function adminMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
    if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }

    if (req.user.role !== ('ADMIN' satisfies Role)) {
        res.status(403).json({ error: 'Forbidden: admin access required' });
        return;
    }
    next();
}