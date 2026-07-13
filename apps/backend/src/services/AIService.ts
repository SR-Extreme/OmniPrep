import { GoogleGenAI, type Part } from '@google/genai';
import type { ProgrammingLanguage } from '@prisma/client';
import { z } from 'zod';
import {
    type AiQuestionPhaseType,
    type AnswerHighlight,
    type BehavioralEvaluationMetrics,
    answerHighlightSchema,
    behavioralEvaluationMetricsSchema,
    stringArraySchema,
} from '../types/behavioral.types.js';
import {
    type EvaluationMetric,
    type MetricScores,
    type SystemDesignRequirements,
} from '../types/system-design.types.js';
import type { DSAEvaluationCachePayload } from './CacheService.js';
import {
    studyPlanSchema,
    type StudyPlan,
} from '../types/mock-interview.types.js';

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

const behavioralQuestionResponseSchema = z.object({
    questionText: z.string().min(1),
    isFollowUp: z.boolean(),
});

const candidateQuestionsResponseSchema = z.object({
    interviewerReplyText: z.string().min(1),
});

const behavioralEvaluationResponseSchema = z.object({
    evaluationMetrics: behavioralEvaluationMetricsSchema,
    strongestAnswer: answerHighlightSchema,
    weakestAnswer: answerHighlightSchema,
    strengths: stringArraySchema,
    weaknesses: stringArraySchema,
    suggestions: stringArraySchema,
    summary: z.string().min(1),
});

const mockInterviewStudyPlanResponseSchema = studyPlanSchema;

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

export interface BehavioralTranscriptTurn {
    turnId: string;
    phaseType: string;
    orderIndex: number;
    questionIndexInPhase: number;
    questionText: string;
    candidateAnswerText: string | null;
    interviewerReplyText: string | null;
    isFollowUp: boolean;
}

export interface GenerateBehavioralQuestionInput {
    companyName: string;
    roleName: string;
    phaseType: AiQuestionPhaseType;
    phaseTitle: string;
    phaseDescription: string;
    generationGuidance: string[];
    resumeText: string;
    transcript: BehavioralTranscriptTurn[];
    questionIndexInPhase: number;
    totalQuestionsInPhase: number;
}

export interface AnswerCandidateQuestionsInput {
    companyName: string;
    roleName: string;
    answerStyle: string;
    answerGuidance: string[];
    candidateQuestions: string;
    resumeText: string;
    transcript: BehavioralTranscriptTurn[];
}

export interface EvaluateBehavioralInput {
    companyName: string;
    roleName: string;
    questionTitle: string;
    questionDescription: string;
    resumeText: string;
    transcript: BehavioralTranscriptTurn[];
}

export interface BehavioralQuestionAIResult {
    questionText: string;
    isFollowUp: boolean;
    model: string;
    tokensUsed: number;
}

export interface CandidateQuestionsAIResult {
    interviewerReplyText: string;
    model: string;
    tokensUsed: number;
}

export interface BehavioralEvaluationAIResult {
    evaluationMetrics: BehavioralEvaluationMetrics;
    strongestAnswer: AnswerHighlight;
    weakestAnswer: AnswerHighlight;
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
    summary: string;
    model: string;
    tokensUsed: number;
}

export interface GenerateMockInterviewStudyPlanInput {
    overallScore: number | null;
    totalTimeTakenMs: number;
    totalTimeCapMs: number;
    sections: Array<{
        section: string;
        overallScore: number | null;
        timeTakenMs: number;
        timeCapMs: number;
    }>;
    evaluationStatuses: Array<{
        section: string;
        status: string;
    }>;
    dsaQuestions: Array<{
        slotIndex: number;
        problemId: string;
        overallScore: number;
        evalStatus: string;
        message?: string;
        evaluation: {
            correctnessScore: number;
            efficiencyScore: number;
            codeQualityScore: number;
            explanationScore: number;
            complexityAnalysis: unknown;
            feedback: string;
            suggestions: string[];
            followUpQuestions: string[];
        } | null;
    }>;
    systemDesign: {
        overallScore: number;
        evalStatus: string;
        message?: string;
        evaluation: {
            metricScores: MetricScores;
            strengths: string[];
            weaknesses: string[];
            feedback: string;
            suggestions: string[];
            followUpQuestions: string[];
        } | null;
    } | null;
    behavioral: {
        overallScore: number;
        evalStatus: string;
        message?: string;
        evaluation: {
            evaluationMetrics: BehavioralEvaluationMetrics;
            strengths: string[];
            weaknesses: string[];
            suggestions: string[];
            summary: string;
            strongestAnswer: {
                phaseType: string;
                question: string;
                explanation: string;
            };
            weakestAnswer: {
                phaseType: string;
                question: string;
                explanation: string;
            };
        } | null;
    } | null;
}

export interface GenerateMockInterviewStudyPlanResult {
    plan: StudyPlan;
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

//--

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

//--

function buildBehavioralQuestionSystemPrompt(input: GenerateBehavioralQuestionInput): string {
    return [
        `You are a ${input.roleName} interviewer at ${input.companyName} conducting a behavioral interview.`,
        'Respond with valid JSON only — no markdown, no code fences.',
        'Generate exactly ONE next interview question.',
        `Current phase: ${input.phaseTitle} (${input.phaseType}).`,
        `This is question ${input.questionIndexInPhase} of ${input.totalQuestionsInPhase} in this phase.`,
        'Questions must be specific to the company and role — never generic or random.',
        'Use the resume and prior transcript for context.',
        'The question may be a fresh question OR a natural follow-up to the previous answer in this phase.',
        'Sound like a real person: use natural transitions like "Interesting", "That is impressive", "Okay", "Can you walk me through" when appropriate.',
        'Do not ask multiple questions at once.',
        'Set isFollowUp to true only if this question directly builds on the most recent answer in this phase.',
        ...input.generationGuidance,
    ].join(' ');
}

function buildBehavioralQuestionUserPrompt(
    input: GenerateBehavioralQuestionInput,
): string {
    const phaseTranscript = input.transcript.filter(
        (turn) => turn.phaseType === input.phaseType,
    );
    return JSON.stringify(
        {
            task: 'Generate the next behavioral interview question',
            interviewContext: {
                companyName: input.companyName,
                roleName: input.roleName,
                phaseType: input.phaseType,
                phaseTitle: input.phaseTitle,
                phaseDescription: input.phaseDescription,
                questionIndexInPhase: input.questionIndexInPhase,
                totalQuestionsInPhase: input.totalQuestionsInPhase,
            },
            resumeText: input.resumeText,
            phaseTranscript,
            fullTranscript: input.transcript,
            requiredJsonShape: {
                questionText: 'string',
                isFollowUp: 'boolean',
            },
        },
        null,
        2,
    );
}

function buildCandidateQuestionsSystemPrompt(
    input: AnswerCandidateQuestionsInput,
): string {
    return [
        `You are a ${input.roleName} interviewer at ${input.companyName}.`,
        input.answerStyle,
        'Respond with valid JSON only — no markdown, no code fences.',
        'The candidate has asked one or more questions in a single message.',
        'Answer all of their questions in one natural interviewer response.',
        'Be realistic, helpful, and role-relevant.',
        'Do not invent confidential internal details.',
        ...input.answerGuidance,
    ].join(' ');
}

function buildCandidateQuestionsUserPrompt(
    input: AnswerCandidateQuestionsInput,
): string {
    return JSON.stringify(
        {
            task: 'Answer the candidate questions as the company interviewer',
            interviewContext: {
                companyName: input.companyName,
                roleName: input.roleName,
            },
            candidateQuestions: input.candidateQuestions,
            resumeText: input.resumeText,
            transcript: input.transcript,
            requiredJsonShape: {
                interviewerReplyText: 'string',
            },
        },
        null,
        2,
    );
}

function buildBehavioralEvaluationSystemPrompt(): string {
    return [
        'You are a senior behavioral interviewer giving a final evaluation.',
        'Respond with valid JSON only — no markdown, no code fences.',
        'Evaluate the full interview transcript and resume context.',
        'Return evaluationMetrics with these numeric fields (all integers):',
        '- overallScore: 0-100',
        '- communication: 0-100',
        '- starStructure.overall: 0-100 (must equal situation + task + action + result)',
        '- starStructure.situation: 0-25',
        '- starStructure.task: 0-25',
        '- starStructure.action: 0-25',
        '- starStructure.result: 0-25',
        '- ownership, leadership, problemSolving, technicalDepth, impact, authenticity, confidence: each 0-100',
        'strongestAnswer and weakestAnswer must reference a real turnId from the transcript.',
        'strengths, weaknesses, suggestions: concise actionable strings.',
        'summary: overall narrative evaluation.',
    ].join(' ');
}

function buildBehavioralEvaluationUserPrompt(
    input: EvaluateBehavioralInput,
): string {
    return JSON.stringify(
        {
            task: 'Final behavioral interview evaluation',
            interviewContext: {
                companyName: input.companyName,
                roleName: input.roleName,
                questionTitle: input.questionTitle,
                questionDescription: input.questionDescription,
            },
            resumeText: input.resumeText,
            transcript: input.transcript,
            requiredJsonShape: {
                evaluationMetrics: {
                    overallScore: 'integer 0-100',
                    communication: 'integer 0-100',
                    starStructure: {
                        overall: 'integer 0-100',
                        situation: 'integer 0-25',
                        task: 'integer 0-25',
                        action: 'integer 0-25',
                        result: 'integer 0-25',
                    },
                    ownership: 'integer 0-100',
                    leadership: 'integer 0-100',
                    problemSolving: 'integer 0-100',
                    technicalDepth: 'integer 0-100',
                    impact: 'integer 0-100',
                    authenticity: 'integer 0-100',
                    confidence: 'integer 0-100',
                },
                strongestAnswer: {
                    phaseType: 'string',
                    turnId: 'string',
                    question: 'string',
                    answer: 'string',
                    explanation: 'string',
                },
                weakestAnswer: {
                    phaseType: 'string',
                    turnId: 'string',
                    question: 'string',
                    answer: 'string',
                    explanation: 'string',
                },
                strengths: ['string'],
                weaknesses: ['string'],
                suggestions: ['string'],
                summary: 'string',
            },
        },
        null,
        2,
    );
}

function buildMockInterviewStudyPlanSystemPrompt(): string {
    return [
        'You are an expert interview coach creating a personalized 7-day study plan.',
        'Respond with valid JSON only — no markdown, no code fences.',
        'Use the full mock-interview report (scores, timing, and evaluation feedback).',
        'Prioritize the weakest sections and concrete gaps from feedback/suggestions.',
        'days must contain exactly 7 items with day=1..7 in order.',
        'Each day needs a clear topic and a specific, actionable description.',
        'summary must be a short overall coaching narrative.',
        'If a section has evalStatus NO_SUBMISSION or PENDING, note the gap and plan accordingly.',
    ].join(' ');
}

function buildMockInterviewStudyPlanUserPrompt(
    input: GenerateMockInterviewStudyPlanInput,
): string {
    return JSON.stringify(
        {
            task: 'Generate a 7-day personalized study plan from this mock interview report',
            report: input,
            requiredJsonShape: {
                days: [
                    {
                        day: 'integer 1-7',
                        topic: 'string',
                        description: 'string',
                    },
                ],
                summary: 'string',
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

//--

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

//--

export async function generateBehavioralQuestion(
    input: GenerateBehavioralQuestionInput,
): Promise<BehavioralQuestionAIResult> {
    const { text, tokensUsed } = await generateJsonFromGemini(
        buildBehavioralQuestionSystemPrompt(input),
        buildBehavioralQuestionUserPrompt(input),
        null,
    );

    const parsed = parseJsonResponse(
        text,
        behavioralQuestionResponseSchema,
        'behavioral question',
    );

    return {
        questionText: parsed.questionText,
        isFollowUp: parsed.isFollowUp,
        model: DEFAULT_MODEL,
        tokensUsed,
    };
}

export async function answerCandidateQuestions(
    input: AnswerCandidateQuestionsInput,
): Promise<CandidateQuestionsAIResult> {
    const { text, tokensUsed } = await generateJsonFromGemini(
        buildCandidateQuestionsSystemPrompt(input),
        buildCandidateQuestionsUserPrompt(input),
        null,
    );

    const parsed = parseJsonResponse(
        text,
        candidateQuestionsResponseSchema,
        'candidate questions answer',
    );

    return {
        interviewerReplyText: parsed.interviewerReplyText,
        model: DEFAULT_MODEL,
        tokensUsed,
    };
}

export async function evaluateBehavioral(
    input: EvaluateBehavioralInput,
): Promise<BehavioralEvaluationAIResult> {
    const { text, tokensUsed } = await generateJsonFromGemini(
        buildBehavioralEvaluationSystemPrompt(),
        buildBehavioralEvaluationUserPrompt(input),
        null,
    );

    const evaluation = parseJsonResponse(
        text,
        behavioralEvaluationResponseSchema,
        'behavioral evaluation',
    );

    return {
        ...evaluation,
        model: DEFAULT_MODEL,
        tokensUsed,
    };
}

export async function generateMockInterviewStudyPlan(
    input: GenerateMockInterviewStudyPlanInput,
): Promise<GenerateMockInterviewStudyPlanResult> {
    const { text, tokensUsed } = await generateJsonFromGemini(
        buildMockInterviewStudyPlanSystemPrompt(),
        buildMockInterviewStudyPlanUserPrompt(input),
        null,
    );

    const plan = parseJsonResponse(
        text,
        mockInterviewStudyPlanResponseSchema,
        'mock interview study plan',
    );

    return {
        plan,
        model: DEFAULT_MODEL,
        tokensUsed,
    };
}
