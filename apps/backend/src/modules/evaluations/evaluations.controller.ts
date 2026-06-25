import type { Response } from 'express';
import type { AuthenticatedRequest } from '../../middleware/auth.middleware.js';
import {
    EvaluationError,
    getDSAEvaluation,
    requestDSAEvaluation,
} from './evaluations.service.js';
import { evaluationSubmissionParamSchema } from './evaluations.validation.js';

function sendValidationError(res: Response, details: unknown): void {
    res.status(400).json({ error: 'Validation failed', details });
}

function handleEvaluationError(res: Response, err: unknown): void {
    if (err instanceof EvaluationError) {
        const statusByCode: Record<EvaluationError['code'], number> = {
            NOT_FOUND: 404,
            FORBIDDEN: 403,
            SAMPLE_RUN_NOT_ALLOWED: 400,
            SERVICE_UNAVAILABLE: 503,
        };

        res.status(statusByCode[err.code]).json({ error: err.message });
        return;
    }

    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
}

export async function requestDSAEvaluationHandler(
    req: AuthenticatedRequest,
    res: Response,
): Promise<void> {
    const parsed = evaluationSubmissionParamSchema.safeParse(req.params);

    if (!parsed.success) {
        sendValidationError(res, parsed.error.flatten().fieldErrors);
        return;
    }

    if (!req.user?.sub) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }

    try {
        const result = await requestDSAEvaluation(
            parsed.data.submissionId,
            req.user.sub,
            req.user.role,
        );

        if (result.status === 'pending') {
            res.status(202).json(result);
            return;
        }

        res.status(200).json(result);
    } catch (err) {
        handleEvaluationError(res, err);
    }
}

export async function getDSAEvaluationHandler(
    req: AuthenticatedRequest,
    res: Response,
): Promise<void> {
    const parsed = evaluationSubmissionParamSchema.safeParse(req.params);

    if (!parsed.success) {
        sendValidationError(res, parsed.error.flatten().fieldErrors);
        return;
    }

    if (!req.user?.sub) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }

    try {
        const result = await getDSAEvaluation(
            parsed.data.submissionId,
            req.user.sub,
            req.user.role,
        );

        res.status(200).json(result);
    } catch (err) {
        handleEvaluationError(res, err);
    }
}