import { z } from 'zod';

export const DIFFICULTIES = ["EASY", "MEDIUM", "HARD"] as const;

//will be used for search query validation
export const listProblemsQuerySchema = z.object({
    difficulty: z.enum(DIFFICULTIES).optional(),

    topic: z.
        string().
        trim().
        min(1, "Topic filter cannot be empty").
        max(100, "Topic filter must be at most 100 characters").
        optional(),

    search: z.
        string().
        trim().
        min(1, "Search query cannot be empty").
        max(200, "Search query must be at most 200 characters").
        optional(),

    page: z.coerce.number().int().min(1, "Page must be at least 1").default(1),

    limit: z.coerce
        .number()
        .int()
        .min(1, "Limit must be at least 1")
        .max(50, "Limit must be at most 50")
        .default(20),
});

export const problemParamSchema = z.object({
    idOrSlug: z
        .string()
        .trim()
        .min(1, "Problem id or slug is required")
        .max(200, "Problem id or slug is too long"),
});

export type ListProblemsQuery = z.infer<typeof listProblemsQuerySchema>;
export type ProblemParam = z.infer<typeof problemParamSchema>;
export type Difficulty = (typeof DIFFICULTIES)[number];