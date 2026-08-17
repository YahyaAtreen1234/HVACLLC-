import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySessionToken } from "./auth";

/**
 * Reads the admin session from the request cookies.
 *
 * Used by the admin layout to gate every page beneath /admin. Route handlers
 * that need the same check can call this too — it is the single definition of
 * "is this person logged in".
 */
export async function isLoggedIn(): Promise<boolean> {
  const store = await cookies();
  return verifySessionToken(store.get(SESSION_COOKIE)?.value);
}
