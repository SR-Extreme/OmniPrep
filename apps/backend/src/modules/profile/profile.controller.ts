import type { Response } from 'express';
import type { AuthenticatedRequest } from '../../middleware/auth.middleware.js';
import {
    ProfileError,
    getProfile,
    getStudyPlanDetail,
    getStudyPlanHistory,
    submitStudyPlanProgress,
    updateProfile,
    uploadAvatar,
} from './profile.service.js';
import {
    studyPlanParamSchema,
    submitStudyPlanProgressBodySchema,
    updateProfileBodySchema,
} from './profile.validation.js';

type ProfileAvatarRequest = AuthenticatedRequest & {
    file?: Express.Multer.File;
};

function sendValidationError(res: Response, details: unknown): void {
    res.status(400).json({ error: 'Validation failed', details });
}

function handleProfileError(err: unknown, res: Response): void {
    if (err instanceof ProfileError) {
        const statusByCode: Record<ProfileError['code'], number> = {
            NOT_FOUND: 404,
            FORBIDDEN: 403,
            INVALID_STATE: 409,
            INVALID_FILE: 400,
            CONFIG_ERROR: 503,
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

export async function getProfileHandler(
    req: AuthenticatedRequest,
    res: Response,
): Promise<void> {
    const userId = requireUserId(req, res);
    if (!userId) {
        return;
    }

    try {
        const profile = await getProfile(userId);
        res.status(200).json(profile);
    } catch (err) {
        handleProfileError(err, res);
    }
}

export async function updateProfileHandler(
    req: AuthenticatedRequest,
    res: Response,
): Promise<void> {
    const userId = requireUserId(req, res);
    if (!userId) {
        return;
    }

    const parsed = updateProfileBodySchema.safeParse(req.body);

    if (!parsed.success) {
        sendValidationError(res, parsed.error.flatten().fieldErrors);
        return;
    }

    try {
        const profile = await updateProfile(userId, parsed.data);
        res.status(200).json(profile);
    } catch (err) {
        handleProfileError(err, res);
    }
}

export async function uploadAvatarHandler(
    req: ProfileAvatarRequest,
    res: Response,
): Promise<void> {
    const userId = requireUserId(req, res);

    if (!userId) {
        return;
    }

    if (!req.file) {
        res.status(400).json({
            error: 'Avatar image file is required',
            code: 'INVALID_FILE',
        });
        return;
    }

    try {
        const profile = await uploadAvatar(userId, {
            buffer: req.file.buffer,
            mimetype: req.file.mimetype,
            originalname: req.file.originalname,
        });
        res.status(200).json(profile);
    } catch (err) {
        handleProfileError(err, res);
    }
}

export async function getStudyPlanHistoryHandler(
    req: AuthenticatedRequest,
    res: Response,
): Promise<void> {
    const userId = requireUserId(req, res);
    if (!userId) {
        return;
    }

    try {
        const plans = await getStudyPlanHistory(userId);
        res.status(200).json({ plans });
    } catch (err) {
        handleProfileError(err, res);
    }
}

export async function getStudyPlanDetailHandler(
    req: AuthenticatedRequest,
    res: Response,
): Promise<void> {
    const userId = requireUserId(req, res);
    if (!userId) {
        return;
    }

    const parsedParams = studyPlanParamSchema.safeParse(req.params);

    if (!parsedParams.success) {
        sendValidationError(res, parsedParams.error.flatten().fieldErrors);
        return;
    }

    try {
        const plan = await getStudyPlanDetail(
            userId,
            parsedParams.data.studyPlanId,
        );
        res.status(200).json(plan);
    } catch (err) {
        handleProfileError(err, res);
    }
}

export async function submitStudyPlanProgressHandler(
    req: AuthenticatedRequest,
    res: Response,
): Promise<void> {
    const userId = requireUserId(req, res);
    if (!userId) {
        return;
    }

    const parsedParams = studyPlanParamSchema.safeParse(req.params);

    if (!parsedParams.success) {
        sendValidationError(res, parsedParams.error.flatten().fieldErrors);
        return;
    }

    const parsedBody = submitStudyPlanProgressBodySchema.safeParse(req.body);

    if (!parsedBody.success) {
        sendValidationError(res, parsedBody.error.flatten().fieldErrors);
        return;
    }

    try {
        const plan = await submitStudyPlanProgress(
            userId,
            parsedParams.data.studyPlanId,
            parsedBody.data,
        );
        res.status(200).json(plan);
    } catch (err) {
        handleProfileError(err, res);
    }
}