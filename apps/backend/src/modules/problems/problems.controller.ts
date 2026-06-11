import type { Response } from "express";
import type { AuthenticatedRequest } from "../../middleware/auth.middleware.js";
import { getProblemByIdOrSlug, listProblems, ProblemError } from "./problems.service.js";
import { listProblemsQuerySchema, problemParamSchema } from "./problems.validation.js";

function sendValidationError(res: Response, details: unknown): void {
    res.status(400).json({ error: "Validation failed", details });
}

function handleProblemError(err: unknown, res: Response): void {
    if (err instanceof ProblemError) {
        const statusByCode: Record<ProblemError["code"], number> = {
            NOT_FOUND: 404,
        }
        res.status(statusByCode[err.code]).json({ error: err.message });
        return;
    }

    console.log(err);
    res.status(500).json({ error: "Internal server error" });
}

export async function listProblemsHandler(
    req: AuthenticatedRequest,
    res: Response,
): Promise<void> {
    const parsed = listProblemsQuerySchema.safeParse(req.query);
    if (!parsed.success) {
        sendValidationError(res, parsed.error.flatten().fieldErrors);
        return;
    }
    try {
        const result = await listProblems(parsed.data, req.user?.role);
        res.status(200).json(result);
    } catch (err) {
        handleProblemError(err, res);
    }
}

export async function getProblemHandler(
    req: AuthenticatedRequest,
    res: Response,
): Promise<void> {
    const parsed = problemParamSchema.safeParse(req.params);

    if (!parsed.success) {
        sendValidationError(res, parsed.error.flatten().fieldErrors);
        return;
    }

    try {
        const problem = await getProblemByIdOrSlug(parsed.data.idOrSlug, req.user?.role);
        res.status(200).json({ problem });
    } catch (err) {
        handleProblemError(err, res);
    }
}