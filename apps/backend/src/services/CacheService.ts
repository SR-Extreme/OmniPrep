import { createHash } from "node:crypto";
import type { ProgrammingLanguage } from "@prisma/client";
import getRedis from "../config/redis.js";

const CACHE_KEY_PREFIX = 'omniprep:dsa-evaluation:';
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

export function buildEvaluationCacheKey(
    problemId: string,
    language: ProgrammingLanguage,
    sourceCode: string,
): string {
    const digest = createHash('sha256').update(`${problemId}:${language}:${sourceCode}`).digest('hex');
    return `${CACHE_KEY_PREFIX}${digest}`;
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

export async function setCachedEvaluation(
    cachedKey: string,
    payload: DSAEvaluationCachePayload,
    ttlseconds: number = DEFAULT_TTL_SECONDS,
): Promise<void> {
    const redis = getRedis();
    await redis.set(cachedKey, JSON.stringify(payload), 'EX', ttlseconds);
}

export async function deleteCachedEvaluation(
    cacheKey: string
): Promise<void> {
    const redis = getRedis();
    await redis.del(cacheKey);
}