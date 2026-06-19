import type { ProblemSignature, ValueType } from "./types.js";

function pythonType(type: ValueType): string {
    switch (type) {
        case "int":
            return "int";
        case "int[]":
            return "List[int]";
        case "int[][]":
            return "List[List[int]]";
        case "string":
            return "str";
        case "string[]":
            return "List[str]";
        case "string[][]":
            return "List[List[str]]";
        case "boolean":
            return "bool";
    }
}

function pythonNeedsTypingImport(sig: ProblemSignature): boolean {
    const types = [...sig.params.map((p) => p.type), sig.returnType];
    return types.some((t) => t.endsWith("[]"));
}

function javaType(type: ValueType): string {
    switch (type) {
        case "int":
            return "int";
        case "int[]":
            return "int[]";
        case "int[][]":
            return "int[][]";
        case "string":
            return "String";
        case "string[]":
            return "String[]";
        case "string[][]":
            return "String[][]";
        case "boolean":
            return "boolean";
    }
}

function cppType(type: ValueType): string {
    switch (type) {
        case "int":
            return "int";
        case "int[]":
            return "vector<int>";
        case "int[][]":
            return "vector<vector<int>>";
        case "string":
            return "string";
        case "string[]":
            return "vector<string>";
        case "string[][]":
            return "vector<vector<string>>";
        case "boolean":
            return "bool";
    }
}

export function generateStarterCode(sig: ProblemSignature): {
    python: string;
    java: string;
    cpp: string;
} {
    const params = sig.params
        .map((p) => `${p.name}: ${pythonType(p.type)}`)
        .join(", ");
    const javaParams = sig.params
        .map((p) => `${javaType(p.type)} ${p.name}`)
        .join(", ");
    const cppParams = sig.params
        .map((p) => `${cppType(p.type)} ${p.name}`)
        .join(", ");

    const typingImport = pythonNeedsTypingImport(sig) ? "from typing import List\n\n" : "";

    return {
        python: `${typingImport}class Solution:
    def ${sig.methodName}(self, ${params}) -> ${pythonType(sig.returnType)}:
        # Write your solution here
        pass
`,
        java: `class Solution {
    public ${javaType(sig.returnType)} ${sig.methodName}(${javaParams}) {
        // Write your solution here
    }
}
`,
        cpp: `#include <bits/stdc++.h>
using namespace std;

class Solution {
public:
    ${cppType(sig.returnType)} ${sig.methodName}(${cppParams}) {
        // Write your solution here
    }
};
`,
    };
}

const CPP_STARTER_HEADER = `#include <bits/stdc++.h>
using namespace std;

`;

/** Ensure design-problem overrides get the same C++ preamble as generated starters. */
export function finalizeCppStarter(cpp: string): string {
    if (cpp.trimStart().startsWith("#include")) {
        return cpp;
    }
    return CPP_STARTER_HEADER + cpp;
}
