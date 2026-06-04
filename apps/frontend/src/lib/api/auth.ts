import { apiRequest } from "./client";
export type Role = 'ADMIN' | 'CANDIDATE';

export interface AuthUser {
    id: string;
    email: string;
    role: Role;
    name: string;
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}

export interface AuthResult {
    user: AuthUser;
    tokens: AuthTokens;
}

export interface SignupBody {
    email: string;
    password: string;
    name: string;
}

export interface LoginBody {
    email: string;
    password: string;
}

export interface RefreshBody {
    refreshToken: string;
}

export interface MeResponse {
    user: {
        sub: string;
        email: string;
        role: Role;
    };
}

export function signup(body: SignupBody): Promise<AuthResult> {
    return apiRequest<AuthResult>('/api/auth/signup', { method: 'POST', body });
}

export function login(body: LoginBody): Promise<AuthResult> {
    return apiRequest<AuthResult>('/api/auth/login', { method: 'POST', body });
}

export function refresh(body: RefreshBody): Promise<AuthResult> {
    return apiRequest<AuthResult>('/api/auth/refresh', { method: 'POST', body, });
}

export function logout(body: RefreshBody): Promise<void> {
    return apiRequest<void>('/api/auth/logout', { method: 'POST', body, });
}

export function getMe(accessToken: string): Promise<MeResponse> {
    return apiRequest<MeResponse>('/api/me', {
        token: accessToken,
    });
}