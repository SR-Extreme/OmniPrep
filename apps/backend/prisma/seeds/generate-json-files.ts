import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildTenCases } from "./build-test-cases.js";
import { MULTI_LANG_SOLUTIONS } from "./multi-lang-solutions/index.js";
import { PROBLEM_DEFINITIONS } from "./problem-definitions.js";
import {
    defaultStarterCode,
    SEED_IO_NOTE,
    type ProblemSeedFile,
} from "./types.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = join(__dirname, "problems");

function padNum(num: number): string {
    return String(num).padStart(3, "0");
}

function toProblemSeedFile(def: (typeof PROBLEM_DEFINITIONS)[number]): ProblemSeedFile {
    const multiLang = MULTI_LANG_SOLUTIONS[def.slug];
    if (!multiLang) {
        throw new Error(`Missing C++/Java solution for slug: ${def.slug}`);
    }

    const testCases = buildTenCases(def.visibleCases, def.hiddenCases);

    const examples = def.visibleCases.map((tc) => ({
        input: JSON.stringify(tc.input),
        output: JSON.stringify(tc.output),
        explanation: tc.explanation,
    }));

    return {
        slug: def.slug,
        title: def.title,
        description: `${def.description}\n\n${SEED_IO_NOTE}`,
        inputFormat: def.inputFormat,
        outputFormat: def.outputFormat,
        constraints: def.constraints,
        examples,
        difficulty: def.difficulty,
        topics: def.topics,
        timeLimitMs: def.difficulty === "HARD" ? 3000 : 2000,
        memoryLimitKb: 256000,
        starterCode: defaultStarterCode(),
        solutionCode: {
            python: def.pythonSolution,
            java: multiLang.java,
            cpp: multiLang.cpp,
        },
        hints: def.hints,
        isPublished: true,
        testCases,
    };
}

function main(): void {
    mkdirSync(OUTPUT_DIR, { recursive: true });

    for (const def of PROBLEM_DEFINITIONS) {
        const filename = `${padNum(def.num)}-${def.slug}.json`;
        const filepath = join(OUTPUT_DIR, filename);
        const payload = toProblemSeedFile(def);
        writeFileSync(filepath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
    }

    console.log(`Generated ${PROBLEM_DEFINITIONS.length} problem JSON files in ${OUTPUT_DIR}`);
}

main();
