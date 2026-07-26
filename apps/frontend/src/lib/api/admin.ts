import { apiRequest } from './client';
import type {
    AdminProfileResponse,
    AdminQuestionListResult,
    AdminUserListResult,
    CreateBehavioralQuestionBody,
    CreateDsaQuestionBody,
    CreateSystemDesignQuestionBody,
    ListAdminQuestionsQuery,
    ListAdminUsersQuery,
    MockAnalyticsResponse,
    PublishQuestionBody,
    RevenueDashboardQuery,
    RevenueDashboardResponse,
    UpdateBehavioralQuestionBody,
    UpdateDsaQuestionBody,
    UpdateSystemDesignQuestionBody,
} from '@/types/admin';
import type { BehavioralQuestionDetail } from '@/types/behavioral';
import type { ProblemDetail } from '@/types/dsa';
import type { SystemDesignQuestionDetail } from '@/types/system-design';

function buildRevenueQueryString(query: RevenueDashboardQuery = {}): string {
    const params = new URLSearchParams();
    if (query.range) {
        params.set('range', query.range);
    }
    const qs = params.toString();
    return qs ? `?${qs}` : '';
}

function buildUsersQueryString(query: ListAdminUsersQuery = {}): string {
    const params = new URLSearchParams();
    if (query.search) {
        params.set('search', query.search);
    }
    if (query.page != null) {
        params.set('page', String(query.page));
    }
    if (query.limit != null) {
        params.set('limit', String(query.limit));
    }
    const qs = params.toString();
    return qs ? `?${qs}` : '';
}

function buildQuestionsQueryString(query: ListAdminQuestionsQuery): string {
    const params = new URLSearchParams();
    params.set('status', query.status);
    if (query.difficulty) {
        params.set('difficulty', query.difficulty);
    }
    for (const topic of query.topics ?? []) {
        params.append('topics', topic);
    }
    if (query.company) {
        params.set('company', query.company);
    }
    if (query.role) {
        params.set('role', query.role);
    }
    if (query.search) {
        params.set('search', query.search);
    }
    if (query.page != null) {
        params.set('page', String(query.page));
    }
    if (query.limit != null) {
        params.set('limit', String(query.limit));
    }
    const qs = params.toString();
    return qs ? `?${qs}` : '';
}

// Analytics

export function getRevenueDashboard(
    accessToken: string,
    query: RevenueDashboardQuery = {},
): Promise<RevenueDashboardResponse> {
    return apiRequest<RevenueDashboardResponse>(
        `/api/admin/analytics/revenue${buildRevenueQueryString(query)}`,
        { token: accessToken },
    );
}

export function getMockAnalytics(
    accessToken: string,
): Promise<MockAnalyticsResponse> {
    return apiRequest<MockAnalyticsResponse>('/api/admin/analytics/mock', {
        token: accessToken,
    });
}

// Profile + users

export function getAdminProfile(
    accessToken: string,
): Promise<AdminProfileResponse> {
    return apiRequest<AdminProfileResponse>('/api/admin/profile', {
        token: accessToken,
    });
}

export function listAdminUsers(
    accessToken: string,
    query: ListAdminUsersQuery = {},
): Promise<AdminUserListResult> {
    return apiRequest<AdminUserListResult>(
        `/api/admin/users${buildUsersQueryString(query)}`,
        { token: accessToken },
    );
}

export function deleteAdminUser(
    accessToken: string,
    userId: string,
): Promise<void> {
    return apiRequest<void>(
        `/api/admin/users/${encodeURIComponent(userId)}`,
        {
            method: 'DELETE',
            token: accessToken,
        },
    );
}

// DSA questions

export function listAdminDsaQuestions(
    accessToken: string,
    query: ListAdminQuestionsQuery,
): Promise<AdminQuestionListResult> {
    return apiRequest<AdminQuestionListResult>(
        `/api/admin/questions/dsa${buildQuestionsQueryString(query)}`,
        { token: accessToken },
    );
}

export function getAdminDsaQuestion(
    accessToken: string,
    questionId: string,
): Promise<{ question: ProblemDetail }> {
    return apiRequest<{ question: ProblemDetail }>(
        `/api/admin/questions/dsa/${encodeURIComponent(questionId)}`,
        { token: accessToken },
    );
}

export function createAdminDsaQuestion(
    accessToken: string,
    body: CreateDsaQuestionBody,
): Promise<{ question: ProblemDetail }> {
    return apiRequest<{ question: ProblemDetail }>(
        '/api/admin/questions/dsa',
        {
            method: 'POST',
            token: accessToken,
            body,
        },
    );
}

export function updateAdminDsaQuestion(
    accessToken: string,
    questionId: string,
    body: UpdateDsaQuestionBody,
): Promise<{ question: ProblemDetail }> {
    return apiRequest<{ question: ProblemDetail }>(
        `/api/admin/questions/dsa/${encodeURIComponent(questionId)}`,
        {
            method: 'PATCH',
            token: accessToken,
            body,
        },
    );
}

export function publishAdminDsaQuestion(
    accessToken: string,
    questionId: string,
    body: PublishQuestionBody,
): Promise<{ question: ProblemDetail }> {
    return apiRequest<{ question: ProblemDetail }>(
        `/api/admin/questions/dsa/${encodeURIComponent(questionId)}/publish`,
        {
            method: 'POST',
            token: accessToken,
            body,
        },
    );
}

export function deleteAdminDsaQuestion(
    accessToken: string,
    questionId: string,
): Promise<void> {
    return apiRequest<void>(
        `/api/admin/questions/dsa/${encodeURIComponent(questionId)}`,
        {
            method: 'DELETE',
            token: accessToken,
        },
    );
}

// System Design questions

export function listAdminSystemDesignQuestions(
    accessToken: string,
    query: ListAdminQuestionsQuery,
): Promise<AdminQuestionListResult> {
    return apiRequest<AdminQuestionListResult>(
        `/api/admin/questions/system-design${buildQuestionsQueryString(query)}`,
        { token: accessToken },
    );
}

export function getAdminSystemDesignQuestion(
    accessToken: string,
    questionId: string,
): Promise<{ question: SystemDesignQuestionDetail }> {
    return apiRequest<{ question: SystemDesignQuestionDetail }>(
        `/api/admin/questions/system-design/${encodeURIComponent(questionId)}`,
        { token: accessToken },
    );
}

export function createAdminSystemDesignQuestion(
    accessToken: string,
    body: CreateSystemDesignQuestionBody,
): Promise<{ question: SystemDesignQuestionDetail }> {
    return apiRequest<{ question: SystemDesignQuestionDetail }>(
        '/api/admin/questions/system-design',
        {
            method: 'POST',
            token: accessToken,
            body,
        },
    );
}

export function updateAdminSystemDesignQuestion(
    accessToken: string,
    questionId: string,
    body: UpdateSystemDesignQuestionBody,
): Promise<{ question: SystemDesignQuestionDetail }> {
    return apiRequest<{ question: SystemDesignQuestionDetail }>(
        `/api/admin/questions/system-design/${encodeURIComponent(questionId)}`,
        {
            method: 'PATCH',
            token: accessToken,
            body,
        },
    );
}

export function publishAdminSystemDesignQuestion(
    accessToken: string,
    questionId: string,
    body: PublishQuestionBody,
): Promise<{ question: SystemDesignQuestionDetail }> {
    return apiRequest<{ question: SystemDesignQuestionDetail }>(
        `/api/admin/questions/system-design/${encodeURIComponent(questionId)}/publish`,
        {
            method: 'POST',
            token: accessToken,
            body,
        },
    );
}

export function deleteAdminSystemDesignQuestion(
    accessToken: string,
    questionId: string,
): Promise<void> {
    return apiRequest<void>(
        `/api/admin/questions/system-design/${encodeURIComponent(questionId)}`,
        {
            method: 'DELETE',
            token: accessToken,
        },
    );
}

// Behavioral questions

export function listAdminBehavioralQuestions(
    accessToken: string,
    query: ListAdminQuestionsQuery,
): Promise<AdminQuestionListResult> {
    return apiRequest<AdminQuestionListResult>(
        `/api/admin/questions/behavioral${buildQuestionsQueryString(query)}`,
        { token: accessToken },
    );
}

export function getAdminBehavioralQuestion(
    accessToken: string,
    questionId: string,
): Promise<{ question: BehavioralQuestionDetail }> {
    return apiRequest<{ question: BehavioralQuestionDetail }>(
        `/api/admin/questions/behavioral/${encodeURIComponent(questionId)}`,
        { token: accessToken },
    );
}

export function createAdminBehavioralQuestion(
    accessToken: string,
    body: CreateBehavioralQuestionBody,
): Promise<{ question: BehavioralQuestionDetail }> {
    return apiRequest<{ question: BehavioralQuestionDetail }>(
        '/api/admin/questions/behavioral',
        {
            method: 'POST',
            token: accessToken,
            body,
        },
    );
}

export function updateAdminBehavioralQuestion(
    accessToken: string,
    questionId: string,
    body: UpdateBehavioralQuestionBody,
): Promise<{ question: BehavioralQuestionDetail }> {
    return apiRequest<{ question: BehavioralQuestionDetail }>(
        `/api/admin/questions/behavioral/${encodeURIComponent(questionId)}`,
        {
            method: 'PATCH',
            token: accessToken,
            body,
        },
    );
}

export function publishAdminBehavioralQuestion(
    accessToken: string,
    questionId: string,
    body: PublishQuestionBody,
): Promise<{ question: BehavioralQuestionDetail }> {
    return apiRequest<{ question: BehavioralQuestionDetail }>(
        `/api/admin/questions/behavioral/${encodeURIComponent(questionId)}/publish`,
        {
            method: 'POST',
            token: accessToken,
            body,
        },
    );
}

export function deleteAdminBehavioralQuestion(
    accessToken: string,
    questionId: string,
): Promise<void> {
    return apiRequest<void>(
        `/api/admin/questions/behavioral/${encodeURIComponent(questionId)}`,
        {
            method: 'DELETE',
            token: accessToken,
        },
    );
}