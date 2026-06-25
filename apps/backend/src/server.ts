import 'dotenv/config';
import { env } from './config/env.js';
import app from './app.js';
import {
    startAIEvaluationWorker,
    stopAIEvaluationWorker,
} from './workers/AIEvaluationWorker.js'

if (env.REDIS_URL) {
    startAIEvaluationWorker();
} else {
    console.warn(
        'REDIS_URL not set - AI Evaluation worker disabled.'
    );
}

const server = app.listen(env.PORT, () => {
    console.log(`OmniPrep API running on http://localhost:${env.PORT}`);
    console.log(`Health check: http://localhost:${env.PORT}/health`);
    console.log(`Auth API: http://localhost:${env.PORT}/api/auth`);
    console.log(`Evaluations API: http://localhost:${env.PORT}/api/evaluations`);
});

async function shutdown(signal: string): Promise<void> {
    console.log(`Received ${signal}, shutting down...`);
    await stopAIEvaluationWorker();
    server.close(() => {
        process.exit(0);
    });
}

process.on('SIGINT', () => {
    void shutdown('SIGINT');
});
process.on('SIGTERM', () => {
    void shutdown('SIGTERM');
});