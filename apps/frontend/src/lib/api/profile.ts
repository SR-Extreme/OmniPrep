import { apiRequest, ApiError, getApiUrl } from './client';
import type {
    ProfileResponse,
    StudyPlanDetailResponse,
    StudyPlanHistoryResponse,
    SubmitStudyPlanProgressBody,
    UpdateProfileBody,
} from '@/types/profile';

async function parseApiResponse<T>(response: Response): Promise<T> {
    if (response.status === 204) {
        return undefined as T;
    }

    const data: unknown = await response.json().catch(() => null);

    if (!response.ok) {
        const message =
            typeof data === 'object' &&
                data != null &&
                'error' in data &&
                typeof (data as { error: unknown }).error === 'string'
                ? (data as { error: string }).error
                : `Request failed with status ${response.status}`;

        const details =
            typeof data === 'object' && data !== null && 'details' in data
                ? (data as { details: unknown }).details
                : undefined;

        throw new ApiError(message, response.status, details);
    }

    return data as T;
}

export function getProfile(accessToken: string): Promise<ProfileResponse> {
    return apiRequest<ProfileResponse>('/api/profile', {
        token: accessToken,
    });
}

export function updateProfile(
    accessToken: string,
    body: UpdateProfileBody,
): Promise<ProfileResponse> {
    return apiRequest<ProfileResponse>('/api/profile', {
        method: 'PATCH',
        token: accessToken,
        body,
    });
}

export async function uploadAvatar(
    accessToken: string,
    file: File,
): Promise<ProfileResponse> {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await fetch(`${getApiUrl()}/api/profile/avatar`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: formData,
    });

    return parseApiResponse<ProfileResponse>(response);
}

export function getStudyPlanHistory(
    accessToken: string,
): Promise<StudyPlanHistoryResponse> {
    return apiRequest<StudyPlanHistoryResponse>('/api/profile/study-plans', {
        token: accessToken,
    });
}

export function getStudyPlanDetail(
    accessToken: string,
    studyPlanId: string,
): Promise<StudyPlanDetailResponse> {
    return apiRequest<StudyPlanDetailResponse>(
        `/api/profile/study-plans/${encodeURIComponent(studyPlanId)}`,
        { token: accessToken },
    );
}

export function submitStudyPlanProgress(
    accessToken: string,
    studyPlanId: string,
    body: SubmitStudyPlanProgressBody,
): Promise<StudyPlanDetailResponse> {
    return apiRequest<StudyPlanDetailResponse>(
        `/api/profile/study-plans/${encodeURIComponent(studyPlanId)}/progress`,
        {
            method: 'POST',
            token: accessToken,
            body,
        },
    );
}