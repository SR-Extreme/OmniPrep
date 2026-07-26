import type { AuthResult } from '@/types/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

//to get extra details in error (error.message,error.status,error.details)
export class ApiError extends Error {
    constructor(
        message: string,
        public readonly status: number,
        public readonly details?: unknown,
        public readonly code?: string,
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

export const FREE_AI_REPORT_LIMIT_CODE = 'FREE_AI_REPORT_LIMIT';

export const AI_QUOTA_EXCEEDED_CODE = 'QUOTA_EXCEEDED';

export const AI_QUOTA_EXCEEDED_MESSAGE =
    "The system's total AI tokens have been exhausted for today. Sorry for the inconvenience — please come back tomorrow.";

export function isFreeAiReportLimitError(err: unknown): boolean {
    return err instanceof ApiError && err.code === FREE_AI_REPORT_LIMIT_CODE;
}

function looksLikeAiQuotaMessage(message: string): boolean {
    return /RESOURCE_EXHAUSTED|exceeded your current quota|generate_content_free_tier|QUOTA_EXCEEDED|tokens have been exhausted/i.test(
        message,
    );
}

export function isAiQuotaExhaustedError(err: unknown): boolean {
    if (err instanceof ApiError) {
        return err.code === AI_QUOTA_EXCEEDED_CODE || looksLikeAiQuotaMessage(err.message);
    }
    return typeof err === 'string' && looksLikeAiQuotaMessage(err);
}

export function resolveActionErrorMessage(err: unknown, fallback: string): string {
    if (isAiQuotaExhaustedError(err)) {
        return AI_QUOTA_EXCEEDED_MESSAGE;
    }
    if (err instanceof ApiError) {
        return err.message;
    }
    return fallback;
}

export type ApiRequestOptions = {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    body?: unknown;
    token?: string | null;
    headers?: Record<string, string>;
    /** Skip refresh-on-401 (used for the refresh call itself). */
    skipAuthRefresh?: boolean;
};

let refreshInFlight: Promise<string | null> | null = null;

function isFormDataBody(body: unknown): body is FormData {
    return typeof FormData !== 'undefined' && body instanceof FormData;
}

function parseErrorPayload(data: unknown, status: number): ApiError {
    const message =
        typeof data === 'object' &&
            data != null &&
            'error' in data &&
            typeof (data as { error: unknown }).error === 'string'
            ? (data as { error: string }).error
            : `Request failed with status ${status}`;

    const details =
        typeof data === 'object' && data !== null && 'details' in data
            ? (data as { details: unknown }).details
            : undefined;

    const code =
        typeof data === 'object' &&
            data != null &&
            'code' in data &&
            typeof (data as { code: unknown }).code === 'string'
            ? (data as { code: string }).code
            : undefined;

    return new ApiError(message, status, details, code);
}

async function readResponseBody(response: Response): Promise<unknown> {
    if (response.status === 204) {
        return undefined;
    }
    return response.json().catch(() => null);
}

/**
 * Single-flight refresh so concurrent 401s share one /api/auth/refresh call
 * (backend rotates refresh tokens).
 */
async function refreshAccessToken(): Promise<string | null> {
    if (refreshInFlight) {
        return refreshInFlight;
    }

    refreshInFlight = (async () => {
        const { useAuthStore } = await import('@/store/authStore');
        const { refreshToken, setSession, clearSession } = useAuthStore.getState();

        if (!refreshToken) {
            clearSession();
            return null;
        }

        try {
            const response = await fetch(`${API_URL}/api/auth/refresh`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken }),
            });

            const data = await readResponseBody(response);

            if (!response.ok) {
                clearSession();
                return null;
            }

            const result = data as AuthResult;
            setSession(
                result.user,
                result.tokens.accessToken,
                result.tokens.refreshToken,
            );
            return result.tokens.accessToken;
        } catch {
            clearSession();
            return null;
        }
    })().finally(() => {
        refreshInFlight = null;
    });

    return refreshInFlight;
}

async function executeRequest(
    path: string,
    options: ApiRequestOptions,
): Promise<Response> {
    const { method = 'GET', body, token, headers = {} } = options;
    const formData = isFormDataBody(body);

    return fetch(`${API_URL}${path}`, {
        method,
        credentials: 'include',
        headers: {
            ...(formData ? {} : { 'Content-Type': 'application/json' }),
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...headers,
        },
        body:
            body === undefined
                ? undefined
                : formData
                    ? body
                    : JSON.stringify(body),
    });
}

export async function apiRequest<T>(
    path: string,
    options: ApiRequestOptions = {},
): Promise<T> {
    const response = await executeRequest(path, options);
    const data = await readResponseBody(response);

    if (response.ok) {
        return data as T;
    }

    const canAttemptRefresh =
        response.status === 401
        && Boolean(options.token)
        && !options.skipAuthRefresh
        && path !== '/api/auth/refresh';

    if (!canAttemptRefresh) {
        throw parseErrorPayload(data, response.status);
    }

    const newAccessToken = await refreshAccessToken();
    if (!newAccessToken) {
        throw parseErrorPayload(data, response.status);
    }

    const retryResponse = await executeRequest(path, {
        ...options,
        token: newAccessToken,
        skipAuthRefresh: true,
    });
    const retryData = await readResponseBody(retryResponse);

    if (!retryResponse.ok) {
        throw parseErrorPayload(retryData, retryResponse.status);
    }

    return retryData as T;
}

export function getApiUrl(): string {
    return API_URL as string;
}
