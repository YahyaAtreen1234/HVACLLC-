import type { Metadata } from "next";
import Link from "next/link";

import { PageHero } from "@/components/sections/PageHero";
import { Container, Section } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Icon } from "@/components/ui/Icon";
import { BuildNote } from "@/components/ui/BuildNote";
import { CtaBand } from "@/components/cta/CtaBand";
import { FaqSection } from "@/components/sections/FaqSection";
import { JsonLd } from "@/components/seo/JsonLd";

import { maintenancePlans, planPricesArePlaceholder } from "@/data/plans";
import { getFaqsByTopic } from "@/server/content/read";
import { pageMetadata } from "@/lib/seo";
import { business } from "@/config/business";
import { site } from "@/config/site";
import { cn } from "@/lib/utils";


/**
 * Rendered per request. The content comes from a database the owner edits in
 * the admin panel, so pre-rendering it at build time would serve the
 * deploy-time copy until the next deploy — and would make the build depend on
 * the database being reachable.
 */
export const dynamic = "force-dynamic";

export const metadata: Metadata = pageMetadata({
  title: "Maintenance Plans",
  description: `Annual HVAC maintenance agreements from ${business.name}. Scheduled tune-ups, priority booking and repair discounts. Call ${business.phone.display}.`,
  path: "/maintenance-plans",
});

export default async function MaintenancePlansPage() {
  const faqs = await getFaqsByTopic("maintenance", 5);

  return (
    <>
      <PageHero
        eyebrow="Maintenance"
        title="Maintenance plans"
        lead="Most no-heat and no-cool calls start as something small that a tune-up would have caught. A plan puts that inspection on the calendar so it actually happens."
        crumbs={[
          { name: "Maintenance plans", href: "/maintenance-plans" },
        ]}
      />

      <Section>
        <Container>
          {planPricesArePlaceholder ? (
            <BuildNote title="Pricing not set" className="mb-10">
              No plan price is published yet, so every tier shows{" "}
              <strong>Call for pricing</strong>. Set real figures in{" "}
              <code>src/data/plans.ts</code> before launch — and only list a
              benefit the office will actually honour, because each one is a
              promise a customer can hold you to.
            </BuildNote>
          ) : null}

          <ul className="grid items-start gap-6 lg:grid-cols-3">
            {maintenancePlans.map((plan) => (
              <li key={plan.slug}>
                <div
                  className={cn(
                    "flex h-full flex-col rounded-2xl border bg-white p-7 shadow-card",
                    plan.featured
                      ? "border-flame-500/50 ring-1 ring-flame-500/20"
                      : "border-ink-900/8",
                  )}
                >
                  {plan.featured ? (
                    <span className="mb-4 self-start rounded-full bg-flame-50 px-3 py-1 font-display text-xs font-bold tracking-wide text-flame-700 uppercase">
                      Most homes
                    </span>
                  ) : null}

                  <h2 className="font-display text-xl font-bold text-ink-950">
                    {plan.name}
                  </h2>

                  <p className="mt-3 text-sm leading-relaxed text-ink-600">
                    {plan.summary}
                  </p>

                  <p className="mt-5">
                    {plan.price ? (
                      <>
                        <span className="font-display text-3xl font-bold text-ink-950">
                          {plan.price}
                        </span>
                        <span className="ml-1.5 text-sm text-ink-500">
                          {plan.interval}
                        </span>
                      </>
                    ) : (
                      <span className="font-display text-xl font-bold text-ink-700">
                        Call for pricing
                      </span>
                    )}
                  </p>

                  <p className="mt-2 text-sm text-ink-500">
                    {plan.visitsPerYear} scheduled{" "}
                    {plan.visitsPerYear === 1 ? "visit" : "visits"} a year
                  </p>

                  <ul className="mt-6 flex-1 space-y-2.5">
                    {plan.benefits.map((benefit) => (
                      <li
                        key={benefit}
                        className="flex gap-2.5 text-sm leading-relaxed text-ink-700"
                      >
                        <Icon
                          name="check"
                          size={17}
                          className="mt-0.5 shrink-0 text-success-500"
                        />
                        {benefit}
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={`/contact?plan=${plan.slug}`}
                    className={cn(
                      "mt-7 inline-flex items-center justify-center gap-2 rounded-lg px-5 py-3 font-display text-sm font-semibold transition-colors",
                      plan.featured
                        ? "bg-flame-600 text-white hover:bg-flame-700"
                        : "border border-ink-900/15 text-ink-950 hover:border-flame-500/40 hover:text-flame-600",
                    )}
                  >
                    Ask about {plan.name}
                    <Icon name="arrow-right" size={16} />
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      <Section tone="muted" spacing="tight">
        <Container size="narrow">
          <SectionHeading
            eyebrow="Why bother"
            title="What a tune-up actually catches"
          />
          <ul className="mt-8 space-y-4">
            {[
              "Refrigerant charge drifting out of spec, which quietly raises running cost long before it stops cooling.",
              "A capacitor reading low — a part that costs little planned, and a weekend emergency call unplanned.",
              "Restricted airflow that is slowly cooking the compressor or cracking the heat exchanger.",
              "Combustion and flue faults, which are a safety issue rather than a comfort one.",
            ].map((item) => (
              <li
                key={item}
                className="flex gap-3 leading-relaxed text-ink-700"
              >
                <Icon
                  name="check"
                  size={19}
                  className="mt-1 shrink-0 text-flame-600"
                />
                {item}
              </li>
            ))}
          </ul>

          <p className="mt-8 text-sm leading-relaxed text-ink-600">
            Manufacturers also require documented annual maintenance to keep
            most equipment warranties valid. Keep the written readings from
            each visit — that record is what a warranty claim is judged on.
          </p>
        </Container>
      </Section>

      {faqs.length ? (
        <FaqSection
          faqs={faqs}
          title="Maintenance questions"
          lead={`Anything else, call ${business.phone.display}.`}
        />
      ) : null}

      <CtaBand
        title="Get on the maintenance schedule"
        lead="Tell us what equipment you have and we will recommend the right plan — or tell you honestly that you do not need one."
      />

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: "HVAC maintenance agreement",
          serviceType: "Preventative HVAC maintenance",
          provider: {
            "@type": "HVACBusiness",
            name: business.name,
            telephone: business.phone.e164,
          },
          url: `${site.url}/maintenance-plans`,
        }}
      />
    </>
  );
}
