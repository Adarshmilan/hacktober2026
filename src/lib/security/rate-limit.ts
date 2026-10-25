/**
 * Fixed-window, per-key (per-IP) in-memory rate limiter.
 * Exports: createRateLimiter(), RateLimiter type.
 * Depends on: @/types.
 *
 * State lives in this server instance only. On serverless hosts each instance
 * keeps its own counts, so the limit is best-effort rather than global.
 */
import type { RateLimitResult } from "@/types";

interface RateLimiterOptions {
  limit: number;
  windowMs: number;
  /** Upper bound on tracked keys so spoofed IPs cannot exhaust memory. */
  maxKeys?: number;
  now?: () => number;
}

interface Window {
  count: number;
  startedAt: number;
}

export function createRateLimiter(options: RateLimiterOptions) {
  const { limit, windowMs } = options;
  const maxKeys = options.maxKeys ?? 10_000;
  const now = options.now ?? Date.now;
  const windows = new Map<string, Window>();

  function evict(currentTime: number): void {
    for (const [key, window] of windows) {
      if (currentTime - window.startedAt >= windowMs) windows.delete(key);
    }
    while (windows.size >= maxKeys) {
      const oldestKey = windows.keys().next().value;
      if (oldestKey === undefined) break;
      windows.delete(oldestKey);
    }
  }

  function check(key: string): RateLimitResult {
    const currentTime = now();
    let window = windows.get(key);

    if (!window || currentTime - window.startedAt >= windowMs) {
      if (!window && windows.size >= maxKeys) evict(currentTime);
      window = { count: 0, startedAt: currentTime };
      // Delete first so a renewed window moves to the end of the eviction order.
      windows.delete(key);
      windows.set(key, window);
    }

    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((window.startedAt + windowMs - currentTime) / 1000),
    );

    if (window.count >= limit) {
      return { allowed: false, remaining: 0, retryAfterSeconds };
    }

    window.count += 1;
    return { allowed: true, remaining: limit - window.count, retryAfterSeconds };
  }

  return {
    check,
    get trackedKeys() {
      return windows.size;
    },
  };
}

export type RateLimiter = ReturnType<typeof createRateLimiter>;
