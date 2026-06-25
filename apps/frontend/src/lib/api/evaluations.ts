import { apiRequest } from "./client";

export type EvaluationStatus = 'completed' | 'pending' | 'failed';

export interface ComplexityAnalysis {
    detected: {
        time: string;
        space: string;
    };
    optimal: {
        time: string;
        space: string;
    };
    isOptimal: boolean;
    notes?: string;
}

export interface DSAEvaluationDetail {
    id: string;
    submissionId: string;
    problemId: string;
    overallScore: number;
    correctnessScore: number;
    efficiencyScore: number;
    codeQualityScore: number;
    explanationScore: number;
    complexityAnalysis: ComplexityAnalysis;
    followUpQuestions: string[];
    feedback: string;
    suggestions: string[];
    model: string;
    tokensUsed: number;
    createdAt: string;
}

export interface EvaluationResult {
    status: EvaluationStatus;
    evaluation?: DSAEvaluationDetail;
}

export function requestDSAEvaluation(
    accessToken: string,
    submissionId: string,
): Promise<EvaluationResult> {
    return apiRequest<EvaluationResult>(
        `/api/evaluations/${encodeURIComponent(submissionId)}`,
        {
            method: 'POST',
            token: accessToken,
        }
    );
}

export function getDSAEvaluation(
    accessToken: string,
    submissionId: string,
): Promise<EvaluationResult> {
    return apiRequest<EvaluationResult>(
        `/api/evaluations/${encodeURIComponent(submissionId)}`,
        { token: accessToken },
    );
}