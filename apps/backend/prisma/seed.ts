import "dotenv/config";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient, Prisma, type Difficulty } from "@prisma/client";
import type { ProblemSeedFile } from "./seeds/types.js";

const prisma = new PrismaClient();

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROBLEMS_DIR = join(__dirname, "seeds", "problems");

function toInputJson(value: unknown): Prisma.InputJsonValue {
    return value as Prisma.InputJsonValue;
}

function loadProblemFiles(): ProblemSeedFile[] {
    const files = readdirSync(PROBLEMS_DIR)
        .filter((name) => name.endsWith(".json"))
        .sort();

    return files.map((filename) => {
        const raw = readFileSync(join(PROBLEMS_DIR, filename), "utf8");
        return JSON.parse(raw) as ProblemSeedFile;
    });
}

async function upsertProblem(problem: ProblemSeedFile): Promise<void> {
    await prisma.problem.upsert({
        where: { slug: problem.slug },
        create: {
            slug: problem.slug,
            title: problem.title,
            description: problem.description,
            inputFormat: problem.inputFormat,
            outputFormat: problem.outputFormat,
            constraints: problem.constraints,
            examples: toInputJson(problem.examples),
            difficulty: problem.difficulty as Difficulty,
            topics: problem.topics,
            timeLimitMs: problem.timeLimitMs,
            memoryLimitKb: problem.memoryLimitKb,
            starterCode: toInputJson(problem.starterCode),
            solutionCode: toInputJson(problem.solutionCode),
            hints: problem.hints,
            isPublished: problem.isPublished,
            testCases: {
                create: problem.testCases.map((tc) => ({
                    input: tc.input,
                    expectedOutput: tc.expectedOutput,
                    explanation: tc.explanation ?? null,
                    isHidden: tc.isHidden,
                    order: tc.order,
                })),
            },
        },
        update: {
            title: problem.title,
            description: problem.description,
            inputFormat: problem.inputFormat,
            outputFormat: problem.outputFormat,
            constraints: problem.constraints,
            examples: toInputJson(problem.examples),
            difficulty: problem.difficulty as Difficulty,
            topics: problem.topics,
            timeLimitMs: problem.timeLimitMs,
            memoryLimitKb: problem.memoryLimitKb,
            starterCode: toInputJson(problem.starterCode),
            solutionCode: toInputJson(problem.solutionCode),
            hints: problem.hints,
            isPublished: problem.isPublished,
            testCases: {
                deleteMany: {},
                create: problem.testCases.map((tc) => ({
                    input: tc.input,
                    expectedOutput: tc.expectedOutput,
                    explanation: tc.explanation ?? null,
                    isHidden: tc.isHidden,
                    order: tc.order,
                })),
            },
        },
    });
}

async function main(): Promise<void> {
    const problems = loadProblemFiles();

    console.log(`Seeding ${problems.length} problems...`);

    for (const problem of problems) {
        await upsertProblem(problem);
        console.log(`  ✓ ${problem.slug}`);
    }

    const [problemCount, testCaseCount] = await Promise.all([
        prisma.problem.count(),
        prisma.testCase.count(),
    ]);

    console.log(`Done. Problems: ${problemCount}, Test cases: ${testCaseCount}`);
}

main()
    .catch((err) => {
        console.error("Seed failed:", err);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
