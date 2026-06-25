import { Router } from "express";
import {
    getDSAEvaluationHandler,
    requestDSAEvaluationHandler,
} from './evaluations.controller.js';

const evaluationsRouter = Router();

evaluationsRouter.post('/:submissionId', requestDSAEvaluationHandler);
evaluationsRouter.get('/:submissionId', getDSAEvaluationHandler);

export default evaluationsRouter;