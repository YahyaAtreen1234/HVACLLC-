import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname, isAbsolute, join } from "node:path";
import { env } from "./env";

/**
 * SQLite connection, using Node's built-in `node:sqlite` — no native module to
 * compile, no dependency to audit, no service to provision. Good enough for the
 * lead volume of a contractor, and durable across restarts.
 *
 * ⚠️ Serverless note: platforms with an ephemeral filesystem (Vercel, Netlify
 * functions) will lose this file between invocations. For those, implement the
 * `LeadStore` interface in `leads/store.ts` against Postgres — that interface
 * is the only thing the rest of the backend knows about.
 *
 * The connection is created lazily and cached on `globalThis` so the dev
 * server's hot reload does not open a new handle on every edit.
 */

const SCHEMA_VERSION = 2;

interface DbGlobal {
  __leadsDb?: DatabaseSync;
}

const globalRef = globalThis as unknown as DbGlobal;

function resolveDbPath(): string {
  return isAbsolute(env.leadsDbPath)
    ? env.leadsDbPath
    : join(process.cwd(), env.leadsDbPath);
}

function migrate(db: DatabaseSync): void {
  const [{ user_version: current }] = db
    .prepare("PRAGMA user_version")
    .all() as Array<{ user_version: number }>;

  if (current >= SCHEMA_VERSION) return;

  // Migration 1 — initial schema.
  if (current < 1) {
    db.exec(`
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
    `);
  }

  // Migration 2 — editable site content.
  //
  // Content that the owner must be able to change without a developer moves
  // out of the TypeScript data files and into these tables. The files remain
  // as the seed: on an empty database they populate it once (see seed.ts), so
  // a fresh install still ships with a complete site.
  if (current < 2) {
    db.exec(`
      CREATE TABLE IF NOT EXISTS settings (
        key        TEXT PRIMARY KEY,
        value      TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS services (
        id             TEXT PRIMARY KEY,
        slug           TEXT NOT NULL UNIQUE,
        name           TEXT NOT NULL,
        short_name     TEXT NOT NULL,
        summary        TEXT NOT NULL,
        description    TEXT NOT NULL,
        icon           TEXT NOT NULL,
        category       TEXT NOT NULL,
        body           TEXT NOT NULL DEFAULT '[]',
        includes       TEXT NOT NULL DEFAULT '[]',
        signs          TEXT NOT NULL DEFAULT '[]',
        related        TEXT NOT NULL DEFAULT '[]',
        image_alt      TEXT NOT NULL DEFAULT '',
        image_src      TEXT NOT NULL DEFAULT '',
        featured       INTEGER NOT NULL DEFAULT 0,
        published      INTEGER NOT NULL DEFAULT 1,
        sort_order     INTEGER NOT NULL DEFAULT 0,
        updated_at     TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS team_members (
        id           TEXT PRIMARY KEY,
        name         TEXT NOT NULL,
        role         TEXT NOT NULL,
        bio          TEXT NOT NULL,
        credentials  TEXT NOT NULL DEFAULT '[]',
        image_src    TEXT NOT NULL DEFAULT '',
        image_alt    TEXT NOT NULL DEFAULT '',
        published    INTEGER NOT NULL DEFAULT 1,
        sort_order   INTEGER NOT NULL DEFAULT 0,
        updated_at   TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS faqs (
        id          TEXT PRIMARY KEY,
        question    TEXT NOT NULL,
        answer      TEXT NOT NULL,
        topic       TEXT NOT NULL DEFAULT 'general',
        published   INTEGER NOT NULL DEFAULT 1,
        sort_order  INTEGER NOT NULL DEFAULT 0,
        updated_at  TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS service_areas (
        id             TEXT PRIMARY KEY,
        city           TEXT NOT NULL,
        state          TEXT NOT NULL,
        slug           TEXT NOT NULL,
        neighborhoods  TEXT NOT NULL DEFAULT '[]',
        note           TEXT NOT NULL DEFAULT '',
        published      INTEGER NOT NULL DEFAULT 1,
        sort_order     INTEGER NOT NULL DEFAULT 0,
        updated_at     TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_services_sort  ON services (sort_order);
      CREATE INDEX IF NOT EXISTS idx_team_sort      ON team_members (sort_order);
      CREATE INDEX IF NOT EXISTS idx_faqs_topic     ON faqs (topic, sort_order);
      CREATE INDEX IF NOT EXISTS idx_areas_sort     ON service_areas (sort_order);
    `);
  }

  db.exec(`PRAGMA user_version = ${SCHEMA_VERSION}`);
}

export function getDb(): DatabaseSync {
  if (globalRef.__leadsDb) return globalRef.__leadsDb;

  const path = resolveDbPath();
  mkdirSync(dirname(path), { recursive: true });

  const db = new DatabaseSync(path);

  // WAL keeps reads from blocking writes; FULL sync trades a little speed for
  // not losing a lead to an unclean shutdown, which is the right trade here.
  db.exec("PRAGMA journal_mode = WAL");
  db.exec("PRAGMA synchronous = FULL");
  db.exec("PRAGMA foreign_keys = ON");

  migrate(db);

  globalRef.__leadsDb = db;
  return db;
}
