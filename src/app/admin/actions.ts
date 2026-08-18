"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { env } from "@/server/env";
import {
  SESSION_COOKIE,
  createSessionToken,
  isAdminConfigured,
  sessionCookieOptions,
} from "@/server/admin/auth";
import { verifyPassword } from "@/server/admin/password";
import { isLoggedIn } from "@/server/admin/session";
import {
  areasStore,
  faqsStore,
  servicesStore,
  teamStore,
  type ServiceInput,
  type TeamMemberInput,
  type FaqInput,
  type ServiceAreaInput,
} from "@/server/content/store";
import { postgresLeadStore } from "@/server/leads/store";
import { saveUpload } from "@/server/content/uploads";
import { isLeadStatus } from "@/server/leads/types";
import type { IconName } from "@/types";

/**
 * Admin mutations.
 *
 * Every action re-checks the session itself. Relying on the layout's redirect
 * alone would be a mistake: server actions are addressable endpoints, and a
 * layout guard does not protect them.
 *
 * After a content change, `revalidatePath` refreshes the affected public pages
 * so an edit is visible immediately instead of after the next deploy.
 */

async function requireSession(): Promise<void> {
  if (!(await isLoggedIn())) {
    throw new Error("Not authorised.");
  }
}

function refreshPublicPages(): void {
  revalidatePath("/", "layout");
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export interface LoginState {
  error: string | null;
}

export async function login(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!isAdminConfigured()) {
    return {
      error:
        "No admin password is configured on the server. Set ADMIN_PASSWORD_HASH in .env.local — see the README.",
    };
  }

  // Usernames compare case-insensitively and ignore surrounding whitespace.
  // The password is the secret; making the username fussy only locks people
  // out of their own panel.
  const userOk =
    username.toLowerCase() === env.adminUsername.trim().toLowerCase();
  const passOk = verifyPassword(password, env.adminPasswordHash);

  // One message for both cases, so the form cannot be used to discover
  // whether a username exists.
  if (!userOk || !passOk) {
    return { error: "Incorrect username or password." };
  }

  const store = await cookies();
  store.set(SESSION_COOKIE, createSessionToken(), sessionCookieOptions());

  redirect("/admin");
}

export async function logout(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  redirect("/admin/login");
}

// ---------------------------------------------------------------------------
// Helpers for reading form values
// ---------------------------------------------------------------------------

const text = (form: FormData, key: string): string =>
  String(form.get(key) ?? "").trim();

const checked = (form: FormData, key: string): boolean =>
  form.get(key) === "on" || form.get(key) === "true";

const number = (form: FormData, key: string): number => {
  const value = Number(form.get(key));
  return Number.isFinite(value) ? value : 0;
};

/** Textareas hold one item per line. */
const lines = (form: FormData, key: string): string[] =>
  String(form.get(key) ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

/** Comma-separated single-line input. */
const commas = (form: FormData, key: string): string[] =>
  String(form.get(key) ?? "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);

/**
 * Resolves the stored image path for a form submission.
 *
 * A newly picked file wins. Otherwise the hidden `<name>Src` field carries
 * whatever was already on the record, so saving without touching the photo
 * keeps it — and clearing it explicitly sends an empty string.
 *
 * An upload that fails validation throws, which surfaces in the admin UI
 * rather than silently saving the record with no picture.
 */
async function imagePath(
  form: FormData,
  field: string,
  folder: "team" | "services" | "general",
): Promise<string> {
  const file = form.get(field);
  const existing = text(form, `${field}Src`);

  if (file instanceof File && file.size > 0) {
    const result = await saveUpload(file, folder);
    if (!result.ok) throw new Error(result.error);
    return result.path;
  }

  return existing;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ---------------------------------------------------------------------------
// Services
// ---------------------------------------------------------------------------

async function serviceFromForm(form: FormData): Promise<ServiceInput> {
  const name = text(form, "name");
  return {
    slug: text(form, "slug") || slugify(name),
    name,
    shortName: text(form, "shortName") || name,
    summary: text(form, "summary"),
    description: text(form, "description") || name,
    icon: (text(form, "icon") || "wrench") as IconName,
    category: text(form, "category") || "general",
    body: lines(form, "body"),
    includes: lines(form, "includes"),
    signs: lines(form, "signs"),
    related: commas(form, "related"),
    imageSrc: await imagePath(form, "image", "services"),
    imageAlt: text(form, "imageAlt"),
    featured: checked(form, "featured"),
    published: checked(form, "published"),
    sortOrder: number(form, "sortOrder"),
  };
}

export async function saveService(formData: FormData): Promise<void> {
  await requireSession();

  const id = text(formData, "id");
  const input = await serviceFromForm(formData);

  if (id) await servicesStore.update(id, input);
  else await servicesStore.create(input);

  refreshPublicPages();
  redirect("/admin/services");
}

export async function deleteService(formData: FormData): Promise<void> {
  await requireSession();
  await servicesStore.remove(text(formData, "id"));
  refreshPublicPages();
  redirect("/admin/services");
}

// ---------------------------------------------------------------------------
// Team
// ---------------------------------------------------------------------------

async function teamFromForm(form: FormData): Promise<TeamMemberInput> {
  return {
    name: text(form, "name"),
    role: text(form, "role"),
    bio: text(form, "bio"),
    credentials: commas(form, "credentials"),
    imageSrc: await imagePath(form, "image", "team"),
    imageAlt: text(form, "imageAlt"),
    published: checked(form, "published"),
    sortOrder: number(form, "sortOrder"),
  };
}

export async function saveTeamMember(formData: FormData): Promise<void> {
  await requireSession();

  const id = text(formData, "id");
  const input = await teamFromForm(formData);

  if (id) await teamStore.update(id, input);
  else await teamStore.create(input);

  refreshPublicPages();
  redirect("/admin/team");
}

export async function deleteTeamMember(formData: FormData): Promise<void> {
  await requireSession();
  await teamStore.remove(text(formData, "id"));
  refreshPublicPages();
  redirect("/admin/team");
}

// ---------------------------------------------------------------------------
// FAQs
// ---------------------------------------------------------------------------

function faqFromForm(form: FormData): FaqInput {
  return {
    question: text(form, "question"),
    answer: text(form, "answer"),
    topic: text(form, "topic") || "general",
    published: checked(form, "published"),
    sortOrder: number(form, "sortOrder"),
  };
}

export async function saveFaq(formData: FormData): Promise<void> {
  await requireSession();

  const id = text(formData, "id");
  const input = faqFromForm(formData);

  if (id) await faqsStore.update(id, input);
  else await faqsStore.create(input);

  refreshPublicPages();
  redirect("/admin/faqs");
}

export async function deleteFaq(formData: FormData): Promise<void> {
  await requireSession();
  await faqsStore.remove(text(formData, "id"));
  refreshPublicPages();
  redirect("/admin/faqs");
}

// ---------------------------------------------------------------------------
// Service areas
// ---------------------------------------------------------------------------

function areaFromForm(form: FormData): ServiceAreaInput {
  const city = text(form, "city");
  return {
    city,
    state: text(form, "state"),
    slug: text(form, "slug") || slugify(city),
    neighborhoods: commas(form, "neighborhoods"),
    note: text(form, "note"),
    published: checked(form, "published"),
    sortOrder: number(form, "sortOrder"),
    isPlaceholder: checked(form, "isPlaceholder"),
  };
}

export async function saveArea(formData: FormData): Promise<void> {
  await requireSession();

  const id = text(formData, "id");
  const input = areaFromForm(formData);

  if (id) await areasStore.update(id, input);
  else await areasStore.create(input);

  refreshPublicPages();
  redirect("/admin/areas");
}

export async function deleteArea(formData: FormData): Promise<void> {
  await requireSession();
  await areasStore.remove(text(formData, "id"));
  refreshPublicPages();
  redirect("/admin/areas");
}

// ---------------------------------------------------------------------------
// Leads
// ---------------------------------------------------------------------------

export async function updateLeadStatus(formData: FormData): Promise<void> {
  await requireSession();

  const id = text(formData, "id");
  const status = text(formData, "status");

  if (isLeadStatus(status)) {
    await postgresLeadStore.updateStatus(id, status);
  }

  revalidatePath("/admin/leads");
}
