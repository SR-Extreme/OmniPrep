import emailjs from '@emailjs/nodejs';
import { env, isEmailJsConfigured } from '../config/env.js';
import {
    APP_NAME,
    type OtpEmailParams,
    type SubscriptionEmailParams,
} from '../types/otp.types.js';

export class EmailJsError extends Error {
    constructor(
        message: string,
        public readonly code: 'CONFIG_ERROR' | 'SEND_FAILED',
    ) {
        super(message);
        this.name = 'EmailJsError';
    }
}

function ensureEmailJsReady(): void {
    if (!isEmailJsConfigured()) {
        throw new EmailJsError(
            'EmailJS is not configured',
            'CONFIG_ERROR',
        );
    }
}

function getSupportEmail(): string {
    return env.EMAILJS_SUPPORT_EMAIL ?? 'undefined';
}

async function sendTemplate(
    templateId: string,
    params: OtpEmailParams | SubscriptionEmailParams,
): Promise<void> {
    ensureEmailJsReady();

    try {
        await emailjs.send(
            env.EMAILJS_SERVICE_ID!,
            templateId,
            params as unknown as Record<string, unknown>,
            {
                publicKey: env.EMAILJS_PUBLIC_KEY!,
                privateKey: env.EMAILJS_PRIVATE_KEY!,
            },
        );
    } catch (error) {
        const detail = error instanceof Error ? error.message : 'Unknown EmailJS error';
        throw new EmailJsError(
            `Failed to send email: ${detail}`,
            'SEND_FAILED',
        );
    }
}

export async function sendLoginOtpEmail(input: {
    toEmail: string;
    toName: string;
    otpCode: string;
    expiryMinutes: number;
}): Promise<void> {
    const params: OtpEmailParams = {
        to_email: input.toEmail,
        to_name: input.toName,
        otp_code: input.otpCode,
        expiry_minutes: input.expiryMinutes,
        support_email: getSupportEmail(),
        app_name: APP_NAME,
    };

    await sendTemplate(env.EMAILJS_TEMPLATE_LOGIN_OTP!, params);
}

export async function sendPasswordResetOtpEmail(input: {
    toEmail: string;
    toName: string;
    otpCode: string;
    expiryMinutes: number;
}): Promise<void> {
    const params: OtpEmailParams = {
        to_email: input.toEmail,
        to_name: input.toName,
        otp_code: input.otpCode,
        expiry_minutes: input.expiryMinutes,
        support_email: getSupportEmail(),
        app_name: APP_NAME,
    };

    await sendTemplate(env.EMAILJS_TEMPLATE_PASSWORD_RESET_OTP!, params);
}

export async function sendSubscriptionConfirmationEmail(input: {
    toEmail: string;
    toName: string;
    planLabel: string;
    amount: string;
    currency: string;
    startsAt: string;
    expiresAt: string;
}): Promise<void> {
    const params: SubscriptionEmailParams = {
        to_email: input.toEmail,
        to_name: input.toName,
        plan_label: input.planLabel,
        amount: input.amount,
        currency: input.currency,
        starts_at: input.startsAt,
        expires_at: input.expiresAt,
        support_email: getSupportEmail(),
        app_name: APP_NAME,
    };

    await sendTemplate(env.EMAILJS_TEMPLATE_SUBSCRIPTION!, params);
}