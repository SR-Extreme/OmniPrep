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
    /** Body of solve(data) — assign to `result` or use `return`. */
    pythonBody: string;
    javaBody: string;
    cppBody: string;
    visibleCases: [CasePair, CasePair];
    hiddenCases: [CasePair, CasePair, CasePair, CasePair, CasePair, CasePair, CasePair, CasePair];
}

export function wrapPython(body: string): string {
    return `import json
import sys

${body.trim()}

if __name__ == "__main__":
    data = json.loads(sys.stdin.read() or "{}")
    result = solve(data)
    print(json.dumps(result))
`;
}
