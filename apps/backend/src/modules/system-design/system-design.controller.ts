import type { Response } from 'express';
import type { AuthenticatedRequest } from '../../middleware/auth.middleware.js';
import {
    SystemDesignEvaluationError,
    getSystemDesignEvaluation,
    requestSystemDesignEvaluation,
} from './system-design-evaluation.service.js';
import {
    generateSystemDesignFollowUpQuestions,
    submitSystemDesignFollowUpAnswers,
} from './system-design-follow-up.service.js';
import {
    SystemDesignError,
    createSystemDesignSubmission,
    getSystemDesignQuestionByIdOrSlug,
    getSystemDesignSubmissionById,
    listMySystemDesignSubmissions,
    listSystemDesignQuestions,
} from './system-design.service.js';
import {
    createSystemDesignSubmissionBodySchema,
    listMySystemDesignSubmissionsQuerySchema,
    listSystemDesignQuestionsQuerySchema,
    submitFollowUpAnswersBodySchema,
    systemDesignQuestionParamSchema,
    systemDesignSubmissionParamSchema,
} from './system-design.validation.js';

type SystemDesignSubmissionRequest = AuthenticatedRequest & {
    file?: Express.Multer.File;
}

function sendValidationError(res: Response, details: unknown): void {
    res.status(400).json({ error: 'Validation failed', details });
}

function handleSystemDesignError(err: unknown, res: Response): void {
    if (err instanceof SystemDesignError) {
        const statusByCode: Record<SystemDesignError['code'], number> = {
            NOT_FOUND: 404,
            FORBIDDEN: 403,
            QUESTION_UNAVAILABLE: 404,
            INVALID_INPUT: 400,
            UPLOAD_FAILED: 502,
            CONFIG_ERROR: 503,
        };

        res.status(statusByCode[err.code]).json({ error: err.message });
        return;
    }

    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
}

function handleSystemDesignEvaluationError(err: unknown, res: Response): void {
    if (err instanceof SystemDesignEvaluationError) {
        const statusByCode: Record<SystemDesignEvaluationError['code'], number> = {
            NOT_FOUND: 404,
            FORBIDDEN: 403,
            INVALID_INPUT: 400,
            SERVICE_UNAVAILABLE: 503,
        };

        res.status(statusByCode[err.code]).json({ error: err.message });
        return;
    }

    handleSystemDesignError(err, res);
}

function requireUserId(req: AuthenticatedRequest, res: Response): string | null {
    if (!req.user?.sub) {
        res.status(401).json({ error: 'Unauthorized' });
        return null;
    }
    return req.user.sub;
}

//------------------------------------------------------------------

export async function listSystemDesignQuestionsHandler(
    req: AuthenticatedRequest,
    res: Response,
): Promise<void> {
    const parsed = listSystemDesignQuestionsQuerySchema.safeParse(req.query);

    if (!parsed.success) {
        sendValidationError(res, parsed.error.flatten().fieldErrors);
        return;
    }

    try {
        const result = await listSystemDesignQuestions(parsed.data, req.user?.role);
        res.status(200).json(result);
    } catch (err) {
        handleSystemDesignError(err, res);
    }
}

export async function getSystemDesignQuestionHandler(
    req: AuthenticatedRequest,
    res: Response,
): Promise<void> {
    const parsed = systemDesignQuestionParamSchema.safeParse(req.params);

    if (!parsed.success) {
        sendValidationError(res, parsed.error.flatten().fieldErrors);
        return;
    }

    try {
        const question = await getSystemDesignQuestionByIdOrSlug(
            parsed.data.idOrSlug,
            req.user?.role,
        );
        res.status(200).json({ question });
    } catch (err) {
        handleSystemDesignError(err, res);
    }
}

export async function createSystemDesignSubmissionHandler(
    req: SystemDesignSubmissionRequest,
    res: Response,
): Promise<void> {
    const parsed = createSystemDesignSubmissionBodySchema.safeParse(req.body);

    if (!parsed.success) {
        sendValidationError(res, parsed.error.flatten().fieldErrors);
        return;
    }

    const userId = requireUserId(req, res);

    if (!userId) {
        return;
    }

    const diagramFile = req.file
        ? {
            buffer: req.file.buffer,
            mimetype: req.file.mimetype,
            originalname: req.file.originalname,
        }
        : null;

    try {
        const submission = await createSystemDesignSubmission(
            userId,
            parsed.data,
            diagramFile,
            req.user?.role,
        );
        res.status(201).json({ submission });
    } catch (err) {
        handleSystemDesignError(err, res);
    }
}

export async function getSystemDesignSubmissionHandler(
    req: AuthenticatedRequest,
    res: Response,
): Promise<void> {
    const parsed = systemDesignSubmissionParamSchema.safeParse(req.params);

    if (!parsed.success) {
        sendValidationError(res, parsed.error.flatten().fieldErrors);
        return;
    }

    const userId = requireUserId(req, res);

    if (!userId) {
        return;
    }

    try {
        const submission = await getSystemDesignSubmissionById(
            parsed.data.id,
            userId,
            req.user?.role,
        );
        res.status(200).json({ submission });
    } catch (err) {
        handleSystemDesignError(err, res);
    }
}

export async function listMySystemDesignSubmissionsHandler(
    req: AuthenticatedRequest,
    res: Response,
): Promise<void> {
    const parsed = listMySystemDesignSubmissionsQuerySchema.safeParse(req.query);

    if (!parsed.success) {
        sendValidationError(res, parsed.error.flatten().fieldErrors);
        return;
    }

    const userId = requireUserId(req, res);

    if (!userId) {
        return;
    }

    try {
        const result = await listMySystemDesignSubmissions(userId, parsed.data);
        res.status(200).json(result);
    } catch (err) {
        handleSystemDesignError(err, res);
    }
}

export async function generateSystemDesignFollowUpQuestionsHandler(
    req: AuthenticatedRequest,
    res: Response,
): Promise<void> {
    const parsed = systemDesignSubmissionParamSchema.safeParse(req.params);

    if (!parsed.success) {
        sendValidationError(res, parsed.error.flatten().fieldErrors);
        return;
    }

    const userId = requireUserId(req, res);

    if (!userId) {
        return;
    }

    try {
        const submission = await generateSystemDesignFollowUpQuestions(
            parsed.data.id,
            userId,
            req.user?.role,
        );
        res.status(200).json({ submission });
    } catch (err) {
        handleSystemDesignError(err, res);
    }
}

export async function submitSystemDesignFollowUpAnswersHandler(
    req: AuthenticatedRequest,
    res: Response,
): Promise<void> {
    const paramParsed = systemDesignSubmissionParamSchema.safeParse(req.params);
    const bodyParsed = submitFollowUpAnswersBodySchema.safeParse(req.body);

    if (!paramParsed.success) {
        sendValidationError(res, paramParsed.error.flatten().fieldErrors);
        return;
    }

    if (!bodyParsed.success) {
        sendValidationError(res, bodyParsed.error.flatten().fieldErrors);
        return;
    }

    const userId = requireUserId(req, res);
    if (!userId) {
        return;
    }

    try {
        const submission = await submitSystemDesignFollowUpAnswers(
            paramParsed.data.id,
            userId,
            bodyParsed.data,
            req.user?.role,
        );
        res.status(200).json({ submission });
    } catch (err) {
        handleSystemDesignError(err, res);
    }
}

export async function requestSystemDesignEvaluationHandler(
    req: AuthenticatedRequest,
    res: Response,
): Promise<void> {
    const parsed = systemDesignSubmissionParamSchema.safeParse(req.params);

    if (!parsed.success) {
        sendValidationError(res, parsed.error.flatten().fieldErrors);
        return;
    }

    const userId = requireUserId(req, res);
    if (!userId) {
        return;
    }

    try {
        const result = await requestSystemDesignEvaluation(
            parsed.data.id,
            userId,
            req.user?.role,
        );

        if (result.status === 'pending') {
            res.status(202).json(result);
            return;
        }

        res.status(200).json(result);
    } catch (err) {
        handleSystemDesignEvaluationError(err, res);
    }
}

export async function getSystemDesignEvaluationHandler(
    req: AuthenticatedRequest,
    res: Response,
): Promise<void> {
    const parsed = systemDesignSubmissionParamSchema.safeParse(req.params);

    if (!parsed.success) {
        sendValidationError(res, parsed.error.flatten().fieldErrors);
        return;
    }

    const userId = requireUserId(req, res);
    if (!userId) {
        return;
    }

    try {
        const result = await getSystemDesignEvaluation(
            parsed.data.id,
            userId,
            req.user?.role,
        );

        res.status(200).json(result);
    } catch (err) {
        handleSystemDesignEvaluationError(err, res);
    }
}