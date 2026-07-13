import { Router } from 'express';
import multer from 'multer';
import {
    createMockBehavioralSessionHandler,
    createMockInterviewHandler,
    finalizeMockBehavioralSectionHandler,
    finalizeMockInterviewHandler,
    generateMockInterviewStudyPlanHandler,
    getMockInterviewHandler,
    getMockInterviewReportHandler,
    getMockInterviewStudyPlanHandler,
    linkDsaSubmissionHandler,
    linkSystemDesignSubmissionHandler,
    listMockBehavioralRolesHandler,
    listMyMockInterviewsHandler,
    startMockBehavioralSectionHandler,
    startMockInterviewHandler,
    submitSectionHandler,
} from './mock-interview.controller.js';

const mockInterviewRouter = Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
});

mockInterviewRouter.post('/', createMockInterviewHandler);
mockInterviewRouter.get('/me', listMyMockInterviewsHandler);
mockInterviewRouter.get('/behavioral/roles', listMockBehavioralRolesHandler);

mockInterviewRouter.get('/:id', getMockInterviewHandler);
mockInterviewRouter.post('/:id/start', startMockInterviewHandler);

mockInterviewRouter.post('/:id/dsa/slots/:slotIndex/submission', linkDsaSubmissionHandler);
mockInterviewRouter.post('/:id/system-design/submission', linkSystemDesignSubmissionHandler);
mockInterviewRouter.post('/:id/sections/:section/submit', submitSectionHandler);

mockInterviewRouter.post('/:id/behavioral/start', startMockBehavioralSectionHandler);

mockInterviewRouter.post(
    '/:id/behavioral/session',
    upload.single('resume'),
    createMockBehavioralSessionHandler,
);

mockInterviewRouter.post('/:id/behavioral/finalize', finalizeMockBehavioralSectionHandler);
mockInterviewRouter.get('/:id/report', getMockInterviewReportHandler);
mockInterviewRouter.post('/:id/finalize', finalizeMockInterviewHandler);

mockInterviewRouter.get('/:id/study-plan', getMockInterviewStudyPlanHandler);
mockInterviewRouter.post('/:id/study-plan', generateMockInterviewStudyPlanHandler);

export default mockInterviewRouter;