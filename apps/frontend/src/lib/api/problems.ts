import { apiRequest } from "./client";
import type { GetProblemResponse, ListProblemsQuery, ListProblemsResult } from "@/types/dsa";

function buildProblemsQueryString(query: ListProblemsQuery): string {
    const params = new URLSearchParams();

    if (query.difficulty) {
        params.set("difficulty", query.difficulty);
    }
    if (query.topic) {
        params.set("topic", query.topic);
    }
    if (query.search) {
        params.set("search", query.search);
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

export function listProblems(
    accessToken: string,
    query: ListProblemsQuery = {},
): Promise<ListProblemsResult> {
    return apiRequest<ListProblemsResult>(
        `/api/problems${buildProblemsQueryString(query)}`,
        { token: accessToken },
    );
}

export function getProblem(
    accessToken: string,
    idOrSlug: string,
): Promise<GetProblemResponse> {
    return apiRequest<GetProblemResponse>(
        `/api/problems/${encodeURIComponent(idOrSlug)}`,
        { token: accessToken },
    );
}