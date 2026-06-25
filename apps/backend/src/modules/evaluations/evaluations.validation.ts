import { z } from 'zod';

export const evaluationSubmissionParamSchema = z.object({
    submissionId: z.string().min(1, 'Submission id  is required'),
});

export type EvaluationSubmissionParam = z.infer<typeof evaluationSubmissionParamSchema>;