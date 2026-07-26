import type { Prisma, ProgrammingLanguage, Role, SubmissionStatus } from "@prisma/client";
import { prisma } from "../../config/db.js";
import { executeCode, Judge0Error, type Judge0ExecuteResult } from "../../services/Judge0Service.js";
import { buildProblemSignature } from "../../services/problem-runner/parseSignature.js";
import { wrapSubmissionCode } from "../../services/problem-runner/codeWrapper.js";
import { prepareTestResultsForClient, type SubmissionTestResult } from "../../types/dsa.types.js";
import type { CreateSubmissionInput, ListMySubmissionsQuery } from "./submissions.validation.js";

export class SubmissionError extends Error {
    constructor(
        message: string,
        public readonly code: "NOT_FOUND" | "FORBIDDEN" | "PROBLEM_UNAVAILABLE",
    ) {
        super(message);
        this.name = "SubmissionError";
    }
}

export interface SubmissionListItem {
    id: string;
    problemId: string;
    problemTitle: string;
    problemSlug: string;
    language: ProgrammingLanguage;
    status: SubmissionStatus;
    passedTests: number;
    totalTests: number;
    isSampleRun: boolean;
    hasEvaluation: boolean;
    createdAt: Date;
}
export interface SubmissionDetail {
    id: string;
    problemId: string;
    language: ProgrammingLanguage;
    sourceCode: string;
    status: SubmissionStatus;
    passedTests: number;
    totalTests: number;
    testResults: SubmissionTestResult[] | null;
    stdout: string | null;
    stderr: string | null;
    compileOutput: string | null;
    executionTimeMs: number | null;
    memoryKb: number | null;
    isSampleRun: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface ListMySubmissionsResult {
    submissions: SubmissionListItem[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

function isAdmin(role: Role | undefined): boolean {
    return role === "ADMIN";
}

function parseTestResultsJson(value: unknown): SubmissionTestResult[] | null {
    if (value == null) {
        return null;
    }
    if (!Array.isArray(value)) {
        return null;
    }
    return value as SubmissionTestResult[];
}

function buildStoredTestResult(
    testCase: { id: string, input: string, expectedOutput: string, isHidden: boolean },
    result: Judge0ExecuteResult,
): SubmissionTestResult {
    const passed = result.status === "ACCEPTED";

    const row: SubmissionTestResult = {
        testCaseId: testCase.id,
        status: passed ? "PASSED" : "FAILED",
        executionTimeMs: result.executionTimeMs ?? undefined,
        memoryKb: result.memoryKb ?? undefined,
    };

    // Visible cases always keep I/O. Failed cases (incl. hidden) store I/O so
    // the API can reveal the first failure for debugging.
    if (!testCase.isHidden || !passed) {
        row.input = testCase.input;
        row.expectedOutput = testCase.expectedOutput;
        row.actualOutput = result.stdout ?? undefined;
    }
    return row;
}

function deriveOverallStatus(
    testResults: SubmissionTestResult[],
    lastJudge0Status: SubmissionStatus,
): SubmissionStatus {
    if (testResults.length === 0) {
        return "INTERNAL_ERROR";
    }

    const allPassed = testResults.every((row) => row.status === "PASSED");
    if (allPassed) {
        return "ACCEPTED";
    }

    return lastJudge0Status === "ACCEPTED" ? "WRONG_ANSWER" : lastJudge0Status;
}

async function updateProblemAcceptanceRate(problemId: string): Promise<void> {
    const [total, accepted] = await Promise.all([
        prisma.submission.count({
            where: { problemId, isSampleRun: false },
        }),
        prisma.submission.count({
            where: { problemId, isSampleRun: false, status: "ACCEPTED" },
        })
    ]);

    await prisma.problem.update({
        where: { id: problemId },
        data: {
            acceptanceRate: total > 0 ? (accepted / total) * 100 : null,
        },
    });
}

function toSubmissionListItem(submission: {
    id: string;
    problemId: string;
    language: ProgrammingLanguage;
    status: SubmissionStatus;
    passedTests: number;
    totalTests: number;
    isSampleRun: boolean;
    createdAt: Date;
    problem: { title: string; slug: string };
    dsaEvaluation: { id: string } | null;
}): SubmissionListItem {
    return {
        id: submission.id,
        problemId: submission.problemId,
        problemTitle: submission.problem.title,
        problemSlug: submission.problem.slug,
        language: submission.language,
        status: submission.status,
        passedTests: submission.passedTests,
        totalTests: submission.totalTests,
        isSampleRun: submission.isSampleRun,
        hasEvaluation: submission.dsaEvaluation != null,
        createdAt: submission.createdAt,
    };
}

function toSubmissionDetail(
    submission: {
        id: string;
        problemId: string;
        language: ProgrammingLanguage;
        sourceCode: string;
        status: SubmissionStatus;
        passedTests: number;
        totalTests: number;
        testResults: unknown;
        stdout: string | null;
        stderr: string | null;
        compileOutput: string | null;
        executionTimeMs: number | null;
        memoryKb: number | null;
        isSampleRun: boolean;
        createdAt: Date;
        updatedAt: Date;
        problem: {
            testCases: {
                id: string;
                isHidden: boolean;
                input: string;
                expectedOutput: string;
            }[];
        };
    },
): SubmissionDetail {
    const parsed = parseTestResultsJson(submission.testResults);
    const testResults =
        parsed != null
            ? prepareTestResultsForClient(parsed, submission.problem.testCases)
            : null;
    const isAccepted = submission.status === "ACCEPTED";
    return {
        id: submission.id,
        problemId: submission.problemId,
        language: submission.language,
        sourceCode: submission.sourceCode,
        status: submission.status,
        passedTests: submission.passedTests,
        totalTests: submission.totalTests,
        testResults,
        // Accepted runs don't need program stdout in the client.
        stdout: isAccepted ? null : submission.stdout,
        stderr: submission.stderr,
        compileOutput: submission.compileOutput,
        executionTimeMs: submission.executionTimeMs,
        memoryKb: submission.memoryKb,
        isSampleRun: submission.isSampleRun,
        createdAt: submission.createdAt,
        updatedAt: submission.updatedAt,
    };
}

export async function createSubmission(
    userId: string,
    input: CreateSubmissionInput,
    role?: Role,
): Promise<SubmissionDetail> {
    const problem = await prisma.problem.findFirst({
        where: {
            id: input.problemId,
            ...(isAdmin(role) ? {} : { isPublished: true }),
        },
        include: {
            testCases: {
                where: input.isSampleRun ? { isHidden: false } : undefined,
                orderBy: { order: "asc" },
            },
        },
    });

    if (!problem) {
        throw new SubmissionError("Problem not found", "NOT_FOUND");
    }

    if (!isAdmin(role) && !problem.isPublished) {
        throw new SubmissionError("Problem is not available", "PROBLEM_UNAVAILABLE");
    }

    if (problem.testCases.length === 0) {
        throw new SubmissionError(
            "No test cases available for this run",
            "PROBLEM_UNAVAILABLE",
        );
    }

    const submission = await prisma.submission.create({
        data: {
            userId,
            problemId: problem.id,
            language: input.language,
            sourceCode: input.sourceCode,
            status: "RUNNING",
            totalTests: problem.testCases.length,
            isSampleRun: input.isSampleRun,
        },
        include: {
            problem: {
                include: {
                    testCases: {
                        select: {
                            id: true,
                            isHidden: true,
                            input: true,
                            expectedOutput: true,
                        },
                    },
                },
            },
        },
    });

    try {
        return await runSubmissionTests(submission, problem, input);
    } catch (err) {
        const message =
            err instanceof Judge0Error
                ? err.message
                : err instanceof Error
                    ? err.message
                    : "Code execution failed";

        await prisma.submission.update({
            where: { id: submission.id },
            data: {
                status: "INTERNAL_ERROR",
                stderr: message,
            },
        });

        if (err instanceof Judge0Error) {
            throw err;
        }

        throw new Error(message);
    }
}

async function runSubmissionTests(
    submission: {
        id: string;
        problem: {
            testCases: { id: string; isHidden: boolean }[];
        };
    },
    problem: {
        id: string;
        slug: string;
        inputFormat: string | null;
        outputFormat: string | null;
        timeLimitMs: number;
        memoryLimitKb: number;
        testCases: { id: string; input: string; expectedOutput: string; isHidden: boolean }[];
    },
    input: CreateSubmissionInput,
): Promise<SubmissionDetail> {
    const signature = buildProblemSignature(
        problem.slug,
        problem.inputFormat ?? "",
        problem.outputFormat ?? "",
    );
    const wrapped = wrapSubmissionCode(input.sourceCode, input.language, signature);

    const testResults: SubmissionTestResult[] = [];
    let lastJudge0Status: SubmissionStatus = "INTERNAL_ERROR";
    let lastToken: string | null = null;
    let lastStdout: string | null = null;
    let lastStderr: string | null = null;
    let lastCompileOutput: string | null = null;
    let maxExecutionTimeMs: number | null = null;
    let maxMemoryKb: number | null = null;
    let passedTests = 0;
    let stopEarly = false;

    for (const testCase of problem.testCases) {
        const result = await executeCode({
            sourceCode: wrapped.sourceCode,
            language: input.language,
            stdin: testCase.input,
            expectedOutput: testCase.expectedOutput,
            timeLimitMs: problem.timeLimitMs,
            memoryLimitKb: problem.memoryLimitKb,
            additionalFiles: wrapped.additionalFiles,
        });

        lastJudge0Status = result.status;
        lastToken = result.token;
        lastStdout = result.stdout;
        lastStderr = result.stderr;
        lastCompileOutput = result.compileOutput;

        if (result.executionTimeMs != null) {
            maxExecutionTimeMs =
                maxExecutionTimeMs == null
                    ? result.executionTimeMs
                    : Math.max(maxExecutionTimeMs, result.executionTimeMs);
        }

        if (result.memoryKb != null) {
            maxMemoryKb =
                maxMemoryKb == null
                    ? result.memoryKb
                    : Math.max(maxMemoryKb, result.memoryKb);
        }

        const row = buildStoredTestResult(testCase, result);
        testResults.push(row);

        if (row.status === "PASSED") {
            passedTests += 1;
        }

        if (result.status === "COMPILATION_ERROR") {
            stopEarly = true;
            break;
        }

        if (result.status !== "ACCEPTED") {
            stopEarly = true;
            break;
        }
    }

    const finalStatus = stopEarly
        ? lastJudge0Status
        : deriveOverallStatus(testResults, lastJudge0Status);

    const updated = await prisma.submission.update({
        where: { id: submission.id },
        data: {
            status: finalStatus,
            passedTests,
            testResults: testResults as unknown as Prisma.InputJsonValue,
            judge0Token: lastToken,
            stdout: lastStdout,
            stderr: lastStderr,
            compileOutput: lastCompileOutput,
            executionTimeMs: maxExecutionTimeMs,
            memoryKb: maxMemoryKb,
        },
        include: {
            problem: {
                include: {
                    testCases: {
                        select: {
                            id: true,
                            isHidden: true,
                            input: true,
                            expectedOutput: true,
                        },
                    },
                },
            },
        },
    });

    if (!input.isSampleRun) {
        await updateProblemAcceptanceRate(problem.id);
    }

    return toSubmissionDetail(
        updated as Parameters<typeof toSubmissionDetail>[0],
    );
}

export async function getSubmissionById(
    submissionId: string,
    userId: string,
    role?: Role,
): Promise<SubmissionDetail> {
    const submission = await prisma.submission.findUnique({
        where: { id: submissionId },
        include: {
            problem: {
                include: {
                    testCases: {
                        select: {
                            id: true,
                            isHidden: true,
                            input: true,
                            expectedOutput: true,
                        },
                    },
                },
            },
        },
    });
    if (!submission) {
        throw new SubmissionError("Submission not found", "NOT_FOUND");
    }
    if (!isAdmin(role) && submission.userId !== userId) {
        throw new SubmissionError("Forbidden", "FORBIDDEN");
    }
    return toSubmissionDetail(submission);
}

export async function listMySubmissions(
    userId: string,
    query: ListMySubmissionsQuery,
): Promise<ListMySubmissionsResult> {
    const where = {
        userId,
        ...(query.problemId ? { problemId: query.problemId } : {}),
    };
    const skip = (query.page - 1) * query.limit;
    const [total, submissions] = await Promise.all([
        prisma.submission.count({ where }),
        prisma.submission.findMany({
            where,
            orderBy: { createdAt: "desc" },
            skip,
            take: query.limit,
            include: {
                problem: {
                    select: { title: true, slug: true },
                },
                dsaEvaluation: {
                    select: { id: true },
                },
            },
        }),
    ]);
    return {
        submissions: submissions.map(toSubmissionListItem),
        pagination: {
            page: query.page,
            limit: query.limit,
            total,
            totalPages: total === 0 ? 0 : Math.ceil(total / query.limit),
        },
    };
}