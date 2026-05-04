// In-memory token bucket. Survives within a single Node process — fine for dev / single-instance.
// Swap for Upstash Redis (@upstash/ratelimit) before going multi-instance in prod.

type Bucket = { tokens: number; updatedAt: number };
const buckets = new Map<string, Bucket>();

export type RateLimitResult = { ok: true } | { ok: false; retryAfterMs: number };

export function rateLimit(opts: {
  key: string;
  capacity: number;
  refillPerSec: number;
}): RateLimitResult {
  const { key, capacity, refillPerSec } = opts;
  const now = Date.now();
  const existing = buckets.get(key) ?? { tokens: capacity, updatedAt: now };
  const elapsedSec = (now - existing.updatedAt) / 1000;
  const tokens = Math.min(capacity, existing.tokens + elapsedSec * refillPerSec);

  if (tokens < 1) {
    const retryAfterMs = Math.ceil(((1 - tokens) / refillPerSec) * 1000);
    buckets.set(key, { tokens, updatedAt: now });
    return { ok: false, retryAfterMs };
  }

  buckets.set(key, { tokens: tokens - 1, updatedAt: now });
  return { ok: true };
}

export function clientKey(req: Request, prefix: string): string {
  const fwd = req.headers.get("x-forwarded-for");
  const ip = fwd ? fwd.split(",")[0]!.trim() : req.headers.get("x-real-ip") ?? "anon";
  return `${prefix}:${ip}`;
}
