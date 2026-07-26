import type { Request, Response } from 'express';
import {
    forgotPasswordSchema,
    loginSchema,
    refreshTokenSchema,
    resendOtpSchema,
    resetPasswordSchema,
    signupSchema,
    verifyOtpSchema,
} from './auth.validation.js';
import {
    AuthError,
    forgotPassword,
    login,
    logout,
    refresh,
    resendLoginOtp,
    resendPasswordResetOtp,
    resetPassword,
    signup,
    verifyLoginOtp,
    verifyPasswordResetOtp,
} from './auth.service.js';
import { EmailJsError } from '../../services/EmailJsService.js';
import { OtpError } from '../../services/OtpService.js';

function sendValidationError(res: Response, details: unknown): void {
    res.status(400).json({ error: 'Validation failed', details });
}

function handleAuthError(err: unknown, res: Response): void {
    if (err instanceof AuthError) {
        const statusByCode: Record<AuthError['code'], number> = {
            EMAIL_EXISTS: 409,
            EMAIL_NOT_FOUND: 404,
            INVALID_CREDENTIALS: 401,
            INVALID_REFRESH_TOKEN: 401,
            FORBIDDEN: 403,
        };

        res.status(statusByCode[err.code]).json({
            error: err.message,
            code: err.code,
        });
        return;
    }

    if (err instanceof OtpError) {
        const statusByCode: Record<OtpError['code'], number> = {
            EMAILJS_NOT_CONFIGURED: 503,
            OTP_INVALID: 401,
            OTP_EXPIRED: 401,
            OTP_NOT_FOUND: 404,
            RESEND_COOLDOWN: 429,
            RESET_TOKEN_INVALID: 401,
            PASSWORD_MISMATCH: 400,
        };

        res.status(statusByCode[err.code]).json({
            error: err.message,
            code: err.code,
        });
        return;
    }

    if (err instanceof EmailJsError) {
        const status = err.code === 'CONFIG_ERROR' ? 503 : 502;
        res.status(status).json({
            error: err.message,
            code: err.code,
        });
        return;
    }

    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
}

export async function signupHandler(req: Request, res: Response): Promise<void> {
    const parsed = signupSchema.safeParse(req.body);

    if (!parsed.success) {
        sendValidationError(res, parsed.error.flatten().fieldErrors);
        return;
    }

    try {
        const result = await signup(parsed.data);
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

export async function verifyLoginOtpHandler(req: Request, res: Response): Promise<void> {
    const parsed = verifyOtpSchema.safeParse(req.body);

    if (!parsed.success) {
        sendValidationError(res, parsed.error.flatten().fieldErrors);
        return;
    }

    try {
        const result = await verifyLoginOtp(parsed.data);
        res.status(200).json(result);
    } catch (err) {
        handleAuthError(err, res);
    }
}

export async function resendLoginOtpHandler(req: Request, res: Response): Promise<void> {
    const parsed = resendOtpSchema.safeParse(req.body);

    if (!parsed.success) {
        sendValidationError(res, parsed.error.flatten().fieldErrors);
        return;
    }

    try {
        const result = await resendLoginOtp(parsed.data);
        res.status(200).json(result);
    } catch (err) {
        handleAuthError(err, res);
    }
}

export async function forgotPasswordHandler(req: Request, res: Response): Promise<void> {
    const parsed = forgotPasswordSchema.safeParse(req.body);

    if (!parsed.success) {
        sendValidationError(res, parsed.error.flatten().fieldErrors);
        return;
    }

    try {
        const result = await forgotPassword(parsed.data);
        res.status(200).json(result);
    } catch (err) {
        handleAuthError(err, res);
    }
}

export async function verifyPasswordResetOtpHandler(
    req: Request,
    res: Response,
): Promise<void> {
    const parsed = verifyOtpSchema.safeParse(req.body);

    if (!parsed.success) {
        sendValidationError(res, parsed.error.flatten().fieldErrors);
        return;
    }

    try {
        const result = await verifyPasswordResetOtp(parsed.data);
        res.status(200).json(result);
    } catch (err) {
        handleAuthError(err, res);
    }
}

export async function resendPasswordResetOtpHandler(
    req: Request,
    res: Response,
): Promise<void> {
    const parsed = resendOtpSchema.safeParse(req.body);

    if (!parsed.success) {
        sendValidationError(res, parsed.error.flatten().fieldErrors);
        return;
    }

    try {
        const result = await resendPasswordResetOtp(parsed.data);
        res.status(200).json(result);
    } catch (err) {
        handleAuthError(err, res);
    }
}

export async function resetPasswordHandler(req: Request, res: Response): Promise<void> {
    const parsed = resetPasswordSchema.safeParse(req.body);

    if (!parsed.success) {
        sendValidationError(res, parsed.error.flatten().fieldErrors);
        return;
    }

    try {
        const result = await resetPassword(parsed.data);
        res.status(200).json(result);
    } catch (err) {
        handleAuthError(err, res);
    }
}

export async function refreshHandler(req: Request, res: Response): Promise<void> {
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

export async function logoutHandler(req: Request, res: Response): Promise<void> {
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