import { z } from 'zod';

/**
 * ✅ Environment Schema
 * Defines the structure and validation rules for your environment variables.
 * Fails FAST if configuration is missing.
 */
const EnvSchema = z.object({
    // Server-Side Secrets (Never exposed to browser)
    SUPABASE_URL: z.string().url({ message: "SUPABASE_URL must be a valid URL" }),
    SUPABASE_ANON_KEY: z.string().min(1, { message: "SUPABASE_ANON_KEY is required" }),

    // Optional but recommended
    GEMINI_API_KEY: z.string().optional(),

    // Public Variables (Prefix with VITE_ or PUBLIC_ to expose)
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

function validateEnv() {
    const _env = {
        SUPABASE_URL: process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
        SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY,
        GEMINI_API_KEY: process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY,
        NODE_ENV: process.env.NODE_ENV,
    };

    const parsed = EnvSchema.safeParse(_env);

    if (!parsed.success) {
        console.error('❌ Invalid environment variables:', parsed.error.format());
        // In production, we might want to throw to prevent startup
        if (process.env.NODE_ENV === 'production') {
            throw new Error('Invalid environment variables');
        }
    }

    return parsed.data || _env as z.infer<typeof EnvSchema>;
}

export const ENV = validateEnv();
