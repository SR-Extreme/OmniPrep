import { Router } from 'express';
import multer from 'multer';
import {
    getProfileHandler,
    getStudyPlanDetailHandler,
    getStudyPlanHistoryHandler,
    submitStudyPlanProgressHandler,
    updateProfileHandler,
    uploadAvatarHandler,
} from './profile.controller.js';

const profileRouter = Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
});

profileRouter.get('/', getProfileHandler);
profileRouter.patch('/', updateProfileHandler);
profileRouter.post('/avatar', upload.single('avatar'), uploadAvatarHandler);
profileRouter.get('/study-plans', getStudyPlanHistoryHandler);
profileRouter.get('/study-plans/:studyPlanId', getStudyPlanDetailHandler);
profileRouter.post(
    '/study-plans/:studyPlanId/progress',
    submitStudyPlanProgressHandler,
);

export default profileRouter;