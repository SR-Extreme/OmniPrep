'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
    login as loginApi,
    logout as logoutApi,
    signup as signupApi,
    verifyLoginOtp as verifyLoginOtpApi,
    type AuthUser,
    type LoginBody,
    type LoginResponse,
    type SignupBody,
    type VerifyOtpBody,
} from '@/lib/api/auth';
import { ApiError } from '@/lib/api/client';

interface AuthState {
    user: AuthUser | null;
    accessToken: string | null;
    refreshToken: string | null;
    isLoading: boolean;
    error: string | null;

    signup: (body: SignupBody) => Promise<void>;
    login: (body: LoginBody) => Promise<LoginResponse>;
    verifyLoginOtp: (body: VerifyOtpBody) => Promise<void>;
    logout: () => Promise<void>;

    clearError: () => void;
    setSession: (user: AuthUser, accessToken: string, refreshToken: string) => void;
    setUser: (user: AuthUser) => void;
    clearSession: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            accessToken: null,
            refreshToken: null,
            isLoading: false,
            error: null,

            setSession: (user, accessToken, refreshToken) => {
                set({ user, accessToken, refreshToken, error: null });
            },

            setUser: (user) => {
                set({ user, error: null });
            },

            clearSession: () => {
                set({
                    user: null,
                    accessToken: null,
                    refreshToken: null,
                    error: null,
                });
            },

            clearError: () => {
                set({ error: null });
            },

            signup: async (body) => {
                set({ isLoading: true, error: null });
                try {
                    await signupApi(body);
                    // Account created — user must sign in with OTP on the login page
                    set({
                        user: null,
                        accessToken: null,
                        refreshToken: null,
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
                set({ isLoading: true, error: null });
                try {
                    const result = await loginApi(body);
                    if (!result.requiresOtp) {
                        set({
                            user: result.user,
                            accessToken: result.tokens.accessToken,
                            refreshToken: result.tokens.refreshToken,
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
                set({ isLoading: true, error: null });
                try {
                    const result = await verifyLoginOtpApi(body);
                    set({
                        user: result.user,
                        accessToken: result.tokens.accessToken,
                        refreshToken: result.tokens.refreshToken,
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
                const { refreshToken } = get();

                // Clear local session immediately so UI never sits on a loading gate.
                set({
                    user: null,
                    accessToken: null,
                    refreshToken: null,
                    error: null,
                    isLoading: false,
                });

                if (!refreshToken) {
                    return;
                }

                try {
                    await logoutApi({ refreshToken });
                } catch {
                    // Local session is already cleared.
                }
            },
        }),

        {
            name: 'omniprep-auth',
            partialize: (state) => ({
                user: state.user,
                accessToken: state.accessToken,
                refreshToken: state.refreshToken,
            }),
        },
    ),
);