export const PROGRAMMING_LANGUAGES = ['CPP', 'JAVA', 'PYTHON'] as const;
export type ProgrammingLanguage = (typeof PROGRAMMING_LANGUAGES)[number];

export const DIFFICULTIES = ['EASY', 'MEDIUM', 'HARD'] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

export const SUBMISSION_STATUSES = [
    'PENDING',
    'RUNNING',
    'ACCEPTED',
    'WRONG_ANSWER',
    'TIME_LIMIT_EXCEEDED',
    'MEMORY_LIMIT_EXCEEDED',
    'RUNTIME_ERROR',
    'COMPILATION_ERROR',
    'INTERNAL_ERROR',
] as const;
export type SubmissionStatus = (typeof SUBMISSION_STATUSES)[number];

export interface Example {
    input: string;
    output: string;
    explanation?: string;
}

export interface StarterCode {
    cpp: string;
    java: string;
    python: string;
}

export type TestCaseRunStatus = 'PASSED' | 'FAILED';

export interface SubmissionTestResult {
    testCaseId: string;
    status: TestCaseRunStatus;
    input?: string;
    expectedOutput?: string;
    actualOutput?: string;
    executionTimeMs?: number;
    memoryKb?: number;
}

export type StarterCodeKey = keyof StarterCode;

const LANGUAGE_TO_STARTER_KEY: Record<ProgrammingLanguage, StarterCodeKey> = {
    CPP: 'cpp',
    JAVA: 'java',
    PYTHON: 'python',
};

const STARTER_KEY_TO_LANGUAGE: Record<StarterCodeKey, ProgrammingLanguage> = {
    cpp: 'CPP',
    java: 'JAVA',
    python: 'PYTHON',
};

export function starterCodeKeyForLanguage(language: ProgrammingLanguage): StarterCodeKey {
    return LANGUAGE_TO_STARTER_KEY[language];
}

export function languageFromStarterCodeKey(key: StarterCodeKey): ProgrammingLanguage {
    return STARTER_KEY_TO_LANGUAGE[key];
}

export function getStarterCodeForLanguage(
    starterCode: StarterCode,
    language: ProgrammingLanguage,
): string {
    return starterCode[starterCodeKeyForLanguage(language)];
}

export interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface ProblemListItem {
    id: string;
    slug: string;
    title: string;
    difficulty: Difficulty;
    topics: string[];
    acceptanceRate: number | null;
}

export interface VisibleTestCase {
    id: string;
    input: string;
    expectedOutput: string;
    explanation: string | null;
    order: number;
}

export interface ProblemDetail {
    id: string;
    slug: string;
    title: string;
    description: string;
    inputFormat: string | null;
    outputFormat: string | null;
    constraints: string | null;
    examples: Example[] | null;
    difficulty: Difficulty;
    topics: string[];
    timeLimitMs: number;
    memoryLimitKb: number;
    starterCode: StarterCode | null;
    hints: string[];
    acceptanceRate: number | null;
    isPublished: boolean;
    createdAt: string;
    updatedAt: string;
    testCases: VisibleTestCase[];
}

export interface ListProblemsResult {
    problems: ProblemListItem[];
    pagination: Pagination;
    filterOptions: {
        topics: string[];
    };
}

export interface GetProblemResponse {
    problem: ProblemDetail;
}

export interface ListProblemsQuery {
    difficulty?: Difficulty;
    topics?: string[];
    search?: string;
    page?: number;
    limit?: number;
}

export interface SubmissionListItem {
    id: string;
    problemId: string;
    problemTitle: string;
    problemSlug: string;
    language: ProgrammingLanguage;
    status: SubmissionStatus;
    passedTests: number;
    totalTests: number;
    isSampleRun: boolean;
    hasEvaluation: boolean;
    createdAt: string;
}

export interface SubmissionDetail {
    id: string;
    problemId: string;
    language: ProgrammingLanguage;
    sourceCode: string;
    status: SubmissionStatus;
    passedTests: number;
    totalTests: number;
    testResults: SubmissionTestResult[] | null;
    stdout: string | null;
    stderr: string | null;
    compileOutput: string | null;
    executionTimeMs: number | null;
    memoryKb: number | null;
    isSampleRun: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface ListMySubmissionsResult {
    submissions: SubmissionListItem[];
    pagination: Pagination;
}

export interface GetSubmissionResponse {
    submission: SubmissionDetail;
}

export interface CreateSubmissionResponse {
    submission: SubmissionDetail;
}

export interface CreateSubmissionInput {
    problemId: string;
    language: ProgrammingLanguage;
    sourceCode: string;
    isSampleRun?: boolean;
}

export interface ListMySubmissionsQuery {
    problemId?: string;
    page?: number;
    limit?: number;
}