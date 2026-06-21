import { Queue } from 'bullmq';
import { env } from '../config/env.js';

export const AI_EVAL_QUEUE_NAME = 'ai-eval-queue';

export interface AIEvalJobData {
    submissionId: string;
    userId: string;
    problemId: string;
}

let aiEvalQueue: Queue<AIEvalJobData> | undefined;

//connection options given to bullMq to internally create a redis connection.
function getQueueConnectionOptions() {
    if (!env.REDIS_URL) {
        throw new Error(
            'REDIS_URL is not configured. Set it in apps/backend/.env for AI evaluation.',
        );
    }

    return {
        url: env.REDIS_URL,
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
    } as const;
}

export function getAIEvalQueue(): Queue<AIEvalJobData> {
    //this ensures only one redis connection exists
    if (aiEvalQueue) {
        return aiEvalQueue;
    }

    aiEvalQueue = new Queue<AIEvalJobData>(AI_EVAL_QUEUE_NAME, {
        connection: getQueueConnectionOptions(),
        defaultJobOptions: {
            attempts: 3,
            backoff: {
                type: 'exponential',
                delay: 5000,
            },
            removeOnComplete: true,
            removeOnFail: false,
        },
    });

    return aiEvalQueue;
}

export async function enqueueAIEvaluation(
    data: AIEvalJobData,
): Promise<string> {
    const job = await getAIEvalQueue().add('evaluate-dsa', data, {
        jobId: `dsa-eval-${data.submissionId}`,
    });

    return job.id ?? `dsa-eval-${data.submissionId}`;
}

export async function getAIEvalJobState(
    submissionId: string,
): Promise<'waiting' | 'active' | 'completed' | 'failed' | 'delayed' | 'unknown'> {
    const job = await getAIEvalQueue().getJob(`dsa-eval-${submissionId}`);

    if (!job) {
        return 'unknown';
    }

    const state = await job.getState();
    return state as 'waiting' | 'active' | 'completed' | 'failed' | 'delayed';
}
