import { z } from 'zod';
import { followUpAnswersSchema } from '../../types/system-design.types.js';
import { DIFFICULTIES } from '../problems/problems.validation.js';

const topicsQuerySchema = z.preprocess((value) => {
    if (value == null || value === '') {
        return undefined;
    }
    const values = Array.isArray(value) ? value : String(value).split(',');
    const topics = values
        .map((item) => String(item).trim())
        .filter((item) => item.length > 0);
    return topics.length > 0 ? topics : undefined;
}, z.array(z.string().trim().min(1).max(100)).max(50).optional());

export const listSystemDesignQuestionsQuerySchema = z.object({
    difficulty: z.enum(DIFFICULTIES).optional(),

    topics: topicsQuerySchema,

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

export const systemDesignQuestionParamSchema = z.object({
    idOrSlug: z
        .string()
        .trim()
        .min(1, 'Question id or slug is required')
        .max(200, 'Question id or slug is too long'),
});

export const createSystemDesignSubmissionBodySchema = z.object({
    questionId: z.string().min(1, 'Question id is required'),
    textAnswer: z
        .string()
        .max(50_000, 'Text answer is too large')
        .optional(),
});

export const systemDesignSubmissionParamSchema = z.object({
    id: z.string().min(1, 'Submission id is required'),
});

export const submitFollowUpAnswersBodySchema = z.object({
    answers: followUpAnswersSchema,
});

export const listMySystemDesignSubmissionsQuerySchema = z.object({
    questionId: z.string().min(1, 'Question id cannot be empty').optional(),
    page: z.coerce.number().int().min(1, 'Page must be at least 1').default(1),
    limit: z.coerce
        .number()
        .int()
        .min(1, 'Limit must be at least 1')
        .max(50, 'Limit must be at most 50')
        .default(20),
});


export type ListSystemDesignQuestionsQuery = z.infer<
    typeof listSystemDesignQuestionsQuerySchema
>;

export type SystemDesignQuestionParam = z.infer<
    typeof systemDesignQuestionParamSchema
>;

export type CreateSystemDesignSubmissionBody = z.infer<
    typeof createSystemDesignSubmissionBodySchema
>;

export type SystemDesignSubmissionParam = z.infer<
    typeof systemDesignSubmissionParamSchema
>;

export type SubmitFollowUpAnswersBody = z.infer<
    typeof submitFollowUpAnswersBodySchema
>;

export type ListMySystemDesignSubmissionsQuery = z.infer<
    typeof listMySystemDesignSubmissionsQuerySchema
>;

//atleast one should exist
export function normalizeInitialSubmissionContent(
    textAnswer: string | undefined,
    hasDiagramFile: boolean,
): { textAnswer: string | null } {
    const trimmed = textAnswer?.trim() ?? '';
    if (!trimmed && !hasDiagramFile) {
        throw new Error('Provide a text answer, a diagram image, or both.');
    }
    return { textAnswer: trimmed || null };
}