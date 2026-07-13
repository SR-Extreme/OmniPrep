import express, { type Request, type Response } from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import authRouter from './modules/auth/auth.routes.js';
import problemsRouter from './modules/problems/problems.routes.js';
import submissionsRouter from './modules/submissions/submissions.routes.js';
import evaluationsRouter from './modules/evaluations/evaluations.routes.js';
import systemDesignRouter from './modules/system-design/system-design.routes.js';
import behavioralRouter from './modules/behavioral/behavioral.routes.js';
import mockInterviewRouter from './modules/mock-interview/mock-interview.routes.js';
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
app.use('/api/problems', authMiddleware, problemsRouter);
app.use('/api/submissions', authMiddleware, submissionsRouter);
app.use('/api/evaluations', authMiddleware, evaluationsRouter);
app.use('/api/system-design', authMiddleware, systemDesignRouter);
app.use('/api/behavioral', authMiddleware, behavioralRouter);
app.use('/api/mock-interview', authMiddleware, mockInterviewRouter);

//tells the current user logged in
app.get('/api/me', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
    res.status(200).json({ user: req.user });
},
);

export default app;