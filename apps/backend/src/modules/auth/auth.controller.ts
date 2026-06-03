import type { Request, Response } from "express";
import { loginSchema, refreshTokenSchema, registerSchema } from "./auth.validation.js";
import { AuthError, login, logout, refresh, register } from "./auth.service.js";

function sendValidationError(res: Response, details: unknown): void {
    res.status(400).json({ error: 'Validation failed', details });
}

function handleAuthError(err: unknown, res: Response): void {
    if (err instanceof AuthError) {
        const statusByCode: Record<AuthError['code'], number> = {
            EMAIL_EXISTS: 409,
            INVALID_CREDENTIALS: 401,
            INVALID_REFRESH_TOKEN: 401,
        }

        res.status(statusByCode[err.code]).json({ error: err.message });
        return;
    }

    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
}

export async function registerHandler(req: Request, res: Response): Promise<void> {
    const parsed = registerSchema.safeParse(req.body);

    if (!parsed.success) {
        sendValidationError(res, parsed.error.flatten().fieldErrors);
        return;
    }

    try {
        const result = await register(parsed.data);
        res.status(201).json(result);
    } catch (err) {
        handleAuthError(err, res);
    }
}

export async function loginHandler(req: Request, res: Response): Promise<void> {
    const parsed = loginSchema.safeParse(req.body);

    if (!parsed.success) {
        sendValidationError(res, parsed.error.flatten().fieldErrors);
        return;
    }

    try {
        const result = await login(parsed.data);
        res.status(200).json(result);
    } catch (err) {
        handleAuthError(err, res);
    }
}

export async function refreshHandler(req: Request, res: Response,): Promise<void> {
    const parsed = refreshTokenSchema.safeParse(req.body);

    if (!parsed.success) {
        sendValidationError(res, parsed.error.flatten().fieldErrors);
        return;
    }

    try {
        const result = await refresh(parsed.data);
        res.status(200).json(result);
    } catch (err) {
        handleAuthError(err, res);
    }
}

export async function logoutHandler(req: Request, res: Response,): Promise<void> {
    const parsed = refreshTokenSchema.safeParse(req.body);

    if (!parsed.success) {
        sendValidationError(res, parsed.error.flatten().fieldErrors);
        return;
    }

    try {
        await logout(parsed.data);
        res.status(204).send();
    } catch (err) {
        handleAuthError(err, res);
    }
}