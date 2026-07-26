export type SeedDifficulty = "EASY" | "MEDIUM" | "HARD";

export interface SeedExample {
    input: string;
    output: string;
    explanation?: string;
}

export interface SeedStarterCode {
    cpp: string;
    java: string;
    python: string;
}

export interface SeedTestCase {
    input: string;
    expectedOutput: string;
    explanation?: string;
    isHidden: boolean;
    order: number;
}

export interface ProblemSeedFile {
    slug: string;
    title: string;
    description: string;
    inputFormat: string;
    outputFormat: string;
    constraints: string;
    examples: SeedExample[];
    difficulty: SeedDifficulty;
    topics: string[];
    timeLimitMs: number;
    memoryLimitKb: number;
    starterCode: SeedStarterCode;
    hints: string[];
    isPublished: boolean;
    testCases: SeedTestCase[];
}

export function jsonIn(value: unknown): string {
    return JSON.stringify(value);
}

export function jsonOut(value: unknown): string {
    return JSON.stringify(value);
}
