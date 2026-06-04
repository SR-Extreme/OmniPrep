'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { login as loginApi, logout as logoutApi, signup as signupApi, type AuthUser, type LoginBody, type SignupBody } from '@/lib/api/auth';
import { ApiError } from '@/lib/api/client';

interface AuthState {
    //states
    user: AuthUser | null;
    accessToken: string | null;
    refreshToken: string | null;
    isLoading: boolean;
    error: string | null;

    //async fns
    signup: (body: SignupBody) => Promise<void>;
    login: (body: LoginBody) => Promise<void>;
    logout: () => Promise<void>;

    //non-async fns
    clearError: () => void;
    setSession: (user: AuthUser, accessToken: string, refreshToken: string) => void;
    clearSession: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            //initial states
            user: null,
            accessToken: null,
            refreshToken: null,
            isLoading: false,
            error: null,

            setSession: (user: AuthUser, accessToken: string, refreshToken: string) => {
                set({ user, accessToken, refreshToken, error: null });
            },

            clearSession: () => {
                set({ user: null, accessToken: null, refreshToken: null, error: null });
            },

            clearError: () => {
                set({ error: null });
            },

            signup: async (body: SignupBody) => {
                set({ isLoading: true, error: null });
                try {
                    const result = await signupApi(body);
                    set({
                        user: result.user,
                        accessToken: result.tokens.accessToken,
                        refreshToken: result.tokens.refreshToken,
                        isLoading: false,
                    });
                } catch (err) {
                    const message = err instanceof ApiError ? err.message : 'Sign up failed';
                    set({ error: message, isLoading: false });
                    throw err;
                }
            },

            login: async (body: LoginBody) => {
                set({ isLoading: true, error: null });
                try {
                    const result = await loginApi(body);
                    set({
                        user: result.user,
                        accessToken: result.tokens.accessToken,
                        refreshToken: result.tokens.refreshToken,
                        isLoading: false,
                    });
                } catch (err) {
                    const message =
                        err instanceof ApiError ? err.message : 'Login failed';
                    set({ error: message, isLoading: false });
                    throw err;
                }
            },

            logout: async () => {
                const { refreshToken } = get();

                set({ isLoading: true, error: null });

                try {
                    if (refreshToken) {
                        await logoutApi({ refreshToken });
                    }
                } catch {

                } finally {
                    set({
                        user: null,
                        accessToken: null,
                        refreshToken: null,
                        isLoading: false,
                    });
                }
            },
        }),

        //what to store in localStorage
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