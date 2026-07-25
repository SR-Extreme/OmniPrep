import type { OtpPurpose } from '@prisma/client';

export const APP_NAME = 'OmniPrep' as const;

export const OTP_PURPOSES = ['LOGIN', 'PASSWORD_RESET'] as const;

export type OtpPurposeValue = (typeof OTP_PURPOSES)[number];

export interface OtpEmailParams {
    to_email: string;
    to_name: string;
    otp_code: string;
    expiry_minutes: number;
    support_email: string;
    app_name: typeof APP_NAME;
}

export interface SubscriptionEmailParams {
    to_email: string;
    to_name: string;
    plan_label: string;
    amount: string;
    currency: string;
    starts_at: string;
    expires_at: string;
    support_email: string;
    app_name: typeof APP_NAME;
}

export interface CreateOtpChallengeResult {
    challengeToken: string;
    expiresAt: Date;
    resendAvailableAt: Date;
    maskedEmail: string;
}

export interface OtpChallengeLookup {
    id: string;
    userId: string;
    purpose: OtpPurpose;
    otpHash: string;
    challengeTokenHash: string;
    expiresAt: Date;
    createdAt: Date;
}

export type OtpErrorCode =
    | 'EMAILJS_NOT_CONFIGURED'
    | 'OTP_INVALID'
    | 'OTP_EXPIRED'
    | 'OTP_NOT_FOUND'
    | 'RESEND_COOLDOWN'
    | 'RESET_TOKEN_INVALID'
    | 'PASSWORD_MISMATCH';