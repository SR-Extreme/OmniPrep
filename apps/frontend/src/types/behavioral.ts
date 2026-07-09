import type { Difficulty, Pagination } from './dsa';

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
    'IN_PROGRESS',
    'COMPLETED'
] as const;

export type BehavioralSessionStatus = (typeof BEHAVIORAL_SESSION_STATUSES)[number];

export type BehavioralEvaluationStatus = 'completed' | 'pending' | 'failed';

export interface StarStructureScores {
    overall: number;
    situation: number;
    task: number;
    action: number;
    result: number;
}

export interface BehavioralEvaluationMetrics {
    overallScore: number;
    communication: number;
    starStructure: StarStructureScores;
    ownership: number;
    leadership: number;
    problemSolving: number;
    technicalDepth: number;
    impact: number;
    authenticity: number;
    confidence: number;
}

export interface AnswerHighlight {
    phaseType: BehavioralPhaseType;
    turnId: string;
    question: string;
    answer: string;
    explanation: string;
}

export interface BehavioralPhase {
    type: BehavioralPhaseType;
    title: string;
    description: string;
    totalQuestions: number;
    content: Record<string, unknown>;
}

export type BehavioralPhases = BehavioralPhase[];

export interface BehavioralQuestionListItem {
    id: string;
    slug: string;
    title: string;
    companyName: string;
    roleName: string;
    difficulty: Difficulty;
}

export interface BehavioralQuestionDetail {
    id: string;
    slug: string;
    title: string;
    description: string;
    companyName: string;
    roleName: string;
    difficulty: Difficulty;
    phases: BehavioralPhases;
    isPublished: boolean;
    createdAt: string;
    updatedAt: string;
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
    createdAt: string;
    answeredAt: string | null;
}

export interface BehavioralSessionDetail {
    id: string;
    questionId: string;
    resumeUrl: string;
    resumeFileName: string;
    resumeMimeType: string;
    currentPhaseIndex: number;
    status: BehavioralSessionStatus;
    completedAt: string | null;
    createdAt: string;
    updatedAt: string;
    turns: BehavioralTurnDetail[];
}

export interface BehavioralSessionListItem {
    id: string;
    questionId: string;
    status: BehavioralSessionStatus;
    currentPhaseIndex: number;
    createdAt: string;
    completedAt: string | null;
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
    createdAt: string;
}

export interface BehavioralFilterOptions {
    companies: string[];
    roles: string[];
}

export interface ListBehavioralQuestionsResult {
    questions: BehavioralQuestionListItem[];
    filterOptions: BehavioralFilterOptions;
    pagination: Pagination;
}

export interface GetBehavioralQuestionResponse {
    question: BehavioralQuestionDetail;
}

export interface CreateBehavioralSessionResponse {
    session: BehavioralSessionDetail;
}

export interface GetBehavioralSessionResponse {
    session: BehavioralSessionDetail;
}

export interface ListMyBehavioralSessionsResult {
    sessions: BehavioralSessionListItem[];
    pagination: Pagination;
}

export interface BehavioralEvaluationResult {
    status: BehavioralEvaluationStatus;
    evaluation?: BehavioralEvaluationDetail;
}

export interface ListBehavioralQuestionsQuery {
    company?: string;
    role?: string;
    difficulty?: Difficulty;
    search?: string;
    page?: number;
    limit?: number;
}

export interface ListMyBehavioralSessionsQuery {
    questionId?: string;
    page?: number;
    limit?: number;
}

export interface CreateBehavioralSessionInput {
    questionId: string;
    resume: File;
}

export interface SubmitTurnAnswerInput {
    answer: string;
}

export interface SubmitCandidateQuestionsInput {
    questions: string;
}

export function isAiQuestionPhase(
    phaseType: BehavioralPhaseType,
): phaseType is AiQuestionPhaseType {
    return (AI_QUESTION_PHASE_TYPES as readonly BehavioralPhaseType[]).includes(phaseType);
}

export function getPhaseAtIndex(phases: BehavioralPhases, index: number): BehavioralPhase {
    const phase = phases[index];
    if (!phase) {
        throw new Error(`Invalid phase index: ${index}`);
    }
    return phase;
}