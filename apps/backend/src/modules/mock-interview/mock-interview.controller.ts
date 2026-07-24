import type { Response } from 'express';
import type { AuthenticatedRequest } from '../../middleware/auth.middleware.js';
import {
    createMockBehavioralSession,
    finalizeMockBehavioralSection,
    listMockBehavioralRoles,
    startMockBehavioralSection,
} from './mock-interview-behavioral.service.js';
import {
    finalizeMockInterview,
    getMockInterviewReport,
} from './mock-interview-report.service.js';
import {
    getMockInterviewSynced,
    linkDsaSubmission,
    linkSystemDesignSubmission,
    submitSection,
} from './mock-interview-section.service.js';
import {
    MockInterviewError,
    createMockInterview,
    listMyMockInterviews,
    startMockInterview,
} from './mock-interview.service.js';
import {
    generateMockInterviewStudyPlan,
    getMockInterviewStudyPlan,
} from './mock-interview-study-plan.service.js';
import {
    linkDsaSubmissionBodySchema,
    linkSystemDesignSubmissionBodySchema,
    listMyMockInterviewsQuerySchema,
    mockInterviewDsaSlotParamSchema,
    mockInterviewParamSchema,
    mockInterviewSectionParamSchema,
    selectBehavioralRoleBodySchema,
} from './mock-interview.validation.js';

type MockBehavioralSessionRequest = AuthenticatedRequest & {
    file?: Express.Multer.File;
};

function sendValidationError(res: Response, details: unknown): void {
    res.status(400).json({ error: 'Validation failed', details });
}

function handleMockInterviewError(err: unknown, res: Response): void {
    if (err instanceof MockInterviewError) {
        const statusByCode: Record<MockInterviewError['code'], number> = {
            NOT_FOUND: 404,
            FORBIDDEN: 404,
            INVALID_STATE: 409,
            CONFIG_ERROR: 503,
            PREMIUM_REQUIRED: 403,
        };

        res.status(statusByCode[err.code]).json({ error: err.message });
        return;
    }

    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
}

function requireUserId(req: AuthenticatedRequest, res: Response): string | null {
    if (!req.user?.sub) {
        res.status(401).json({ error: 'Unauthorized' });
        return null;
    }

    return req.user.sub;
}

// Session

export async function createMockInterviewHandler(
    req: AuthenticatedRequest,
    res: Response,
): Promise<void> {
    const userId = requireUserId(req, res);
    if (!userId) {
        return;
    }

    try {
        const interview = await createMockInterview(userId);
        res.status(201).json({ interview });
    } catch (err) {
        handleMockInterviewError(err, res);
    }
}

export async function listMyMockInterviewsHandler(
    req: AuthenticatedRequest,
    res: Response,
): Promise<void> {
    const parsed = listMyMockInterviewsQuerySchema.safeParse(req.query);

    if (!parsed.success) {
        sendValidationError(res, parsed.error.flatten().fieldErrors);
        return;
    }

    const userId = requireUserId(req, res);
    if (!userId) {
        return;
    }

    try {
        const result = await listMyMockInterviews(userId, parsed.data);
        res.status(200).json(result);
    } catch (err) {
        handleMockInterviewError(err, res);
    }
}

export async function getMockInterviewHandler(
    req: AuthenticatedRequest,
    res: Response,
): Promise<void> {
    const parsed = mockInterviewParamSchema.safeParse(req.params);

    if (!parsed.success) {
        sendValidationError(res, parsed.error.flatten().fieldErrors);
        return;
    }

    const userId = requireUserId(req, res);
    if (!userId) {
        return;
    }

    try {
        const interview = await getMockInterviewSynced(
            userId,
            parsed.data.id,
            req.user?.role,
        );
        res.status(200).json({ interview });
    } catch (err) {
        handleMockInterviewError(err, res);
    }
}

export async function startMockInterviewHandler(
    req: AuthenticatedRequest,
    res: Response,
): Promise<void> {
    const parsed = mockInterviewParamSchema.safeParse(req.params);

    if (!parsed.success) {
        sendValidationError(res, parsed.error.flatten().fieldErrors);
        return;
    }

    const userId = requireUserId(req, res);
    if (!userId) {
        return;
    }

    try {
        const interview = await startMockInterview(userId, parsed.data.id);
        res.status(200).json({ interview });
    } catch (err) {
        handleMockInterviewError(err, res);
    }
}

// Sections (DSA / System Design)

export async function linkDsaSubmissionHandler(
    req: AuthenticatedRequest,
    res: Response,
): Promise<void> {
    const params = mockInterviewDsaSlotParamSchema.safeParse(req.params);
    const body = linkDsaSubmissionBodySchema.safeParse(req.body);

    if (!params.success) {
        sendValidationError(res, params.error.flatten().fieldErrors);
        return;
    }

    if (!body.success) {
        sendValidationError(res, body.error.flatten().fieldErrors);
        return;
    }

    const userId = requireUserId(req, res);
    if (!userId) {
        return;
    }

    try {
        const interview = await linkDsaSubmission(
            userId,
            params.data.id,
            params.data.slotIndex,
            body.data,
        );
        res.status(200).json({ interview });
    } catch (err) {
        handleMockInterviewError(err, res);
    }
}

export async function linkSystemDesignSubmissionHandler(
    req: AuthenticatedRequest,
    res: Response,
): Promise<void> {
    const params = mockInterviewParamSchema.safeParse(req.params);
    const body = linkSystemDesignSubmissionBodySchema.safeParse(req.body);

    if (!params.success) {
        sendValidationError(res, params.error.flatten().fieldErrors);
        return;
    }

    if (!body.success) {
        sendValidationError(res, body.error.flatten().fieldErrors);
        return;
    }

    const userId = requireUserId(req, res);
    if (!userId) {
        return;
    }

    try {
        const interview = await linkSystemDesignSubmission(
            userId,
            params.data.id,
            body.data,
        );
        res.status(200).json({ interview });
    } catch (err) {
        handleMockInterviewError(err, res);
    }
}

export async function submitSectionHandler(
    req: AuthenticatedRequest,
    res: Response,
): Promise<void> {
    const parsed = mockInterviewSectionParamSchema.safeParse(req.params);

    if (!parsed.success) {
        sendValidationError(res, parsed.error.flatten().fieldErrors);
        return;
    }

    const userId = requireUserId(req, res);
    if (!userId) {
        return;
    }

    try {
        const interview = await submitSection(
            userId,
            parsed.data.id,
            parsed.data.section,
            req.user?.role,
        );
        res.status(200).json({ interview });
    } catch (err) {
        handleMockInterviewError(err, res);
    }
}

// Behavioral

export async function listMockBehavioralRolesHandler(
    _req: AuthenticatedRequest,
    res: Response,
): Promise<void> {
    try {
        const result = await listMockBehavioralRoles();
        res.status(200).json(result);
    } catch (err) {
        handleMockInterviewError(err, res);
    }
}

export async function startMockBehavioralSectionHandler(
    req: AuthenticatedRequest,
    res: Response,
): Promise<void> {
    const params = mockInterviewParamSchema.safeParse(req.params);
    const body = selectBehavioralRoleBodySchema.safeParse(req.body);

    if (!params.success) {
        sendValidationError(res, params.error.flatten().fieldErrors);
        return;
    }

    if (!body.success) {
        sendValidationError(res, body.error.flatten().fieldErrors);
        return;
    }

    const userId = requireUserId(req, res);
    if (!userId) {
        return;
    }

    try {
        const interview = await startMockBehavioralSection(
            userId,
            params.data.id,
            body.data,
        );
        res.status(200).json({ interview });
    } catch (err) {
        handleMockInterviewError(err, res);
    }
}

export async function createMockBehavioralSessionHandler(
    req: MockBehavioralSessionRequest,
    res: Response,
): Promise<void> {
    const parsed = mockInterviewParamSchema.safeParse(req.params);

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
        const result = await createMockBehavioralSession(
            userId,
            parsed.data.id,
            resumeFile,
        );
        res.status(201).json(result);
    } catch (err) {
        handleMockInterviewError(err, res);
    }
}

export async function finalizeMockBehavioralSectionHandler(
    req: AuthenticatedRequest,
    res: Response,
): Promise<void> {
    const parsed = mockInterviewParamSchema.safeParse(req.params);

    if (!parsed.success) {
        sendValidationError(res, parsed.error.flatten().fieldErrors);
        return;
    }

    const userId = requireUserId(req, res);
    if (!userId) {
        return;
    }

    try {
        const interview = await finalizeMockBehavioralSection(
            userId,
            parsed.data.id,
            req.user?.role,
        );
        res.status(200).json({ interview });
    } catch (err) {
        handleMockInterviewError(err, res);
    }
}

// Report + study plan

export async function getMockInterviewReportHandler(
    req: AuthenticatedRequest,
    res: Response,
): Promise<void> {
    const parsed = mockInterviewParamSchema.safeParse(req.params);

    if (!parsed.success) {
        sendValidationError(res, parsed.error.flatten().fieldErrors);
        return;
    }

    const userId = requireUserId(req, res);
    if (!userId) {
        return;
    }

    try {
        const report = await getMockInterviewReport(
            userId,
            parsed.data.id,
            req.user?.role,
        );
        res.status(200).json({ report });
    } catch (err) {
        handleMockInterviewError(err, res);
    }
}

export async function finalizeMockInterviewHandler(
    req: AuthenticatedRequest,
    res: Response,
): Promise<void> {
    const parsed = mockInterviewParamSchema.safeParse(req.params);

    if (!parsed.success) {
        sendValidationError(res, parsed.error.flatten().fieldErrors);
        return;
    }

    const userId = requireUserId(req, res);
    if (!userId) {
        return;
    }

    try {
        const interview = await finalizeMockInterview(userId, parsed.data.id);
        res.status(200).json({ interview });
    } catch (err) {
        handleMockInterviewError(err, res);
    }
}

export async function getMockInterviewStudyPlanHandler(
    req: AuthenticatedRequest,
    res: Response,
): Promise<void> {
    const parsed = mockInterviewParamSchema.safeParse(req.params);

    if (!parsed.success) {
        sendValidationError(res, parsed.error.flatten().fieldErrors);
        return;
    }

    const userId = requireUserId(req, res);
    if (!userId) {
        return;
    }

    try {
        const studyPlan = await getMockInterviewStudyPlan(
            userId,
            parsed.data.id,
        );
        res.status(200).json({ studyPlan });
    } catch (err) {
        handleMockInterviewError(err, res);
    }
}

export async function generateMockInterviewStudyPlanHandler(
    req: AuthenticatedRequest,
    res: Response,
): Promise<void> {
    const parsed = mockInterviewParamSchema.safeParse(req.params);

    if (!parsed.success) {
        sendValidationError(res, parsed.error.flatten().fieldErrors);
        return;
    }

    const userId = requireUserId(req, res);
    if (!userId) {
        return;
    }

    try {
        const studyPlan = await generateMockInterviewStudyPlan(
            userId,
            parsed.data.id,
            req.user?.role,
        );
        res.status(200).json({ studyPlan });
    } catch (err) {
        handleMockInterviewError(err, res);
    }
}