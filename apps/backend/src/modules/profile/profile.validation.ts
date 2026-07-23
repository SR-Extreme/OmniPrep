import { z } from 'zod';

export const updateProfileBodySchema = z
    .object({
        name: z
            .string()
            .trim()
            .min(1, 'Name is required')
            .max(100, 'Name must be at most 100 characters')
            .optional(),
        phoneNo: z
            .string()
            .trim()
            .length(10, 'Phone number must be exactly 10 digits')
            .regex(/^\d+$/, 'Phone number must contain only digits')
            .optional(),
        image: z
            .string()
            .trim()
            .url('Image must be a valid URL')
            .max(2048, 'Image URL is too long')
            .nullable()
            .optional(),
    })
    .refine(
        (body) =>
            body.name !== undefined
            || body.phoneNo !== undefined
            || body.image !== undefined,
        {
            message: 'At least one profile field must be provided',
        },
    );

export const studyPlanParamSchema = z.object({
    studyPlanId: z
        .string()
        .trim()
        .min(1, 'Study plan id is required'),
});

export const studyPlanTaskKeySchema = z
    .string()
    .regex(/^day:[1-7]$/, 'Task key must be day:1 through day:7');

export const submitStudyPlanProgressBodySchema = z.object({
    completedTaskKeys: z
        .array(studyPlanTaskKeySchema)
        .max(7, 'A study plan has at most 7 day tasks'),
});

export type UpdateProfileBody = z.infer<typeof updateProfileBodySchema>;
export type StudyPlanParam = z.infer<typeof studyPlanParamSchema>;
export type SubmitStudyPlanProgressBody = z.infer<
    typeof submitStudyPlanProgressBodySchema
>;