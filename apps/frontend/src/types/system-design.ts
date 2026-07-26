import type { Difficulty, Pagination } from './dsa';

export interface SystemDesignRequirements {
    functional: string[];
    nonFunctional: string[];
}

export interface EvaluationMetric {
    id: string;
    title: string;
    weight: number;
    criteria: string[];
}

export type EvaluationMetrics = EvaluationMetric[];

export type MetricScores = Record<string, number>;

export type SystemDesignEvaluationStatus = 'completed' | 'pending' | 'failed';

export interface SystemDesignQuestionListItem {
    id: string;
    slug: string;
    title: string;
    difficulty: Difficulty;
    topics: string[];
}

export interface SystemDesignQuestionDetail {
    id: string;
    slug: string;
    title: string;
    description: string;
    requirements: SystemDesignRequirements;
    deliverables: string[];
    constraints: string[];
    scaleFactors: string[];
    difficulty: Difficulty;
    topics: string[];
    hints: string[];
    evaluationMetrics: EvaluationMetrics;
    isPublished: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface SystemDesignSubmissionDetail {
    id: string;
    questionId: string;
    textAnswer: string | null;
    diagramUrl: string | null;
    followUpQuestions: string[] | null;
    followUpAnswers: string[] | null;
    createdAt: string;
    updatedAt: string;
}

export interface SystemDesignSubmissionListItem {
    id: string;
    questionId: string;
    questionTitle: string;
    questionSlug: string;
    hasTextAnswer: boolean;
    hasDiagram: boolean;
    hasFollowUpQuestions: boolean;
    hasFollowUpAnswers: boolean;
    hasEvaluation: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface SystemDesignEvaluationDetail {
    id: string;
    submissionId: string;
    questionId: string;
    overallScore: number;
    metricScores: MetricScores;
    strengths: string[];
    weaknesses: string[];
    followUpQuestions: string[];
    feedback: string;
    suggestions: string[];
    model: string;
    tokensUsed: number;
    createdAt: string;
}


export interface ListSystemDesignQuestionsResult {
    questions: SystemDesignQuestionListItem[];
    pagination: Pagination;
    filterOptions: {
        topics: string[];
    };
}

export interface GetSystemDesignQuestionResponse {
    question: SystemDesignQuestionDetail;
}

export interface CreateSystemDesignSubmissionResponse {
    submission: SystemDesignSubmissionDetail;
}

export interface GetSystemDesignSubmissionResponse {
    submission: SystemDesignSubmissionDetail;
}

export interface ListMySystemDesignSubmissionsResult {
    submissions: SystemDesignSubmissionListItem[];
    pagination: Pagination;
}

export interface SystemDesignEvaluationResult {
    status: SystemDesignEvaluationStatus;
    evaluation?: SystemDesignEvaluationDetail;
}

export interface ListMySystemDesignSubmissionsQuery {
    questionId?: string;
    page?: number;
    limit?: number;
}

export interface ListSystemDesignQuestionsQuery {
    difficulty?: Difficulty;
    topics?: string[];
    search?: string;
    page?: number;
    limit?: number;
}

export interface CreateSystemDesignSubmissionInput {
    questionId: string;
    textAnswer?: string;
    diagram?: File;
}

export interface SubmitFollowUpAnswersInput {
    answers: [string, string];
}