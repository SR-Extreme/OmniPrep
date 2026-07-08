import type { Response } from 'express';
import type { AuthenticatedRequest } from '../../middleware/auth.middleware.js';
import {
    BehavioralEvaluationError,
    getBehavioralEvaluation,
    requestBehavioralEvaluation,
} from './behavioral-evaluation.service.js';
import {
    BehavioralError,
    createBehavioralSession,
    getBehavioralQuestionByIdOrSlug,
    getBehavioralSessionById,
    listBehavioralQuestions,
    listMyBehavioralSessions,
} from './behavioral.service.js';
import {
    generateNextBehavioralQuestion,
    submitCandidateQuestions,
    submitTurnAnswer,
} from './behavioral-turn.service.js';
import {
    behavioralQuestionParamSchema,
    behavioralSessionParamSchema,
    behavioralTurnParamSchema,
    createBehavioralSessionBodySchema,
    listBehavioralQuestionsQuerySchema,
    listMyBehavioralSessionsQuerySchema,
    submitCandidateQuestionsBodySchema,
    submitTurnAnswerBodySchema,
} from './behavioral.validation.js';

type BehavioralSessionRequest = AuthenticatedRequest & {
    file?: Express.Multer.File;
};

function sendValidationError(res: Response, details: unknown): void {
    res.status(400).json({ error: 'Validation failed', details });
}

function handleBehavioralError(err: unknown, res: Response): void {
    if (err instanceof BehavioralError) {
        const statusByCode: Record<BehavioralError['code'], number> = {
            NOT_FOUND: 404,
            FORBIDDEN: 403,
            QUESTION_UNAVAILABLE: 404,
            INVALID_INPUT: 400,
            UPLOAD_FAILED: 502,
            CONFIG_ERROR: 503,
            PARSE_FAILED: 400,
        };
        res.status(statusByCode[err.code]).json({ error: err.message });
        return;
    }

    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
}

function handleBehavioralEvaluationError(err: unknown, res: Response): void {
    if (err instanceof BehavioralEvaluationError) {
        const statusByCode: Record<BehavioralEvaluationError['code'], number> = {
            NOT_FOUND: 404,
            FORBIDDEN: 403,
            INVALID_INPUT: 400,
            SERVICE_UNAVAILABLE: 503,
        };
        res.status(statusByCode[err.code]).json({ error: err.message });
        return;
    }
    handleBehavioralError(err, res);
}


//------------------------------------------------------------------------


function requireUserId(req: AuthenticatedRequest, res: Response): string | null {
    if (!req.user?.sub) {
        res.status(401).json({ error: 'Unauthorized' });
        return null;
    }

    return req.user.sub;
}

export async function listBehavioralQuestionsHandler(
    req: AuthenticatedRequest,
    res: Response,
): Promise<void> {
    const parsed = listBehavioralQuestionsQuerySchema.safeParse(req.query);

    if (!parsed.success) {
        sendValidationError(res, parsed.error.flatten().fieldErrors);
        return;
    }

    try {
        const result = await listBehavioralQuestions(parsed.data, req.user?.role);
        res.status(200).json(result);
    } catch (err) {
        handleBehavioralError(err, res);
    }
}

export async function getBehavioralQuestionHandler(
    req: AuthenticatedRequest,
    res: Response,
): Promise<void> {
    const parsed = behavioralQuestionParamSchema.safeParse(req.params);

    if (!parsed.success) {
        sendValidationError(res, parsed.error.flatten().fieldErrors);
        return;
    }

    try {
        const question = await getBehavioralQuestionByIdOrSlug(
            parsed.data.idOrSlug,
            req.user?.role,
        );

        res.status(200).json({ question });
    } catch (err) {
        handleBehavioralError(err, res);
    }
}

export async function createBehavioralSessionHandler(
    req: BehavioralSessionRequest,
    res: Response,
): Promise<void> {
    const parsed = createBehavioralSessionBodySchema.safeParse(req.body);

    if (!parsed.success) {
        sendValidationError(res, parsed.error.flatten().fieldErrors);
        return;
    }

    const userId = requireUserId(req, res);

    if (!userId) {
        return;
    }

    if (!req.file) {
        res.status(400).json({ error: 'Resume PDF is required.' });
        return;
    }

    const resumeFile = {
        buffer: req.file.buffer,
        mimetype: req.file.mimetype,
        originalname: req.file.originalname,
    };

    try {
        const session = await createBehavioralSession(
            userId,
            parsed.data,
            resumeFile,
            req.user?.role,
        );
        res.status(201).json({ session });
    } catch (err) {
        handleBehavioralError(err, res);
    }
}

export async function getBehavioralSessionHandler(
    req: AuthenticatedRequest,
    res: Response,
): Promise<void> {
    const parsed = behavioralSessionParamSchema.safeParse(req.params);

    if (!parsed.success) {
        sendValidationError(res, parsed.error.flatten().fieldErrors);
        return;
    }

    const userId = requireUserId(req, res);

    if (!userId) {
        return;
    }

    try {
        const session = await getBehavioralSessionById(
            parsed.data.id,
            userId,
            req.user?.role,
        );
        res.status(200).json({ session });
    } catch (err) {
        handleBehavioralError(err, res);
    }
}

export async function listMyBehavioralSessionsHandler(
    req: AuthenticatedRequest,
    res: Response,
): Promise<void> {
    const parsed = listMyBehavioralSessionsQuerySchema.safeParse(req.query);

    if (!parsed.success) {
        sendValidationError(res, parsed.error.flatten().fieldErrors);
        return;
    }

    const userId = requireUserId(req, res);
    if (!userId) {
        return;
    }

    try {
        const result = await listMyBehavioralSessions(userId, parsed.data);
        res.status(200).json(result);
    } catch (err) {
        handleBehavioralError(err, res);
    }
}

export async function generateNextBehavioralQuestionHandler(
    req: AuthenticatedRequest,
    res: Response,
): Promise<void> {
    const parsed = behavioralSessionParamSchema.safeParse(req.params);

    if (!parsed.success) {
        sendValidationError(res, parsed.error.flatten().fieldErrors);
        return;
    }

    const userId = requireUserId(req, res);

    if (!userId) {
        return;
    }

    try {
        const session = await generateNextBehavioralQuestion(
            parsed.data.id,
            userId,
            req.user?.role,
        );
        res.status(200).json({ session });
    } catch (err) {
        handleBehavioralError(err, res);
    }
}

export async function submitTurnAnswerHandler(
    req: AuthenticatedRequest,
    res: Response,
): Promise<void> {
    const paramParsed = behavioralTurnParamSchema.safeParse(req.params);
    const bodyParsed = submitTurnAnswerBodySchema.safeParse(req.body);

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
        const session = await submitTurnAnswer(
            paramParsed.data.id,
            paramParsed.data.turnId,
            userId,
            bodyParsed.data,
            req.user?.role,
        );
        res.status(200).json({ session });
    } catch (err) {
        handleBehavioralError(err, res);
    }
}

export async function submitCandidateQuestionsHandler(
    req: AuthenticatedRequest,
    res: Response,
): Promise<void> {
    const paramParsed = behavioralSessionParamSchema.safeParse(req.params);
    const bodyParsed = submitCandidateQuestionsBodySchema.safeParse(req.body);

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
        const session = await submitCandidateQuestions(
            paramParsed.data.id,
            userId,
            bodyParsed.data,
            req.user?.role,
        );
        res.status(200).json({ session });
    } catch (err) {
        handleBehavioralError(err, res);
    }
}

export async function requestBehavioralEvaluationHandler(
    req: AuthenticatedRequest,
    res: Response,
): Promise<void> {
    const parsed = behavioralSessionParamSchema.safeParse(req.params);

    if (!parsed.success) {
        sendValidationError(res, parsed.error.flatten().fieldErrors);
        return;
    }

    const userId = requireUserId(req, res);

    if (!userId) {
        return;
    }

    try {
        const result = await requestBehavioralEvaluation(
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
        handleBehavioralEvaluationError(err, res);
    }
}

export async function getBehavioralEvaluationHandler(
    req: AuthenticatedRequest,
    res: Response,
): Promise<void> {
    const parsed = behavioralSessionParamSchema.safeParse(req.params);

    if (!parsed.success) {
        sendValidationError(res, parsed.error.flatten().fieldErrors);
        return;
    }

    const userId = requireUserId(req, res);

    if (!userId) {
        return;
    }

    try {
        const result = await getBehavioralEvaluation(
            parsed.data.id,
            userId,
            req.user?.role,
        );
        res.status(200).json(result);
    } catch (err) {
        handleBehavioralEvaluationError(err, res);
    }
}