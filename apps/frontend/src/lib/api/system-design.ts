import { apiRequest } from './client';
import type {
    CreateSystemDesignSubmissionInput,
    CreateSystemDesignSubmissionResponse,
    GetSystemDesignQuestionResponse,
    GetSystemDesignSubmissionResponse,
    ListMySystemDesignSubmissionsQuery,
    ListMySystemDesignSubmissionsResult,
    ListSystemDesignQuestionsQuery,
    ListSystemDesignQuestionsResult,
    SubmitFollowUpAnswersInput,
    SystemDesignEvaluationResult,
} from '@/types/system-design';

function buildQuestionsQueryString(query: ListSystemDesignQuestionsQuery): string {
    const params = new URLSearchParams();

    if (query.difficulty) {
        params.set('difficulty', query.difficulty);
    }
    if (query.topic) {
        params.set('topic', query.topic);
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
    return qs ? `?$${qs}` : '';
}

function buildMySubmissionsQueryString(
    query: ListMySystemDesignSubmissionsQuery,
): string {
    const params = new URLSearchParams();
    if (query.questionId) {
        params.set('questionId', query.questionId);
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

export function listSystemDesignQuestions(
    accessToken: string,
    query: ListSystemDesignQuestionsQuery = {},
): Promise<ListSystemDesignQuestionsResult> {
    return apiRequest<ListSystemDesignQuestionsResult>(
        `/api/system-design/questions${buildQuestionsQueryString(query)}`,
        { token: accessToken },
    );
}

export function getSystemDesignQuestion(
    accessToken: string,
    idOrSlug: string,
): Promise<GetSystemDesignQuestionResponse> {
    return apiRequest<GetSystemDesignQuestionResponse>(
        `/api/system-design/questions/${encodeURIComponent(idOrSlug)}`,
        { token: accessToken },
    );
}

export function createSystemDesignSubmission(
    accessToken: string,
    input: CreateSystemDesignSubmissionInput,
): Promise<CreateSystemDesignSubmissionResponse> {
    //used formData as it supports file type
    const formData = new FormData();
    formData.append('questionId', input.questionId);

    if (input.textAnswer != null && input.textAnswer.trim().length > 0) {
        formData.append('textAnswer', input.textAnswer);
    }

    if (input.diagram) {
        formData.append('diagram', input.diagram);
    }

    return apiRequest<CreateSystemDesignSubmissionResponse>(
        '/api/system-design/submissions',
        {
            method: 'POST',
            token: accessToken,
            body: formData,
        },
    );
}

export function getSystemDesignSubmission(
    accessToken: string,
    id: string,
): Promise<GetSystemDesignSubmissionResponse> {
    return apiRequest<GetSystemDesignSubmissionResponse>(
        `/api/system-design/submissions/${encodeURIComponent(id)}`,
        { token: accessToken },
    );
}

export function listMySystemDesignSubmissions(
    accessToken: string,
    query: ListMySystemDesignSubmissionsQuery = {},
): Promise<ListMySystemDesignSubmissionsResult> {
    return apiRequest<ListMySystemDesignSubmissionsResult>(
        `/api/system-design/submissions/me${buildMySubmissionsQueryString(query)}`,
        { token: accessToken },
    );
}

export function generateSystemDesignFollowUps(
    accessToken: string,
    submissionId: string,
): Promise<GetSystemDesignSubmissionResponse> {
    return apiRequest<GetSystemDesignSubmissionResponse>(
        `/api/system-design/submissions/${encodeURIComponent(submissionId)}/follow-ups/generate`,
        {
            method: 'POST',
            token: accessToken,
        },
    );
}

export function submitSystemDesignFollowUpAnswers(
    accessToken: string,
    submissionId: string,
    body: SubmitFollowUpAnswersInput,
): Promise<GetSystemDesignSubmissionResponse> {
    return apiRequest<GetSystemDesignSubmissionResponse>(
        `/api/system-design/submissions/${encodeURIComponent(submissionId)}/follow-ups`,
        {
            method: 'PATCH',
            body,
            token: accessToken,
        },
    );
}

export function requestSystemDesignEvaluation(
    accessToken: string,
    submissionId: string,
): Promise<SystemDesignEvaluationResult> {
    return apiRequest<SystemDesignEvaluationResult>(
        `/api/system-design/evaluations/${encodeURIComponent(submissionId)}`,
        {
            method: 'POST',
            token: accessToken,
        },
    );
}

export function getSystemDesignEvaluation(
    accessToken: string,
    submissionId: string,
): Promise<SystemDesignEvaluationResult> {
    return apiRequest<SystemDesignEvaluationResult>(
        `/api/system-design/evaluations/${encodeURIComponent(submissionId)}`,
        { token: accessToken },
    );
}



