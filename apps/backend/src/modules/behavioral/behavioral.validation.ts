import { z } from 'zod';
import { DIFFICULTIES } from '../problems/problems.validation.js';

export const listBehavioralQuestionsQuerySchema = z.object({
    company: z
        .string()
        .trim()
        .min(1, 'Company filter cannot be empty')
        .max(100, 'Company filter must be at most 100 characters')
        .optional(),

    role: z
        .string()
        .trim()
        .min(1, 'Role filter cannot be empty')
        .max(100, 'Role filter must be at most 100 characters')
        .optional(),

    difficulty: z.enum(DIFFICULTIES).optional(),

    search: z
        .string()
        .trim()
        .min(1, 'Search query cannot be empty')
        .max(200, 'Search query must be at most 200 characters')
        .optional(),

    page: z.coerce.number().int().min(1, 'Page must be at least 1').default(1),

    limit: z.coerce
        .number()
        .int()
        .min(1, 'Limit must be at least 1')
        .max(50, 'Limit must be at most 50')
        .default(20),
});

export const behavioralQuestionParamSchema = z.object({
    idOrSlug: z
        .string()
        .trim()
        .min(1, 'Question id or slug is required')
        .max(200, 'Question id or slug is too long'),
});

export const createBehavioralSessionBodySchema = z.object({
    questionId: z.string().min(1, 'Question id is required'),
});

export const behavioralSessionParamSchema = z.object({
    id: z.string().min(1, 'Session id is required'),
});

export const behavioralTurnParamSchema = z.object({
    id: z.string().min(1, 'Session id is required'),
    turnId: z.string().min(1, 'Turn id is required'),
});

export const submitTurnAnswerBodySchema = z.object({
    answer: z
        .string()
        .trim()
        .min(1, 'Answer is required')
        .max(20_000, 'Answer is too large'),
});

export const submitCandidateQuestionsBodySchema = z.object({
    questions: z
        .string()
        .trim()
        .min(1, 'At least one question is required')
        .max(10_000, 'Questions text is too large'),
});

export const listMyBehavioralSessionsQuerySchema = z.object({
    questionId: z.string().min(1, 'Question id cannot be empty').optional(),
    page: z.coerce.number().int().min(1, 'Page must be at least 1').default(1),
    limit: z.coerce
        .number()
        .int()
        .min(1, 'Limit must be at least 1')
        .max(50, 'Limit must be at most 50')
        .default(20),
});

export type ListBehavioralQuestionsQuery = z.infer<
    typeof listBehavioralQuestionsQuerySchema
>;

export type BehavioralQuestionParam = z.infer<
    typeof behavioralQuestionParamSchema
>;

export type CreateBehavioralSessionBody = z.infer<
    typeof createBehavioralSessionBodySchema
>;

export type BehavioralSessionParam = z.infer<
    typeof behavioralSessionParamSchema
>;

export type BehavioralTurnParam = z.infer<
    typeof behavioralTurnParamSchema
>;

export type SubmitTurnAnswerBody = z.infer<
    typeof submitTurnAnswerBodySchema
>;

export type SubmitCandidateQuestionsBody = z.infer<
    typeof submitCandidateQuestionsBodySchema
>;

export type ListMyBehavioralSessionsQuery = z.infer<
    typeof listMyBehavioralSessionsQuerySchema
>;