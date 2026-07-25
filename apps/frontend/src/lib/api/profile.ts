import { apiRequest } from './client';
import type {
    ProfileResponse,
    StudyPlanDetailResponse,
    StudyPlanHistoryResponse,
    SubmitStudyPlanProgressBody,
    UpdateProfileBody,
} from '@/types/profile';

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

export function uploadAvatar(
    accessToken: string,
    file: File,
): Promise<ProfileResponse> {
    const formData = new FormData();
    formData.append('avatar', file);

    return apiRequest<ProfileResponse>('/api/profile/avatar', {
        method: 'POST',
        token: accessToken,
        body: formData,
    });
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