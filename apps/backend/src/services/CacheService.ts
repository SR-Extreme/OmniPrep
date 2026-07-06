import { createHash } from "node:crypto";
import type { ProgrammingLanguage } from "@prisma/client";
import getRedis from "../config/redis.js";
import type {
    AnswerHighlight,
    BehavioralEvaluationMetrics,
} from '../types/behavioral.types.js';
import type { MetricScores } from "../types/system-design.types.js";

const DSA_CACHE_KEY_PREFIX = 'omniprep:dsa-evaluation:';
const SD_CACHE_KEY_PREFIX = 'omniprep:sd-evaluation:';
const BEHAVIORAL_CACHE_KEY_PREFIX = 'omniprep:behavioral-evaluation:';
const DEFAULT_TTL_SECONDS = 60 * 60 * 24 * 7;

export interface ComplexityAnalysis {
    detected: {
        time: string;
        space: string;
    };
    optimal: {
        time: string;
        space: string;
    };
    isOptimal: boolean;
    notes?: string;
}

export interface DSAEvaluationCachePayload {
    overallScore: number;
    correctnessScore: number;
    efficiencyScore: number;
    codeQualityScore: number;
    explanationScore: number;
    complexityAnalysis: ComplexityAnalysis;
    followUpQuestions: string[];
    feedback: string;
    suggestions: string[];
    model: string;
    tokensUsed: number;
}

export interface SystemDesignEvaluationCachePayload {
    metricScores: MetricScores;
    strengths: string[];
    weaknesses: string[];
    followUpQuestions: string[];
    feedback: string;
    suggestions: string[];
    model: string;
    tokensUsed: number;
}

export interface BehavioralEvaluationCachePayload {
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

export interface BuildSystemDesignEvaluationCacheKeyInput {
    questionId: string;
    textAnswer: string | null;
    diagramUrl: string | null;
    followUpQuestions: string[];
    followUpAnswers: string[];
}

export interface BuildBehavioralEvaluationCacheKeyInput {
    questionId: string;
    resumeText: string;
    transcript: Array<{
        turnId: string;
        phaseType: string;
        orderIndex: number;
        questionIndexInPhase: number;
        questionText: string;
        candidateAnswerText: string | null;
        interviewerReplyText: string | null;
        isFollowUp: boolean;
    }>;
}

export function buildEvaluationCacheKey(
    problemId: string,
    language: ProgrammingLanguage,
    sourceCode: string,
): string {
    const digest = createHash('sha256').update(`${problemId}:${language}:${sourceCode}`).digest('hex');
    return `${DSA_CACHE_KEY_PREFIX}${digest}`;
}

export function buildSystemDesignEvaluationCacheKey(
    input: BuildSystemDesignEvaluationCacheKeyInput,
): string {
    const payload = JSON.stringify({
        questionId: input.questionId,
        textAnswer: input.textAnswer ?? '',
        diagramUrl: input.diagramUrl ?? '',
        followUpQuestions: input.followUpQuestions,
        followUpAnswers: input.followUpAnswers,
    });

    const digest = createHash('sha256').update(payload).digest('hex');
    return `${SD_CACHE_KEY_PREFIX}${digest}`;
}

export function buildBehavioralEvaluationCacheKey(
    input: BuildBehavioralEvaluationCacheKeyInput,
): string {
    const payload = JSON.stringify({
        questionId: input.questionId,
        resumeText: input.resumeText,
        transcript: input.transcript,
    });
    const digest = createHash('sha256').update(payload).digest('hex');
    return `${BEHAVIORAL_CACHE_KEY_PREFIX}${digest}`;
}

export async function getCachedEvaluation(
    cacheKey: string,
): Promise<DSAEvaluationCachePayload | null> {
    const redis = getRedis();
    const raw = await redis.get(cacheKey);

    if (!raw) {
        return null;
    }

    try {
        return JSON.parse(raw) as DSAEvaluationCachePayload;
    } catch (err) {
        await redis.del(cacheKey);
        return null;
    }
}

export async function getCachedSystemDesignEvaluation(
    cacheKey: string,
): Promise<SystemDesignEvaluationCachePayload | null> {
    const redis = getRedis();
    const raw = await redis.get(cacheKey);

    if (!raw) {
        return null;
    }

    try {
        return JSON.parse(raw) as SystemDesignEvaluationCachePayload;
    } catch (err) {
        await redis.del(cacheKey);
        return null;
    }
}

export async function getCachedBehavioralEvaluation(
    cacheKey: string,
): Promise<BehavioralEvaluationCachePayload | null> {
    const redis = getRedis();
    const raw = await redis.get(cacheKey);

    if (!raw) {
        return null;
    }

    try {
        return JSON.parse(raw) as BehavioralEvaluationCachePayload;
    } catch {
        await redis.del(cacheKey);
        return null;
    }
}

export async function setCachedEvaluation(
    cachedKey: string,
    payload: DSAEvaluationCachePayload,
    ttlseconds: number = DEFAULT_TTL_SECONDS,
): Promise<void> {
    const redis = getRedis();
    await redis.set(cachedKey, JSON.stringify(payload), 'EX', ttlseconds);
}

export async function setCachedSystemDesignEvaluation(
    cacheKey: string,
    payload: SystemDesignEvaluationCachePayload,
    ttlSeconds: number = DEFAULT_TTL_SECONDS,
): Promise<void> {
    const redis = getRedis();
    await redis.set(cacheKey, JSON.stringify(payload), 'EX', ttlSeconds);
}

export async function setCachedBehavioralEvaluation(
    cacheKey: string,
    payload: BehavioralEvaluationCachePayload,
    ttlSeconds: number = DEFAULT_TTL_SECONDS,
): Promise<void> {
    const redis = getRedis();
    await redis.set(cacheKey, JSON.stringify(payload), 'EX', ttlSeconds);
}

export async function deleteCachedEvaluation(
    cacheKey: string
): Promise<void> {
    const redis = getRedis();
    await redis.del(cacheKey);
}