import { services as seedServices, featuredServices } from "@/data/services";
import { team as seedTeam } from "@/data/team";
import { faqs as seedFaqs } from "@/data/faqs";
import { serviceAreas as seedAreas } from "@/data/service-areas";
import {
  areasStore,
  faqsStore,
  servicesStore,
  settingsStore,
  teamStore,
} from "./store";

/**
 * First-run seeding.
 *
 * The TypeScript data files are the shipped defaults; the database is what the
 * site actually reads once it is running. On an empty install this copies the
 * defaults in once, so a fresh deployment still has a complete site rather
 * than a blank one waiting to be filled in by hand.
 *
 * Guarded by a settings flag rather than row counts, so deleting everything
 * from the admin panel does not cause the defaults to reappear on next boot.
 */

const SEED_FLAG = "content.seeded";

const featuredSlugs = new Set(featuredServices.map((service) => service.slug));

/**
 * In-process guard.
 *
 * The database flag stops a second *deployment* from re-seeding, but not a
 * second concurrent *request* in the same process: several pages can call this
 * at once during the first render, all read an unset flag, and all start
 * inserting. Caching the promise makes them share one run.
 */
let seeding: Promise<void> | null = null;

export function seedContentIfEmpty(): Promise<void> {
  seeding ??= runSeed().catch((error: unknown) => {
    // Clear the cache so a transient database error at boot does not leave the
    // process permanently convinced it has seeded.
    seeding = null;
    throw error;
  });
  return seeding;
}

async function runSeed(): Promise<void> {
  if (await settingsStore.has(SEED_FLAG)) return;

  // Sequential rather than Promise.all: sortOrder is the array index, and the
  // pool holds only a handful of connections. Concurrency here would buy
  // nothing on a one-off boot task and risks starving the request handling it.
  for (const [index, service] of seedServices.entries()) {
    await servicesStore.create({
      slug: service.slug,
      name: service.name,
      shortName: service.name,
      summary: service.summary,
      description: service.title,
      icon: service.icon,
      category: service.category,
      body: service.body,
      includes: service.includes,
      signs: service.signs,
      related: service.related ?? [],
      imageSrc: service.image.src,
      imageAlt: service.image.alt,
      featured: featuredSlugs.has(service.slug),
      published: true,
      sortOrder: index,
    });
  }

  for (const [index, member] of seedTeam.entries()) {
    await teamStore.create({
      name: member.name,
      role: member.role,
      bio: member.bio,
      credentials: member.credentials ?? [],
      imageSrc: member.image.src,
      imageAlt: member.image.alt,
      published: true,
      sortOrder: index,
    });
  }

  for (const [index, faq] of seedFaqs.entries()) {
    await faqsStore.create({
      question: faq.question,
      answer: faq.answer,
      topic: faq.topic ?? "general",
      published: true,
      sortOrder: index,
    });
  }

  for (const [index, area] of seedAreas.entries()) {
    await areasStore.create({
      city: area.city,
      state: area.state,
      slug: area.slug,
      neighborhoods: area.neighborhoods ?? [],
      note: "",
      published: true,
      sortOrder: index,
      isPlaceholder: area.isPlaceholder,
    });
  }

  await settingsStore.set(SEED_FLAG, { at: new Date().toISOString() });
}
