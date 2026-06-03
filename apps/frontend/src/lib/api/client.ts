const API_URL = process.env.NEXT_PUBLIC_API_URL;

//to get extra details in error (error.message,error.status,error.details)
export class ApiError extends Error {
    constructor(message: string, public readonly status: number, public readonly details?: unknown) {
        super(message);
        this.name = 'ApiError';
    }
}

export type ApiRequestOptions = {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    body?: unknown;
    token?: string | null;
    headers?: Record<string, string>;
};

export async function apiRequest<T>(
    path: string,
    options: ApiRequestOptions = {},
): Promise<T> {
    const { method = 'GET', body, token, headers = {} } = options;

    const response = await fetch(`${API_URL}${path}`, {
        method,
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...headers,
        },
        body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    //204 = No content
    if (response.status === 204) {
        return undefined as T;
    }

    const data: unknown = await response.json().catch(() => null);

    if (!response.ok) {
        const message = typeof data === 'object' && data != null && 'error' in data &&
            typeof (data as { error: unknown }).error === 'string' ?
            (data as { error: string }).error : `Request failed with status ${response.status}`;

        const details = typeof data === 'object' && data !== null &&
            'details' in data ? (data as { details: unknown }).details : undefined;

        throw new ApiError(message, response.status, details);
    }

    return data as T;
}

export function getApiUrl(): string {
    return API_URL as string;
}