import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import {
    createCheckoutSessionHandler,
    getPlanCatalogHandler,
    getPremiumStatusHandler,
} from './billing.controller.js';

const billingRouter = Router();

billingRouter.get('/plans', getPlanCatalogHandler);
billingRouter.get('/status', authMiddleware, getPremiumStatusHandler);
billingRouter.post('/checkout', authMiddleware, createCheckoutSessionHandler);

export default billingRouter;