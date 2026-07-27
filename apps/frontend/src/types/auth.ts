export type Role = 'ADMIN' | 'CANDIDATE';

export interface AuthUser {
    id: string;
    email: string;
    role: Role;
    name: string;
    image: string | null;
    isPremium: boolean;
    premiumFrom: string | null;
    premiumTill: string | null;
}

export interface AuthTokens {
    accessToken: string;
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

export interface SignupBody {
    email: string;
    password: string;
    name: string;
    phoneNo: string;
    role: 'CANDIDATE';
}

export interface LoginBody {
    email: string;
    password: string;
    expectedRole?: Role;
}

export interface VerifyOtpBody {
    challengeToken: string;
    otp: string;
}

export interface ResendOtpBody {
    challengeToken: string;
}

export interface ForgotPasswordBody {
    email: string;
}

export interface ResetPasswordBody {
    challengeToken: string;
    newPassword: string;
    confirmPassword: string;
}

export interface PasswordResetVerifiedResponse {
    challengeToken: string;
    message: string;
}

export interface MessageResponse {
    message: string;
}

export interface MeResponse {
    user: {
        sub: string;
        email: string;
        role: Role;
    };
}

export type LoginPageStep =
    | 'login'
    | 'login-otp'
    | 'forgot-email'
    | 'forgot-otp'
    | 'forgot-reset';
