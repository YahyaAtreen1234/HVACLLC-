import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { env } from "../env";

/**
 * Admin session handling.
 *
 * A signed, stateless session cookie: the token carries its own expiry and an
 * HMAC over it, so a forged or edited cookie fails verification. There is no
 * session table to keep in sync, and no way to mint a token without the secret.
 *
 * This is deliberately a single shared login, not per-person accounts. It is
 * enough to keep the panel private; if several people need separate audited
 * logins, that needs a user table and this is where it would go.
 */

export const SESSION_COOKIE = "hvac_admin_session";
const MAX_AGE_SECONDS = 7 * 24 * 60 * 60; // 7 days

// Falls back to a per-process secret so tokens are never unsigned. That means
// a restart logs everyone out, which /api/health warns about.
const fallbackSecret = randomBytes(32).toString("hex");

function secret(): string {
  return env.adminSessionSecret || fallbackSecret;
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("hex");
}

/** `expiresAt.signature` */
export function createSessionToken(): string {
  const expiresAt = Date.now() + MAX_AGE_SECONDS * 1000;
  const payload = String(expiresAt);
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token: string | null | undefined): boolean {
  if (!token) return false;

  const separator = token.lastIndexOf(".");
  if (separator === -1) return false;

  const payload = token.slice(0, separator);
  const signature = token.slice(separator + 1);

  const expected = sign(payload);
  const given = Buffer.from(signature);
  const want = Buffer.from(expected);

  if (given.length !== want.length) return false;
  if (!timingSafeEqual(given, want)) return false;

  const expiresAt = Number(payload);
  return Number.isFinite(expiresAt) && Date.now() < expiresAt;
}

/**
 * Cookie options.
 *
 * `secure` is off in development because localhost is plain http — a Secure
 * cookie would simply never be sent back, making login appear to fail.
 */
export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: env.isProduction,
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  };
}

export function isAdminConfigured(): boolean {
  return Boolean(env.adminPasswordHash);
}
