import { apiRequest } from "./client";
import type {
    CreateSubmissionInput,
    CreateSubmissionResponse,
    GetSubmissionResponse,
    ListMySubmissionsQuery,
    ListMySubmissionsResult,
} from "@/types/dsa";


function buildSubmissionsQueryString(query: ListMySubmissionsQuery): string {
    const params = new URLSearchParams();
    if (query.problemId) {
        params.set("problemId", query.problemId);
    }
    if (query.page != null) {
        params.set("page", String(query.page));
    }
    if (query.limit != null) {
        params.set("limit", String(query.limit));
    }
    const qs = params.toString();
    return qs ? `?${qs}` : "";
}

export function createSubmission(
    accessToken: string,
    body: CreateSubmissionInput,
): Promise<CreateSubmissionResponse> {
    return apiRequest<CreateSubmissionResponse>(
        "/api/submissions", {
        method: "POST",
        body,
        token: accessToken,
    }
    );
}

export function getSubmission(
    accessToken: string,
    id: string,
): Promise<GetSubmissionResponse> {
    return apiRequest<GetSubmissionResponse>(
        `/api/submissions/${encodeURIComponent(id)}`,
        { token: accessToken },
    );
}

export function listMySubmissions(
    accessToken: string,
    query: ListMySubmissionsQuery = {},
): Promise<ListMySubmissionsResult> {
    return apiRequest<ListMySubmissionsResult>(
        `/api/submissions/me${buildSubmissionsQueryString(query)}`,
        { token: accessToken },
    );
}
