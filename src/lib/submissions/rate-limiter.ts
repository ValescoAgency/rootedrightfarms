export interface RateLimiter {
  check(key: string): { allowed: boolean; retryAfterSeconds: number };
}

/**
 * In-memory fixed-window limiter. Good enough for preview deploys and unit
 * tests; swap for a Vercel KV / Upstash-backed limiter in production.
 * TODO(prod): move to Vercel KV before launch so horizontal scale doesn't
 * defeat the limit.
 */
export function createInMemoryRateLimiter(options: {
  max: number;
  windowSeconds: number;
  now?: () => number;
}): RateLimiter {
  const windows = new Map<string, { count: number; resetAt: number }>();
  const now = options.now ?? Date.now;

  return {
    check(key) {
      const current = now();
      const existing = windows.get(key);
      if (!existing || existing.resetAt <= current) {
        windows.set(key, {
          count: 1,
          resetAt: current + options.windowSeconds * 1000,
        });
        return { allowed: true, retryAfterSeconds: 0 };
      }
      if (existing.count >= options.max) {
        return {
          allowed: false,
          retryAfterSeconds: Math.ceil((existing.resetAt - current) / 1000),
        };
      }
      existing.count += 1;
      return { allowed: true, retryAfterSeconds: 0 };
    },
  };
}
