import { apiRequest } from './client';
import type {
    CreateMockBehavioralSessionResponse,
    GenerateMockInterviewStudyPlanResponse,
    GetMockInterviewReportResponse,
    GetMockInterviewResponse,
    GetMockInterviewStudyPlanResponse,
    LinkDsaSubmissionInput,
    LinkSystemDesignSubmissionInput,
    ListMockBehavioralRolesResult,
    ListMyMockInterviewsQuery,
    ListMyMockInterviewsResult,
    MockInterviewSection,
    SelectBehavioralRoleInput,
} from '@/types/mock-interview';

function buildListQueryString(query: ListMyMockInterviewsQuery): string {
    const params = new URLSearchParams();

    if (query.page != null) {
        params.set('page', String(query.page));
    }
    if (query.limit != null) {
        params.set('limit', String(query.limit));
    }

    const qs = params.toString();
    return qs ? `?${qs}` : '';
}

// Session

export function createMockInterview(
    accessToken: string,
): Promise<GetMockInterviewResponse> {
    return apiRequest<GetMockInterviewResponse>('/api/mock-interview', {
        method: 'POST',
        token: accessToken,
    });
}

export function listMyMockInterviews(
    accessToken: string,
    query: ListMyMockInterviewsQuery = {},
): Promise<ListMyMockInterviewsResult> {
    return apiRequest<ListMyMockInterviewsResult>(
        `/api/mock-interview/me${buildListQueryString(query)}`,
        { token: accessToken },
    );
}

export function getMockInterview(
    accessToken: string,
    interviewId: string,
): Promise<GetMockInterviewResponse> {
    return apiRequest<GetMockInterviewResponse>(
        `/api/mock-interview/${encodeURIComponent(interviewId)}`,
        { token: accessToken },
    );
}

export function startMockInterview(
    accessToken: string,
    interviewId: string,
): Promise<GetMockInterviewResponse> {
    return apiRequest<GetMockInterviewResponse>(
        `/api/mock-interview/${encodeURIComponent(interviewId)}/start`,
        {
            method: 'POST',
            token: accessToken,
        },
    );
}

// Sections (DSA / System Design)

export function linkMockDsaSubmission(
    accessToken: string,
    interviewId: string,
    slotIndex: number,
    body: LinkDsaSubmissionInput,
): Promise<GetMockInterviewResponse> {
    return apiRequest<GetMockInterviewResponse>(
        `/api/mock-interview/${encodeURIComponent(interviewId)}/dsa/slots/${slotIndex}/submission`,
        {
            method: 'POST',
            body,
            token: accessToken,
        },
    );
}

export function linkMockSystemDesignSubmission(
    accessToken: string,
    interviewId: string,
    body: LinkSystemDesignSubmissionInput,
): Promise<GetMockInterviewResponse> {
    return apiRequest<GetMockInterviewResponse>(
        `/api/mock-interview/${encodeURIComponent(interviewId)}/system-design/submission`,
        {
            method: 'POST',
            body,
            token: accessToken,
        },
    );
}

export function submitMockSection(
    accessToken: string,
    interviewId: string,
    section: MockInterviewSection,
): Promise<GetMockInterviewResponse> {
    return apiRequest<GetMockInterviewResponse>(
        `/api/mock-interview/${encodeURIComponent(interviewId)}/sections/${encodeURIComponent(section)}/submit`,
        {
            method: 'POST',
            token: accessToken,
        },
    );
}

// Behavioral

export function listMockBehavioralRoles(
    accessToken: string,
): Promise<ListMockBehavioralRolesResult> {
    return apiRequest<ListMockBehavioralRolesResult>(
        '/api/mock-interview/behavioral/roles',
        { token: accessToken },
    );
}

export function startMockBehavioralSection(
    accessToken: string,
    interviewId: string,
    body: SelectBehavioralRoleInput,
): Promise<GetMockInterviewResponse> {
    return apiRequest<GetMockInterviewResponse>(
        `/api/mock-interview/${encodeURIComponent(interviewId)}/behavioral/start`,
        {
            method: 'POST',
            body,
            token: accessToken,
        },
    );
}

export function createMockBehavioralSession(
    accessToken: string,
    interviewId: string,
    resume: File,
): Promise<CreateMockBehavioralSessionResponse> {
    const formData = new FormData();
    formData.append('resume', resume);

    return apiRequest<CreateMockBehavioralSessionResponse>(
        `/api/mock-interview/${encodeURIComponent(interviewId)}/behavioral/session`,
        {
            method: 'POST',
            token: accessToken,
            body: formData,
        },
    );
}

export function finalizeMockBehavioralSection(
    accessToken: string,
    interviewId: string,
): Promise<GetMockInterviewResponse> {
    return apiRequest<GetMockInterviewResponse>(
        `/api/mock-interview/${encodeURIComponent(interviewId)}/behavioral/finalize`,
        {
            method: 'POST',
            token: accessToken,
        },
    );
}

// Report + study plan

export function getMockInterviewReport(
    accessToken: string,
    interviewId: string,
): Promise<GetMockInterviewReportResponse> {
    return apiRequest<GetMockInterviewReportResponse>(
        `/api/mock-interview/${encodeURIComponent(interviewId)}/report`,
        { token: accessToken },
    );
}

export function finalizeMockInterview(
    accessToken: string,
    interviewId: string,
): Promise<GetMockInterviewResponse> {
    return apiRequest<GetMockInterviewResponse>(
        `/api/mock-interview/${encodeURIComponent(interviewId)}/finalize`,
        {
            method: 'POST',
            token: accessToken,
        },
    );
}

export function getMockInterviewStudyPlan(
    accessToken: string,
    interviewId: string,
): Promise<GetMockInterviewStudyPlanResponse> {
    return apiRequest<GetMockInterviewStudyPlanResponse>(
        `/api/mock-interview/${encodeURIComponent(interviewId)}/study-plan`,
        { token: accessToken },
    );
}

export function generateMockInterviewStudyPlan(
    accessToken: string,
    interviewId: string,
): Promise<GenerateMockInterviewStudyPlanResponse> {
    return apiRequest<GenerateMockInterviewStudyPlanResponse>(
        `/api/mock-interview/${encodeURIComponent(interviewId)}/study-plan`,
        {
            method: 'POST',
            token: accessToken,
        },
    );
}