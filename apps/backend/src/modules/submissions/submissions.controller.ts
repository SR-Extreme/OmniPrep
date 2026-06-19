import type { Response } from "express";
import type { AuthenticatedRequest } from "../../middleware/auth.middleware.js";
import { Judge0Error } from "../../services/Judge0Service.js";
import {
    createSubmission,
    getSubmissionById,
    listMySubmissions,
    SubmissionError,
} from "./submissions.service.js";
import {
    createSubmissionSchema,
    listMySubmissionsQuerySchema,
    submissionParamSchema,
} from "./submissions.validation.js";

function sendValidationError(res: Response, details: unknown): void {
    res.status(400).json({ error: "Validation failed", details });
}

function handleSubmissionError(err: unknown, res: Response) {
    if (err instanceof SubmissionError) {
        const statusByCode: Record<SubmissionError["code"], number> = {
            NOT_FOUND: 404,
            FORBIDDEN: 403,
            PROBLEM_UNAVAILABLE: 404,
        };

        res.status(statusByCode[err.code]).json({ error: err.message });
        return;
    }

    if (err instanceof Judge0Error) {
        const statusByCode: Record<Judge0Error["code"], number> = {
            SUBMIT_FAILED: 502,
            POLL_FAILED: 502,
            TIMEOUT: 504,
            INVALID_RESPONSE: 502,
        };
        res.status(statusByCode[err.code]).json({ error: err.message });
        return;
    }

    console.error(err);
    res.status(500).json({ error: "Internal server error" });
}

//-------------------------------------------------------------------

export async function createSubmissionHandler(
    req: AuthenticatedRequest,
    res: Response,
): Promise<void> {
    const parsed = createSubmissionSchema.safeParse(req.body);

    if (!parsed.success) {
        sendValidationError(res, parsed.error.flatten().fieldErrors);
        return;
    }

    if (!req.user?.sub) {
        res.status(401).json({ error: "Unauthorized" });
        return;
    }

    try {
        const submission = await createSubmission(
            req.user.sub,
            parsed.data,
            req.user.role,
        );
        res.status(201).json({ submission });
    } catch (err) {
        handleSubmissionError(err, res);
    }
}

export async function getSubmissionHandler(
    req: AuthenticatedRequest,
    res: Response,
): Promise<void> {
    const parsed = submissionParamSchema.safeParse(req.params);

    if (!parsed.success) {
        sendValidationError(res, parsed.error.flatten().fieldErrors);
        return;
    }

    if (!req.user?.sub) {
        res.status(401).json({ error: "Unauthorized" });
        return;
    }

    try {
        const submission = await getSubmissionById(
            parsed.data.id,
            req.user.sub,
            req.user.role,
        );
        res.status(200).json({ submission });
    } catch (err) {
        handleSubmissionError(err, res);
    }
}

export async function listMySubmissionHandler(
    req: AuthenticatedRequest,
    res: Response,
): Promise<void> {
    const parsed = listMySubmissionsQuerySchema.safeParse(req.query);

    if (!parsed.success) {
        sendValidationError(res, parsed.error.flatten().fieldErrors);
        return;
    }
    if (!req.user?.sub) {
        res.status(401).json({ error: "Unauthorized" });
        return;
    }

    try {
        const result = await listMySubmissions(req.user.sub, parsed.data);
        res.status(200).json(result);
    } catch (err) {
        handleSubmissionError(err, res);
    }
}





