import { createHash, randomBytes } from "node:crypto";
import { env } from "./env";

/**
 * Deriving what we need from an incoming request, without keeping more
 * personal data than the job requires.
 */

// Falls back to a per-process random salt so hashes are never unsalted, even
// when IP_HASH_SALT is missing. /api/health warns when that happens.
const fallbackSalt = randomBytes(32).toString("hex");

/**
 * One-way hash of the client IP.
 *
 * Rate limiting and abuse investigation only need to know "same source or
 * not" — they never need the address itself. Hashing means a database leak
 * does not expose visitors' IPs.
 */
export function hashIp(ip: string | null): string | null {
  if (!ip) return null;
  const salt = env.ipHashSalt || fallbackSalt;
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex").slice(0, 32);
}

/**
 * Best-effort client IP.
 *
 * ⚠️ `x-forwarded-for` is trivially spoofed unless a trusted proxy sets it.
 * Behind Vercel/Cloudflare/nginx the left-most entry is the real client and is
 * safe to use; on a host without a proxy, treat this as a hint only. It is used
 * for rate limiting, never for authorisation.
 */
export function getClientIp(headers: Headers): string | null {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return (
    headers.get("cf-connecting-ip") ??
    headers.get("x-real-ip") ??
    null
  );
}

export function getUserAgent(headers: Headers): string | null {
  const ua = headers.get("user-agent");
  return ua ? ua.slice(0, 300) : null;
}
