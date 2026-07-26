import crypto from 'node:crypto';
import bcrypt from 'bcrypt';
import jwt, { type SignOptions } from 'jsonwebtoken';
import type { Role } from '@prisma/client';
import { prisma } from '../../config/db.js';
import { env } from '../../config/env.js';
import { getUserPremiumStatus } from '../../middleware/premium.middleware.js';
import {
    createOtpChallenge,
    createPasswordResetAuthorization,
    consumePasswordResetAuthorization,
    resendOtpChallenge,
    verifyOtpChallenge,
} from '../../services/OtpService.js';
import type {
    ForgotPasswordInput,
    LoginInput,
    RefreshTokenInput,
    ResendOtpInput,
    ResetPasswordInput,
    SignupInput,
    VerifyOtpInput,
} from './auth.validation.js';

const BCRYPT_ROUNDS = 12;

export class AuthError extends Error {
    constructor(
        message: string,
        public readonly code:
            | 'EMAIL_EXISTS'
            | 'EMAIL_NOT_FOUND'
            | 'INVALID_CREDENTIALS'
            | 'INVALID_REFRESH_TOKEN'
            | 'FORBIDDEN',
    ) {
        super(message);
        this.name = 'AuthError';
    }
}

export interface AuthUser {
    id: string;
    email: string;
    role: Role;
    name: string;
    image: string | null;
    isPremium: boolean;
    premiumFrom: Date | null;
    premiumTill: Date | null;
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}

export interface AuthResult {
    user: AuthUser;
    tokens: AuthTokens;
}

export interface OtpChallengeResponse {
    requiresOtp: true;
    challengeToken: string;
    expiresAt: string;
    resendAvailableAt: string;
    maskedEmail: string;
    message: string;
}

export interface DirectLoginResponse extends AuthResult {
    requiresOtp: false;
}

export type LoginResponse = OtpChallengeResponse | DirectLoginResponse;

export interface AccessTokenPayload {
    sub: string;
    email: string;
    role: Role;
}

function hashRefreshToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
}

function generateRefreshToken(): string {
    return crypto.randomBytes(40).toString('hex');
}

function getRefreshTokenExpiresAt(): Date {
    const expiry = env.JWT_REFRESH_EXPIRY;
    const match = /^(\d+)([smhd])$/.exec(expiry);

    if (!match) {
        throw new Error(`Invalid JWT_REFRESH_EXPIRY: ${expiry}`);
    }

    const value = Number(match[1]);
    const unit = match[2];

    const multipliers: Record<string, number> = {
        s: 1_000,
        m: 60_000,
        h: 3_600_000,
        d: 86_400_000,
    };

    return new Date(Date.now() + value * multipliers[unit]!);
}

function toOtpChallengeResponse(
    challenge: {
        challengeToken: string;
        expiresAt: Date;
        resendAvailableAt: Date;
        maskedEmail: string;
    },
    message: string,
): OtpChallengeResponse {
    return {
        requiresOtp: true,
        challengeToken: challenge.challengeToken,
        expiresAt: challenge.expiresAt.toISOString(),
        resendAvailableAt: challenge.resendAvailableAt.toISOString(),
        maskedEmail: challenge.maskedEmail,
        message,
    };
}

async function toAuthUser(user: {
    id: string;
    email: string;
    role: Role;
    name: string;
    image: string | null;
}): Promise<AuthUser> {
    const premium = await getUserPremiumStatus(user.id);

    return {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        image: user.image,
        isPremium: premium.isPremium,
        premiumFrom: premium.premiumFrom,
        premiumTill: premium.premiumTill,
    };
}

async function issueTokens(user: {
    id: string;
    email: string;
    role: Role;
    name: string;
    image: string | null;
}): Promise<AuthResult> {
    const signOptions: SignOptions = {
        expiresIn: env.JWT_ACCESS_EXPIRY as SignOptions['expiresIn'],
    };

    const accessToken = jwt.sign(
        {
            sub: user.id,
            email: user.email,
            role: user.role,
        } satisfies AccessTokenPayload,
        env.JWT_ACCESS_SECRET,
        signOptions,
    );

    const refreshToken = generateRefreshToken();
    const tokenHash = hashRefreshToken(refreshToken);

    await prisma.refreshToken.create({
        data: {
            userId: user.id,
            tokenHash,
            expiresAt: getRefreshTokenExpiresAt(),
        },
    });

    return {
        user: await toAuthUser(user),
        tokens: { accessToken, refreshToken },
    };
}

export async function signup(input: SignupInput): Promise<{ message: string }> {
    if (input.role !== 'CANDIDATE') {
        throw new AuthError('Admin accounts cannot be created via signup', 'FORBIDDEN');
    }

    const existing = await prisma.user.findUnique({
        where: { email: input.email },
    });

    if (existing) {
        throw new AuthError('An account with this email already exists', 'EMAIL_EXISTS');
    }

    const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);

    await prisma.user.create({
        data: {
            email: input.email,
            passwordHash,
            name: input.name,
            phoneNo: input.phoneNo,
            role: 'CANDIDATE',
        },
    });

    return {
        message: 'Account created successfully. Please sign in.',
    };
}

/** Step 1: validate password — OTP for candidates, direct session for admins */
export async function login(input: LoginInput): Promise<LoginResponse> {
    const user = await prisma.user.findUnique({
        where: { email: input.email },
    });

    if (!user) {
        throw new AuthError('Invalid email or password', 'INVALID_CREDENTIALS');
    }

    const valid = await bcrypt.compare(input.password, user.passwordHash);

    if (!valid) {
        throw new AuthError('Invalid email or password', 'INVALID_CREDENTIALS');
    }

    if (input.expectedRole && user.role !== input.expectedRole) {
        throw new AuthError('Invalid email or password', 'INVALID_CREDENTIALS');
    }

    if (user.role === 'ADMIN') {
        const updated = await prisma.user.update({
            where: { id: user.id },
            data: { recentLogin: new Date() },
            select: {
                id: true,
                email: true,
                role: true,
                name: true,
                image: true,
            },
        });

        const session = await issueTokens(updated);
        return {
            requiresOtp: false,
            ...session,
        };
    }

    const challenge = await createOtpChallenge({
        userId: user.id,
        email: user.email,
        name: user.name,
        purpose: 'LOGIN',
    });

    return toOtpChallengeResponse(
        challenge,
        'A 6-digit verification code has been sent to your registered email.',
    );
}

/** Step 2: verify login OTP → issue session */
export async function verifyLoginOtp(input: VerifyOtpInput): Promise<AuthResult> {
    const { userId } = await verifyOtpChallenge({
        challengeToken: input.challengeToken,
        otpCode: input.otp,
        purpose: 'LOGIN',
    });

    const user = await prisma.user.update({
        where: { id: userId },
        data: { recentLogin: new Date() },
        select: {
            id: true,
            email: true,
            role: true,
            name: true,
            image: true,
        },
    });

    return issueTokens(user);
}

export async function resendLoginOtp(input: ResendOtpInput): Promise<OtpChallengeResponse> {
    const challenge = await resendOtpChallenge({
        challengeToken: input.challengeToken,
        purpose: 'LOGIN',
    });

    return toOtpChallengeResponse(
        challenge,
        'A new verification code has been sent to your registered email.',
    );
}

export async function forgotPassword(
    input: ForgotPasswordInput,
): Promise<OtpChallengeResponse> {
    const user = await prisma.user.findUnique({
        where: { email: input.email },
    });

    if (!user) {
        throw new AuthError('No account found with this email', 'EMAIL_NOT_FOUND');
    }

    const challenge = await createOtpChallenge({
        userId: user.id,
        email: user.email,
        name: user.name,
        purpose: 'PASSWORD_RESET',
    });

    return toOtpChallengeResponse(
        challenge,
        'A verification code has been sent to your registered email.',
    );
}

export async function verifyPasswordResetOtp(
    input: VerifyOtpInput,
): Promise<{ challengeToken: string; message: string }> {
    const { userId } = await verifyOtpChallenge({
        challengeToken: input.challengeToken,
        otpCode: input.otp,
        purpose: 'PASSWORD_RESET',
    });

    const authorization = await createPasswordResetAuthorization(userId);

    return {
        challengeToken: authorization.challengeToken,
        message: 'OTP verified. You can now set a new password.',
    };
}

export async function resendPasswordResetOtp(
    input: ResendOtpInput,
): Promise<OtpChallengeResponse> {
    const challenge = await resendOtpChallenge({
        challengeToken: input.challengeToken,
        purpose: 'PASSWORD_RESET',
    });

    return toOtpChallengeResponse(
        challenge,
        'A new verification code has been sent to your registered email.',
    );
}

export async function resetPassword(
    input: ResetPasswordInput,
): Promise<{ message: string }> {
    const { userId } = await consumePasswordResetAuthorization(input.challengeToken);

    const passwordHash = await bcrypt.hash(input.newPassword, BCRYPT_ROUNDS);

    await prisma.user.update({
        where: { id: userId },
        data: { passwordHash },
    });

    await prisma.refreshToken.deleteMany({ where: { userId } });

    return { message: 'Password updated successfully. Please sign in.' };
}

export async function refresh(input: RefreshTokenInput): Promise<AuthResult> {
    const tokenHash = hashRefreshToken(input.refreshToken);

    const stored = await prisma.refreshToken.findUnique({
        where: { tokenHash },
        include: {
            user: {
                select: {
                    id: true,
                    email: true,
                    role: true,
                    name: true,
                    image: true,
                },
            },
        },
    });

    if (!stored || stored.expiresAt < new Date()) {
        if (stored) {
            await prisma.refreshToken.delete({ where: { id: stored.id } });
        }
        throw new AuthError('Invalid or expired refresh token', 'INVALID_REFRESH_TOKEN');
    }

    await prisma.refreshToken.delete({ where: { id: stored.id } });

    return issueTokens(stored.user);
}

export async function logout(input: RefreshTokenInput): Promise<void> {
    const tokenHash = hashRefreshToken(input.refreshToken);
    await prisma.refreshToken.deleteMany({
        where: { tokenHash },
    });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
    if (!payload.sub || !payload.email || !payload.role) {
        throw new jwt.JsonWebTokenError('Invalid access token payload');
    }
    return payload;
}