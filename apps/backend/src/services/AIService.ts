import { GoogleGenAI } from '@google/genai';
import type { ProgrammingLanguage } from '@prisma/client';
import { z } from 'zod';
import type { DSAEvaluationCachePayload } from './CacheService.js';

const DEFAULT_MODEL = 'gemini-2.5-flash';

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

const evaluationResponseSchema = z.object({
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

let geminiClient: GoogleGenAI | undefined;

function getGeminiClient(): GoogleGenAI {
    const apiKey = process.env.GEMINI_API_KEY?.trim();

    if (!apiKey) {
        throw new AIError(
            'GEMINI_API_KEY is not configured',
            'CONFIG_ERROR',
        );
    }

    if (!geminiClient) {
        geminiClient = new GoogleGenAI({ apiKey });
    }
    return geminiClient;
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
        'Limit all feedback, suggestions strictly to the submitted code within the function boilerplate and its implementation; do not provide suggestions related to project structure, architecture, UI/UX, documentation, naming of features, future enhancements, or any recommendations beyond improving the code itself.',
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
function parseEvaluationResponse(raw: string): z.infer<typeof evaluationResponseSchema> {
    let parsed: unknown;

    try {
        parsed = JSON.parse(raw);
    } catch {
        throw new AIError('Gemini returned non-JSON content.', 'INVALID_RESPONSE');
    }

    const result = evaluationResponseSchema.safeParse(parsed);

    if (!result.success) {
        throw new AIError(
            `Gemini response failed validation: ${result.error.message}`,
            'INVALID_RESPONSE',
        );
    }
    return result.data;
}

//makes call to Gemini and returns response object
export async function evaluateDSA(
    input: EvaluateDSAInput,
): Promise<DSAEvaluationCachePayload> {
    const client = getGeminiClient();
    let response;

    try {
        response = await client.models.generateContent({
            model: DEFAULT_MODEL,
            contents: buildUserPrompt(input),
            config: {
                systemInstruction: buildSystemPrompt(),
                temperature: 0.2,
                responseMimeType: 'application/json',
            },
        });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown Gemini API error';
        throw new AIError(message, 'REQUEST_FAILED');
    }

    const content = response.text;

    if (!content) {
        throw new AIError('Gemini returned an empty response.', 'INVALID_RESPONSE');
    }

    const evaluation = parseEvaluationResponse(content);
    const tokensUsed = response.usageMetadata?.totalTokenCount ?? 0;

    return {
        ...evaluation,
        model: DEFAULT_MODEL,
        tokensUsed,
    };
}
