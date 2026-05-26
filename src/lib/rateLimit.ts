import { headers } from 'next/headers';

type RateLimitResult = { success: boolean; remaining: number; reset: number };

const inMemoryStore = new Map<string, { count: number; resetAt: number }>();

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

  return inMemoryRateLimit(ip, limit, windowMs);
}
