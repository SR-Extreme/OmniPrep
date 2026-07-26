import { z } from 'zod';

export const DIFFICULTIES = ["EASY", "MEDIUM", "HARD"] as const;

const topicsQuerySchema = z.preprocess((value) => {
    if (value == null || value === "") {
        return undefined;
    }
    const values = Array.isArray(value) ? value : String(value).split(",");
    const topics = values
        .map((item) => String(item).trim())
        .filter((item) => item.length > 0);
    return topics.length > 0 ? topics : undefined;
}, z.array(z.string().trim().min(1).max(100)).max(50).optional());

//will be used for search query validation
export const listProblemsQuerySchema = z.object({
    difficulty: z.enum(DIFFICULTIES).optional(),

    topics: topicsQuerySchema,

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