//It is validating your environment variables (.env) when the server starts.
import { z } from 'zod';

const optionalNonEmptyString = z.preprocess(
    (value) => (
        typeof value === 'string' && value.trim() === ''
            ? undefined
            : value
    ),
    z.string().min(1).optional(),
);

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
    REDIS_URL: optionalNonEmptyString,
    JUDGE0_API_KEY: optionalNonEmptyString,
    JUDGE0_BASE_URL: z.string().url(),
    GEMINI_API_KEY: optionalNonEmptyString,
    CLOUDINARY_CLOUD_NAME: optionalNonEmptyString,
    CLOUDINARY_API_KEY: optionalNonEmptyString,
    CLOUDINARY_API_SECRET: optionalNonEmptyString,
    STRIPE_SECRET_KEY: optionalNonEmptyString,
    STRIPE_WEBHOOK_SECRET: optionalNonEmptyString,
    STRIPE_PRICE_MONTHLY: optionalNonEmptyString,
    STRIPE_PRICE_SIX_MONTHS: optionalNonEmptyString,
    STRIPE_PRICE_YEARLY: optionalNonEmptyString,
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

export function isCloudinaryConfigured(envConfig: Env = env): boolean {
    return Boolean(
        envConfig.CLOUDINARY_CLOUD_NAME
        && envConfig.CLOUDINARY_API_KEY
        && envConfig.CLOUDINARY_API_SECRET,
    );
}

export function isGeminiConfigured(envConfig: Env = env): boolean {
    return Boolean(envConfig.GEMINI_API_KEY);
}

export function isStripeConfigured(envConfig: Env = env): boolean {
    return Boolean(
        envConfig.STRIPE_SECRET_KEY
        && envConfig.STRIPE_WEBHOOK_SECRET
        && envConfig.STRIPE_PRICE_MONTHLY
        && envConfig.STRIPE_PRICE_SIX_MONTHS
        && envConfig.STRIPE_PRICE_YEARLY,
    );
}