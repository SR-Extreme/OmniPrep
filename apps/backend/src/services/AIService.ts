import { GoogleGenAI, type Part } from '@google/genai';
import type { ProgrammingLanguage } from '@prisma/client';
import { z } from 'zod';
import {
    type EvaluationMetric,
    type MetricScores,
    type SystemDesignRequirements,
} from '../types/system-design.types.js';import type { DSAEvaluationCachePayload } from './CacheService.js';

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

const systemDesignFollowUpResponseSchema = z.object({
    followUpQuestions: z.array(z.string().min(1)).length(2),
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

export interface GenerateSystemDesignFollowUpsInput {
    questionTitle: string;
    questionDescription: string;
    requirements: SystemDesignRequirements;
    deliverables: string[];
    constraints: string[];
    textAnswer: string | null;
    diagramUrl: string | null;
}

export interface EvaluateSystemDesignInput {
    questionTitle: string;
    questionDescription: string;
    requirements: SystemDesignRequirements;
    deliverables: string[];
    constraints: string[];
    scaleFactors: string[];
    evaluationMetrics: EvaluationMetric[];
    textAnswer: string | null;
    diagramUrl: string | null;
    followUpQuestions: string[];
    followUpAnswers: string[];
}

export interface SystemDesignEvaluationAIResult {
    metricScores: MetricScores;
    strengths: string[];
    weaknesses: string[];
    followUpQuestions: string[];
    feedback: string;
    suggestions: string[];
    model: string;
    tokensUsed: number;
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

async function fetchDiagramInlineData(
    diagramUrl: string,
): Promise<{ mimeType: string; data: string }> {
    let response: Response;

    try {
        response = await fetch(diagramUrl);
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown fetch error';
        throw new AIError(`Failed to fetch diagram image: ${message}`, 'REQUEST_FAILED');
    }

    if (!response.ok) {
        throw new AIError(
            `Failed to fetch diagram image (HTTP ${response.status}).`,
            'REQUEST_FAILED',
        );
    }

    const buffer = Buffer.from(await response.arrayBuffer()); //text to binary
    const mimeType = response.headers.get('content-type')?.split(';')[0]?.trim() ?? 'image/png';

    return {
        mimeType,
        data: buffer.toString('base64'), //binary to text
    };
}

async function buildMultimodalParts(
    textPrompt: string,
    diagramUrl: string | null,
): Promise<Part[]> {
    const parts: Part[] = [{ text: textPrompt }];

    if (diagramUrl) {
        const inlineData = await fetchDiagramInlineData(diagramUrl);
        parts.push({ inlineData });
    }

    return parts;
}

async function generateJsonFromGemini(
    systemInstruction: string,
    textPrompt: string,
    diagramUrl: string | null,
): Promise<{ text: string; tokensUsed: number }> {
    const client = getGeminiClient();
    const parts = await buildMultimodalParts(textPrompt, diagramUrl);

    let response;

    try {
        response = await client.models.generateContent({
            model: DEFAULT_MODEL,
            contents: [{ role: 'user', parts }],
            config: {
                systemInstruction,
                temperature: 0.2,
                responseMimeType: 'application/json',
            },
        });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown Gemini API error';
        throw new AIError(message, 'REQUEST_FAILED');
    }

    const text = response.text;

    if (!text) {
        throw new AIError('Gemini returned an empty response.', 'INVALID_RESPONSE');
    }

    return {
        text,
        tokensUsed: response.usageMetadata?.totalTokenCount ?? 0,
    };
}

function parseJsonResponse<T>(
    raw: string,
    schema: z.ZodType<T>,
    label: string,
): T {
    let parsed: unknown;

    try {
        parsed = JSON.parse(raw);
    } catch (err) {
        throw new AIError(`Gemini returned non-JSON content for ${label}.`, 'INVALID_RESPONSE');
    }

    const result = schema.safeParse(parsed);

    if (!result.success) {
        throw new AIError(
            `Gemini ${label} response failed validation: ${result.error.message}`,
            'INVALID_RESPONSE',
        );
    }

    return result.data;
}

function buildMetricScoresSchema(metrics: EvaluationMetric[]) {
    const shape: Record<string, z.ZodNumber> = {};

    for (const metric of metrics) {
        shape[metric.id] = z.number().int().min(0).max(100);
    }

    return z.object(shape);
}

function buildSystemDesignEvaluationSchema(metrics: EvaluationMetric[]) {
    return z.object({
        metricScores: buildMetricScoresSchema(metrics),
        strengths: z.array(z.string().min(1)).min(1).max(5),
        weaknesses: z.array(z.string().min(1)).min(1).max(5),
        followUpQuestions: z.array(z.string().min(1)).min(3).max(5),
        feedback: z.string().min(1),
        suggestions: z.array(z.string().min(1)).min(1).max(4),
    });
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
    return parseJsonResponse(raw, evaluationResponseSchema, 'DSA evaluation');
}

function buildSystemDesignFollowUpSystemPrompt(): string {
    return [
        'You are a senior system design interviewer.',
        'Respond with valid JSON only — no markdown, no code fences.',
        'Generate exactly 2 follow-up questions based on the candidate initial answer.',
        'Questions must probe gaps, trade-offs, scaling, or failure modes in their design.',
        'If a diagram image is provided, reference specific elements from it when relevant.',
        'Do not repeat the original prompt; ask deeper interviewer-style questions.',
    ].join(' ');
}

function buildSystemDesignFollowUpUserPrompt(
    input: GenerateSystemDesignFollowUpsInput,
): string {
    return JSON.stringify(
        {
            task: 'Generate 2 follow-up interview questions',
            question: {
                title: input.questionTitle,
                description: input.questionDescription,
                requirements: input.requirements,
                deliverables: input.deliverables,
                constraints: input.constraints,
            },
            candidateInitialAnswer: {
                textAnswer: input.textAnswer,
                hasDiagram: input.diagramUrl != null,
            },
            requiredJsonShape: {
                followUpQuestions: ['string', 'string'],
            },
        },
        null,
        2,
    );
}

function buildSystemDesignEvaluationSystemPrompt(
    metrics: EvaluationMetric[],
): string {
    const rubricLines = metrics.map(
        (m) => `- ${m.id} (${m.title}, weight ${m.weight}): score 0-100 using criteria: ${m.criteria.join('; ')}`,
    );

    return [
        'You are a senior system design interviewer giving a final evaluation.',
        'Respond with valid JSON only — no markdown, no code fences.',
        'Evaluate based on the initial answer, diagram (if provided), and follow-up Q&A keeping evaluationMetrics in mind.',
        'Return metricScores with exactly these keys, each an integer 0-100:',
        ...rubricLines,
        'Do not return overallScore — it is computed server-side from weighted metricScores.',
        'strengths and weaknesses: concise bullet-style strings.',
        'followUpQuestions: 3-4 additional learning questions for the candidate (not the interview round).',
        'feedback: narrative summary.',
        'suggestions: actionable improvements.',
    ].join(' ');
}

function buildSystemDesignEvaluationUserPrompt(
    input: EvaluateSystemDesignInput,
): string {
    return JSON.stringify(
        {
            task: 'Final system design evaluation',
            question: {
                title: input.questionTitle,
                description: input.questionDescription,
                requirements: input.requirements,
                deliverables: input.deliverables,
                constraints: input.constraints,
                scaleFactors: input.scaleFactors,
            },
            evaluationMetrics: input.evaluationMetrics,
            candidateSubmission: {
                textAnswer: input.textAnswer,
                hasDiagram: input.diagramUrl != null,
                followUpQuestions: input.followUpQuestions,
                followUpAnswers: input.followUpAnswers,
            },
            requiredJsonShape: {
                metricScores: Object.fromEntries(
                    input.evaluationMetrics.map((m) => [m.id, 'integer 0-100']),
                ),
                strengths: ['string'],
                weaknesses: ['string'],
                followUpQuestions: ['string'],
                feedback: 'string',
                suggestions: ['string'],
            },
        },
        null,
        2,
    );
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

export async function generateSystemDesignFollowUps(
    input: GenerateSystemDesignFollowUpsInput,
): Promise<string[]> {
    const { text } = await generateJsonFromGemini(
        buildSystemDesignFollowUpSystemPrompt(),
        buildSystemDesignFollowUpUserPrompt(input),
        input.diagramUrl,
    );

    const parsed = parseJsonResponse(
        text,
        systemDesignFollowUpResponseSchema,
        'System design follow-up',
    );

    return parsed.followUpQuestions;
}

export async function evaluateSystemDesign(
    input: EvaluateSystemDesignInput,
): Promise<SystemDesignEvaluationAIResult> {
    const schema = buildSystemDesignEvaluationSchema(input.evaluationMetrics);

    const { text, tokensUsed } = await generateJsonFromGemini(
        buildSystemDesignEvaluationSystemPrompt(input.evaluationMetrics),
        buildSystemDesignEvaluationUserPrompt(input),
        input.diagramUrl,
    );

    const evaluation = parseJsonResponse(
        text,
        schema,
        'system design evaluation',
    );

    return {
        metricScores: evaluation.metricScores,
        strengths: evaluation.strengths,
        weaknesses: evaluation.weaknesses,
        followUpQuestions: evaluation.followUpQuestions,
        feedback: evaluation.feedback,
        suggestions: evaluation.suggestions,
        model: DEFAULT_MODEL,
        tokensUsed,
    };
}
