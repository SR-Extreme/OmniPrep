import type { SeedDifficulty } from "../types.js";

export interface CasePair {
    input: Record<string, unknown>;
    output: unknown;
    explanation?: string;
}

export interface ProblemSpec {
    num: number;
    slug: string;
    title: string;
    difficulty: SeedDifficulty;
    topics: string[];
    inputFormat: string;
    outputFormat: string;
    constraints: string;
    hints: string[];
    visibleCases: [CasePair, CasePair];
    hiddenCases: [CasePair, CasePair, CasePair, CasePair, CasePair, CasePair, CasePair, CasePair];
}
