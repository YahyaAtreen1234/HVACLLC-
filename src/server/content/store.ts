import { randomUUID } from "node:crypto";
import { count as countRows, execute, query, queryOne } from "../db";
import type { IconName } from "@/types";

/**
 * Editable site content.
 *
 * These are the things the owner must be able to change without a developer:
 * services, team, FAQs, service areas, and business settings. Everything the
 * public pages render comes through here.
 *
 * Every method is async: Postgres is a network service, unlike the in-process
 * SQLite this replaced. Callers are server components and route handlers, both
 * of which can await, so the change is confined to adding `await`.
 */

type Row = Record<string, unknown>;

const str = (row: Row, key: string): string =>
  typeof row[key] === "string" ? (row[key] as string) : String(row[key] ?? "");

const num = (row: Row, key: string): number =>
  typeof row[key] === "number" ? (row[key] as number) : Number(row[key] ?? 0);

/**
 * Postgres BOOLEAN comes back as a real boolean. The numeric branch is kept so
 * a column read through a driver that returns 0/1 still behaves.
 */
const bool = (row: Row, key: string): boolean => {
  const value = row[key];
  if (typeof value === "boolean") return value;
  return num(row, key) === 1;
};

/**
 * JSONB is decoded by the driver, so the value normally arrives as an array
 * already. The string branch covers a column that still holds encoded JSON.
 */
function jsonArray(row: Row, key: string): string[] {
  const value = row[key];
  if (Array.isArray(value)) return value.map(String);

  try {
    const parsed: unknown = JSON.parse(str(row, key) || "[]");
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

/** Arrays are handed to Postgres as JSON text and cast into the jsonb column. */
const json = (value: unknown): string => JSON.stringify(value);

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
  async all(includeUnpublished = false): Promise<DbService[]> {
    const sql = includeUnpublished
      ? "SELECT * FROM services ORDER BY sort_order, name"
      : "SELECT * FROM services WHERE published = TRUE ORDER BY sort_order, name";
    return (await query(sql)).map(toService);
  },

  async bySlug(slug: string): Promise<DbService | null> {
    const row = await queryOne("SELECT * FROM services WHERE slug = $1", [slug]);
    return row ? toService(row) : null;
  },

  async byId(id: string): Promise<DbService | null> {
    const row = await queryOne("SELECT * FROM services WHERE id = $1", [id]);
    return row ? toService(row) : null;
  },

  async create(input: ServiceInput): Promise<DbService> {
    const id = randomUUID();
    await execute(
      `INSERT INTO services (
         id, slug, name, short_name, summary, description, icon, category,
         body, includes, signs, related, image_src, image_alt,
         featured, published, sort_order, updated_at
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)`,
      [
        id,
        input.slug,
        input.name,
        input.shortName,
        input.summary,
        input.description,
        input.icon,
        input.category,
        json(input.body),
        json(input.includes),
        json(input.signs),
        json(input.related),
        input.imageSrc,
        input.imageAlt,
        input.featured,
        input.published,
        input.sortOrder,
        now(),
      ],
    );
    return { id, ...input };
  },

  async update(id: string, input: ServiceInput): Promise<DbService | null> {
    const changed = await execute(
      `UPDATE services SET
         slug=$1, name=$2, short_name=$3, summary=$4, description=$5, icon=$6,
         category=$7, body=$8, includes=$9, signs=$10, related=$11, image_src=$12,
         image_alt=$13, featured=$14, published=$15, sort_order=$16, updated_at=$17
       WHERE id=$18`,
      [
        input.slug,
        input.name,
        input.shortName,
        input.summary,
        input.description,
        input.icon,
        input.category,
        json(input.body),
        json(input.includes),
        json(input.signs),
        json(input.related),
        input.imageSrc,
        input.imageAlt,
        input.featured,
        input.published,
        input.sortOrder,
        now(),
        id,
      ],
    );
    return changed ? { id, ...input } : null;
  },

  async remove(id: string): Promise<boolean> {
    return (await execute("DELETE FROM services WHERE id = $1", [id])) > 0;
  },

  count(): Promise<number> {
    return countRows("SELECT COUNT(*) AS n FROM services");
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
  async all(includeUnpublished = false): Promise<DbTeamMember[]> {
    const sql = includeUnpublished
      ? "SELECT * FROM team_members ORDER BY sort_order, name"
      : "SELECT * FROM team_members WHERE published = TRUE ORDER BY sort_order, name";
    return (await query(sql)).map(toTeamMember);
  },

  async byId(id: string): Promise<DbTeamMember | null> {
    const row = await queryOne("SELECT * FROM team_members WHERE id = $1", [id]);
    return row ? toTeamMember(row) : null;
  },

  async create(input: TeamMemberInput): Promise<DbTeamMember> {
    const id = randomUUID();
    await execute(
      `INSERT INTO team_members
         (id, name, role, bio, credentials, image_src, image_alt, published, sort_order, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      [
        id,
        input.name,
        input.role,
        input.bio,
        json(input.credentials),
        input.imageSrc,
        input.imageAlt,
        input.published,
        input.sortOrder,
        now(),
      ],
    );
    return { id, ...input };
  },

  async update(
    id: string,
    input: TeamMemberInput,
  ): Promise<DbTeamMember | null> {
    const changed = await execute(
      `UPDATE team_members SET
         name=$1, role=$2, bio=$3, credentials=$4, image_src=$5, image_alt=$6,
         published=$7, sort_order=$8, updated_at=$9
       WHERE id=$10`,
      [
        input.name,
        input.role,
        input.bio,
        json(input.credentials),
        input.imageSrc,
        input.imageAlt,
        input.published,
        input.sortOrder,
        now(),
        id,
      ],
    );
    return changed ? { id, ...input } : null;
  },

  async remove(id: string): Promise<boolean> {
    return (await execute("DELETE FROM team_members WHERE id = $1", [id])) > 0;
  },

  count(): Promise<number> {
    return countRows("SELECT COUNT(*) AS n FROM team_members");
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
  async all(includeUnpublished = false): Promise<DbFaq[]> {
    const sql = includeUnpublished
      ? "SELECT * FROM faqs ORDER BY sort_order, question"
      : "SELECT * FROM faqs WHERE published = TRUE ORDER BY sort_order, question";
    return (await query(sql)).map(toFaq);
  },

  async byTopic(topic: string): Promise<DbFaq[]> {
    const rows = await query(
      "SELECT * FROM faqs WHERE published = TRUE AND topic = $1 ORDER BY sort_order, question",
      [topic],
    );
    return rows.map(toFaq);
  },

  async byId(id: string): Promise<DbFaq | null> {
    const row = await queryOne("SELECT * FROM faqs WHERE id = $1", [id]);
    return row ? toFaq(row) : null;
  },

  async create(input: FaqInput): Promise<DbFaq> {
    const id = randomUUID();
    await execute(
      `INSERT INTO faqs (id, question, answer, topic, published, sort_order, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [
        id,
        input.question,
        input.answer,
        input.topic,
        input.published,
        input.sortOrder,
        now(),
      ],
    );
    return { id, ...input };
  },

  async update(id: string, input: FaqInput): Promise<DbFaq | null> {
    const changed = await execute(
      `UPDATE faqs SET question=$1, answer=$2, topic=$3, published=$4, sort_order=$5, updated_at=$6
       WHERE id=$7`,
      [
        input.question,
        input.answer,
        input.topic,
        input.published,
        input.sortOrder,
        now(),
        id,
      ],
    );
    return changed ? { id, ...input } : null;
  },

  async remove(id: string): Promise<boolean> {
    return (await execute("DELETE FROM faqs WHERE id = $1", [id])) > 0;
  },

  count(): Promise<number> {
    return countRows("SELECT COUNT(*) AS n FROM faqs");
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
  /**
   * True while this town is unconfirmed seed data. Placeholder areas are kept
   * out of the sitemap and set to noindex, so the site never ranks for a town
   * the office does not actually dispatch to.
   */
  isPlaceholder: boolean;
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
    isPlaceholder: bool(row, "is_placeholder"),
  };
}

export const areasStore = {
  async all(includeUnpublished = false): Promise<DbServiceArea[]> {
    const sql = includeUnpublished
      ? "SELECT * FROM service_areas ORDER BY sort_order, city"
      : "SELECT * FROM service_areas WHERE published = TRUE ORDER BY sort_order, city";
    return (await query(sql)).map(toArea);
  },

  async byId(id: string): Promise<DbServiceArea | null> {
    const row = await queryOne("SELECT * FROM service_areas WHERE id = $1", [id]);
    return row ? toArea(row) : null;
  },

  async create(input: ServiceAreaInput): Promise<DbServiceArea> {
    const id = randomUUID();
    await execute(
      `INSERT INTO service_areas
         (id, city, state, slug, neighborhoods, note, published, sort_order, is_placeholder, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      [
        id,
        input.city,
        input.state,
        input.slug,
        json(input.neighborhoods),
        input.note,
        input.published,
        input.sortOrder,
        input.isPlaceholder,
        now(),
      ],
    );
    return { id, ...input };
  },

  async update(
    id: string,
    input: ServiceAreaInput,
  ): Promise<DbServiceArea | null> {
    const changed = await execute(
      `UPDATE service_areas SET
         city=$1, state=$2, slug=$3, neighborhoods=$4, note=$5, published=$6,
         sort_order=$7, is_placeholder=$8, updated_at=$9
       WHERE id=$10`,
      [
        input.city,
        input.state,
        input.slug,
        json(input.neighborhoods),
        input.note,
        input.published,
        input.sortOrder,
        input.isPlaceholder,
        now(),
        id,
      ],
    );
    return changed ? { id, ...input } : null;
  },

  async remove(id: string): Promise<boolean> {
    return (await execute("DELETE FROM service_areas WHERE id = $1", [id])) > 0;
  },

  count(): Promise<number> {
    return countRows("SELECT COUNT(*) AS n FROM service_areas");
  },
};

// ---------------------------------------------------------------------------
// Settings — arbitrary JSON blobs keyed by name (business config, etc.)
// ---------------------------------------------------------------------------

export const settingsStore = {
  async get<T>(key: string): Promise<T | null> {
    const row = await queryOne<{ value: unknown }>(
      "SELECT value FROM settings WHERE key = $1",
      [key],
    );
    if (!row) return null;

    // jsonb arrives decoded; the string branch covers a plain-text column.
    if (typeof row.value === "string") {
      try {
        return JSON.parse(row.value) as T;
      } catch {
        return null;
      }
    }
    return (row.value ?? null) as T | null;
  },

  async set(key: string, value: unknown): Promise<void> {
    await execute(
      `INSERT INTO settings (key, value, updated_at) VALUES ($1,$2,$3)
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = EXCLUDED.updated_at`,
      [key, json(value), now()],
    );
  },

  async has(key: string): Promise<boolean> {
    return (
      (await countRows("SELECT COUNT(*) AS n FROM settings WHERE key = $1", [
        key,
      ])) > 0
    );
  },
};

// ---------------------------------------------------------------------------
// Reviews
// ---------------------------------------------------------------------------

export interface DbReview {
  id: string;
  author: string;
  rating: number;
  quote: string;
  source: string;
  sourceUrl: string;
  /** ISO date the review was left, as published on the source platform. */
  reviewDate: string;
  location: string;
  /** Optional service slug, to show a review beside the work it describes. */
  service: string;
  published: boolean;
  sortOrder: number;
}

export type ReviewInput = Omit<DbReview, "id">;

function toReview(row: Row): DbReview {
  return {
    id: str(row, "id"),
    author: str(row, "author"),
    rating: num(row, "rating"),
    quote: str(row, "quote"),
    source: str(row, "source"),
    sourceUrl: str(row, "source_url"),
    reviewDate: str(row, "review_date"),
    location: str(row, "location"),
    service: str(row, "service"),
    published: bool(row, "published"),
    sortOrder: num(row, "sort_order"),
  };
}

export const reviewsStore = {
  async all(includeUnpublished = false): Promise<DbReview[]> {
    // Newest first within a sort order: how recent a review is forms part of
    // how much weight a reader gives it.
    const sql = includeUnpublished
      ? "SELECT * FROM reviews ORDER BY sort_order, review_date DESC"
      : "SELECT * FROM reviews WHERE published = TRUE ORDER BY sort_order, review_date DESC";
    return (await query(sql)).map(toReview);
  },

  async byId(id: string): Promise<DbReview | null> {
    const row = await queryOne("SELECT * FROM reviews WHERE id = $1", [id]);
    return row ? toReview(row) : null;
  },

  async create(input: ReviewInput): Promise<DbReview> {
    const id = randomUUID();
    await execute(
      `INSERT INTO reviews
         (id, author, rating, quote, source, source_url, review_date, location,
          service, published, sort_order, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
      [
        id,
        input.author,
        input.rating,
        input.quote,
        input.source,
        input.sourceUrl,
        input.reviewDate,
        input.location,
        input.service,
        input.published,
        input.sortOrder,
        now(),
      ],
    );
    return { id, ...input };
  },

  async update(id: string, input: ReviewInput): Promise<DbReview | null> {
    const changed = await execute(
      `UPDATE reviews SET
         author=$1, rating=$2, quote=$3, source=$4, source_url=$5,
         review_date=$6, location=$7, service=$8, published=$9,
         sort_order=$10, updated_at=$11
       WHERE id=$12`,
      [
        input.author,
        input.rating,
        input.quote,
        input.source,
        input.sourceUrl,
        input.reviewDate,
        input.location,
        input.service,
        input.published,
        input.sortOrder,
        now(),
        id,
      ],
    );
    return changed ? { id, ...input } : null;
  },

  async remove(id: string): Promise<boolean> {
    return (await execute("DELETE FROM reviews WHERE id = $1", [id])) > 0;
  },

  count(): Promise<number> {
    return countRows("SELECT COUNT(*) AS n FROM reviews");
  },
};
