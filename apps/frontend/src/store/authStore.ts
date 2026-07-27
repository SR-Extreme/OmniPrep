'use client';

import { create } from 'zustand';
import {
    login as loginApi,
    logout as logoutApi,
    refresh as refreshApi,
    signup as signupApi,
    verifyLoginOtp as verifyLoginOtpApi,
    type AuthUser,
    type LoginBody,
    type LoginResponse,
    type SignupBody,
    type VerifyOtpBody,
} from '@/lib/api/auth';
import { ApiError } from '@/lib/api/client';

const LEGACY_AUTH_STORAGE_KEY = 'omniprep-auth';

interface AuthState {
    user: AuthUser | null;
    /** In-memory only — never persisted to localStorage. */
    accessToken: string | null;
    /** False until the initial cookie-based session restore finishes. */
    isReady: boolean;
    isLoading: boolean;
    error: string | null;

    signup: (body: SignupBody) => Promise<void>;
    login: (body: LoginBody) => Promise<LoginResponse>;
    verifyLoginOtp: (body: VerifyOtpBody) => Promise<void>;
    logout: () => Promise<void>;
    /** Rehydrate access token from the httpOnly refresh cookie (page load). */
    restoreSession: () => Promise<void>;

    clearError: () => void;
    setSession: (user: AuthUser, accessToken: string) => void;
    setUser: (user: AuthUser) => void;
    clearSession: () => void;
}

let restoreInFlight: Promise<void> | null = null;

function clearLegacyAuthStorage(): void {
    if (typeof window === 'undefined') {
        return;
    }
    try {
        window.localStorage.removeItem(LEGACY_AUTH_STORAGE_KEY);
    } catch {
        // Ignore quota / private-mode errors.
    }
}

export const useAuthStore = create<AuthState>()((set, get) => ({
    user: null,
    accessToken: null,
    isReady: false,
    isLoading: false,
    error: null,

    setSession: (user, accessToken) => {
        set({ user, accessToken, error: null });
    },

    setUser: (user) => {
        set({ user, error: null });
    },

    clearSession: () => {
        set({
            user: null,
            accessToken: null,
            error: null,
        });
    },

    clearError: () => {
        set({ error: null });
    },

    restoreSession: () => {
        if (get().isReady) {
            return Promise.resolve();
        }

        if (restoreInFlight) {
            return restoreInFlight;
        }

        restoreInFlight = (async () => {
            clearLegacyAuthStorage();

            try {
                const result = await refreshApi();
                set({
                    user: result.user,
                    accessToken: result.tokens.accessToken,
                    isReady: true,
                    error: null,
                });
            } catch {
                set({
                    user: null,
                    accessToken: null,
                    isReady: true,
                    error: null,
                });
            } finally {
                restoreInFlight = null;
            }
        })();

        return restoreInFlight;
    },

    signup: async (body) => {
        set({ isLoading: true, error: null });
        try {
            await signupApi(body);
            // Account created — user must sign in with OTP on the login page
            set({
                user: null,
                accessToken: null,
                isLoading: false,
            });
        } catch (err) {
            const message =
                err instanceof ApiError ? err.message : 'Sign up failed';
            set({ error: message, isLoading: false });
            throw err;
        }
    },

    login: async (body) => {
        // Wait for cookie restore so login doesn't race refresh-token rotation.
        await get().restoreSession();

        set({ isLoading: true, error: null });
        try {
            const result = await loginApi(body);
            if (!result.requiresOtp) {
                set({
                    user: result.user,
                    accessToken: result.tokens.accessToken,
                    isReady: true,
                    isLoading: false,
                });
            } else {
                set({ isLoading: false });
            }
            return result;
        } catch (err) {
            const message =
                err instanceof ApiError ? err.message : 'Login failed';
            set({ error: message, isLoading: false });
            throw err;
        }
    },

    verifyLoginOtp: async (body) => {
        await get().restoreSession();

        set({ isLoading: true, error: null });
        try {
            const result = await verifyLoginOtpApi(body);
            set({
                user: result.user,
                accessToken: result.tokens.accessToken,
                isReady: true,
                isLoading: false,
            });
        } catch (err) {
            const message =
                err instanceof ApiError
                    ? err.message
                    : 'OTP verification failed';
            set({ error: message, isLoading: false });
            throw err;
        }
    },

    logout: async () => {
        // Clear memory session immediately so UI never sits on a loading gate.
        set({
            user: null,
            accessToken: null,
            error: null,
            isLoading: false,
            isReady: true,
        });

        try {
            await logoutApi();
        } catch {
            // Local session is already cleared; cookie clear is best-effort.
        }
    },
}));
