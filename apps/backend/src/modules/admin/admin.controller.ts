import type { Response } from 'express';
import type { AuthenticatedRequest } from '../../middleware/auth.middleware.js';
import {
    getMockAnalytics,
    getRevenueDashboard,
} from './admin-analytics.service.js';
import {
    AdminQuestionsError,
    createBehavioralQuestion,
    createDsaQuestion,
    createSystemDesignQuestion,
    deleteBehavioralQuestion,
    deleteDsaQuestion,
    deleteSystemDesignQuestion,
    getBehavioralQuestion,
    getDsaQuestion,
    getSystemDesignQuestion,
    listBehavioralQuestions,
    listDsaQuestions,
    listSystemDesignQuestions,
    publishBehavioralQuestion,
    publishDsaQuestion,
    publishSystemDesignQuestion,
    updateBehavioralQuestion,
    updateDsaQuestion,
    updateSystemDesignQuestion,
} from './admin-questions.service.js';
import {
    AdminUsersError,
    deleteAdminUser,
    getAdminProfile,
    listAdminUsers,
} from './admin-users.service.js';
import {
    adminQuestionParamSchema,
    adminUserParamSchema,
    createBehavioralQuestionBodySchema,
    createDsaQuestionBodySchema,
    createSystemDesignQuestionBodySchema,
    listAdminQuestionsQuerySchema,
    listAdminUsersQuerySchema,
    publishQuestionBodySchema,
    revenueDashboardQuerySchema,
    updateBehavioralQuestionBodySchema,
    updateDsaQuestionBodySchema,
    updateSystemDesignQuestionBodySchema,
} from './admin.validation.js';

function sendValidationError(res: Response, details: unknown): void {
    res.status(400).json({ error: 'Validation failed', details });
}

function handleAdminError(err: unknown, res: Response): void {
    if (err instanceof AdminQuestionsError) {
        const statusByCode: Record<AdminQuestionsError['code'], number> = {
            NOT_FOUND: 404,
            CONFLICT: 409,
            INVALID_STATE: 409,
        };
        res.status(statusByCode[err.code]).json({
            error: err.message,
            code: err.code,
        });
        return;
    }

    if (err instanceof AdminUsersError) {
        const statusByCode: Record<AdminUsersError['code'], number> = {
            NOT_FOUND: 404,
            FORBIDDEN: 403,
            INVALID_STATE: 409,
        };
        res.status(statusByCode[err.code]).json({
            error: err.message,
            code: err.code,
        });
        return;
    }

    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
}

function requireUserId(
    req: AuthenticatedRequest,
    res: Response,
): string | null {
    if (!req.user?.sub) {
        res.status(401).json({ error: 'Unauthorized' });
        return null;
    }
    return req.user.sub;
}

export async function getRevenueDashboardHandler(
    req: AuthenticatedRequest,
    res: Response,
): Promise<void> {
    const parsed = revenueDashboardQuerySchema.safeParse(req.query);
    if (!parsed.success) {
        sendValidationError(res, parsed.error.flatten().fieldErrors);
        return;
    }

    try {
        const dashboard = await getRevenueDashboard(parsed.data.range);
        res.status(200).json(dashboard);
    } catch (err) {
        handleAdminError(err, res);
    }
}

export async function getMockAnalyticsHandler(
    _req: AuthenticatedRequest,
    res: Response,
): Promise<void> {
    try {
        const analytics = await getMockAnalytics();
        res.status(200).json(analytics);
    } catch (err) {
        handleAdminError(err, res);
    }
}

export async function listAdminUsersHandler(
    req: AuthenticatedRequest,
    res: Response,
): Promise<void> {
    const parsed = listAdminUsersQuerySchema.safeParse(req.query);
    if (!parsed.success) {
        sendValidationError(res, parsed.error.flatten().fieldErrors);
        return;
    }

    try {
        const result = await listAdminUsers(parsed.data);
        res.status(200).json(result);
    } catch (err) {
        handleAdminError(err, res);
    }
}

export async function getAdminProfileHandler(
    req: AuthenticatedRequest,
    res: Response,
): Promise<void> {
    const userId = requireUserId(req, res);
    if (!userId) {
        return;
    }

    try {
        const profile = await getAdminProfile(userId);
        res.status(200).json(profile);
    } catch (err) {
        handleAdminError(err, res);
    }
}

export async function deleteAdminUserHandler(
    req: AuthenticatedRequest,
    res: Response,
): Promise<void> {
    const actorId = requireUserId(req, res);
    if (!actorId) {
        return;
    }

    const parsedParams = adminUserParamSchema.safeParse(req.params);
    if (!parsedParams.success) {
        sendValidationError(res, parsedParams.error.flatten().fieldErrors);
        return;
    }

    try {
        await deleteAdminUser(actorId, parsedParams.data.userId);
        res.status(204).send();
    } catch (err) {
        handleAdminError(err, res);
    }
}

export async function listDsaQuestionsHandler(
    req: AuthenticatedRequest,
    res: Response,
): Promise<void> {
    const parsed = listAdminQuestionsQuerySchema.safeParse(req.query);
    if (!parsed.success) {
        sendValidationError(res, parsed.error.flatten().fieldErrors);
        return;
    }

    try {
        const result = await listDsaQuestions(parsed.data);
        res.status(200).json(result);
    } catch (err) {
        handleAdminError(err, res);
    }
}

export async function getDsaQuestionHandler(
    req: AuthenticatedRequest,
    res: Response,
): Promise<void> {
    const parsedParams = adminQuestionParamSchema.safeParse(req.params);
    if (!parsedParams.success) {
        sendValidationError(res, parsedParams.error.flatten().fieldErrors);
        return;
    }

    try {
        const question = await getDsaQuestion(parsedParams.data.questionId);
        res.status(200).json({ question });
    } catch (err) {
        handleAdminError(err, res);
    }
}

export async function createDsaQuestionHandler(
    req: AuthenticatedRequest,
    res: Response,
): Promise<void> {
    const parsed = createDsaQuestionBodySchema.safeParse(req.body);
    if (!parsed.success) {
        sendValidationError(res, parsed.error.flatten().fieldErrors);
        return;
    }

    try {
        const question = await createDsaQuestion(parsed.data);
        res.status(201).json({ question });
    } catch (err) {
        handleAdminError(err, res);
    }
}

export async function updateDsaQuestionHandler(
    req: AuthenticatedRequest,
    res: Response,
): Promise<void> {
    const parsedParams = adminQuestionParamSchema.safeParse(req.params);
    if (!parsedParams.success) {
        sendValidationError(res, parsedParams.error.flatten().fieldErrors);
        return;
    }

    const parsedBody = updateDsaQuestionBodySchema.safeParse(req.body);
    if (!parsedBody.success) {
        sendValidationError(res, parsedBody.error.flatten().fieldErrors);
        return;
    }

    try {
        const question = await updateDsaQuestion(
            parsedParams.data.questionId,
            parsedBody.data,
        );
        res.status(200).json({ question });
    } catch (err) {
        handleAdminError(err, res);
    }
}

export async function publishDsaQuestionHandler(
    req: AuthenticatedRequest,
    res: Response,
): Promise<void> {
    const parsedParams = adminQuestionParamSchema.safeParse(req.params);
    if (!parsedParams.success) {
        sendValidationError(res, parsedParams.error.flatten().fieldErrors);
        return;
    }

    const parsedBody = publishQuestionBodySchema.safeParse(req.body);
    if (!parsedBody.success) {
        sendValidationError(res, parsedBody.error.flatten().fieldErrors);
        return;
    }

    try {
        const question = await publishDsaQuestion(
            parsedParams.data.questionId,
            parsedBody.data,
        );
        res.status(200).json({ question });
    } catch (err) {
        handleAdminError(err, res);
    }
}

export async function deleteDsaQuestionHandler(
    req: AuthenticatedRequest,
    res: Response,
): Promise<void> {
    const parsedParams = adminQuestionParamSchema.safeParse(req.params);
    if (!parsedParams.success) {
        sendValidationError(res, parsedParams.error.flatten().fieldErrors);
        return;
    }

    try {
        await deleteDsaQuestion(parsedParams.data.questionId);
        res.status(204).send();
    } catch (err) {
        handleAdminError(err, res);
    }
}

export async function listSystemDesignQuestionsHandler(
    req: AuthenticatedRequest,
    res: Response,
): Promise<void> {
    const parsed = listAdminQuestionsQuerySchema.safeParse(req.query);
    if (!parsed.success) {
        sendValidationError(res, parsed.error.flatten().fieldErrors);
        return;
    }

    try {
        const result = await listSystemDesignQuestions(parsed.data);
        res.status(200).json(result);
    } catch (err) {
        handleAdminError(err, res);
    }
}

export async function getSystemDesignQuestionHandler(
    req: AuthenticatedRequest,
    res: Response,
): Promise<void> {
    const parsedParams = adminQuestionParamSchema.safeParse(req.params);
    if (!parsedParams.success) {
        sendValidationError(res, parsedParams.error.flatten().fieldErrors);
        return;
    }

    try {
        const question = await getSystemDesignQuestion(
            parsedParams.data.questionId,
        );
        res.status(200).json({ question });
    } catch (err) {
        handleAdminError(err, res);
    }
}

export async function createSystemDesignQuestionHandler(
    req: AuthenticatedRequest,
    res: Response,
): Promise<void> {
    const parsed = createSystemDesignQuestionBodySchema.safeParse(req.body);
    if (!parsed.success) {
        sendValidationError(res, parsed.error.flatten().fieldErrors);
        return;
    }

    try {
        const question = await createSystemDesignQuestion(parsed.data);
        res.status(201).json({ question });
    } catch (err) {
        handleAdminError(err, res);
    }
}

export async function updateSystemDesignQuestionHandler(
    req: AuthenticatedRequest,
    res: Response,
): Promise<void> {
    const parsedParams = adminQuestionParamSchema.safeParse(req.params);
    if (!parsedParams.success) {
        sendValidationError(res, parsedParams.error.flatten().fieldErrors);
        return;
    }

    const parsedBody = updateSystemDesignQuestionBodySchema.safeParse(req.body);
    if (!parsedBody.success) {
        sendValidationError(res, parsedBody.error.flatten().fieldErrors);
        return;
    }

    try {
        const question = await updateSystemDesignQuestion(
            parsedParams.data.questionId,
            parsedBody.data,
        );
        res.status(200).json({ question });
    } catch (err) {
        handleAdminError(err, res);
    }
}

export async function publishSystemDesignQuestionHandler(
    req: AuthenticatedRequest,
    res: Response,
): Promise<void> {
    const parsedParams = adminQuestionParamSchema.safeParse(req.params);
    if (!parsedParams.success) {
        sendValidationError(res, parsedParams.error.flatten().fieldErrors);
        return;
    }

    const parsedBody = publishQuestionBodySchema.safeParse(req.body);
    if (!parsedBody.success) {
        sendValidationError(res, parsedBody.error.flatten().fieldErrors);
        return;
    }

    try {
        const question = await publishSystemDesignQuestion(
            parsedParams.data.questionId,
            parsedBody.data,
        );
        res.status(200).json({ question });
    } catch (err) {
        handleAdminError(err, res);
    }
}

export async function deleteSystemDesignQuestionHandler(
    req: AuthenticatedRequest,
    res: Response,
): Promise<void> {
    const parsedParams = adminQuestionParamSchema.safeParse(req.params);
    if (!parsedParams.success) {
        sendValidationError(res, parsedParams.error.flatten().fieldErrors);
        return;
    }

    try {
        await deleteSystemDesignQuestion(parsedParams.data.questionId);
        res.status(204).send();
    } catch (err) {
        handleAdminError(err, res);
    }
}

export async function listBehavioralQuestionsHandler(
    req: AuthenticatedRequest,
    res: Response,
): Promise<void> {
    const parsed = listAdminQuestionsQuerySchema.safeParse(req.query);
    if (!parsed.success) {
        sendValidationError(res, parsed.error.flatten().fieldErrors);
        return;
    }

    try {
        const result = await listBehavioralQuestions(parsed.data);
        res.status(200).json(result);
    } catch (err) {
        handleAdminError(err, res);
    }
}

export async function getBehavioralQuestionHandler(
    req: AuthenticatedRequest,
    res: Response,
): Promise<void> {
    const parsedParams = adminQuestionParamSchema.safeParse(req.params);
    if (!parsedParams.success) {
        sendValidationError(res, parsedParams.error.flatten().fieldErrors);
        return;
    }

    try {
        const question = await getBehavioralQuestion(
            parsedParams.data.questionId,
        );
        res.status(200).json({ question });
    } catch (err) {
        handleAdminError(err, res);
    }
}

export async function createBehavioralQuestionHandler(
    req: AuthenticatedRequest,
    res: Response,
): Promise<void> {
    const parsed = createBehavioralQuestionBodySchema.safeParse(req.body);
    if (!parsed.success) {
        sendValidationError(res, parsed.error.flatten().fieldErrors);
        return;
    }

    try {
        const question = await createBehavioralQuestion(parsed.data);
        res.status(201).json({ question });
    } catch (err) {
        handleAdminError(err, res);
    }
}

export async function updateBehavioralQuestionHandler(
    req: AuthenticatedRequest,
    res: Response,
): Promise<void> {
    const parsedParams = adminQuestionParamSchema.safeParse(req.params);
    if (!parsedParams.success) {
        sendValidationError(res, parsedParams.error.flatten().fieldErrors);
        return;
    }

    const parsedBody = updateBehavioralQuestionBodySchema.safeParse(req.body);
    if (!parsedBody.success) {
        sendValidationError(res, parsedBody.error.flatten().fieldErrors);
        return;
    }

    try {
        const question = await updateBehavioralQuestion(
            parsedParams.data.questionId,
            parsedBody.data,
        );
        res.status(200).json({ question });
    } catch (err) {
        handleAdminError(err, res);
    }
}

export async function publishBehavioralQuestionHandler(
    req: AuthenticatedRequest,
    res: Response,
): Promise<void> {
    const parsedParams = adminQuestionParamSchema.safeParse(req.params);
    if (!parsedParams.success) {
        sendValidationError(res, parsedParams.error.flatten().fieldErrors);
        return;
    }

    const parsedBody = publishQuestionBodySchema.safeParse(req.body);
    if (!parsedBody.success) {
        sendValidationError(res, parsedBody.error.flatten().fieldErrors);
        return;
    }

    try {
        const question = await publishBehavioralQuestion(
            parsedParams.data.questionId,
            parsedBody.data,
        );
        res.status(200).json({ question });
    } catch (err) {
        handleAdminError(err, res);
    }
}

export async function deleteBehavioralQuestionHandler(
    req: AuthenticatedRequest,
    res: Response,
): Promise<void> {
    const parsedParams = adminQuestionParamSchema.safeParse(req.params);
    if (!parsedParams.success) {
        sendValidationError(res, parsedParams.error.flatten().fieldErrors);
        return;
    }

    try {
        await deleteBehavioralQuestion(parsedParams.data.questionId);
        res.status(204).send();
    } catch (err) {
        handleAdminError(err, res);
    }
}