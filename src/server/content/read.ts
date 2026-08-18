import type { Faq, Service, ServiceArea, TeamMember } from "@/types";
import { seedContentIfEmpty } from "./seed";
import { areasStore, faqsStore, servicesStore, teamStore } from "./store";

/**
 * What the public pages read.
 *
 * These adapt database rows back into the same shapes the components already
 * expect (`Service`, `TeamMember`, `Faq`, `ServiceArea`), so moving content
 * into the database did not require rewriting any component.
 *
 * `seedContentIfEmpty()` runs on first access, which makes a fresh install
 * self-populating without a separate setup step.
 */

async function ensureSeeded(): Promise<void> {
  await seedContentIfEmpty();
}

export async function getServices(): Promise<Service[]> {
  await ensureSeeded();
  const rows = await servicesStore.all();
  return rows.map((row) => ({
    slug: row.slug,
    name: row.name,
    title: row.description,
    summary: row.summary,
    icon: row.icon,
    category: row.category as Service["category"],
    includes: row.includes,
    signs: row.signs,
    body: row.body,
    image: {
      src: row.imageSrc,
      alt: row.imageAlt,
      width: 1200,
      height: 800,
    },
    related: row.related,
  }));
}

export async function getService(slug: string): Promise<Service | undefined> {
  return (await getServices()).find((service) => service.slug === slug);
}

export async function getFeaturedServices(limit = 6): Promise<Service[]> {
  await ensureSeeded();
  const featured = (await servicesStore.all())
    .filter((row) => row.featured)
    .map((row) => row.slug);

  const services = await getServices();
  const picked = services.filter((service) => featured.includes(service.slug));
  return (picked.length ? picked : services).slice(0, limit);
}

export async function getRelatedServices(
  slug: string,
  limit = 3,
): Promise<Service[]> {
  const service = await getService(slug);
  if (!service) return [];
  const all = await getServices();
  return service.related
    .map((related) => all.find((entry) => entry.slug === related))
    .filter((entry): entry is Service => Boolean(entry))
    .slice(0, limit);
}

export async function getTeam(): Promise<TeamMember[]> {
  await ensureSeeded();
  const rows = await teamStore.all();
  return rows.map((row) => ({
    name: row.name,
    role: row.role,
    bio: row.bio,
    credentials: row.credentials.length ? row.credentials : undefined,
    image: {
      src: row.imageSrc,
      alt: row.imageAlt,
      width: 800,
      height: 800,
    },
    // A member is treated as placeholder while the name still reads like a prompt.
    isPlaceholder: /^add /i.test(row.name),
  }));
}

export async function getFaqs(): Promise<Faq[]> {
  await ensureSeeded();
  const rows = await faqsStore.all();
  return rows.map((row) => ({
    question: row.question,
    answer: row.answer,
    topic: row.topic as Faq["topic"],
  }));
}

export async function getFaqsByTopic(
  topic: string,
  limit?: number,
): Promise<Faq[]> {
  const matching = (await getFaqs()).filter((faq) => faq.topic === topic);
  return typeof limit === "number" ? matching.slice(0, limit) : matching;
}

/** A short mixed set for the home page — spread across topics, not just the first few. */
export async function getHomeFaqs(limit = 4): Promise<Faq[]> {
  const all = await getFaqs();
  const seen = new Set<string>();
  const picked: Faq[] = [];

  for (const faq of all) {
    if (picked.length >= limit) break;
    if (seen.has(faq.topic)) continue;
    seen.add(faq.topic);
    picked.push(faq);
  }

  // Top up from whatever is left if there were not enough distinct topics.
  for (const faq of all) {
    if (picked.length >= limit) break;
    if (!picked.includes(faq)) picked.push(faq);
  }

  return picked;
}

export async function getTeamIsPlaceholder(): Promise<boolean> {
  return (await getTeam()).some((member) => member.isPlaceholder);
}

/** One service area by slug, for its dedicated page. */
export async function getServiceArea(
  slug: string,
): Promise<ServiceArea | undefined> {
  return (await getServiceAreas()).find((area) => area.slug === slug);
}

/** Nearby areas, for cross-linking between city pages. */
export async function getNearbyAreas(
  slug: string,
  limit = 6,
): Promise<ServiceArea[]> {
  return (await getServiceAreas())
    .filter((area) => area.slug !== slug)
    .slice(0, limit);
}

export async function getServiceAreasArePlaceholder(): Promise<boolean> {
  return (await getServiceAreas()).some((area) => area.isPlaceholder);
}

export async function getServiceAreas(): Promise<ServiceArea[]> {
  await ensureSeeded();
  const rows = await areasStore.all();
  return rows.map((row) => ({
    slug: row.slug,
    city: row.city,
    state: row.state,
    neighborhoods: row.neighborhoods,
    isPlaceholder: row.isPlaceholder,
  }));
}
