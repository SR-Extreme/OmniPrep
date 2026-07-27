import type { CookieOptions, Response } from 'express';
import { env } from '../config/env.js';

export const REFRESH_TOKEN_COOKIE = 'refreshToken';

function refreshTokenMaxAgeMs(): number {
    const expiry = env.JWT_REFRESH_EXPIRY;
    const match = /^(\d+)([smhd])$/.exec(expiry);

    if (!match) {
        throw new Error(`Invalid JWT_REFRESH_EXPIRY: ${expiry}`);
    }

    const value = Number(match[1]);
    const unit = match[2];
    const multipliers: Record<string, number> = {
        s: 1000,
        m: 60_000,
        h: 3_600_000,
        d: 86_400_000,
    };

    return value * multipliers[unit];
}

export function getRefreshTokenCookieOptions(): CookieOptions {
    const isProduction = env.NODE_ENV === 'production';

    return {
        httpOnly: true,
        secure: isProduction,
        // Cross-origin SPA (frontend ≠ API host) needs None in production;
        // localhost ports are same-site so Lax works in development.
        sameSite: isProduction ? 'none' : 'lax',
        path: '/api/auth',
        maxAge: refreshTokenMaxAgeMs(),
    };
}

export function setRefreshTokenCookie(res: Response, refreshToken: string): void {
    res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, getRefreshTokenCookieOptions());
}

export function clearRefreshTokenCookie(res: Response): void {
    res.clearCookie(REFRESH_TOKEN_COOKIE, {
        ...getRefreshTokenCookieOptions(),
        maxAge: undefined,
    });
}
