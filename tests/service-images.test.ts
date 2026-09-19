import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { services } from "../src/data/services";

/**
 * The service photographs exist in two places and must agree.
 *
 * src/data/services.ts is the fallback the site renders when the database is
 * unreachable. Migration 5 in src/server/db.ts writes the same paths into the
 * database, which is what the site renders the rest of the time.
 *
 * Migration 4 tried to avoid the duplication by importing the data file into
 * the migration. It deployed, recorded itself, and updated nothing — no
 * exception, no failing read, just eight rows left empty and service pages
 * still showing the placeholder. Whatever the cause, the lesson was that a
 * migration is the wrong place to depend on another module resolving.
 *
 * So the strings are written twice, and this test is what keeps them honest:
 * it reads the migration's own source and compares it against the data file.
 * Change a photograph in one place and forget the other, and this fails.
 */

const DB_SOURCE = readFileSync(
  join(import.meta.dirname, "..", "src", "server", "db.ts"),
  "utf8",
);

/** Pulls the [slug, src, alt] triples out of migration 5's photo table. */
function migrationPhotos(): Map<string, { src: string; alt: string }> {
  const block = DB_SOURCE.split("if (current < 5) {")[1];
  assert.ok(block, "migration 5 is missing from db.ts");

  const table = block.split("];")[0];
  const found = new Map<string, { src: string; alt: string }>();

  for (const match of table.matchAll(
    /\["([a-z-]+)",\s*"([^"]+)",\s*\n?\s*"([^"]+)"\]/g,
  )) {
    found.set(match[1], { src: match[2], alt: match[3] });
  }

  return found;
}

describe("service photographs agree between the data file and the migration", () => {
  const fromMigration = migrationPhotos();
  const withPhoto = services.filter((service) => service.image.src);

  test("the migration table was parsed at all", () => {
    assert.ok(
      fromMigration.size > 0,
      "parsed zero entries out of migration 5 — the format changed and this " +
        "test is no longer checking anything",
    );
  });

  test("every service with a photo in the data file is in the migration", () => {
    const missing = withPhoto
      .map((service) => service.slug)
      .filter((slug) => !fromMigration.has(slug));

    assert.deepEqual(
      missing,
      [],
      `these services have a photo in src/data/services.ts but no row in ` +
        `migration 5, so the live database will never get it: ${missing.join(", ")}`,
    );
  });

  test("the migration names no service the data file does not", () => {
    const slugs = new Set(services.map((service) => service.slug));
    const unknown = [...fromMigration.keys()].filter((slug) => !slugs.has(slug));

    assert.deepEqual(unknown, [], `migration 5 names unknown services: ${unknown.join(", ")}`);
  });

  test("paths and alt text match exactly", () => {
    const mismatches: string[] = [];

    for (const service of withPhoto) {
      const row = fromMigration.get(service.slug);
      if (!row) continue;

      if (row.src !== service.image.src) {
        mismatches.push(`${service.slug} src: "${row.src}" vs "${service.image.src}"`);
      }
      if (row.alt !== service.image.alt) {
        mismatches.push(`${service.slug} alt differs`);
      }
    }

    assert.deepEqual(mismatches, [], mismatches.join("\n  "));
  });

  test("every referenced photograph is a lowercase path that exists", () => {
    const problems: string[] = [];

    for (const service of withPhoto) {
      const src = service.image.src;

      // Windows resolves a mis-cased path and Linux does not, so a capital
      // letter here is a 404 in production and nowhere else. This repo has
      // already shipped that twice.
      if (src !== src.toLowerCase()) {
        problems.push(`${service.slug}: "${src}" is not lowercase`);
      }
      if (/\s/.test(src)) {
        problems.push(`${service.slug}: "${src}" contains a space`);
      }

      try {
        readFileSync(join(import.meta.dirname, "..", "public", src));
      } catch {
        problems.push(`${service.slug}: public${src} does not exist`);
      }
    }

    assert.deepEqual(problems, [], problems.join("\n  "));
  });
});
