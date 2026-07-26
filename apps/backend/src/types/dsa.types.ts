import { z } from 'zod';

export const PROGRAMMING_LANGUAGES = ['CPP', 'JAVA', 'PYTHON'] as const;
export type ProgrammingLanguage = (typeof PROGRAMMING_LANGUAGES)[number]; //|CPP|JAVA|PYTHON

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

export const exampleSchema = z.object({
    input: z.string(),
    output: z.string(),
    explanation: z.string().optional(),
});

export const examplesSchema = z.array(exampleSchema);

export const starterCodeSchema = z.object({
    cpp: z.string(),
    java: z.string(),
    python: z.string(),
});

//to validate
export function parseExamples(value: unknown): Example[] {
    return examplesSchema.parse(value);
}

export function parseStarterCode(value: unknown): StarterCode {
    return starterCodeSchema.parse(value);
}

//----------------------------------------------------------------------

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

export const submissionTestResultSchema = z.object({
    testCaseId: z.string().min(1),
    status: z.enum(['PASSED', 'FAILED']),
    input: z.string().optional(),
    expectedOutput: z.string().optional(),
    actualOutput: z.string().optional(),
    executionTimeMs: z.number().nonnegative().optional(),
    memoryKb: z.number().int().nonnegative().optional(),
});

export const testResultsSchema = z.array(submissionTestResultSchema);

export function parseTestResults(value: unknown): SubmissionTestResult[] {
    return testResultsSchema.parse(value);
}

//------------------------------------------------------------------

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

const LANGUAGE_TO_JUDGE0_ID: Record<ProgrammingLanguage, number> = {
    CPP: 54,
    JAVA: 62,
    PYTHON: 71,
};

export function starterCodeKeyForLanguage(language: ProgrammingLanguage): StarterCodeKey {
    return LANGUAGE_TO_STARTER_KEY[language];
}

export function languageFromStarterCodeKey(key: StarterCodeKey): ProgrammingLanguage {
    return STARTER_KEY_TO_LANGUAGE[key];
}

export function judge0LanguageId(language: ProgrammingLanguage): number {
    return LANGUAGE_TO_JUDGE0_ID[language];
}

export function getStarterCodeForLanguage(starterCode: StarterCode, language: ProgrammingLanguage): string {
    const key = starterCodeKeyForLanguage(language);
    return starterCode[key];
}

//input and exp_output are removed from the row and rest put in safe for hiddentestcases
export function redactHiddenTestResults(
    results: SubmissionTestResult[],
    hiddenTestCaseIds: ReadonlySet<string>,
): SubmissionTestResult[] {
    return results.map((row) => {
        if (!hiddenTestCaseIds.has(row.testCaseId)) {
            return row;
        }
        const { input: _in, expectedOutput: _exp, ...safe } = row;
        return safe;
    });
}