import { headers } from 'next/headers';

type RateLimitResult = { success: boolean; remaining: number; reset: number };

const inMemoryStore = new Map<string, { count: number; resetAt: number }>();

let upstashRedis: any = null;

async function getUpstashClient() {
  if (upstashRedis) return upstashRedis;
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    try {
      const { Redis } = await import('@upstash/redis');
      upstashRedis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      });
      return upstashRedis;
    } catch {
      return null;
    }
  }
  return null;
}

async function upstashRateLimit(ip: string, limit: number, windowMs: number): Promise<RateLimitResult | null> {
  try {
    const redis = await getUpstashClient();
    if (!redis) return null;

    const key = `rl:${ip}`;
    const windowSeconds = Math.ceil(windowMs / 1000);
    const now = Math.floor(Date.now() / 1000);
    const reset = now + windowSeconds;

    const count = await redis.incr(key);
    if (count === 1) {
      await redis.expire(key, windowSeconds);
    }

    if (count > limit) {
      return { success: false, remaining: 0, reset };
    }

    return { success: true, remaining: limit - count, reset };
  } catch {
    return null;
  }
}

function inMemoryRateLimit(ip: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const key = `rl:${ip}`;
  const entry = inMemoryStore.get(key);

  if (!entry || now > entry.resetAt) {
    inMemoryStore.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: limit - 1, reset: now + windowMs };
  }

  entry.count++;
  if (entry.count > limit) {
    return { success: false, remaining: 0, reset: entry.resetAt };
  }

  return { success: true, remaining: limit - entry.count, reset: entry.resetAt };
}

export async function checkRateLimit(
  options?: { limit?: number; windowMs?: number; identifier?: string },
): Promise<RateLimitResult> {
  const limit = options?.limit ?? 10;
  const windowMs = options?.windowMs ?? 60_000;
  const ip =
    options?.identifier ?? (await headers()).get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'anonymous';

  const upstashResult = await upstashRateLimit(ip, limit, windowMs);
  if (upstashResult) return upstashResult;

  return inMemoryRateLimit(ip, limit, windowMs);
}
