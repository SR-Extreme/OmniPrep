import { z } from 'zod';
import { object } from 'zod/v4';

export interface SystemDesignRequirements {
    functional: string[];
    nonFunctional: string[];
}

export type EvaluationMetrics = Record<string, number>;

export type MetricScores = Record<string, number>;

export const requirementsSchema = z.object({
    functional: z.array(z.string().min(1)),
    nonFunctional: z.array(z.string().min(1)),
});

export const deliverablesSchema = z.array(z.string().min(1));

export const constraintsSchema = z.array(z.string().min(1));

export const evaluationMetricsSchema = z
    .record(z.string().min(1), z.number().int().positive())
    .refine(
        (metrics) => Object.values(metrics).reduce((sum, weight) => sum + weight, 0) === 100,
        { message: 'evaluationMetrics weights must sum to 100' },
    );

export const followUpQuestionsSchema = z.array(z.string().min(1)).length(2);

export const followUpAnswersSchema = z.array(z.string().min(1)).length(2);

export const metricScoresSchema = z.record(
    z.string().min(1), z.number().int().min(0).max(100),
)

export function parseRequirements(value: unknown): SystemDesignRequirements {
    return requirementsSchema.parse(value);
}

export function parseDeliverables(value: unknown): string[] {
    return deliverablesSchema.parse(value);
}

export function parseConstraints(value: unknown): string[] {
    return constraintsSchema.parse(value);
}

export function parseEvaluationMetrics(value: unknown): EvaluationMetrics {
    return evaluationMetricsSchema.parse(value);
}

export function parseFollowUpQuestions(value: unknown): string[] {
    return followUpQuestionsSchema.parse(value);
}

export function parseFollowUpAnswers(value: unknown): string[] {
    return followUpAnswersSchema.parse(value);
}

export function parseMetricScores(value: unknown): MetricScores {
    return metricScoresSchema.parse(value);
}

export function validateMetricScoresAgainstRubric(
    metricScores: MetricScores,
    evaluationMetrics: EvaluationMetrics,
): void {
    const rubricKeys = Object.keys(evaluationMetrics).sort();
    const scoreKeys = Object.keys(metricScores).sort();

    if (rubricKeys.join('|') !== scoreKeys.join('|')) {
        throw new Error('metricScores keys must match evaluationMetrics keys');
    }
}

export function computeOverallScore(
    metricScores: MetricScores,
    evaluationMetrics: EvaluationMetrics,
): number {
    validateMetricScoresAgainstRubric(metricScores, evaluationMetrics);

    const weighted = Object.entries(evaluationMetrics).reduce(
        (total, [key, weight]) => total + ((metricScores[key] ?? 0) * weight) / 100,
        0,
    );

    return Math.round(weighted);
}

export interface SystemDesignQuestionListItem {
    id: string;
    slug: string;
    title: string;
    difficulty: string;
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
    difficulty: string;
    topics: string[];
    hints: string[];
    evaluationMetrics: EvaluationMetrics;
    isPublished: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface SystemDesignSubmissionDetail {
    id: string;
    questionId: string;
    textAnswer: string | null;
    diagramUrl: string | null;
    followUpQuestions: string[] | null;
    followUpAnswers: string[] | null;
    createdAt: Date;
    updatedAt: Date;
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
    createdAt: Date;
}