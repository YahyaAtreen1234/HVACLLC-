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

/**
 * A stored hash is `salt:hash` — 32 hex characters, a colon, then 128.
 * Checking the shape matters because a value that arrives mangled (wrapped in
 * quotes by a shell, truncated on paste, carrying a stray newline) otherwise
 * looks configured and simply rejects every password forever, with nothing to
 * suggest the value rather than the password is at fault.
 */
const HASH_SHAPE = /^[0-9a-f]{32}:[0-9a-f]{128}$/i;

export function isAdminConfigured(): boolean {
  return HASH_SHAPE.test(env.adminPasswordHash.trim());
}

export interface EnvCheck {
  key: string;
  ok: boolean;
  detail: string;
}

/**
 * What the running server can actually see, for each variable sign-in needs.
 *
 * Reports presence, length and shape — never any part of a value. The point is
 * to distinguish "the variable never arrived" from "it arrived damaged", which
 * look identical from the outside and have completely different fixes.
 */
export function adminEnvReport(): { checks: EnvCheck[]; context: string[] } {
  const raw = process.env.ADMIN_PASSWORD_HASH ?? "";
  const hash = raw.trim();

  let hashDetail: string;
  let hashOk = false;

  if (!raw) {
    hashDetail = "not set — this variable did not reach this deployment";
  } else if (HASH_SHAPE.test(hash)) {
    hashOk = true;
    hashDetail = `looks correct (${hash.length} characters)`;
  } else if (/^["'].*["']$/.test(hash)) {
    hashDetail = "wrapped in quotation marks — paste the value without them";
  } else if (!hash.includes(":")) {
    hashDetail = `${hash.length} characters and no colon — this is not a full hash, it looks truncated`;
  } else {
    hashDetail = `${hash.length} characters — expected 161 (32, a colon, then 128)`;
  }

  const username = process.env.ADMIN_USERNAME ?? "";
  const secret = process.env.ADMIN_SESSION_SECRET ?? "";

  const checks: EnvCheck[] = [
    { key: "ADMIN_PASSWORD_HASH", ok: hashOk, detail: hashDetail },
    {
      key: "ADMIN_USERNAME",
      ok: Boolean(username.trim()),
      detail: username.trim()
        ? `set (${username.trim().length} characters)`
        : "not set — defaults to \"admin\"",
    },
    {
      key: "ADMIN_SESSION_SECRET",
      ok: secret.trim().length >= 32,
      detail: !secret.trim()
        ? "not set — sessions cannot survive across serverless instances"
        : secret.trim().length < 32
          ? `only ${secret.trim().length} characters — 64 expected`
          : `set (${secret.trim().length} characters)`,
    },
  ];

  const context: string[] = [];
  const target = process.env.VERCEL_ENV;
  if (target) context.push(`Deployment environment: ${target}`);

  const sha = process.env.VERCEL_GIT_COMMIT_SHA;
  if (sha) context.push(`Built from commit: ${sha.slice(0, 7)}`);

  // Preview plus nothing set is the combination worth naming. Hosting
  // dashboards scope each variable to chosen environments, and saving one for
  // Production alone leaves every preview URL looking exactly like this —
  // which reads as "it did not save" rather than "it saved somewhere else".
  const nothingArrived = checks.every((check) => !check.ok);
  if (target === "preview" && nothingArrived) {
    context.push(
      "This is a preview URL — the one with a random suffix. Variables saved " +
        "only for Production never appear here. Tick Production, Preview and " +
        "Development when saving them, or test on the production domain instead.",
    );
  }

  return { checks, context };
}

/**
 * What to do about a missing admin password, phrased for wherever this is
 * running.
 *
 * The distinction matters: `.env.local` is gitignored and never deployed, so
 * telling someone looking at a live site to edit it sends them somewhere that
 * cannot possibly work. A deployed instance needs the variable set on the host
 * and — the part people miss — a fresh deployment, because a new environment
 * variable does not reach a build that already happened.
 */
export function adminSetupHint(): string {
  if (!env.isProduction) {
    return (
      "No admin password is configured. Run `npm run admin:setup` to create " +
      "one, then restart the dev server — credentials are read once at startup."
    );
  }

  return (
    "No admin password is configured on this deployment. In your hosting " +
    "provider's environment variables set ADMIN_PASSWORD_HASH, ADMIN_USERNAME " +
    "and ADMIN_SESSION_SECRET (copy them from your local .env.local), then " +
    "redeploy — new variables do not apply to a deployment that is already built."
  );
}

/**
 * Configuration problems that would let a login succeed and then fail
 * confusingly, rather than blocking it outright.
 */
export function adminConfigWarnings(): string[] {
  const warnings: string[] = [];

  if (isAdminConfigured() && !env.adminSessionSecret) {
    warnings.push(
      "ADMIN_SESSION_SECRET is not set, so sessions are signed with a key " +
        "generated per process. On serverless hosting each instance has its " +
        "own, so signing in will appear to work and then bounce you straight " +
        "back here. Set it and redeploy.",
    );
  }

  return warnings;
}
