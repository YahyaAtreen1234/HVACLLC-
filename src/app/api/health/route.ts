import { getDb } from "@/server/db";
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
  let databaseError: string | null = null;

  try {
    getDb().prepare("SELECT 1").get();
  } catch (error) {
    database = "error";
    databaseError = error instanceof Error ? error.message : String(error);
  }

  const warnings = configurationWarnings();
  const healthy = database === "ok";

  return json(
    {
      status: healthy ? "ok" : "degraded",
      time: new Date().toISOString(),
      checks: {
        database,
        ...(databaseError ? { databaseError } : {}),
        notificationChannels: configuredChannels(),
      },
      warnings,
    },
    { status: healthy ? 200 : 503 },
  );
}
