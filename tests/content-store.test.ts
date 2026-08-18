import { test, describe, after } from "node:test";
import assert from "node:assert/strict";

/**
 * Content store tests, against a real PostgreSQL database.
 *
 * `leads.test.ts` fakes the store so it never touches a database, which is
 * right for testing the lead pipeline but leaves the actual SQL untested. That
 * gap once shipped a broken INSERT: the service areas statement listed ten
 * columns but bound nine values, so every column after the missing one took
 * its neighbour's value. It survived typecheck, lint and a local build, and
 * only failed on a clean build machine — because seeding short-circuits on a
 * database that already has content, so no local run ever executed it.
 *
 * Requires TEST_DATABASE_URL, deliberately separate from DATABASE_URL: these
 * tests write rows and run the seeder, neither of which belongs anywhere near
 * a production database. Without it they skip rather than fail, so `npm test`
 * still works on a machine with no Postgres.
 */

const TEST_URL = process.env.TEST_DATABASE_URL ?? "";
const SKIP = TEST_URL
  ? false
  : "set TEST_DATABASE_URL to run the content store tests";

// Point the pool at the test database before the module reads the environment.
if (TEST_URL) process.env.DATABASE_URL = TEST_URL;

const { seedContentIfEmpty } = await import("../src/server/content/seed");
const { areasStore } = await import("../src/server/content/store");
const { getServiceAreas } = await import("../src/server/content/read");
const { closeDb, execute } = await import("../src/server/db");

const CREATED: string[] = [];

after(async () => {
  if (!TEST_URL) return;
  for (const id of CREATED) {
    await execute("DELETE FROM service_areas WHERE id = $1", [id]);
  }
  await closeDb();
});

describe("seeding an empty database", { skip: SKIP }, () => {
  test("populates service areas without a constraint failure", async () => {
    // The exact call that once failed a deploy: it runs the migrations, then
    // the INSERT, so an arity mismatch surfaces here rather than in production.
    await seedContentIfEmpty();

    const areas = await getServiceAreas();
    assert.ok(
      areas.length > 0,
      "seeding produced no service areas, so every city page would 404",
    );
  });

  test("is idempotent", async () => {
    const before = (await getServiceAreas()).length;
    await seedContentIfEmpty();
    assert.equal(
      (await getServiceAreas()).length,
      before,
      "seeding twice duplicated the content",
    );
  });
});

describe("service area coverage flag", { skip: SKIP }, () => {
  test("survives a create and read back", async () => {
    const created = await areasStore.create({
      city: "Testville",
      state: "AZ",
      slug: `testville-${Date.now()}`,
      neighborhoods: ["Downtown"],
      note: "",
      published: true,
      sortOrder: 99,
      isPlaceholder: true,
    });
    CREATED.push(created.id);

    const stored = await areasStore.byId(created.id);
    assert.ok(stored, "the created area could not be read back");

    // The flag decides whether a city page is indexable. Losing it silently
    // means advertising towns the office does not drive to.
    assert.equal(stored.isPlaceholder, true);
    assert.equal(stored.city, "Testville");
    assert.equal(stored.sortOrder, 99);
    assert.deepEqual(stored.neighborhoods, ["Downtown"]);
  });

  test("can be cleared by an update, and the update actually applies", async () => {
    const slug = `editville-${Date.now()}`;
    const created = await areasStore.create({
      city: "Editville",
      state: "AZ",
      slug,
      neighborhoods: [],
      note: "",
      published: true,
      sortOrder: 98,
      isPlaceholder: true,
    });
    CREATED.push(created.id);

    const updated = await areasStore.update(created.id, {
      city: "Editville",
      state: "AZ",
      slug,
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

    const stored = await areasStore.byId(created.id);
    assert.equal(stored?.isPlaceholder, false);
    assert.equal(stored?.note, "Confirmed coverage");
    assert.deepEqual(stored?.neighborhoods, ["Old Town"]);
  });
});
