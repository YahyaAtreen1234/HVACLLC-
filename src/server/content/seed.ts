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

export function seedContentIfEmpty(): void {
  if (settingsStore.has(SEED_FLAG)) return;

  seedServices.forEach((service, index) => {
    servicesStore.create({
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
  });

  seedTeam.forEach((member, index) => {
    teamStore.create({
      name: member.name,
      role: member.role,
      bio: member.bio,
      credentials: member.credentials ?? [],
      imageSrc: member.image.src,
      imageAlt: member.image.alt,
      published: true,
      sortOrder: index,
    });
  });

  seedFaqs.forEach((faq, index) => {
    faqsStore.create({
      question: faq.question,
      answer: faq.answer,
      topic: faq.topic ?? "general",
      published: true,
      sortOrder: index,
    });
  });

  seedAreas.forEach((area, index) => {
    areasStore.create({
      city: area.city,
      state: area.state,
      slug: area.slug,
      neighborhoods: area.neighborhoods ?? [],
      note: "",
      published: true,
      sortOrder: index,
      isPlaceholder: area.isPlaceholder,
    });
  });

  settingsStore.set(SEED_FLAG, { at: new Date().toISOString() });
}
