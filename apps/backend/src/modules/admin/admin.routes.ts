import { Router } from 'express';
import {
    createBehavioralQuestionHandler,
    createDsaQuestionHandler,
    createSystemDesignQuestionHandler,
    deleteAdminUserHandler,
    deleteBehavioralQuestionHandler,
    deleteDsaQuestionHandler,
    deleteSystemDesignQuestionHandler,
    getAdminProfileHandler,
    getBehavioralQuestionHandler,
    getDsaQuestionHandler,
    getMockAnalyticsHandler,
    getRevenueDashboardHandler,
    getSystemDesignQuestionHandler,
    listAdminUsersHandler,
    listBehavioralQuestionsHandler,
    listDsaQuestionsHandler,
    listSystemDesignQuestionsHandler,
    publishBehavioralQuestionHandler,
    publishDsaQuestionHandler,
    publishSystemDesignQuestionHandler,
    updateBehavioralQuestionHandler,
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

// Behavioral questions
adminRouter.get('/questions/behavioral', listBehavioralQuestionsHandler);
adminRouter.post('/questions/behavioral', createBehavioralQuestionHandler);
adminRouter.get('/questions/behavioral/:questionId', getBehavioralQuestionHandler);
adminRouter.patch('/questions/behavioral/:questionId', updateBehavioralQuestionHandler);
adminRouter.post('/questions/behavioral/:questionId/publish', publishBehavioralQuestionHandler);
adminRouter.delete('/questions/behavioral/:questionId', deleteBehavioralQuestionHandler);

export default adminRouter;
