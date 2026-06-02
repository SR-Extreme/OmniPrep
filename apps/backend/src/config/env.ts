//It is validating your environment variables (.env) when the server starts.
import { z } from 'zod';

const envSchema = z.object({
    NODE_ENV: z
        .enum(['development', 'production', 'test'])
        .default('development'),
    PORT: z.coerce.number().int().positive().default(4000),
    DATABASE_URL: z.string().min(1),
    JWT_ACCESS_SECRET: z.string().min(32),
    JWT_REFRESH_SECRET: z.string().min(32),
    JWT_ACCESS_EXPIRY: z.string().default('15m'),
    JWT_REFRESH_EXPIRY: z.string().default('7d'),
    FRONTEND_URL: z.string().url(),
    REDIS_URL: z.string().min(1).optional(),
});

export type Env = z.infer<typeof envSchema>;

function parseEnv(): Env {
    const result = envSchema.safeParse(process.env);

    if (!result.success) {
        console.error(
            'Invalid environment variables:',
            result.error.flatten().fieldErrors,
        );
        process.exit(1);
    }

    return result.data;
}

export const env = parseEnv();