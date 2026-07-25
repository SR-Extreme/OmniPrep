import { Router } from 'express';
import { getPlatformStatsHandler } from './platform.controller.js';

const platformRouter = Router();

platformRouter.get('/stats', getPlatformStatsHandler);

export default platformRouter;
