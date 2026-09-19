import { Pool, type PoolClient, type QueryResultRow } from "pg";
import { env } from "./env";
import { services as seedServices } from "@/data/services";

/**
 * PostgreSQL connection.
 *
 * Replaces the previous SQLite file. SQLite needed a writable disk, which ruled
 * out serverless hosting: the filesystem there is read-only apart from a /tmp
 * that is wiped between requests, so leads and content edits could not survive.
 * Postgres is a network service, so the same code runs anywhere.
 *
 * The pool is cached on `globalThis` because the dev server re-imports modules
 * on every edit, and a fresh pool per edit would leak connections until the
 * server was restarted.
 */

const SCHEMA_VERSION = 4;

/**
 * Advisory lock id for migrations. Any fixed number works; it only has to be
 * the same in every process. Without it two instances starting together can
 * both decide the schema is out of date and race each other.
 */
const MIGRATION_LOCK_ID = 4_912_007;

interface DbGlobal {
  __pgPool?: Pool;
  __pgReady?: Promise<void>;
}

const globalRef = globalThis as unknown as DbGlobal;

function isLocalConnection(url: string): boolean {
  return /@(localhost|127\.0\.0\.1|\[::1\])(:|\/)/.test(url);
}

export function getPool(): Pool {
  if (globalRef.__pgPool) return globalRef.__pgPool;

  if (!env.databaseUrl) {
    throw new Error(
      "DATABASE_URL is not set. The site stores leads and editable content in " +
        "PostgreSQL — see the README for how to provision one.",
    );
  }

  const local = isLocalConnection(env.databaseUrl);

  const pool = new Pool({
    connectionString: env.databaseUrl,
    // Managed providers require TLS; a local server usually has none. Certificate
    // verification stays ON by default — DATABASE_SSL_NO_VERIFY exists for
    // providers that present a self-signed chain, and weakens the connection to
    // encryption without authentication, so it is opt-in rather than assumed.
    ssl: local
      ? false
      : env.databaseSslNoVerify
        ? { rejectUnauthorized: false }
        : true,
    // Deliberately small. On serverless every instance builds its own pool, so
    // a large max multiplied by the instance count exhausts the server's
    // connection limit. Point DATABASE_URL at a pooler if you expect traffic.
    max: 5,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  });

  // Without a listener, a dropped idle connection raises an unhandled 'error'
  // event and takes the process down.
  pool.on("error", (error) => {
    console.error("[db] idle client error:", error.message);
  });

  globalRef.__pgPool = pool;
  return pool;
}

async function migrate(client: PoolClient): Promise<void> {
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version    INTEGER PRIMARY KEY,
      applied_at TEXT NOT NULL
    )
  `);

  const { rows } = await client.query<{ version: number | null }>(
    "SELECT MAX(version) AS version FROM schema_migrations",
  );
  const current = Number(rows[0]?.version ?? 0);

  if (current >= SCHEMA_VERSION) return;

  // Migration 1 — full schema.
  //
  // The SQLite version reached this shape over three migrations. They are
  // collapsed here because Postgres starts empty: there is no existing database
  // to step forward, so replaying the history would only add ways to go wrong.
  // Later changes get their own numbered block below.
  if (current < 1) {
    await client.query(`
      CREATE TABLE IF NOT EXISTS leads (
        id            TEXT PRIMARY KEY,
        received_at   TEXT NOT NULL,
        name          TEXT NOT NULL,
        phone         TEXT NOT NULL,
        email         TEXT,
        zip           TEXT NOT NULL,
        service_slug  TEXT NOT NULL,
        service_name  TEXT NOT NULL,
        urgency       TEXT NOT NULL,
        message       TEXT,
        source        TEXT NOT NULL,
        status        TEXT NOT NULL DEFAULT 'new',
        ip_hash       TEXT,
        user_agent    TEXT,
        notified_at   TEXT,
        notify_error  TEXT
      );

      CREATE INDEX IF NOT EXISTS idx_leads_received_at ON leads (received_at DESC);
      CREATE INDEX IF NOT EXISTS idx_leads_status      ON leads (status);
      CREATE INDEX IF NOT EXISTS idx_leads_ip_hash     ON leads (ip_hash);

      CREATE TABLE IF NOT EXISTS settings (
        key        TEXT PRIMARY KEY,
        value      JSONB NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS services (
        id           TEXT PRIMARY KEY,
        slug         TEXT NOT NULL UNIQUE,
        name         TEXT NOT NULL,
        short_name   TEXT NOT NULL,
        summary      TEXT NOT NULL,
        description  TEXT NOT NULL,
        icon         TEXT NOT NULL,
        category     TEXT NOT NULL,
        body         JSONB   NOT NULL DEFAULT '[]'::jsonb,
        includes     JSONB   NOT NULL DEFAULT '[]'::jsonb,
        signs        JSONB   NOT NULL DEFAULT '[]'::jsonb,
        related      JSONB   NOT NULL DEFAULT '[]'::jsonb,
        image_src    TEXT    NOT NULL DEFAULT '',
        image_alt    TEXT    NOT NULL DEFAULT '',
        featured     BOOLEAN NOT NULL DEFAULT FALSE,
        published    BOOLEAN NOT NULL DEFAULT TRUE,
        sort_order   INTEGER NOT NULL DEFAULT 0,
        updated_at   TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS team_members (
        id          TEXT PRIMARY KEY,
        name        TEXT NOT NULL,
        role        TEXT NOT NULL,
        bio         TEXT NOT NULL,
        credentials JSONB   NOT NULL DEFAULT '[]'::jsonb,
        image_src   TEXT    NOT NULL DEFAULT '',
        image_alt   TEXT    NOT NULL DEFAULT '',
        published   BOOLEAN NOT NULL DEFAULT TRUE,
        sort_order  INTEGER NOT NULL DEFAULT 0,
        updated_at  TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS faqs (
        id         TEXT PRIMARY KEY,
        question   TEXT NOT NULL,
        answer     TEXT NOT NULL,
        topic      TEXT    NOT NULL DEFAULT 'general',
        published  BOOLEAN NOT NULL DEFAULT TRUE,
        sort_order INTEGER NOT NULL DEFAULT 0,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS service_areas (
        id             TEXT PRIMARY KEY,
        city           TEXT NOT NULL,
        state          TEXT NOT NULL,
        slug           TEXT NOT NULL,
        neighborhoods  JSONB   NOT NULL DEFAULT '[]'::jsonb,
        note           TEXT    NOT NULL DEFAULT '',
        published      BOOLEAN NOT NULL DEFAULT TRUE,
        sort_order     INTEGER NOT NULL DEFAULT 0,
        -- True while the town is unconfirmed seed data. Such areas are kept out
        -- of the sitemap and set to noindex, so the site never ranks for a town
        -- the office does not actually dispatch to.
        is_placeholder BOOLEAN NOT NULL DEFAULT FALSE,
        updated_at     TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_services_sort ON services (sort_order);
      CREATE INDEX IF NOT EXISTS idx_team_sort     ON team_members (sort_order);
      CREATE INDEX IF NOT EXISTS idx_faqs_topic    ON faqs (topic, sort_order);
      CREATE INDEX IF NOT EXISTS idx_areas_sort    ON service_areas (sort_order);
    `);
  }

  // Migration 2 — customer reviews.
  //
  // Previously these lived only in a TypeScript file, so publishing one meant a
  // developer and a deploy. A contractor collects reviews continuously and the
  // person holding them is not the person with the repository.
  if (current < 2) {
    await client.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id          TEXT PRIMARY KEY,
        author      TEXT NOT NULL,
        -- Constrained at the database rather than only in the form: a rating
        -- outside 1-5 would silently corrupt the average shown in search
        -- results, and that average is a published claim.
        rating      INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
        quote       TEXT NOT NULL,
        source      TEXT    NOT NULL DEFAULT 'Google',
        source_url  TEXT    NOT NULL DEFAULT '',
        review_date TEXT    NOT NULL,
        location    TEXT    NOT NULL DEFAULT '',
        service     TEXT    NOT NULL DEFAULT '',
        published   BOOLEAN NOT NULL DEFAULT TRUE,
        sort_order  INTEGER NOT NULL DEFAULT 0,
        updated_at  TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_reviews_sort
        ON reviews (sort_order, review_date DESC);
    `);
  }

  // Migration 3 — the towns the office actually dispatches to.
  //
  // The live database held one confirmed area, Phoenix, so /service-areas
  // listed a single city and the sitemap carried a single city page. The other
  // seven towns below were supplied by the business as the real coverage area,
  // which makes them confirmed rather than seed data: is_placeholder is FALSE,
  // so each one is indexable and gets its own city page.
  //
  // Written as a migration rather than a seed because the database is already
  // populated — a seeder that only fills an empty table would never run here.
  //
  // Two properties matter, since this executes on every boot until the version
  // row is written and the office can edit these rows in /admin/areas
  // afterwards:
  //
  //   • Keyed on `slug`, not `id`. Phoenix already exists under an id this code
  //     cannot know, so an id-based upsert would have inserted a second
  //     Phoenix rather than leaving the existing row alone.
  //   • Insert-only. `WHERE NOT EXISTS` means a town already present is
  //     untouched, so a name, note or neighbourhood list edited in the admin
  //     panel is never reverted by a later deploy.
  if (current < 3) {
    const now = new Date().toISOString();

    // Order as supplied by the business; sort_order drives the on-page order.
    const areas: Array<[string, string, number]> = [
      ["Sun City", "sun-city", 1],
      ["Peoria", "peoria", 2],
      ["Surprise", "surprise", 3],
      ["Goodyear", "goodyear", 4],
      ["Buckeye", "buckeye", 5],
      ["Phoenix", "phoenix", 6],
      ["Glendale", "glendale", 7],
      ["Avondale", "avondale", 8],
    ];

    for (const [city, slug, order] of areas) {
      await client.query(
        `INSERT INTO service_areas
           (id, city, state, slug, neighborhoods, note, published, sort_order,
            is_placeholder, updated_at)
         SELECT $1, $2, 'AZ', $3, '[]'::jsonb, '', TRUE, $4, FALSE, $5
         WHERE NOT EXISTS (
           SELECT 1 FROM service_areas WHERE slug = $3
         )`,
        [`area-${slug}`, city, slug, order, now],
      );
    }

    // Phoenix predates this migration and keeps whatever the office has edited
    // into it, but its position in the list is this migration's to set — left
    // alone it would sort by an order chosen before the other seven existed.
    await client.query(
      "UPDATE service_areas SET sort_order = $1 WHERE slug = 'phoenix'",
      [6],
    );
  }

  // Migration 4 — the job photographs the office supplied for each service.
  //
  // Every service row was created with an empty image_src, so each service
  // page and card was drawing the placeholder panel. These are the company's
  // own photographs of its own work — the far more persuasive thing to show a
  // homeowner than stock photography, which the site refuses to use anyway.
  //
  // The values come from src/data/services.ts rather than being written out
  // again here. Two copies of the same path and alt text would be two things
  // to keep in step, and the one that drifts is always the copy nobody looks
  // at — in this case the fallback used precisely when the database is down.
  //
  // Only fills rows that are still empty. A photograph swapped later in
  // /admin/services must survive the next deploy, and `WHERE image_src = ''`
  // is what guarantees that. Services with no suitable photograph — indoor air
  // quality and thermostats, which nothing in the supplied set actually shows
  // — are skipped here and keep their placeholder rather than borrowing a
  // picture of something else.
  if (current < 4) {
    for (const service of seedServices) {
      if (!service.image.src) continue;

      await client.query(
        `UPDATE services
            SET image_src = $1, image_alt = $2, updated_at = $3
          WHERE slug = $4 AND image_src = ''`,
        [
          service.image.src,
          service.image.alt,
          new Date().toISOString(),
          service.slug,
        ],
      );
    }
  }

  await client.query(
    "INSERT INTO schema_migrations (version, applied_at) VALUES ($1, $2) ON CONFLICT (version) DO NOTHING",
    [SCHEMA_VERSION, new Date().toISOString()],
  );
}

/**
 * Runs migrations once per process, serialised across processes.
 *
 * The promise is cached rather than a boolean so that concurrent callers during
 * start-up wait for the same run instead of each starting their own.
 */
function ready(): Promise<void> {
  if (globalRef.__pgReady) return globalRef.__pgReady;

  globalRef.__pgReady = (async () => {
    const client = await getPool().connect();
    try {
      await client.query("SELECT pg_advisory_lock($1)", [MIGRATION_LOCK_ID]);
      try {
        await migrate(client);
      } finally {
        await client.query("SELECT pg_advisory_unlock($1)", [MIGRATION_LOCK_ID]);
      }
    } catch (error) {
      // Let the next call retry rather than caching a permanent failure — a
      // database that was briefly unreachable at boot should not poison the
      // process for its lifetime.
      globalRef.__pgReady = undefined;
      throw error;
    } finally {
      client.release();
    }
  })();

  return globalRef.__pgReady;
}

/** Runs a query, returning the rows. Ensures the schema exists first. */
export async function query<T extends QueryResultRow = QueryResultRow>(
  sql: string,
  params: unknown[] = [],
): Promise<T[]> {
  await ready();
  const result = await getPool().query<T>(sql, params);
  return result.rows;
}

/** Runs a query expected to match at most one row. */
export async function queryOne<T extends QueryResultRow = QueryResultRow>(
  sql: string,
  params: unknown[] = [],
): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows[0] ?? null;
}

/** Runs a statement, returning how many rows it changed. */
export async function execute(
  sql: string,
  params: unknown[] = [],
): Promise<number> {
  await ready();
  const result = await getPool().query(sql, params);
  return result.rowCount ?? 0;
}

/**
 * COUNT(*) returns bigint, which node-postgres hands back as a string to avoid
 * losing precision past 2^53. Every caller wants a number, and forgetting the
 * conversion yields "0" being truthy and counts that concatenate instead of
 * adding — so it is done here, once.
 */
export async function count(sql: string, params: unknown[] = []): Promise<number> {
  const row = await queryOne<{ n: string | number }>(sql, params);
  return Number(row?.n ?? 0);
}

/** Closes the pool. Used by tests, and for a graceful shutdown. */
export async function closeDb(): Promise<void> {
  const pool = globalRef.__pgPool;
  globalRef.__pgPool = undefined;
  globalRef.__pgReady = undefined;
  await pool?.end();
}
