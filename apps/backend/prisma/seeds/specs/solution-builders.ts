import { javaSolution, cppSolution } from "../solution-wrappers.js";
import type { ProblemSpec } from "./types.js";

/** Normalize pythonBody to a full solve() function source. */
function normalizePythonBody(body: string): string {
    const lines = body.split("\n");
    const indents = lines
        .filter((line) => line.trim().length > 0)
        .map((line) => line.match(/^(\s*)/)?.[1].length ?? 0);

    if (indents.length === 0) {
        return "";
    }

    let normalized = lines;

    // Template literals often drop base indent on continuation lines — re-align them.
    const minIndent = Math.min(...indents);
    const hasDroppedBase =
        minIndent === 0 && indents.some((indent) => indent > 0);
    if (hasDroppedBase) {
        const baseIndent = Math.min(...indents.filter((indent) => indent > 0));
        normalized = lines.map((line) => {
            if (!line.trim()) {
                return "";
            }
            const indent = line.match(/^(\s*)/)?.[1].length ?? 0;
            if (indent === 0) {
                return `${" ".repeat(baseIndent)}${line}`;
            }
            return line;
        });
    }

    const dedentBy = Math.min(
        ...normalized
            .filter((line) => line.trim().length > 0)
            .map((line) => line.match(/^(\s*)/)?.[1].length ?? 0),
    );

    return normalized
        .map((line) => {
            if (!line.trim()) {
                return "";
            }
            return line.slice(dedentBy);
        })
        .join("\n");
}

export function buildPythonSolution(spec: ProblemSpec): string {
    const body = spec.pythonBody.trim();
    const hasSolveDef =
        body.startsWith("def solve(") || body.includes("\ndef solve(");

    if (hasSolveDef) {
        return `import json
import sys

${body}

if __name__ == "__main__":
    data = json.loads(sys.stdin.read() or "{}")
    result = solve(data)
    print(json.dumps(result))
`;
    }

    const normalized = normalizePythonBody(body);
    const indented = normalized
        .split("\n")
        .map((line) => (line.trim().length > 0 ? `    ${line}` : line))
        .join("\n");

    return `import json
import sys

def solve(data):
${indented}

if __name__ == "__main__":
    data = json.loads(sys.stdin.read() or "{}")
    result = solve(data)
    print(json.dumps(result))
`;
}

export function buildJavaSolution(spec: ProblemSpec): string {
    return javaSolution(spec.javaBody);
}

export function buildCppSolution(spec: ProblemSpec): string {
    return cppSolution(spec.cppBody);
}
