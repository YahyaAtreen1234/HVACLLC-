import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";

import { PageHero } from "@/components/sections/PageHero";
import { Container, Section } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Icon } from "@/components/ui/Icon";
import { ServiceCard } from "@/components/cards/ServiceCard";
import { ContactForm } from "@/components/forms/ContactForm";
import { EmergencyCta } from "@/components/cta/EmergencyCta";
import { CtaBand } from "@/components/cta/CtaBand";
import { FaqSection } from "@/components/sections/FaqSection";
import { JsonLd } from "@/components/seo/JsonLd";
import { Alert } from "@/components/ui/Alert";

import {
  getServiceArea,
  getNearbyAreas,
  getServices,
  getFeaturedServices,
  getFaqs,
} from "@/server/content/read";
import { pageMetadata } from "@/lib/seo";
import { business } from "@/config/business";
import { site } from "@/config/site";


/**
 * Rendered per request. The content comes from a database the owner edits in
 * the admin panel, so pre-rendering it at build time would serve the
 * deploy-time copy until the next deploy — and would make the build depend on
 * the database being reachable.
 */
export const dynamic = "force-dynamic";

/**
 * Per-city landing pages.
 *
 * This is the page type that decides whether a contractor shows up when
 * somebody searches "ac repair <town>". One combined service-areas page cannot
 * rank for thirty towns; a page per town can.
 *
 * The cities come from the database, so adding one in the admin panel creates
 * its page — no code change, no redeploy.
 */
// Not pre-rendered: the cities live in a database the owner edits at runtime.
// Building the list at deploy time would bake in whatever the content was then
// and require the database to be reachable during the build.

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const area = await getServiceArea(slug);

  if (!area) {
    return pageMetadata({
      title: "Service area not found",
      description: "This service area page could not be found.",
      path: `/service-areas/${slug}`,
      index: false,
    });
  }

  return pageMetadata({
    title: `HVAC Repair & Installation in ${area.city}, ${area.state}`,
    description: `Heating, cooling and air quality service for ${area.city}, ${area.state}. ${business.emergency.offered ? "Emergency calls answered. " : ""}Call ${business.phone.display} to book a visit.`,
    path: `/service-areas/${area.slug}`,
    // A stand-in city must not be indexed — it would rank for a town the
    // business may not even cover.
    index: !area.isPlaceholder,
  });
}

export default async function ServiceAreaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const area = await getServiceArea(slug);

  if (!area) notFound();

  const where = `${area.city}, ${area.state}`;
  const nearby = await getNearbyAreas(area.slug);
  const services = await getFeaturedServices(6);
  const areaFaqs = (await getFaqs()).slice(0, 5);

  return (
    <>
      <PageHero
        eyebrow="Service area"
        title={`HVAC service in ${where}`}
        lead={`Heating, cooling and indoor air work for homes in ${area.city} — diagnosed properly, explained in plain language, and priced before the work starts.`}
        crumbs={[
          { name: "Service areas", href: "/service-areas" },
          { name: area.city, href: `/service-areas/${area.slug}` },
        ]}
      />

      <Section>
        <Container>
          {area.isPlaceholder ? (
            <Alert tone="info" className="mb-10">
              <strong>{area.city} is placeholder data.</strong> Confirm this is
              a town the office actually dispatches to, then edit it at{" "}
              <code>/admin/areas</code>. Until then this page is set to
              noindex so it cannot rank for a market you do not serve.
            </Alert>
          ) : null}

          <div className="grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
            <div>
              <h2 className="text-2xl text-ink-950">
                What we handle in {area.city}
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-ink-800">
                Same technicians, same pricing, same diagnostic process
                everywhere we work. {area.city} homes get a measured diagnosis
                before any part is quoted, and a written option list when
                repair and replacement are both reasonable.
              </p>

              {area.neighborhoods?.length ? (
                <>
                  <h3 className="mt-10 text-xl text-ink-950">
                    Neighbourhoods we cover
                  </h3>
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {area.neighborhoods.map((hood) => (
                      <li
                        key={hood}
                        className="rounded-full border border-ink-900/10 bg-sand-50 px-3.5 py-1.5 text-sm text-ink-700"
                      >
                        {hood}
                      </li>
                    ))}
                  </ul>
                </>
              ) : null}

              <h3 className="mt-10 text-xl text-ink-950">
                Booking a visit in {area.city}
              </h3>
              <ol className="mt-4 space-y-3">
                {[
                  "Tell us what the system is doing — warm air, no heat, odd noise, or nothing at all.",
                  "We book a real appointment window rather than an open-ended day.",
                  "You approve the work, with the price, before anything is replaced.",
                ].map((step, index) => (
                  <li
                    key={step}
                    className="flex gap-3 text-[0.95rem] leading-relaxed text-ink-700"
                  >
                    <span className="font-display font-bold text-flame-600">
                      {index + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>

              <EmergencyCta variant="inline" className="mt-12" />
            </div>

            <aside className="lg:sticky lg:top-32 lg:self-start">
              <h2 className="sr-only">Request service in {area.city}</h2>
              <ContactForm services={await getServices()} />
            </aside>
          </div>
        </Container>
      </Section>

      <Section tone="muted" spacing="tight">
        <Container>
          <SectionHeading
            eyebrow="Services"
            title={`Popular in ${area.city}`}
          />
          <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <li key={service.slug}>
                <ServiceCard service={service} />
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      {nearby.length ? (
        <Section spacing="tight">
          <Container>
            <div className="flex flex-wrap items-end justify-between gap-6">
              <SectionHeading eyebrow="Nearby" title="Other areas we cover" />
              <Link
                href="/service-areas"
                className="font-display text-sm font-semibold text-flame-600 hover:text-flame-700"
              >
                All service areas
              </Link>
            </div>
            <ul className="mt-8 flex flex-wrap gap-3">
              {nearby.map((other) => (
                <li key={other.slug}>
                  <Link
                    href={`/service-areas/${other.slug}`}
                    className="inline-flex items-center gap-2 rounded-full border border-ink-900/12 px-4 py-2 text-sm text-ink-700 transition-colors hover:border-flame-500/50 hover:bg-flame-50 hover:text-flame-700"
                  >
                    <Icon name="map-pin" size={15} className="text-flame-600" />
                    {other.city}
                  </Link>
                </li>
              ))}
            </ul>
          </Container>
        </Section>
      ) : null}

      <FaqSection
        faqs={areaFaqs}
        title={`${area.city} questions`}
        lead={`Anything not covered here, call ${business.phone.display}.`}
        tone="muted"
      />

      <CtaBand
        title={`Book HVAC service in ${area.city}`}
        lead="Tell us the symptoms and we will bring the right parts on the first visit."
      />

      {/* Local schema for this specific town, not the whole service area. */}
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          serviceType: "HVAC repair, installation and maintenance",
          provider: {
            "@type": "HVACBusiness",
            name: business.name,
            telephone: business.phone.e164,
          },
          areaServed: {
            "@type": "City",
            name: area.city,
            containedInPlace: {
              "@type": "State",
              name: area.state,
            },
          },
          url: `${site.url}/service-areas/${area.slug}`,
        }}
      />
    </>
  );
}
