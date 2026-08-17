import { timingSafeEqual } from "node:crypto";
import { env } from "./env";

/**
 * Bearer-token guard for the admin endpoints.
 *
 * Deliberately minimal: a single shared token from the environment. That is
 * appropriate for machine access (a script, a dashboard, an integration) and
 * is honest about what it is. It is NOT a login system — if the office needs a
 * browser UI with per-person accounts, add a real session layer rather than
 * putting this token in a cookie.
 *
 * When ADMIN_API_TOKEN is unset the endpoints refuse everything, so an
 * unconfigured deploy is closed rather than open.
 */

export type AuthResult =
  | { ok: true }
  | { ok: false; status: 401 | 503; message: string };

function constantTimeEquals(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  // timingSafeEqual throws on length mismatch, so compare lengths separately —
  // length is not the secret, the value is.
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export function authorizeAdmin(request: Request): AuthResult {
  if (!env.adminToken) {
    return {
      ok: false,
      status: 503,
      message:
        "Admin API is disabled because ADMIN_API_TOKEN is not configured on the server.",
    };
  }

  const header = request.headers.get("authorization") ?? "";
  const [scheme, token] = header.split(" ");

  if (scheme?.toLowerCase() !== "bearer" || !token) {
    return {
      ok: false,
      status: 401,
      message: "Provide an Authorization: Bearer <token> header.",
    };
  }

  if (!constantTimeEquals(token, env.adminToken)) {
    return { ok: false, status: 401, message: "Invalid token." };
  }

  return { ok: true };
}
