import { apiRequest } from './client';
import type {
    AuthResult,
    ForgotPasswordBody,
    LoginBody,
    MeResponse,
    MessageResponse,
    OtpChallengeResponse,
    PasswordResetVerifiedResponse,
    RefreshBody,
    ResendOtpBody,
    ResetPasswordBody,
    SignupBody,
    VerifyOtpBody,
} from '@/types/auth';

export type {
    AuthResult,
    AuthTokens,
    AuthUser,
    ForgotPasswordBody,
    LoginBody,
    MeResponse,
    MessageResponse,
    OtpChallengeResponse,
    PasswordResetVerifiedResponse,
    RefreshBody,
    ResendOtpBody,
    ResetPasswordBody,
    Role,
    SignupBody,
    VerifyOtpBody,
} from '@/types/auth';

export function signup(body: SignupBody): Promise<MessageResponse> {
    return apiRequest<MessageResponse>('/api/auth/signup', { method: 'POST', body });
}

/** Validates credentials and sends OTP — does not return JWTs */
export function login(body: LoginBody): Promise<OtpChallengeResponse> {
    return apiRequest<OtpChallengeResponse>('/api/auth/login', {
        method: 'POST',
        body,
    });
}

export function verifyLoginOtp(body: VerifyOtpBody): Promise<AuthResult> {
    return apiRequest<AuthResult>('/api/auth/login/verify-otp', {
        method: 'POST',
        body,
    });
}

export function resendLoginOtp(body: ResendOtpBody): Promise<OtpChallengeResponse> {
    return apiRequest<OtpChallengeResponse>('/api/auth/login/resend-otp', {
        method: 'POST',
        body,
    });
}

export function forgotPassword(body: ForgotPasswordBody): Promise<OtpChallengeResponse> {
    return apiRequest<OtpChallengeResponse>('/api/auth/forgot-password', {
        method: 'POST',
        body,
    });
}

export function verifyPasswordResetOtp(
    body: VerifyOtpBody,
): Promise<PasswordResetVerifiedResponse> {
    return apiRequest<PasswordResetVerifiedResponse>(
        '/api/auth/forgot-password/verify-otp',
        { method: 'POST', body },
    );
}

export function resendPasswordResetOtp(
    body: ResendOtpBody,
): Promise<OtpChallengeResponse> {
    return apiRequest<OtpChallengeResponse>('/api/auth/forgot-password/resend-otp', {
        method: 'POST',
        body,
    });
}

export function resetPassword(body: ResetPasswordBody): Promise<MessageResponse> {
    return apiRequest<MessageResponse>('/api/auth/forgot-password/reset', {
        method: 'POST',
        body,
    });
}

export function refresh(body: RefreshBody): Promise<AuthResult> {
    return apiRequest<AuthResult>('/api/auth/refresh', {
        method: 'POST',
        body,
        skipAuthRefresh: true,
    });
}

export function logout(body: RefreshBody): Promise<void> {
    return apiRequest<void>('/api/auth/logout', { method: 'POST', body });
}

export function getMe(accessToken: string): Promise<MeResponse> {
    return apiRequest<MeResponse>('/api/me', {
        token: accessToken,
    });
}