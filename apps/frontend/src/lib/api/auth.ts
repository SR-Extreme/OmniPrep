import { apiRequest } from './client';
import type {
    AuthResult,
    ForgotPasswordBody,
    LoginBody,
    LoginResponse,
    MeResponse,
    MessageResponse,
    OtpChallengeResponse,
    PasswordResetVerifiedResponse,
    ResendOtpBody,
    ResetPasswordBody,
    SignupBody,
    VerifyOtpBody,
} from '@/types/auth';

export type {
    AuthResult,
    AuthTokens,
    AuthUser,
    DirectLoginResponse,
    ForgotPasswordBody,
    LoginBody,
    LoginResponse,
    MeResponse,
    MessageResponse,
    OtpChallengeResponse,
    PasswordResetVerifiedResponse,
    ResendOtpBody,
    ResetPasswordBody,
    Role,
    SignupBody,
    VerifyOtpBody,
} from '@/types/auth';

export function signup(body: SignupBody): Promise<MessageResponse> {
    return apiRequest<MessageResponse>('/api/auth/signup', { method: 'POST', body });
}

export function login(body: LoginBody): Promise<LoginResponse> {
    return apiRequest<LoginResponse>('/api/auth/login', {
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

export function refresh(): Promise<AuthResult> {
    return apiRequest<AuthResult>('/api/auth/refresh', {
        method: 'POST',
        skipAuthRefresh: true,
    });
}

export function logout(): Promise<void> {
    return apiRequest<void>('/api/auth/logout', { method: 'POST' });
}

export function getMe(accessToken: string): Promise<MeResponse> {
    return apiRequest<MeResponse>('/api/me', {
        token: accessToken,
    });
}