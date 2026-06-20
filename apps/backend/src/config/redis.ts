import { Redis } from 'ioredis';
import { env } from './env.js';

const globalForRedis = globalThis as unknown as {
    redis: Redis | undefined;
};

export function getRedis(): Redis {
    if (!env.REDIS_URL) {
        throw new Error(
            'REDIS_URL not found.',
        );
    }

    if (!globalForRedis.redis) {
        globalForRedis.redis = new Redis(env.REDIS_URL, {
            maxRetriesPerRequest: null,
            enableReadyCheck: false,
        });
    }

    return globalForRedis.redis;
}

export default getRedis;