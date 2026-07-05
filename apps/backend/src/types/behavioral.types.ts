import { z } from 'zod';

export const BEHAVIORAL_PHASE_TYPES = [
    'INTRODUCTION',
    'ICE_BREAKER',
    'RESUME_DEEP_DIVE',
    'CORE_BEHAVIORAL',
    'COMPANY_VALUES',
    'CANDIDATE_QUESTIONS',
    'WRAP_UP',
] as const;

export type BehavioralPhaseType = (typeof BEHAVIORAL_PHASE_TYPES)[number];

export const AI_QUESTION_PHASE_TYPES = [
    'ICE_BREAKER',
    'RESUME_DEEP_DIVE',
    'CORE_BEHAVIORAL',
    'COMPANY_VALUES',
] as const;

export type AiQuestionPhaseType = (typeof AI_QUESTION_PHASE_TYPES)[number];

export const BEHAVIORAL_SESSION_STATUSES = [
    'IN_PROGRESS', 'COMPLETED'
] as const;

export type BehavioralSessionStatus = (typeof BEHAVIORAL_SESSION_STATUSES)[number];

const scoreSchema = z.number().int().min(0).max(100);
const starComponentSchema = z.number().int().min(0).max(25);

export const starStructureSchema = z
    .object({
        overall: scoreSchema,
        situation: starComponentSchema,
        task: starComponentSchema,
        action: starComponentSchema,
        result: starComponentSchema,
    })
    .superRefine((star, ctx) => {
        const sum = star.situation + star.task + star.action + star.result;
        if (sum !== star.overall) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'starStructure.overall must equal situation + task + action + result',
            });
        }
    });

export const behavioralEvaluationMetricsSchema = z.object({
    overallScore: scoreSchema,
    communication: scoreSchema,
    starStructure: starStructureSchema,
    ownership: scoreSchema,
    leadership: scoreSchema,
    problemSolving: scoreSchema,
    technicalDepth: scoreSchema,
    impact: scoreSchema,
    authenticity: scoreSchema,
    confidence: scoreSchema,
});

export type BehavioralEvaluationMetrics = z.infer<typeof behavioralEvaluationMetricsSchema>;

//zod check for strongest and weakest answer
export const answerHighlightSchema = z.object({
    phaseType: z.enum(BEHAVIORAL_PHASE_TYPES),
    turnId: z.string().min(1),
    question: z.string().min(1),
    answer: z.string().min(1),
    explanation: z.string().min(1),
});

export type AnswerHighlight = z.infer<typeof answerHighlightSchema>;

export const stringArraySchema = z.array(z.string().min(1));

export const behavioralPhaseContentSchema = z.record(z.string(), z.unknown());

export const behavioralPhaseSchema = z.object({
    type: z.enum(BEHAVIORAL_PHASE_TYPES),
    title: z.string().min(1),
    description: z.string().min(1),
    totalQuestions: z.number().int().min(0),
    content: behavioralPhaseContentSchema,
});

export type BehavioralPhase = z.infer<typeof behavioralPhaseSchema>;

export const behavioralPhasesSchema = z
    .array(behavioralPhaseSchema)
    .length(BEHAVIORAL_PHASE_TYPES.length)
    .superRefine((phases, ctx) => {
        for (let i = 0; i < BEHAVIORAL_PHASE_TYPES.length; i++) {
            if (phases[i]?.type !== BEHAVIORAL_PHASE_TYPES[i]) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: `Phase at index ${i} must be ${BEHAVIORAL_PHASE_TYPES[i]}`,
                });
            }
        }

        const expectedTotals: Record<BehavioralPhaseType, number> = {
            INTRODUCTION: 0,
            ICE_BREAKER: 2,
            RESUME_DEEP_DIVE: 3,
            CORE_BEHAVIORAL: 3,
            COMPANY_VALUES: 2,
            CANDIDATE_QUESTIONS: 0,
            WRAP_UP: 0,
        };

        for (const phase of phases) {
            if (phase.totalQuestions !== expectedTotals[phase.type]) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: `${phase.type} must have totalQuestions=${expectedTotals[phase.type]}`,
                });
            }
        }
    });

export type BehavioralPhases = z.infer<typeof behavioralPhasesSchema>;

export function parseBehavioralPhases(value: unknown): BehavioralPhases {
    return behavioralPhasesSchema.parse(value);
}

export function parseBehavioralEvaluationMetrics(value: unknown): BehavioralEvaluationMetrics {
    return behavioralEvaluationMetricsSchema.parse(value);
}

export function parseAnswerHighlight(value: unknown): AnswerHighlight {
    return answerHighlightSchema.parse(value);
}

export function parseStringArray(value: unknown): string[] {
    return stringArraySchema.parse(value);
}

export function isAiQuestionPhase(phaseType: BehavioralPhaseType): phaseType is AiQuestionPhaseType {
    return (AI_QUESTION_PHASE_TYPES as readonly BehavioralPhaseType[]).includes(phaseType);
}

//phases: full all phase schema from which phase: single part of it will be extracted
//phases = array of phase
export function getPhaseAtIndex(phases: BehavioralPhases, index: number): BehavioralPhase {
    const phase = phases[index];
    if (!phase) {
        throw new Error(`Invalid phase index: ${index}`);
    }
    return phase;
}

export interface BehavioralQuestionListItem {
    id: string;
    slug: string;
    title: string;
    companyName: string;
    roleName: string;
    difficulty: string;
}

export interface BehavioralQuestionDetail {
    id: string;
    slug: string;
    title: string;
    description: string;
    companyName: string;
    roleName: string;
    difficulty: string;
    phases: BehavioralPhases;
    isPublished: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface BehavioralTurnDetail {
    id: string;
    sessionId: string;
    phaseType: BehavioralPhaseType;
    orderIndex: number;
    questionIndexInPhase: number;
    questionText: string;
    candidateAnswerText: string | null;
    interviewerReplyText: string | null;
    isFollowUp: boolean;
    createdAt: Date;
    answeredAt: Date | null;
}

export interface BehavioralSessionDetail {
    id: string;
    questionId: string;
    resumeUrl: string;
    resumeFileName: string;
    resumeMimeType: string;
    currentPhaseIndex: number;
    status: BehavioralSessionStatus;
    completedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    turns: BehavioralTurnDetail[];
}

export interface BehavioralSessionListItem {
    id: string;
    questionId: string;
    status: BehavioralSessionStatus;
    currentPhaseIndex: number;
    createdAt: Date;
    completedAt: Date | null;
    hasEvaluation: boolean;
}

export interface BehavioralEvaluationDetail {
    id: string;
    sessionId: string;
    questionId: string;
    evaluationMetrics: BehavioralEvaluationMetrics;
    strongestAnswer: AnswerHighlight;
    weakestAnswer: AnswerHighlight;
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
    summary: string;
    model: string;
    tokensUsed: number;
    createdAt: Date;
}
