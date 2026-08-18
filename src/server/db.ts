import { Pool, type PoolClient, type QueryResultRow } from "pg";
import { env } from "./env";

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

const SCHEMA_VERSION = 1;

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
