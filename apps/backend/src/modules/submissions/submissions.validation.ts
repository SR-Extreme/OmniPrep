import { z } from "zod";
import { PROGRAMMING_LANGUAGES } from "../../types/dsa.types.js";

//Submit or sample-run code
export const createSubmissionSchema = z.object({
    problemId: z.string().min(1, "Problem id is required"),
    language: z.enum(PROGRAMMING_LANGUAGES),
    sourceCode: z
        .string()
        .min(1, "Source code is required")
        .max(100_000, "Source code is too large"),
    isSampleRun: z.boolean().default(false),
});

//Fetch one submission
export const submissionParamSchema = z.object({
    id: z.string().min(1, "Submission id is required"),
});

//User history + optional problemId filter
export const listMySubmissionsQuerySchema = z.object({
    problemId: z.string().min(1, "Problem id cannot be empty").optional(),
    page: z.coerce.number().int().min(1, "Page must be at least 1").default(1),
    limit: z.coerce
        .number()
        .int()
        .min(1, "Limit must be at least 1")
        .max(50, "Limit must be at most 50")
        .default(20),
});

export type CreateSubmissionInput = z.infer<typeof createSubmissionSchema>;
export type SubmissionParam = z.infer<typeof submissionParamSchema>;
export type ListMySubmissionsQuery = z.infer<typeof listMySubmissionsQuerySchema>;
