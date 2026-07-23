import { z } from 'zod';
import {
    DEFAULT_REVENUE_TIME_RANGE,
    REVENUE_TIME_RANGES,
} from '../../types/admin.types.js';
import {
    examplesSchema,
    solutionCodeSchema,
    starterCodeSchema,
} from '../../types/dsa.types.js';
import {
    deliverablesSchema,
    evaluationMetricsSchema,
    requirementsSchema,
} from '../../types/system-design.types.js';
import { DIFFICULTIES } from '../problems/problems.validation.js';

export const QUESTION_LIST_STATUSES = ['published', 'draft'] as const;

export const revenueDashboardQuerySchema = z.object({
    range: z
        .enum(REVENUE_TIME_RANGES)
        .default(DEFAULT_REVENUE_TIME_RANGE),
});

export const listAdminUsersQuerySchema = z.object({
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
        .max(100, 'Limit must be at most 100')
        .default(50),
});

export const adminUserParamSchema = z.object({
    userId: z.string().trim().min(1, 'User id is required'),
});

export const listAdminQuestionsQuerySchema = z.object({
    status: z.enum(QUESTION_LIST_STATUSES, {
        message: 'Status must be published or draft',
    }),
    page: z.coerce.number().int().min(1, 'Page must be at least 1').default(1),
    limit: z.coerce
        .number()
        .int()
        .min(1, 'Limit must be at least 1')
        .max(100, 'Limit must be at most 100')
        .default(50),
});

export const adminQuestionParamSchema = z.object({
    questionId: z.string().trim().min(1, 'Question id is required'),
});

export const adminTestCaseSchema = z.object({
    input: z.string().min(1, 'Test case input is required'),
    expectedOutput: z.string().min(1, 'Test case expected output is required'),
    explanation: z.string().optional(),
    isHidden: z.boolean().default(true),
    order: z.number().int().min(0).default(0),
});

export const createDsaQuestionBodySchema = z.object({
    slug: z
        .string()
        .trim()
        .min(1, 'Slug is required')
        .max(200, 'Slug is too long')
        .regex(
            /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
            'Slug must be lowercase kebab-case',
        ),
    title: z.string().trim().min(1, 'Title is required').max(200),
    description: z.string().trim().min(1, 'Description is required'),
    inputFormat: z.string().trim().optional(),
    outputFormat: z.string().trim().optional(),
    constraints: z.string().trim().optional(),
    examples: examplesSchema.optional(),
    difficulty: z.enum(DIFFICULTIES),
    topics: z.array(z.string().trim().min(1)).default([]),
    timeLimitMs: z.number().int().positive().default(2000),
    memoryLimitKb: z.number().int().positive().default(256000),
    starterCode: starterCodeSchema.optional(),
    solutionCode: solutionCodeSchema.optional(),
    hints: z.array(z.string().trim().min(1)).default([]),
    isPublished: z.boolean().default(false),
    testCases: z.array(adminTestCaseSchema).default([]),
});

export const updateDsaQuestionBodySchema = createDsaQuestionBodySchema
    .partial()
    .refine(
        (body) => Object.keys(body).length > 0,
        { message: 'At least one field must be provided' },
    );

export const createSystemDesignQuestionBodySchema = z.object({
    slug: z
        .string()
        .trim()
        .min(1, 'Slug is required')
        .max(200, 'Slug is too long')
        .regex(
            /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
            'Slug must be lowercase kebab-case',
        ),
    title: z.string().trim().min(1, 'Title is required').max(200),
    description: z.string().trim().min(1, 'Description is required'),
    requirements: requirementsSchema,
    deliverables: deliverablesSchema.min(1, 'At least one deliverable is required'),
    constraints: z.array(z.string().trim().min(1)).default([]),
    scaleFactors: z.array(z.string().trim().min(1)).default([]),
    difficulty: z.enum(DIFFICULTIES),
    topics: z.array(z.string().trim().min(1)).default([]),
    hints: z.array(z.string().trim().min(1)).default([]),
    evaluationMetrics: evaluationMetricsSchema,
    isPublished: z.boolean().default(false),
});

export const updateSystemDesignQuestionBodySchema =
    createSystemDesignQuestionBodySchema
        .partial()
        .refine(
            (body) => Object.keys(body).length > 0,
            { message: 'At least one field must be provided' },
        );

export const publishQuestionBodySchema = z.object({
    isPublished: z.boolean(),
});

export type RevenueDashboardQuery = z.infer<typeof revenueDashboardQuerySchema>;
export type ListAdminUsersQuery = z.infer<typeof listAdminUsersQuerySchema>;
export type AdminUserParam = z.infer<typeof adminUserParamSchema>;
export type ListAdminQuestionsQuery = z.infer<typeof listAdminQuestionsQuerySchema>;
export type AdminQuestionParam = z.infer<typeof adminQuestionParamSchema>;
export type CreateDsaQuestionBody = z.infer<typeof createDsaQuestionBodySchema>;
export type UpdateDsaQuestionBody = z.infer<typeof updateDsaQuestionBodySchema>;
export type CreateSystemDesignQuestionBody = z.infer<typeof createSystemDesignQuestionBodySchema>;
export type UpdateSystemDesignQuestionBody = z.infer<typeof updateSystemDesignQuestionBodySchema>;
export type PublishQuestionBody = z.infer<typeof publishQuestionBodySchema>;