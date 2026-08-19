/**
 * Connects to DATABASE_URL, applies the schema, seeds it if empty, and reports
 * what is actually in there.
 *
 * Run with:  npm run db:check
 *
 * This exercises the real application code — the same migration and seeding
 * path a deployed instance takes on its first request — rather than a
 * standalone query. That matters because the SQL is otherwise only proven by
 * the first production request, which is a bad place to discover a typo.
 */

import { register } from "node:module";
register("../tests/alias-hooks.mjs", import.meta.url);

const url = process.env.DATABASE_URL ?? "";

if (!url) {
  console.error(`
  DATABASE_URL is not set.

  Add it to .env.local, or pass it for one run:
    $env:DATABASE_URL="postgres://..."; npm run db:check
`);
  process.exit(1);
}

// Never print the password.
const safe = url.replace(/:\/\/([^:]+):[^@]+@/, "://$1:****@");
const pooled = /-pooler\./.test(url);

console.log(`\n  Connecting to ${safe}`);
console.log(
  `  Pooled connection: ${pooled ? "yes" : "no — fine locally, but use the -pooler host on Vercel"}\n`,
);

const { seedContentIfEmpty } = await import("../src/server/content/seed.ts");
const { query, closeDb } = await import("../src/server/db.ts");

try {
  const started = Date.now();

  // Forces the migrations to run.
  await query("SELECT 1");
  console.log(`  ✓ connected and schema applied (${Date.now() - started} ms)`);

  const version = await query(
    "SELECT MAX(version) AS v FROM schema_migrations",
  );
  console.log(`  ✓ schema version ${version[0]?.v ?? "?"}`);

  await seedContentIfEmpty();
  console.log("  ✓ seeding complete\n");

  const tables = [
    "services",
    "team_members",
    "faqs",
    "service_areas",
    "leads",
    "settings",
  ];

  for (const table of tables) {
    const [{ n }] = await query(`SELECT COUNT(*) AS n FROM ${table}`);
    console.log(`    ${table.padEnd(15)} ${String(n).padStart(4)} rows`);
  }

  // Proves the JSONB and BOOLEAN columns decode back into the shapes the
  // pages expect, which is the part a bare connection test would miss.
  const [area] = await query(
    "SELECT city, neighborhoods, is_placeholder FROM service_areas ORDER BY sort_order LIMIT 1",
  );
  if (area) {
    console.log(
      `\n    sample row: ${area.city} — neighborhoods ${
        Array.isArray(area.neighborhoods)
          ? `decoded as an array of ${area.neighborhoods.length}`
          : `NOT an array (got ${typeof area.neighborhoods})`
      }, is_placeholder is a ${typeof area.is_placeholder}`,
    );
  }

  console.log("\n  Database is ready.\n");
} catch (error) {
  console.error(`\n  ✗ FAILED: ${error instanceof Error ? error.message : error}\n`);
  process.exitCode = 1;
} finally {
  await closeDb();
}
