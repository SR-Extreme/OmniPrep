import type { SubmissionStatus } from "@prisma/client";
import { env } from "../config/env.js";
import type { ProgrammingLanguage } from "../types/dsa.types.js";
import { judge0LanguageId } from "../types/dsa.types.js";

export class Judge0Error extends Error {
    constructor(
        message: string,
        public readonly code:
            | "SUBMIT_FAILED"
            | "POLL_FAILED"
            | "TIMEOUT"
            | "INVALID_RESPONSE",
    ) {
        super(message);
        this.name = "Judge0Error";
    }
}

export interface Judge0ExecuteInput {
    sourceCode: string;
    language: ProgrammingLanguage;
    stdin?: string;
    expectedOutput?: string;
    timeLimitMs: number;
    memoryLimitKb: number;
}

export interface Judge0ExecuteResult {
    token: string;
    status: SubmissionStatus;
    statusId: number;
    statusDescription: string;
    stdout: string | null;
    stderr: string | null;
    compileOutput: string | null;
    executionTimeMs: number | null;
    memoryKb: number | null;
}

interface Judge0SubmissionResponse {
    token?: string;
    status?: { id?: number; description?: string };
    stdout?: string | null;
    stderr?: string | null;
    compile_output?: string | null;
    time?: string | null;
    memory?: number | null;
    message?: string;
}

const JUDGE0_AUTH_HEADER = "X-Auth-Token";
const POLL_INTERVAL_MS = 500;
const MAX_POLL_ATTEMPTS = 120;

function judge0BaseUrl(): string {
    return env.JUDGE0_BASE_URL.replace(/\/$/, "");
}

function judge0Headers(): Record<string, string> {
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };
    if (env.JUDGE0_API_KEY) {
        headers[JUDGE0_AUTH_HEADER] = env.JUDGE0_API_KEY;
    }
    return headers;
}

function parseJudge0Response(data: unknown): Judge0SubmissionResponse {
    if (!data || typeof data !== "object") {
        throw new Judge0Error("Invalid Judge0 response", "INVALID_RESPONSE");
    }
    return data as Judge0SubmissionResponse;
}

export function mapJudge0StatusToSubmissionStatus(statusId: number): SubmissionStatus {
    switch (statusId) {
        case 3:
            return "ACCEPTED";
        case 4:
            return "WRONG_ANSWER";
        case 5:
            return "TIME_LIMIT_EXCEEDED";
        case 6:
            return "COMPILATION_ERROR";
        case 7:
        case 8:
        case 9:
        case 10:
        case 11:
        case 12:
        case 14:
            return "RUNTIME_ERROR";
        case 13:
        case 17:
        case 18:
            return "INTERNAL_ERROR";
        case 15:
        case 20:
            return "MEMORY_LIMIT_EXCEEDED";
        case 1:
        case 2:
            return "RUNNING";
        default:
            return "INTERNAL_ERROR";
    }
}

///Converts raw Judge0 JSON into your application's format.
function toExecuteResult(
    token: string,
    data: Judge0SubmissionResponse,
): Judge0ExecuteResult {
    const statusId = data.status?.id ?? 0;
    const executionTimeMs =
        data.time != null && data.time !== "" ? parseFloat(data.time) * 1000 : null;
    return {
        token,
        status: mapJudge0StatusToSubmissionStatus(statusId),
        statusId,
        statusDescription: data.status?.description ?? "Unknown",
        stdout: data.stdout ?? null,
        stderr: data.stderr ?? null,
        compileOutput: data.compile_output ?? null,
        executionTimeMs:
            executionTimeMs != null && Number.isFinite(executionTimeMs)
                ? executionTimeMs
                : null,
        memoryKb: data.memory ?? null,
    };
}

//Converts your input into Judge0's expected request format.
function buildSubmissionBody(input: Judge0ExecuteInput): Record<string, unknown> {
    const cpuTimeLimitSec = Math.max(input.timeLimitMs / 1000, 0.1);
    const body: Record<string, unknown> = {
        source_code: input.sourceCode,
        language_id: judge0LanguageId(input.language),
        cpu_time_limit: cpuTimeLimitSec,
        wall_time_limit: cpuTimeLimitSec * 3,
        memory_limit: input.memoryLimitKb,
    };
    if (input.stdin !== undefined) {
        body.stdin = input.stdin;
    }
    if (input.expectedOutput !== undefined) {
        body.expected_output = input.expectedOutput;
    }
    return body;
}

//Submits code to Judge0. (wait is a field of judge0 and give answer accordingly).
async function createSubmission(
    input: Judge0ExecuteInput,
    wait: boolean,
): Promise<Judge0ExecuteResult> {
    const url = `${judge0BaseUrl()}/submissions?base64_encoded=false&wait=${wait}`;
    const response = await fetch(url, {
        method: "POST",
        headers: judge0Headers(),
        body: JSON.stringify(buildSubmissionBody(input)),
    });
    if (!response.ok) {
        const text = await response.text();
        throw new Judge0Error(
            `Judge0 submit failed (${response.status}): ${text}`,
            "SUBMIT_FAILED",
        );
    }
    const data = parseJudge0Response(await response.json());
    const token = data.token;
    if (!token) {
        throw new Judge0Error("Judge0 response missing token", "INVALID_RESPONSE");
    }
    if (wait) {
        return toExecuteResult(token, data);
    }
    return pollSubmission(token);
}

//Fetch status/result of an existing submission.
async function fetchSubmission(token: string): Promise<Judge0SubmissionResponse> {
    const url = `${judge0BaseUrl()}/submissions/${token}?base64_encoded=false`;
    const response = await fetch(url, {
        method: "GET",
        headers: judge0Headers(),
    });
    if (!response.ok) {
        const text = await response.text();
        throw new Judge0Error(
            `Judge0 poll failed (${response.status}): ${text}`,
            "POLL_FAILED",
        );
    }
    return parseJudge0Response(await response.json());
}

//Waits until Judge0 finishes execution.
export async function pollSubmission(token: string): Promise<Judge0ExecuteResult> {
    for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
        const data = await fetchSubmission(token);
        const statusId = data.status?.id ?? 0;
        if (statusId > 2) {
            return toExecuteResult(token, data);
        }
        //used for halting execution for 500ms
        await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
    }
    throw new Judge0Error("Judge0 execution timed out", "TIMEOUT");
}

//Simple API for running code immediately.
export async function executeCode(input: Judge0ExecuteInput): Promise<Judge0ExecuteResult> {
    return createSubmission(input, true);
}

//Submit code and return only the token.
export async function submitCode(input: Judge0ExecuteInput): Promise<string> {
    const url = `${judge0BaseUrl()}/submissions?base64_encoded=false&wait=false`;
    const response = await fetch(url, {
        method: "POST",
        headers: judge0Headers(),
        body: JSON.stringify(buildSubmissionBody(input)),
    });
    if (!response.ok) {
        const text = await response.text();
        throw new Judge0Error(
            `Judge0 submit failed (${response.status}): ${text}`,
            "SUBMIT_FAILED",
        );
    }
    const data = parseJudge0Response(await response.json());
    if (!data.token) {
        throw new Judge0Error("Judge0 response missing token", "INVALID_RESPONSE");
    }
    return data.token;
}