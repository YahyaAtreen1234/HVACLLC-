import { query, schemaStatus } from "@/server/db";
import { configuredChannels, configurationWarnings } from "@/server/env";
import { json } from "@/server/http";

/**
 * GET /api/health — deployment sanity check.
 *
 * Point an uptime monitor at this. It reports 503 when the database is
 * unreachable, so a broken deploy is caught by a monitor rather than by a
 * customer whose request vanishes.
 *
 * Deliberately leaks nothing sensitive: which channels are configured, not
 * their URLs or keys.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  let database: "ok" | "error" = "ok";
  let schema: { applied: number; expected: number } | null = null;

  try {
    // Also forces the migrations to run, so a schema problem shows up here
    // rather than on a customer's first request.
    await query("SELECT 1");

    // Reported because a migration that does not apply is otherwise silent:
    // reads keep working against the old shape and the only symptom is
    // content missing from pages. `applied` behind `expected` says so plainly.
    schema = await schemaStatus();
  } catch (error) {
    database = "error";

    // Logged, never returned. This route is unauthenticated and reachable by
    // anyone, and a driver's connection error carries infrastructure detail —
    // the database hostname on a DNS failure, host and port on a refused
    // connection, the role name on a rejected login. None of that is a
    // credential, but none of it belongs in a public response either, and the
    // operator can read it in the platform logs where it is actually useful.
    //
    // The status code is what an uptime monitor needs; the reason is not.
    console.error("[health] database check failed:", error);
  }

  const warnings = configurationWarnings();
  const healthy = database === "ok";

  return json(
    {
      status: healthy ? "ok" : "degraded",
      time: new Date().toISOString(),
      checks: {
        database,
        schema,
        notificationChannels: configuredChannels(),
      },
      warnings,
    },
    { status: healthy ? 200 : 503 },
  );
}
