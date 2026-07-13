import { z } from 'zod';
import { MOCK_SECTIONS } from '../../types/mock-interview.types.js';

export const mockInterviewParamSchema = z.object({
    id: z.string().min(1, 'Interview id is required'),
});

export const mockInterviewSectionParamSchema = z.object({
    id: z.string().min(1, 'Interview id is required'),
    section: z.enum(MOCK_SECTIONS, {
        message: 'Section must be DSA, SYSTEM_DESIGN, or BEHAVIORAL',
    }),
});

export const mockInterviewDsaSlotParamSchema = z.object({
    id: z.string().min(1, 'Interview id is required'),
    slotIndex: z.coerce
        .number()
        .int()
        .min(0, 'Slot index must be 0 or 1')
        .max(1, 'Slot index must be 0 or 1'),
});

export const listMyMockInterviewsQuerySchema = z.object({
    page: z.coerce.number().int().min(1, 'Page must be at least 1').default(1),
    limit: z.coerce
        .number()
        .int()
        .min(1, 'Limit must be at least 1')
        .max(50, 'Limit must be at most 50')
        .default(20),
});

export const selectBehavioralRoleBodySchema = z.object({
    roleName: z
        .string()
        .trim()
        .min(1, 'Role is required')
        .max(100, 'Role must be at most 100 characters'),
});

export const linkDsaSubmissionBodySchema = z.object({
    submissionId: z.string().min(1, 'Submission id is required'),
});

export const linkSystemDesignSubmissionBodySchema = z.object({
    submissionId: z.string().min(1, 'Submission id is required'),
});

export const submitBehavioralAnswerBodySchema = z.object({
    answer: z
        .string()
        .trim()
        .min(1, 'Answer is required')
        .max(20_000, 'Answer is too large'),
});

export type MockInterviewParam = z.infer<typeof mockInterviewParamSchema>;

export type MockInterviewSectionParam = z.infer<
    typeof mockInterviewSectionParamSchema
>;

export type MockInterviewDsaSlotParam = z.infer<
    typeof mockInterviewDsaSlotParamSchema
>;

export type ListMyMockInterviewsQuery = z.infer<
    typeof listMyMockInterviewsQuerySchema
>;

export type SelectBehavioralRoleBody = z.infer<
    typeof selectBehavioralRoleBodySchema
>;

export type LinkDsaSubmissionBody = z.infer<typeof linkDsaSubmissionBodySchema>;
export type LinkSystemDesignSubmissionBody = z.infer<
    typeof linkSystemDesignSubmissionBodySchema
>;

export type SubmitBehavioralAnswerBody = z.infer<
    typeof submitBehavioralAnswerBodySchema
>;