// Simple per-IP limiter. On Vercel each serverless instance keeps its own
// counts, which is enough to stop casual form spam. For a stricter shared
// limit, swap this for Upstash Ratelimit (see README).
const hits = new Map<string, number[]>();

export function rateLimit(key: string, limit = 5, windowMs = 10 * 60 * 1000) {
  const now = Date.now();
  const list = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (list.length >= limit) {
    hits.set(key, list);
    return false;
  }
  list.push(now);
  hits.set(key, list);
  return true;
}
