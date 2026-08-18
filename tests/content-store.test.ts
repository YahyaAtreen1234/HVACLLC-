import { test, describe, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

/**
 * Content store tests, against a real SQLite file.
 *
 * `leads.test.ts` fakes the store so it never touches disk, which is right for
 * testing the lead pipeline but left the actual SQL untested. That gap shipped
 * a broken INSERT: the service areas statement listed ten columns but bound
 * nine values, so every column after the missing one took its neighbour's
 * value and `updated_at` ended up NULL.
 *
 * It survived typecheck, lint and a local production build, because a
 * developer machine already has a seeded database and seeding short-circuits.
 * Only a genuinely empty database runs that INSERT — which is what a clean
 * build machine has, so it failed there first.
 *
 * Hence a temporary directory per run: these must exercise the path a fresh
 * install takes, not the one a warm working copy takes.
 */

const dir = mkdtempSync(join(tmpdir(), "hvac-content-store-"));

// Must be set before the database module is imported: `env` reads
// process.env once, at module load.
process.env.LEADS_DB_PATH = join(dir, "content-test.db");

const { seedContentIfEmpty } = await import("../src/server/content/seed");
const { areasStore } = await import("../src/server/content/store");
const { getServiceAreas } = await import("../src/server/content/read");
const { closeDb } = await import("../src/server/db");

after(() => {
  // Close before removing: SQLite keeps the file open, and Windows refuses to
  // delete a directory that still has an open handle inside it.
  closeDb();
  rmSync(dir, { recursive: true, force: true });
});

describe("seeding an empty database", () => {
  test("populates service areas without a constraint failure", () => {
    // The exact call that failed the deploy. It runs the migrations, then the
    // INSERT, so an arity mismatch surfaces here rather than in production.
    seedContentIfEmpty();

    const areas = getServiceAreas();
    assert.ok(
      areas.length > 0,
      "seeding produced no service areas, so every city page would 404",
    );
  });

  test("is idempotent", () => {
    const before = getServiceAreas().length;
    seedContentIfEmpty();
    assert.equal(
      getServiceAreas().length,
      before,
      "seeding twice duplicated the content",
    );
  });
});

describe("service area coverage flag", () => {
  test("survives a create and read back", () => {
    const created = areasStore.create({
      city: "Testville",
      state: "AZ",
      slug: "testville",
      neighborhoods: ["Downtown"],
      note: "",
      published: true,
      sortOrder: 99,
      isPlaceholder: true,
    });

    const stored = areasStore.byId(created.id);
    assert.ok(stored, "the created area could not be read back");

    // The flag decides whether a city page is indexable. Losing it silently
    // means advertising towns the office does not drive to.
    assert.equal(stored.isPlaceholder, true);
    assert.equal(stored.city, "Testville");
    assert.equal(stored.sortOrder, 99);
    assert.deepEqual(stored.neighborhoods, ["Downtown"]);
  });

  test("can be cleared by an update, and the update actually applies", () => {
    const created = areasStore.create({
      city: "Editville",
      state: "AZ",
      slug: "editville",
      neighborhoods: [],
      note: "",
      published: true,
      sortOrder: 98,
      isPlaceholder: true,
    });

    const updated = areasStore.update(created.id, {
      city: "Editville",
      state: "AZ",
      slug: "editville",
      neighborhoods: ["Old Town"],
      note: "Confirmed coverage",
      published: true,
      sortOrder: 98,
      isPlaceholder: false,
    });

    // A misbound UPDATE shifts every value one place, leaving the WHERE clause
    // matching nothing. It changes no rows and reports no error, so the admin
    // panel would appear to save while discarding the edit.
    assert.ok(updated, "update matched no rows, so the edit was silently lost");

    const stored = areasStore.byId(created.id);
    assert.equal(stored?.isPlaceholder, false);
    assert.equal(stored?.note, "Confirmed coverage");
    assert.deepEqual(stored?.neighborhoods, ["Old Town"]);
  });
});
