import { SESSION_COOKIE, verifySessionToken } from "./auth";

/**
 * Session check for route handlers, which receive a raw Request rather than
 * Next's cookie store. Server components should use `session.ts` instead.
 */
export function isRequestAuthenticated(request: Request): boolean {
  const header = request.headers.get("cookie") ?? "";
  const match = header
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${SESSION_COOKIE}=`));

  if (!match) return false;
  return verifySessionToken(match.slice(SESSION_COOKIE.length + 1));
}
