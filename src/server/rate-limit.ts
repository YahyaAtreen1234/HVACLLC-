/**
 * In-memory sliding-window rate limiter.
 *
 * A public form endpoint will be found by bots within days of launch, and a
 * honeypot alone does not stop someone hammering it. This caps how often one
 * source can submit.
 *
 * ⚠️ Scope: per process. That is correct for a single container or VPS. Across
 * multiple instances each has its own window, so a horizontally scaled deploy
 * should back this with Redis (or the platform's own rate limiter) — the
 * `checkRateLimit` signature is what you would reimplement.
 *
 * The database also enforces a longer-window cap (see `leads/service.ts`),
 * which survives restarts and covers what this misses.
 */

interface Window {
  hits: number[];
}

const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_HITS = 5; // submissions per window, per key
const SWEEP_EVERY_MS = 5 * 60 * 1000;

interface LimiterGlobal {
  __rateLimiter?: Map<string, Window>;
  __rateLimiterSweep?: number;
}

const globalRef = globalThis as unknown as LimiterGlobal;
const windows: Map<string, Window> = (globalRef.__rateLimiter ??= new Map());

/** Drops expired keys so the map cannot grow without bound. */
function sweep(now: number): void {
  const last = globalRef.__rateLimiterSweep ?? 0;
  if (now - last < SWEEP_EVERY_MS) return;
  globalRef.__rateLimiterSweep = now;

  for (const [key, window] of windows) {
    const live = window.hits.filter((at) => now - at < WINDOW_MS);
    if (live.length === 0) windows.delete(key);
    else window.hits = live;
  }
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  /** Seconds until the caller may retry; 0 when allowed. */
  retryAfter: number;
}

/**
 * Records a hit against `key` and reports whether it is allowed.
 * A null key (no identifiable source) is always allowed — the database-backed
 * cap is the backstop there.
 */
export function checkRateLimit(key: string | null): RateLimitResult {
  if (!key) return { allowed: true, remaining: MAX_HITS, retryAfter: 0 };

  const now = Date.now();
  sweep(now);

  const window = windows.get(key) ?? { hits: [] };
  window.hits = window.hits.filter((at) => now - at < WINDOW_MS);

  if (window.hits.length >= MAX_HITS) {
    windows.set(key, window);
    const oldest = window.hits[0];
    return {
      allowed: false,
      remaining: 0,
      retryAfter: Math.ceil((WINDOW_MS - (now - oldest)) / 1000),
    };
  }

  window.hits.push(now);
  windows.set(key, window);

  return {
    allowed: true,
    remaining: MAX_HITS - window.hits.length,
    retryAfter: 0,
  };
}

/** Test helper — clears all windows. */
export function resetRateLimits(): void {
  windows.clear();
  globalRef.__rateLimiterSweep = 0;
}
