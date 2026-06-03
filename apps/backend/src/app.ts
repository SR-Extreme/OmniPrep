import express, { type Request, type Response } from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import authRouter from './modules/auth/auth.routes.js';
import { authMiddleware, type AuthenticatedRequest } from './middleware/auth.middleware.js';

const app = express();

app.use(cors({
    origin: env.FRONTEND_URL,
    credentials: true,
}));

app.use(express.json());

app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({
        status: 'ok',
        message: 'OmniPrep API is running'
    });
});

app.use('/api/auth', authRouter);

//tells the current user logged in
app.get('/api/me', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
    res.status(200).json({ user: req.user });
},
);

export default app;