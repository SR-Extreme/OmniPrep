import { Router } from 'express';
import {
    createDsaQuestionHandler,
    createSystemDesignQuestionHandler,
    deleteAdminUserHandler,
    deleteDsaQuestionHandler,
    deleteSystemDesignQuestionHandler,
    getAdminProfileHandler,
    getDsaQuestionHandler,
    getMockAnalyticsHandler,
    getRevenueDashboardHandler,
    getSystemDesignQuestionHandler,
    listAdminUsersHandler,
    listDsaQuestionsHandler,
    listSystemDesignQuestionsHandler,
    publishDsaQuestionHandler,
    publishSystemDesignQuestionHandler,
    updateDsaQuestionHandler,
    updateSystemDesignQuestionHandler,
} from './admin.controller.js';

const adminRouter = Router();

// Analytics
adminRouter.get('/analytics/revenue', getRevenueDashboardHandler);
adminRouter.get('/analytics/mock', getMockAnalyticsHandler);

// Admin profile + user management
adminRouter.get('/profile', getAdminProfileHandler);
adminRouter.get('/users', listAdminUsersHandler);
adminRouter.delete('/users/:userId', deleteAdminUserHandler);

// DSA questions
adminRouter.get('/questions/dsa', listDsaQuestionsHandler);
adminRouter.post('/questions/dsa', createDsaQuestionHandler);
adminRouter.get('/questions/dsa/:questionId', getDsaQuestionHandler);
adminRouter.patch('/questions/dsa/:questionId', updateDsaQuestionHandler);
adminRouter.post('/questions/dsa/:questionId/publish', publishDsaQuestionHandler);
adminRouter.delete('/questions/dsa/:questionId', deleteDsaQuestionHandler);

// System Design questions
adminRouter.get('/questions/system-design', listSystemDesignQuestionsHandler);
adminRouter.post('/questions/system-design', createSystemDesignQuestionHandler);
adminRouter.get('/questions/system-design/:questionId', getSystemDesignQuestionHandler);
adminRouter.patch('/questions/system-design/:questionId', updateSystemDesignQuestionHandler);
adminRouter.post('/questions/system-design/:questionId/publish', publishSystemDesignQuestionHandler);
adminRouter.delete('/questions/system-design/:questionId', deleteSystemDesignQuestionHandler);

export default adminRouter;