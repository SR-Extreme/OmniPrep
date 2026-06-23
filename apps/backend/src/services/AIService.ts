import OpenAI from 'openai';
import type { ProgrammingLanguage } from '@prisma/client';
import { z } from 'zod';
import type { DSAEvaluationCachePayload } from './CacheService.js';

const DEFAULT_MODEL = 'gpt-4o';

const complexityAnalysisSchema = z.object({
    detected: z.object({
        time: z.string().min(1),
        space: z.string().min(1),
    }),
    optimal: z.object({
        time: z.string().min(1),
        space: z.string().min(1),
    }),
    isOptimal: z.boolean(),
    notes: z.string().optional(),
});

const gptEvaluationSchema = z.object({
    overallScore: z.number().int().min(0).max(100),
    correctnessScore: z.number().int().min(0).max(100),
    efficiencyScore: z.number().int().min(0).max(100),
    codeQualityScore: z.number().int().min(0).max(100),
    explanationScore: z.number().int().min(0).max(100),
    complexityAnalysis: complexityAnalysisSchema,
    followUpQuestions: z.array(z.string().min(1)).min(3).max(5),
    feedback: z.string().min(1),
    suggestions: z.array(z.string().min(1)).min(1).max(4),
});

export class AIError extends Error {
    constructor(
        message: string,
        public readonly code:
            | 'CONFIG_ERROR'
            | 'REQUEST_FAILED'
            | 'INVALID_RESPONSE',
    ) {
        super(message);
        this.name = 'AIError';
    }
}

//Input for DSA Code evaluation
export interface EvaluateDSAInput {
    problemTitle: string;
    problemDescription: string;
    difficulty: string;
    topics: string[];
    constraints?: string | null;
    language: ProgrammingLanguage;
    sourceCode: string;
    submissionStatus: string;
    passedTests: number;
    totalTests: number;
}

let openaiclient: OpenAI | undefined;

function getOpenAIClient(): OpenAI {
    const apiKey = process.env.OPENAI_API_KEY?.trim();

    if (!apiKey) {
        throw new AIError(
            'OPENAI_API_KEY is not configured',
            'CONFIG_ERROR',
        );
    }

    if (!openaiclient) {
        openaiclient = new OpenAI({ apiKey });
    }
    return openaiclient;
}

function buildSystemPrompt(): string {
    return [
        'You are a senior technical interviewer evaluating a DSA submission.',
        'Respond with valid JSON only — no markdown, no code fences.',
        'All scores must be integers from 0 to 100.',
        'overallScore is the holistic verdict out of 100.',
        'Score dimensions (each 0-100): correctnessScore, efficiencyScore, codeQualityScore, explanationScore.',
        'complexityAnalysis must include detected time/space, optimal time/space for this problem, isOptimal boolean, and optional notes.',
        'followUpQuestions: 3-6 realistic interviewer follow-ups (complexity, trade-offs, edge cases) based on the code submitted.',
        'suggestions: actionable improvements.',
        'feedback: concise narrative summary for the candidate for the given question.',
    ].join(' ');
}

function buildUserPrompt(input: EvaluateDSAInput): string {
    return JSON.stringify(
        {
            task: 'Evaluate this DSA submission',
            problem: {
                title: input.problemTitle,
                description: input.problemDescription,
                difficulty: input.difficulty,
                topics: input.topics,
                constraints: input.constraints ?? null,
            },
            submission: {
                language: input.language,
                status: input.submissionStatus,
                passedTests: input.passedTests,
                totalTests: input.totalTests,
                sourceCode: input.sourceCode,
            },
            requiredJsonShape: {
                overallScore: 'integer 0-100',
                correctnessScore: 'integer 0-100',
                efficiencyScore: 'integer 0-100',
                codeQualityScore: 'integer 0-100',
                explanationScore: 'integer 0-100',
                complexityAnalysis: {
                    detected: { time: 'string', space: 'string' },
                    optimal: { time: 'string', space: 'string' },
                    isOptimal: 'boolean',
                    notes: 'string (optional)',
                },
                followUpQuestions: ['string'],
                feedback: 'string',
                suggestions: ['string'],
            },
        },
        null,
        2,
    );
}

//for checking consistency of response with requirements
function parseEvaluationResponse(raw: string): z.infer<typeof gptEvaluationSchema> {
    let parsed: unknown;

    try {
        parsed = JSON.parse(raw);
    } catch {
        throw new AIError('GPT returned non-JSON content.', 'INVALID_RESPONSE');
    }

    const result = gptEvaluationSchema.safeParse(parsed);

    if (!result.success) {
        throw new AIError(
            `GPT response failed validation: ${result.error.message}`,
            'INVALID_RESPONSE',
        );
    }
    return result.data;
}

//makes call to gpt and returns response object
export async function evaluateDSA(
    input: EvaluateDSAInput,
): Promise<DSAEvaluationCachePayload> {
    const client = getOpenAIClient();
    let completion;

    try {
        completion = await client.chat.completions.create({
            model: DEFAULT_MODEL,
            temperature: 0.2,
            response_format: { type: 'json_object' },
            messages: [
                {
                    role: 'system', content: buildSystemPrompt()
                },
                {
                    role: 'user', content: buildUserPrompt(input)
                },
            ],
        });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown OpenAI API error';
        throw new AIError(message, 'REQUEST_FAILED');
    }

    const content = completion.choices[0]?.message?.content;

    if (!content) {
        throw new AIError('GPT returned an empty response.', 'INVALID_RESPONSE');
    }

    const evaluation = parseEvaluationResponse(content);
    const tokensUsed = completion.usage?.total_tokens ?? 0;

    return {
        ...evaluation,
        model: completion.model ?? DEFAULT_MODEL,
        tokensUsed,
    };
}