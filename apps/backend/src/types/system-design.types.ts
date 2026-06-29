import { z } from 'zod';

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

export const requirementsSchema = z.object({
    functional: z.array(z.string().min(1)),
    nonFunctional: z.array(z.string().min(1)),
});

export const deliverablesSchema = z.array(z.string().min(1));

export const constraintsSchema = z.array(z.string().min(1));

export const scaleFactorsSchema = z.array(z.string().min(1));

export const evaluationMetricSchema = z.object({
    id: z.string().min(1).regex(/^[a-z][a-zA-Z0-9]*$/, {
        message: 'Metric id must be camelCase (e.g. highLevelDesign)',
    }),
    title: z.string().min(1),
    weight: z.number().int().positive(),
    criteria: z.array(z.string().min(1)).min(1),
});

export const evaluationMetricsSchema = z
    .array(evaluationMetricSchema)
    .min(1)
    .superRefine((metrics, ctx) => {
        const ids = metrics.map((m) => m.id);
        const uniqueIds = new Set(ids);
        if (uniqueIds.size !== ids.length) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'evaluationMetrics ids must be unique',
            });
        }

        const weightSum = metrics.reduce((sum, m) => sum + m.weight, 0);
        if (weightSum !== 100) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'evaluationMetrics weights must sum to 100',
            });
        }
    });

export const followUpQuestionsSchema = z.array(z.string().min(1)).length(2);

export const followUpAnswersSchema = z.array(z.string().min(1)).length(2);

export const metricScoresSchema = z.record(
    z.string().min(1),
    z.number().int().min(0).max(100),
);

export function parseRequirements(value: unknown): SystemDesignRequirements {
    return requirementsSchema.parse(value);
}

export function parseDeliverables(value: unknown): string[] {
    return deliverablesSchema.parse(value);
}

export function parseConstraints(value: unknown): string[] {
    return constraintsSchema.parse(value);
}

export function parseScaleFactors(value: unknown): string[] {
    return scaleFactorsSchema.parse(value);
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

export function getEvaluationMetricIds(metrics: EvaluationMetrics): string[] {
    return metrics.map((m) => m.id);
}

export function validateMetricScoresAgainstRubric(
    metricScores: MetricScores,
    evaluationMetrics: EvaluationMetrics,
): void {
    const rubricIds = getEvaluationMetricIds(evaluationMetrics).sort();
    const scoreIds = Object.keys(metricScores).sort();

    if (rubricIds.join('|') !== scoreIds.join('|')) {
        throw new Error('metricScores keys must match evaluationMetrics ids');
    }
}

export function computeOverallScore(
    metricScores: MetricScores,
    evaluationMetrics: EvaluationMetrics,
): number {
    validateMetricScoresAgainstRubric(metricScores, evaluationMetrics);

    const weighted = evaluationMetrics.reduce(
        (total, metric) => total + ((metricScores[metric.id] ?? 0) * metric.weight) / 100,
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
    scaleFactors: string[];
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
