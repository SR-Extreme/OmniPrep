import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildProblemSignature } from "../../src/services/problem-runner/parseSignature.js";
import { generateStarterCode, finalizeCppStarter } from "../../src/services/problem-runner/starter-code.js";
import { formatExampleDisplayFromObjects } from "../../src/services/problem-runner/exampleFormat.js";
import { buildTenCases } from "./build-test-cases.js";
import { PROBLEM_DESCRIPTIONS } from "./problem-descriptions.js";
import { ALL_PROBLEM_SPECS } from "./specs/index.js";
import {
    buildCppSolution,
    buildJavaSolution,
    buildPythonSolution,
} from "./specs/solution-builders.js";
import type { ProblemSeedFile } from "./types.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = join(__dirname, "problems");
const MULTI_LANG_DIR = join(__dirname, "multi-lang-solutions");

/** LeetCode-style starter for design / ops-driven problems. */
const STARTER_OVERRIDES: Record<string, ProblemSeedFile["starterCode"]> = {
    "min-stack": {
        python: `class MinStack:
    def __init__(self):
        pass

    def push(self, val: int) -> None:
        pass

    def pop(self) -> None:
        pass

    def top(self) -> int:
        pass

    def getMin(self) -> int:
        pass
`,
        java: `class MinStack {
    public MinStack() {}

    public void push(int val) {}

    public void pop() {}

    public int top() { return 0; }

    public int getMin() { return 0; }
}
`,
        cpp: `class MinStack {
public:
    MinStack() {}

    void push(int val) {}

    void pop() {}

    int top() { return 0; }

    int getMin() { return 0; }
};
`,
    },
    "implement-queue-using-stacks": {
        python: `class MyQueue:
    def __init__(self):
        pass

    def push(self, x: int) -> None:
        pass

    def pop(self) -> int:
        pass

    def peek(self) -> int:
        pass

    def empty(self) -> bool:
        pass
`,
        java: `class MyQueue {
    public MyQueue() {}

    public void push(int x) {}

    public int pop() { return 0; }

    public int peek() { return 0; }

    public boolean empty() { return true; }
}
`,
        cpp: `class MyQueue {
public:
    MyQueue() {}

    void push(int x) {}

    int pop() { return 0; }

    int peek() { return 0; }

    bool empty() { return true; }
};
`,
    },
    "my-calendar-i": {
        python: `class MyCalendar:
    def __init__(self):
        pass

    def book(self, start: int, end: int) -> bool:
        pass
`,
        java: `class MyCalendar {
    public MyCalendar() {}

    public boolean book(int start, int end) { return false; }
}
`,
        cpp: `class MyCalendar {
public:
    MyCalendar() {}

    bool book(int start, int end) { return false; }
};
`,
    },
    "design-hashmap": {
        python: `class MyHashMap:
    def __init__(self):
        pass

    def put(self, key: int, value: int) -> None:
        pass

    def get(self, key: int) -> int:
        pass

    def remove(self, key: int) -> None:
        pass
`,
        java: `class MyHashMap {
    public MyHashMap() {}

    public void put(int key, int value) {}

    public int get(int key) { return -1; }

    public void remove(int key) {}
}
`,
        cpp: `class MyHashMap {
public:
    MyHashMap() {}

    void put(int key, int value) {}

    int get(int key) { return -1; }

    void remove(int key) {}
};
`,
    },
    "design-add-and-search-words-data-structure": {
        python: `class WordDictionary:
    def __init__(self):
        pass

    def addWord(self, word: str) -> None:
        pass

    def search(self, word: str) -> bool:
        pass
`,
        java: `class WordDictionary {
    public WordDictionary() {}

    public void addWord(String word) {}

    public boolean search(String word) { return false; }
}
`,
        cpp: `class WordDictionary {
public:
    WordDictionary() {}

    void addWord(string word) {}

    bool search(string word) { return false; }
};
`,
    },
    "find-median-from-data-stream": {
        python: `class MedianFinder:
    def __init__(self):
        pass

    def addNum(self, num: int) -> None:
        pass

    def findMedian(self) -> float:
        pass
`,
        java: `class MedianFinder {
    public MedianFinder() {}

    public void addNum(int num) {}

    public double findMedian() { return 0.0; }
}
`,
        cpp: `class MedianFinder {
public:
    MedianFinder() {}

    void addNum(int num) {}

    double findMedian() { return 0.0; }
};
`,
    },
    "serialize-and-deserialize-binary-tree": {
        python: `class Codec:
    def serialize(self, root):
        pass

    def deserialize(self, data: str):
        pass
`,
        java: `class Codec {
    public String serialize(TreeNode root) { return ""; }

    public TreeNode deserialize(String data) { return null; }
}
`,
        cpp: `class Codec {
public:
    string serialize(TreeNode* root) { return ""; }

    TreeNode* deserialize(string data) { return nullptr; }
};
`,
    },
};

function padNum(num: number): string {
    return String(num).padStart(3, "0");
}

function toProblemSeedFile(
    spec: (typeof ALL_PROBLEM_SPECS)[number],
): ProblemSeedFile {
    const description = PROBLEM_DESCRIPTIONS[spec.slug];
    if (!description) {
        throw new Error(`Missing description for slug: ${spec.slug}`);
    }

    const signature = buildProblemSignature(
        spec.slug,
        spec.inputFormat,
        spec.outputFormat,
    );
    const starterRaw =
        STARTER_OVERRIDES[spec.slug] ?? generateStarterCode(signature);
    const starterCode = {
        ...starterRaw,
        cpp: finalizeCppStarter(starterRaw.cpp),
    };
    const testCases = buildTenCases(spec.visibleCases, [...spec.hiddenCases]);

    const examples = spec.visibleCases.map((tc) => {
        const formatted = formatExampleDisplayFromObjects(tc.input, tc.output);
        return {
            input: formatted.input,
            output: formatted.output,
            explanation: tc.explanation,
        };
    });

    return {
        slug: spec.slug,
        title: spec.title,
        description,
        inputFormat: spec.inputFormat,
        outputFormat: spec.outputFormat,
        constraints: spec.constraints,
        examples,
        difficulty: spec.difficulty,
        topics: spec.topics,
        timeLimitMs: spec.difficulty === "HARD" ? 3000 : 2000,
        memoryLimitKb: 256000,
        starterCode,
        solutionCode: {
            python: buildPythonSolution(spec),
            java: buildJavaSolution(spec),
            cpp: buildCppSolution(spec),
        },
        hints: spec.hints,
        isPublished: true,
        testCases,
    };
}

function writeMultiLangBatches(): void {
    const chunks: (typeof ALL_PROBLEM_SPECS)[] = [];
    for (let i = 0; i < 4; i++) {
        chunks.push(ALL_PROBLEM_SPECS.slice(i * 25, (i + 1) * 25));
    }

    chunks.forEach((chunk, idx) => {
        const batchNum = String(idx + 1).padStart(2, "0");
        const entries = chunk
            .map((spec) => {
                const java = JSON.stringify(buildJavaSolution(spec));
                const cpp = JSON.stringify(buildCppSolution(spec));
                return `    "${spec.slug}": {\n        java: ${java},\n        cpp: ${cpp},\n    }`;
            })
            .join(",\n");

        const content = `import type { MultiLangSolutionMap } from "../solution-wrappers.js";

export const BATCH_${batchNum}: MultiLangSolutionMap = {
${entries},
};
`;
        writeFileSync(join(MULTI_LANG_DIR, `batch-${batchNum}.ts`), content, "utf8");
    });
}

function main(): void {
    mkdirSync(OUTPUT_DIR, { recursive: true });

    for (const spec of ALL_PROBLEM_SPECS) {
        const filename = `${padNum(spec.num)}-${spec.slug}.json`;
        const filepath = join(OUTPUT_DIR, filename);
        const payload = toProblemSeedFile(spec);
        writeFileSync(filepath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
    }

    writeMultiLangBatches();

    console.log(
        `Generated ${ALL_PROBLEM_SPECS.length} problem JSON files and 4 multi-lang batches`,
    );
}

main();
