import { apiRequest } from './client';
import type {
    BehavioralEvaluationResult,
    CreateBehavioralSessionInput,
    CreateBehavioralSessionResponse,
    GetBehavioralQuestionResponse,
    GetBehavioralSessionResponse,
    ListBehavioralQuestionsQuery,
    ListBehavioralQuestionsResult,
    ListMyBehavioralSessionsQuery,
    ListMyBehavioralSessionsResult,
    SubmitCandidateQuestionsInput,
    SubmitTurnAnswerInput,
} from '@/types/behavioral';

function buildQuestionsQueryString(query: ListBehavioralQuestionsQuery): string {
    const params = new URLSearchParams();

    if (query.company) {
        params.set('company', query.company);
    }
    if (query.role) {
        params.set('role', query.role);
    }
    if (query.difficulty) {
        params.set('difficulty', query.difficulty);
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

function buildMySessionsQueryString(query: ListMyBehavioralSessionsQuery): string {
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

export function listBehavioralQuestions(
    accessToken: string,
    query: ListBehavioralQuestionsQuery = {},
): Promise<ListBehavioralQuestionsResult> {
    return apiRequest<ListBehavioralQuestionsResult>(
        `/api/behavioral/questions${buildQuestionsQueryString(query)}`,
        { token: accessToken },
    );
}

export function getBehavioralQuestion(
    accessToken: string,
    idOrSlug: string,
): Promise<GetBehavioralQuestionResponse> {
    return apiRequest<GetBehavioralQuestionResponse>(
        `/api/behavioral/questions/${encodeURIComponent(idOrSlug)}`,
        { token: accessToken },
    );
}

export function createBehavioralSession(
    accessToken: string,
    input: CreateBehavioralSessionInput,
): Promise<CreateBehavioralSessionResponse> {
    const formData = new FormData();
    formData.append('questionId', input.questionId);
    formData.append('resume', input.resume);

    return apiRequest<CreateBehavioralSessionResponse>('/api/behavioral/sessions', {
        method: 'POST',
        token: accessToken,
        body: formData,
    });
}

export function listMyBehavioralSessions(
    accessToken: string,
    query: ListMyBehavioralSessionsQuery = {},
): Promise<ListMyBehavioralSessionsResult> {
    return apiRequest<ListMyBehavioralSessionsResult>(
        `/api/behavioral/sessions/me${buildMySessionsQueryString(query)}`,
        { token: accessToken },
    );
}

export function getBehavioralSession(
    accessToken: string,
    sessionId: string,
): Promise<GetBehavioralSessionResponse> {
    return apiRequest<GetBehavioralSessionResponse>(
        `/api/behavioral/sessions/${encodeURIComponent(sessionId)}`,
        { token: accessToken },
    );
}

export function generateNextBehavioralQuestion(
    accessToken: string,
    sessionId: string,
): Promise<GetBehavioralSessionResponse> {
    return apiRequest<GetBehavioralSessionResponse>(
        `/api/behavioral/sessions/${encodeURIComponent(sessionId)}/next-question`,
        {
            method: 'POST',
            token: accessToken,
        },
    );
}

export function submitBehavioralTurnAnswer(
    accessToken: string,
    sessionId: string,
    turnId: string,
    body: SubmitTurnAnswerInput,
): Promise<GetBehavioralSessionResponse> {
    return apiRequest<GetBehavioralSessionResponse>(
        `/api/behavioral/sessions/${encodeURIComponent(sessionId)}/turns/${encodeURIComponent(turnId)}`,
        {
            method: 'PATCH',
            body,
            token: accessToken,
        },
    );
}

export function submitBehavioralCandidateQuestions(
    accessToken: string,
    sessionId: string,
    body: SubmitCandidateQuestionsInput,
): Promise<GetBehavioralSessionResponse> {
    return apiRequest<GetBehavioralSessionResponse>(
        `/api/behavioral/sessions/${encodeURIComponent(sessionId)}/candidate-questions`,
        {
            method: 'POST',
            body,
            token: accessToken,
        },
    );
}

export function requestBehavioralEvaluation(
    accessToken: string,
    sessionId: string,
): Promise<BehavioralEvaluationResult> {
    return apiRequest<BehavioralEvaluationResult>(
        `/api/behavioral/evaluations/${encodeURIComponent(sessionId)}`,
        {
            method: 'POST',
            token: accessToken,
        },
    );
}

export function getBehavioralEvaluation(
    accessToken: string,
    sessionId: string,
): Promise<BehavioralEvaluationResult> {
    return apiRequest<BehavioralEvaluationResult>(
        `/api/behavioral/evaluations/${encodeURIComponent(sessionId)}`,
        { token: accessToken },
    );
}



