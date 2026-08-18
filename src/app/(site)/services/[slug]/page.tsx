import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";

import { PageHero } from "@/components/sections/PageHero";
import { Container, Section } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Icon } from "@/components/ui/Icon";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { ServiceCard } from "@/components/cards/ServiceCard";
import { ContactForm } from "@/components/forms/ContactForm";
import { EmergencyCta } from "@/components/cta/EmergencyCta";
import { CtaBand } from "@/components/cta/CtaBand";
import { FaqSection } from "@/components/sections/FaqSection";
import { JsonLd } from "@/components/seo/JsonLd";

import {
  getRelatedServices,
  getService,
  getServices,
} from "@/server/content/read";
import { faqs } from "@/data/faqs";
import { pageMetadata, serviceSchema } from "@/lib/seo";
import { business } from "@/config/business";


/**
 * Rendered per request. The content comes from a database the owner edits in
 * the admin panel, so pre-rendering it at build time would serve the
 * deploy-time copy until the next deploy — and would make the build depend on
 * the database being reachable.
 */
export const dynamic = "force-dynamic";

// Rendered per request rather than pre-rendered: services are edited in the
// admin panel, and a build-time list would go stale the moment one changed.

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = await getService(slug);

  if (!service) {
    return pageMetadata({
      title: "Service not found",
      description: "This service page could not be found.",
      path: `/services/${slug}`,
      index: false,
    });
  }

  return pageMetadata({
    title: service.title,
    description: service.summary,
    path: `/services/${service.slug}`,
  });
}

/** FAQ topics that map onto each service category. */
const TOPIC_BY_CATEGORY = {
  cooling: "cooling",
  heating: "heating",
  "air-quality": "maintenance",
  maintenance: "maintenance",
  commercial: "general",
} as const;

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = await getService(slug);

  if (!service) notFound();

  const related = await getRelatedServices(service.slug);
  const topic = TOPIC_BY_CATEGORY[service.category];
  const serviceFaqs = faqs.filter((faq) => faq.topic === topic).slice(0, 5);

  return (
    <>
      <PageHero
        eyebrow={service.name}
        title={service.title}
        lead={service.summary}
        crumbs={[
          { name: "Services", href: "/services" },
          { name: service.name, href: `/services/${service.slug}` },
        ]}
      />

      <Section>
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
            {/* Main copy */}
            <div>
              <MediaFrame
                image={service.image}
                icon={service.icon}
                aspect="16/9"
                sizes="(min-width: 1024px) 55vw, 100vw"
              />

              <div className="mt-10 space-y-5">
                {service.body.map((paragraph) => (
                  <p
                    key={paragraph.slice(0, 40)}
                    className="text-lg leading-relaxed text-ink-800"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>

              <div className="mt-12 grid gap-8 sm:grid-cols-2">
                <div>
                  <h2 className="text-xl text-ink-950">What the visit covers</h2>
                  <ul className="mt-4 space-y-3">
                    {service.includes.map((item) => (
                      <li key={item} className="flex gap-3 text-[0.95rem] leading-relaxed text-ink-700">
                        <Icon
                          name="check"
                          size={18}
                          className="mt-0.5 shrink-0 text-success-500"
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h2 className="text-xl text-ink-950">Signs you need this</h2>
                  <ul className="mt-4 space-y-3">
                    {service.signs.map((item) => (
                      <li key={item} className="flex gap-3 text-[0.95rem] leading-relaxed text-ink-700">
                        <Icon
                          name="alert"
                          size={18}
                          className="mt-0.5 shrink-0 text-flame-500"
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <EmergencyCta variant="inline" className="mt-12" />
            </div>

            {/* Booking rail */}
            <aside className="lg:sticky lg:top-32 lg:self-start">
              <h2 className="sr-only">Request this service</h2>
              <ContactForm services={await getServices()} defaultService={service.slug} />
            </aside>
          </div>
        </Container>
      </Section>

      {related.length ? (
        <Section tone="muted" spacing="tight">
          <Container>
            <div className="flex flex-wrap items-end justify-between gap-6">
              <SectionHeading
                eyebrow="Related"
                title="Often booked with this"
              />
              <Link
                href="/services"
                className="font-display text-sm font-semibold text-flame-600 hover:text-flame-700"
              >
                View all services
              </Link>
            </div>
            <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <li key={item.slug}>
                  <ServiceCard service={item} />
                </li>
              ))}
            </ul>
          </Container>
        </Section>
      ) : null}

      <FaqSection
        faqs={serviceFaqs}
        title={`${service.name} questions`}
        lead={`Common questions about ${service.name}. Anything else, call ${business.phone.display}.`}
      />

      <CtaBand
        title={`Book ${service.name}`}
        lead="Tell us the symptoms and we will bring the right parts on the first visit."
      />

      <JsonLd
        data={await serviceSchema({
          name: service.title,
          description: service.summary,
          path: `/services/${service.slug}`,
        })}
      />
    </>
  );
}
