import { Router } from 'express';
import multer from 'multer';
import {
    createBehavioralSessionHandler,
    generateNextBehavioralQuestionHandler,
    getBehavioralEvaluationHandler,
    getBehavioralQuestionHandler,
    getBehavioralSessionHandler,
    listBehavioralQuestionsHandler,
    listMyBehavioralSessionsHandler,
    requestBehavioralEvaluationHandler,
    submitCandidateQuestionsHandler,
    submitTurnAnswerHandler,
} from './behavioral.controller.js';

const behavioralRouter = Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
});

behavioralRouter.get('/questions', listBehavioralQuestionsHandler);
behavioralRouter.get('/questions/:idOrSlug', getBehavioralQuestionHandler);

behavioralRouter.post(
    '/sessions',
    upload.single('resume'),
    createBehavioralSessionHandler,
);

behavioralRouter.get('/sessions/me', listMyBehavioralSessionsHandler);

behavioralRouter.post(
    '/sessions/:id/next-question',
    generateNextBehavioralQuestionHandler,
);

behavioralRouter.patch(
    '/sessions/:id/turns/:turnId',
    submitTurnAnswerHandler,
);

behavioralRouter.post(
    '/sessions/:id/candidate-questions',
    submitCandidateQuestionsHandler,
);

behavioralRouter.get('/sessions/:id', getBehavioralSessionHandler);

behavioralRouter.post(
    '/evaluations/:id',
    requestBehavioralEvaluationHandler,
);

behavioralRouter.get(
    '/evaluations/:id',
    getBehavioralEvaluationHandler,
);

export default behavioralRouter;