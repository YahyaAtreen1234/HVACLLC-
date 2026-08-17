import { randomUUID } from "node:crypto";
import { getDb } from "../db";
import type { IconName } from "@/types";

/**
 * Editable site content.
 *
 * These are the things the owner must be able to change without a developer:
 * services, team, FAQs, service areas, and business settings. Everything the
 * public pages render comes through here.
 *
 * All reads are synchronous (SQLite is in-process, so there is nothing to
 * await) and cheap enough to call directly from a server component.
 */

type Row = Record<string, unknown>;

const str = (row: Row, key: string): string =>
  typeof row[key] === "string" ? (row[key] as string) : String(row[key] ?? "");

const num = (row: Row, key: string): number =>
  typeof row[key] === "number" ? (row[key] as number) : Number(row[key] ?? 0);

const bool = (row: Row, key: string): boolean => num(row, key) === 1;

function jsonArray(row: Row, key: string): string[] {
  try {
    const parsed: unknown = JSON.parse(str(row, key) || "[]");
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

const now = () => new Date().toISOString();

// ---------------------------------------------------------------------------
// Services
// ---------------------------------------------------------------------------

export interface DbService {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  summary: string;
  description: string;
  icon: IconName;
  category: string;
  body: string[];
  includes: string[];
  signs: string[];
  related: string[];
  imageSrc: string;
  imageAlt: string;
  featured: boolean;
  published: boolean;
  sortOrder: number;
}

export type ServiceInput = Omit<DbService, "id">;

function toService(row: Row): DbService {
  return {
    id: str(row, "id"),
    slug: str(row, "slug"),
    name: str(row, "name"),
    shortName: str(row, "short_name"),
    summary: str(row, "summary"),
    description: str(row, "description"),
    icon: str(row, "icon") as IconName,
    category: str(row, "category"),
    body: jsonArray(row, "body"),
    includes: jsonArray(row, "includes"),
    signs: jsonArray(row, "signs"),
    related: jsonArray(row, "related"),
    imageSrc: str(row, "image_src"),
    imageAlt: str(row, "image_alt"),
    featured: bool(row, "featured"),
    published: bool(row, "published"),
    sortOrder: num(row, "sort_order"),
  };
}

export const servicesStore = {
  all(includeUnpublished = false): DbService[] {
    const sql = includeUnpublished
      ? "SELECT * FROM services ORDER BY sort_order, name"
      : "SELECT * FROM services WHERE published = 1 ORDER BY sort_order, name";
    const rows: Row[] = getDb().prepare(sql).all();
    return rows.map(toService);
  },

  bySlug(slug: string): DbService | null {
    const row: Row | undefined = getDb()
      .prepare("SELECT * FROM services WHERE slug = ?")
      .get(slug);
    return row ? toService(row) : null;
  },

  byId(id: string): DbService | null {
    const row: Row | undefined = getDb()
      .prepare("SELECT * FROM services WHERE id = ?")
      .get(id);
    return row ? toService(row) : null;
  },

  create(input: ServiceInput): DbService {
    const id = randomUUID();
    getDb()
      .prepare(
        `INSERT INTO services (
           id, slug, name, short_name, summary, description, icon, category,
           body, includes, signs, related, image_src, image_alt,
           featured, published, sort_order, updated_at
         ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      )
      .run(
        id,
        input.slug,
        input.name,
        input.shortName,
        input.summary,
        input.description,
        input.icon,
        input.category,
        JSON.stringify(input.body),
        JSON.stringify(input.includes),
        JSON.stringify(input.signs),
        JSON.stringify(input.related),
        input.imageSrc,
        input.imageAlt,
        input.featured ? 1 : 0,
        input.published ? 1 : 0,
        input.sortOrder,
        now(),
      );
    return { id, ...input };
  },

  update(id: string, input: ServiceInput): DbService | null {
    const result = getDb()
      .prepare(
        `UPDATE services SET
           slug=?, name=?, short_name=?, summary=?, description=?, icon=?,
           category=?, body=?, includes=?, signs=?, related=?, image_src=?,
           image_alt=?, featured=?, published=?, sort_order=?, updated_at=?
         WHERE id=?`,
      )
      .run(
        input.slug,
        input.name,
        input.shortName,
        input.summary,
        input.description,
        input.icon,
        input.category,
        JSON.stringify(input.body),
        JSON.stringify(input.includes),
        JSON.stringify(input.signs),
        JSON.stringify(input.related),
        input.imageSrc,
        input.imageAlt,
        input.featured ? 1 : 0,
        input.published ? 1 : 0,
        input.sortOrder,
        now(),
        id,
      );
    return result.changes ? { id, ...input } : null;
  },

  remove(id: string): boolean {
    return getDb().prepare("DELETE FROM services WHERE id = ?").run(id).changes > 0;
  },

  count(): number {
    const row = getDb().prepare("SELECT COUNT(*) AS n FROM services").get() as {
      n: number;
    };
    return row.n;
  },
};

// ---------------------------------------------------------------------------
// Team
// ---------------------------------------------------------------------------

export interface DbTeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  credentials: string[];
  imageSrc: string;
  imageAlt: string;
  published: boolean;
  sortOrder: number;
}

export type TeamMemberInput = Omit<DbTeamMember, "id">;

function toTeamMember(row: Row): DbTeamMember {
  return {
    id: str(row, "id"),
    name: str(row, "name"),
    role: str(row, "role"),
    bio: str(row, "bio"),
    credentials: jsonArray(row, "credentials"),
    imageSrc: str(row, "image_src"),
    imageAlt: str(row, "image_alt"),
    published: bool(row, "published"),
    sortOrder: num(row, "sort_order"),
  };
}

export const teamStore = {
  all(includeUnpublished = false): DbTeamMember[] {
    const sql = includeUnpublished
      ? "SELECT * FROM team_members ORDER BY sort_order, name"
      : "SELECT * FROM team_members WHERE published = 1 ORDER BY sort_order, name";
    const rows: Row[] = getDb().prepare(sql).all();
    return rows.map(toTeamMember);
  },

  byId(id: string): DbTeamMember | null {
    const row: Row | undefined = getDb()
      .prepare("SELECT * FROM team_members WHERE id = ?")
      .get(id);
    return row ? toTeamMember(row) : null;
  },

  create(input: TeamMemberInput): DbTeamMember {
    const id = randomUUID();
    getDb()
      .prepare(
        `INSERT INTO team_members
           (id, name, role, bio, credentials, image_src, image_alt, published, sort_order, updated_at)
         VALUES (?,?,?,?,?,?,?,?,?,?)`,
      )
      .run(
        id,
        input.name,
        input.role,
        input.bio,
        JSON.stringify(input.credentials),
        input.imageSrc,
        input.imageAlt,
        input.published ? 1 : 0,
        input.sortOrder,
        now(),
      );
    return { id, ...input };
  },

  update(id: string, input: TeamMemberInput): DbTeamMember | null {
    const result = getDb()
      .prepare(
        `UPDATE team_members SET
           name=?, role=?, bio=?, credentials=?, image_src=?, image_alt=?,
           published=?, sort_order=?, updated_at=?
         WHERE id=?`,
      )
      .run(
        input.name,
        input.role,
        input.bio,
        JSON.stringify(input.credentials),
        input.imageSrc,
        input.imageAlt,
        input.published ? 1 : 0,
        input.sortOrder,
        now(),
        id,
      );
    return result.changes ? { id, ...input } : null;
  },

  remove(id: string): boolean {
    return (
      getDb().prepare("DELETE FROM team_members WHERE id = ?").run(id).changes > 0
    );
  },

  count(): number {
    const row = getDb()
      .prepare("SELECT COUNT(*) AS n FROM team_members")
      .get() as { n: number };
    return row.n;
  },
};

// ---------------------------------------------------------------------------
// FAQs
// ---------------------------------------------------------------------------

export interface DbFaq {
  id: string;
  question: string;
  answer: string;
  topic: string;
  published: boolean;
  sortOrder: number;
}

export type FaqInput = Omit<DbFaq, "id">;

function toFaq(row: Row): DbFaq {
  return {
    id: str(row, "id"),
    question: str(row, "question"),
    answer: str(row, "answer"),
    topic: str(row, "topic"),
    published: bool(row, "published"),
    sortOrder: num(row, "sort_order"),
  };
}

export const faqsStore = {
  all(includeUnpublished = false): DbFaq[] {
    const sql = includeUnpublished
      ? "SELECT * FROM faqs ORDER BY sort_order, question"
      : "SELECT * FROM faqs WHERE published = 1 ORDER BY sort_order, question";
    const rows: Row[] = getDb().prepare(sql).all();
    return rows.map(toFaq);
  },

  byTopic(topic: string): DbFaq[] {
    const rows: Row[] = getDb()
      .prepare(
        "SELECT * FROM faqs WHERE published = 1 AND topic = ? ORDER BY sort_order, question",
      )
      .all(topic);
    return rows.map(toFaq);
  },

  byId(id: string): DbFaq | null {
    const row: Row | undefined = getDb()
      .prepare("SELECT * FROM faqs WHERE id = ?")
      .get(id);
    return row ? toFaq(row) : null;
  },

  create(input: FaqInput): DbFaq {
    const id = randomUUID();
    getDb()
      .prepare(
        `INSERT INTO faqs (id, question, answer, topic, published, sort_order, updated_at)
         VALUES (?,?,?,?,?,?,?)`,
      )
      .run(
        id,
        input.question,
        input.answer,
        input.topic,
        input.published ? 1 : 0,
        input.sortOrder,
        now(),
      );
    return { id, ...input };
  },

  update(id: string, input: FaqInput): DbFaq | null {
    const result = getDb()
      .prepare(
        `UPDATE faqs SET question=?, answer=?, topic=?, published=?, sort_order=?, updated_at=?
         WHERE id=?`,
      )
      .run(
        input.question,
        input.answer,
        input.topic,
        input.published ? 1 : 0,
        input.sortOrder,
        now(),
        id,
      );
    return result.changes ? { id, ...input } : null;
  },

  remove(id: string): boolean {
    return getDb().prepare("DELETE FROM faqs WHERE id = ?").run(id).changes > 0;
  },

  count(): number {
    const row = getDb().prepare("SELECT COUNT(*) AS n FROM faqs").get() as {
      n: number;
    };
    return row.n;
  },
};

// ---------------------------------------------------------------------------
// Service areas
// ---------------------------------------------------------------------------

export interface DbServiceArea {
  id: string;
  city: string;
  state: string;
  slug: string;
  neighborhoods: string[];
  note: string;
  published: boolean;
  sortOrder: number;
}

export type ServiceAreaInput = Omit<DbServiceArea, "id">;

function toArea(row: Row): DbServiceArea {
  return {
    id: str(row, "id"),
    city: str(row, "city"),
    state: str(row, "state"),
    slug: str(row, "slug"),
    neighborhoods: jsonArray(row, "neighborhoods"),
    note: str(row, "note"),
    published: bool(row, "published"),
    sortOrder: num(row, "sort_order"),
  };
}

export const areasStore = {
  all(includeUnpublished = false): DbServiceArea[] {
    const sql = includeUnpublished
      ? "SELECT * FROM service_areas ORDER BY sort_order, city"
      : "SELECT * FROM service_areas WHERE published = 1 ORDER BY sort_order, city";
    const rows: Row[] = getDb().prepare(sql).all();
    return rows.map(toArea);
  },

  byId(id: string): DbServiceArea | null {
    const row: Row | undefined = getDb()
      .prepare("SELECT * FROM service_areas WHERE id = ?")
      .get(id);
    return row ? toArea(row) : null;
  },

  create(input: ServiceAreaInput): DbServiceArea {
    const id = randomUUID();
    getDb()
      .prepare(
        `INSERT INTO service_areas
           (id, city, state, slug, neighborhoods, note, published, sort_order, updated_at)
         VALUES (?,?,?,?,?,?,?,?,?)`,
      )
      .run(
        id,
        input.city,
        input.state,
        input.slug,
        JSON.stringify(input.neighborhoods),
        input.note,
        input.published ? 1 : 0,
        input.sortOrder,
        now(),
      );
    return { id, ...input };
  },

  update(id: string, input: ServiceAreaInput): DbServiceArea | null {
    const result = getDb()
      .prepare(
        `UPDATE service_areas SET
           city=?, state=?, slug=?, neighborhoods=?, note=?, published=?, sort_order=?, updated_at=?
         WHERE id=?`,
      )
      .run(
        input.city,
        input.state,
        input.slug,
        JSON.stringify(input.neighborhoods),
        input.note,
        input.published ? 1 : 0,
        input.sortOrder,
        now(),
        id,
      );
    return result.changes ? { id, ...input } : null;
  },

  remove(id: string): boolean {
    return (
      getDb().prepare("DELETE FROM service_areas WHERE id = ?").run(id).changes > 0
    );
  },

  count(): number {
    const row = getDb()
      .prepare("SELECT COUNT(*) AS n FROM service_areas")
      .get() as { n: number };
    return row.n;
  },
};

// ---------------------------------------------------------------------------
// Settings — arbitrary JSON blobs keyed by name (business config, etc.)
// ---------------------------------------------------------------------------

export const settingsStore = {
  get<T>(key: string): T | null {
    const row: Row | undefined = getDb()
      .prepare("SELECT value FROM settings WHERE key = ?")
      .get(key);
    if (!row) return null;
    try {
      return JSON.parse(str(row, "value")) as T;
    } catch {
      return null;
    }
  },

  set(key: string, value: unknown): void {
    getDb()
      .prepare(
        `INSERT INTO settings (key, value, updated_at) VALUES (?,?,?)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
      )
      .run(key, JSON.stringify(value), now());
  },

  has(key: string): boolean {
    const row = getDb()
      .prepare("SELECT COUNT(*) AS n FROM settings WHERE key = ?")
      .get(key) as { n: number };
    return row.n > 0;
  },
};
