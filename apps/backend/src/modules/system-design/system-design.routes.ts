import { Router } from 'express';
import multer from 'multer';
import {
    createSystemDesignSubmissionHandler,
    generateSystemDesignFollowUpQuestionsHandler,
    getSystemDesignEvaluationHandler,
    getSystemDesignQuestionHandler,
    getSystemDesignSubmissionHandler,
    listMySystemDesignSubmissionsHandler,
    listSystemDesignQuestionsHandler,
    requestSystemDesignEvaluationHandler,
    submitSystemDesignFollowUpAnswersHandler,
} from './system-design.controller.js';

const systemDesignRouter = Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
});

systemDesignRouter.get('/questions', listSystemDesignQuestionsHandler);
systemDesignRouter.get('/questions/:idOrSlug', getSystemDesignQuestionHandler);

systemDesignRouter.post(
    '/submissions',
    upload.single('diagram'), //attaches uploaded date to req.file
    createSystemDesignSubmissionHandler,
);

systemDesignRouter.get('/submissions/me', listMySystemDesignSubmissionsHandler);

systemDesignRouter.post(
    '/submissions/:id/follow-ups/generate',
    generateSystemDesignFollowUpQuestionsHandler,
);

systemDesignRouter.patch(
    '/submissions/:id/follow-ups',
    submitSystemDesignFollowUpAnswersHandler,
);

systemDesignRouter.get('/submissions/:id', getSystemDesignSubmissionHandler);

systemDesignRouter.post(
    '/evaluations/:id',
    requestSystemDesignEvaluationHandler,
);

systemDesignRouter.get(
    '/evaluations/:id',
    getSystemDesignEvaluationHandler,
);

export default systemDesignRouter;