import crypto from 'node:crypto';
import type { OtpPurpose } from '@prisma/client';
import { prisma } from '../config/db.js';
import { env } from '../config/env.js';
import {
    sendLoginOtpEmail,
    sendPasswordResetOtpEmail,
} from './EmailJsService.js';
import type {
    CreateOtpChallengeResult,
    OtpChallengeLookup,
    OtpErrorCode,
} from '../types/otp.types.js';

export class OtpError extends Error {
    constructor(
        message: string,
        public readonly code: OtpErrorCode,
    ) {
        super(message);
        this.name = 'OtpError';
    }
}

function hashValue(value: string): string {
    return crypto.createHash('sha256').update(value).digest('hex');
}

function generateOtpCode(): string {
    return crypto.randomInt(100000, 1000000).toString();
}

function generateChallengeToken(): string {
    return crypto.randomBytes(32).toString('hex');
}

function getOtpExpiryDate(): Date {
    const minutes = env.OTP_EXPIRY_MINUTES ?? 10;
    return new Date(Date.now() + minutes * 60_000);
}

function getResendAvailableAt(from: Date = new Date()): Date {
    const seconds = env.OTP_RESEND_COOLDOWN_SECONDS ?? 60;
    return new Date(from.getTime() + seconds * 1000);
}

export function maskEmail(email: string): string {
    const [local, domain] = email.split('@');
    if (!local || !domain) {
        return '***';
    }

    const visible = local.slice(0, Math.min(2, local.length));
    return `${visible}***@${domain}`;
}

async function sendOtpByPurpose(input: {
    purpose: OtpPurpose;
    toEmail: string;
    toName: string;
    otpCode: string;
}): Promise<void> {
    const expiryMinutes = env.OTP_EXPIRY_MINUTES ?? 10;

    if (input.purpose === 'LOGIN') {
        await sendLoginOtpEmail({
            toEmail: input.toEmail,
            toName: input.toName,
            otpCode: input.otpCode,
            expiryMinutes,
        });
        return;
    }

    await sendPasswordResetOtpEmail({
        toEmail: input.toEmail,
        toName: input.toName,
        otpCode: input.otpCode,
        expiryMinutes,
    });
}

export async function createOtpChallenge(input: {
    userId: string;
    email: string;
    name: string;
    purpose: OtpPurpose;
}): Promise<CreateOtpChallengeResult> {
    const otpCode = generateOtpCode();
    const challengeToken = generateChallengeToken();
    const expiresAt = getOtpExpiryDate();
    const now = new Date();

    await prisma.otpChallenge.deleteMany({
        where: {
            userId: input.userId,
            purpose: input.purpose,
        },
    });

    await prisma.otpChallenge.create({
        data: {
            userId: input.userId,
            purpose: input.purpose,
            otpHash: hashValue(otpCode),
            challengeTokenHash: hashValue(challengeToken),
            expiresAt,
        },
    });

    await sendOtpByPurpose({
        purpose: input.purpose,
        toEmail: input.email,
        toName: input.name,
        otpCode,
    });

    return {
        challengeToken,
        expiresAt,
        resendAvailableAt: getResendAvailableAt(now),
        maskedEmail: maskEmail(input.email),
    };
}

export async function findActiveChallenge(
    challengeToken: string,
    purpose: OtpPurpose,
): Promise<OtpChallengeLookup> {
    const challenge = await prisma.otpChallenge.findUnique({
        where: { challengeTokenHash: hashValue(challengeToken) },
    });

    if (!challenge || challenge.purpose !== purpose) {
        throw new OtpError('OTP challenge not found', 'OTP_NOT_FOUND');
    }

    if (challenge.expiresAt < new Date()) {
        await prisma.otpChallenge.delete({ where: { id: challenge.id } });
        throw new OtpError('OTP has expired', 'OTP_EXPIRED');
    }

    return challenge;
}

export async function verifyOtpChallenge(input: {
    challengeToken: string;
    otpCode: string;
    purpose: OtpPurpose;
}): Promise<{ userId: string }> {
    const challenge = await findActiveChallenge(input.challengeToken, input.purpose);

    if (challenge.otpHash !== hashValue(input.otpCode)) {
        throw new OtpError('Incorrect OTP', 'OTP_INVALID');
    }

    await prisma.otpChallenge.delete({ where: { id: challenge.id } });

    return { userId: challenge.userId };
}

export async function resendOtpChallenge(input: {
    challengeToken: string;
    purpose: OtpPurpose;
}): Promise<CreateOtpChallengeResult> {
    const existing = await findActiveChallenge(input.challengeToken, input.purpose);

    const cooldownMs = (env.OTP_RESEND_COOLDOWN_SECONDS ?? 60) * 1000;
    const earliestResendAt = existing.createdAt.getTime() + cooldownMs;

    if (Date.now() < earliestResendAt) {
        throw new OtpError(
            'Please wait before requesting another code',
            'RESEND_COOLDOWN',
        );
    }

    const user = await prisma.user.findUnique({
        where: { id: existing.userId },
        select: { id: true, email: true, name: true },
    });

    if (!user) {
        throw new OtpError('OTP challenge not found', 'OTP_NOT_FOUND');
    }

    return createOtpChallenge({
        userId: user.id,
        email: user.email,
        name: user.name,
        purpose: input.purpose,
    });
}

const PASSWORD_RESET_AUTHORIZED_MARKER = 'PASSWORD_RESET_AUTHORIZED';

export async function createPasswordResetAuthorization(
    userId: string,
): Promise<{ challengeToken: string; expiresAt: Date }> {
    const challengeToken = generateChallengeToken();
    const expiresAt = new Date(Date.now() + 15 * 60_000);

    await prisma.otpChallenge.deleteMany({
        where: {
            userId,
            purpose: 'PASSWORD_RESET',
        },
    });

    await prisma.otpChallenge.create({
        data: {
            userId,
            purpose: 'PASSWORD_RESET',
            otpHash: hashValue(PASSWORD_RESET_AUTHORIZED_MARKER),
            challengeTokenHash: hashValue(challengeToken),
            expiresAt,
        },
    });

    return { challengeToken, expiresAt };
}

export async function consumePasswordResetAuthorization(
    challengeToken: string,
): Promise<{ userId: string }> {
    const challenge = await findActiveChallenge(challengeToken, 'PASSWORD_RESET');

    if (challenge.otpHash !== hashValue(PASSWORD_RESET_AUTHORIZED_MARKER)) {
        throw new OtpError('Reset token is invalid', 'RESET_TOKEN_INVALID');
    }

    await prisma.otpChallenge.delete({ where: { id: challenge.id } });

    return { userId: challenge.userId };
}