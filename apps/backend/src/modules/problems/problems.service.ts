import type { Role } from "@prisma/client";
import { prisma } from "../../config/db.js";
import {
    parseExamples,
    parseStarterCode,
    type Example,
    type StarterCode,
} from "../../types/dsa.types.js";
import { normalizeExamplesForDisplay } from "../../services/problem-runner/normalizeExamples.js";
import type { ListProblemsQuery } from "./problems.validation.js";

export class ProblemError extends Error {
    constructor(
        message: string,
        public readonly code: "NOT_FOUND",
    ) {
        super(message);
        this.name = "ProblemError";
    }
}

export interface ProblemListItem {
    id: string;
    slug: string;
    title: string;
    difficulty: string;
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
    difficulty: string;
    topics: string[];
    timeLimitMs: number;
    memoryLimitKb: number;
    starterCode: StarterCode | null;
    hints: string[];
    acceptanceRate: number | null;
    isPublished: boolean;
    createdAt: Date;
    updatedAt: Date;
    testCases: VisibleTestCase[];
}

export interface ListProblemsResult {
    problems: ProblemListItem[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

function isAdmin(role: Role | undefined): boolean {
    return role === 'ADMIN';
}

function publishedWhere(role: Role | undefined) {
    if (isAdmin(role)) {
        return {};
    }
    return { isPublished: true };
}

function toProblemListItem(problem: {
    id: string;
    slug: string;
    title: string;
    difficulty: string;
    topics: string[];
    acceptanceRate: number | null;
}): ProblemListItem {
    return {
        id: problem.id,
        slug: problem.slug,
        title: problem.title,
        difficulty: problem.difficulty,
        topics: problem.topics,
        acceptanceRate: problem.acceptanceRate,
    };
}

function toVisibleTestCase(testCase: {
    id: string;
    input: string;
    expectedOutput: string;
    explanation: string | null;
    order: number;
}): VisibleTestCase {
    return {
        id: testCase.id,
        input: testCase.input,
        expectedOutput: testCase.expectedOutput,
        explanation: testCase.explanation,
        order: testCase.order,
    };
}

function parseProblemJsonFields(problem: {
    examples: unknown;
    starterCode: unknown;
}): {
    examples: Example[] | null;
    starterCode: StarterCode | null;
} {
    let examples: Example[] | null = null;
    let starterCode: StarterCode | null = null;
    if (problem.examples != null) {
        examples = normalizeExamplesForDisplay(parseExamples(problem.examples));
    }
    if (problem.starterCode != null) {
        starterCode = parseStarterCode(problem.starterCode);
    }
    return { examples, starterCode };
}

//to get the list of problems based on search
export async function listProblems(
    query: ListProblemsQuery,
    role?: Role,
): Promise<ListProblemsResult> {
    const where = {
        ...publishedWhere(role),
        ...(query.difficulty ? { difficulty: query.difficulty } : {}),
        ...(query.topic ? { topics: { has: query.topic } } : {}),
        ...(query.search
            ? {
                OR: [
                    { title: { contains: query.search, mode: "insensitive" as const } },
                    { slug: { contains: query.search, mode: "insensitive" as const } },
                ],
            }
            : {}),
    };
    const skip = (query.page - 1) * query.limit;
    const [total, problems] = await Promise.all([
        prisma.problem.count({ where }),
        prisma.problem.findMany({
            where,
            orderBy: [{ difficulty: "asc" }, { title: "asc" }],
            skip,
            take: query.limit,
            select: {
                id: true,
                slug: true,
                title: true,
                difficulty: true,
                topics: true,
                acceptanceRate: true,
            },
        }),
    ]);
    return {
        problems: problems.map(toProblemListItem),
        pagination: {
            page: query.page,
            limit: query.limit,
            total,
            totalPages: total === 0 ? 0 : Math.ceil(total / query.limit),
        },
    };
}


//getting problem details for user choosen 1 problem
export async function getProblemByIdOrSlug(
    idOrSlug: string,
    role?: Role,
): Promise<ProblemDetail> {
    const problem = await prisma.problem.findFirst({
        where: {
            ...publishedWhere(role),
            OR: [{ id: idOrSlug }, { slug: idOrSlug }],
        },
        include: {
            testCases: {
                where: isAdmin(role) ? undefined : { isHidden: false },
                orderBy: { order: "asc" },
            },
        },
    });
    if (!problem) {
        throw new ProblemError("Problem not found", "NOT_FOUND");
    }
    const { examples, starterCode } = parseProblemJsonFields(problem);
    return {
        id: problem.id,
        slug: problem.slug,
        title: problem.title,
        description: problem.description,
        inputFormat: problem.inputFormat,
        outputFormat: problem.outputFormat,
        constraints: problem.constraints,
        examples,
        difficulty: problem.difficulty,
        topics: problem.topics,
        timeLimitMs: problem.timeLimitMs,
        memoryLimitKb: problem.memoryLimitKb,
        starterCode,
        hints: problem.hints,
        acceptanceRate: problem.acceptanceRate,
        isPublished: problem.isPublished,
        createdAt: problem.createdAt,
        updatedAt: problem.updatedAt,
        testCases: problem.testCases.map(toVisibleTestCase),
    };
}

