import type { Metadata } from "next";
import { PageHero } from "@/components/sections/PageHero";
import { Container, Section } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { Icon } from "@/components/ui/Icon";
import { Alert } from "@/components/ui/Alert";
import { TrustBadgeRow } from "@/components/cards/TrustBadge";
import { ProcessSteps } from "@/components/sections/ProcessSteps";
import { TeamSection } from "@/components/sections/TeamSection";
import { CtaBand } from "@/components/cta/CtaBand";
import { differentiators } from "@/data/trust";
import { business } from "@/config/business";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "About Us",
  description: `${business.name} provides residential and light commercial heating, cooling and indoor air quality services.`,
  path: "/about",
});

export default function AboutPage() {
  const hasCredentials =
    Boolean(business.credentials.licenseNumber) ||
    business.credentials.insured ||
    business.credentials.bonded ||
    business.credentials.certifications.length > 0;

  return (
    <>
      <PageHero
        eyebrow="About"
        title={`The people behind ${business.name}`}
        lead="A straightforward HVAC contractor: measure the system, explain what it needs, do the work properly."
        crumbs={[{ name: "About", href: "/about" }]}
      />

      <Section>
        <Container>
          <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <SectionHeading
                eyebrow="Our approach"
                title="Comfort problems are diagnosis problems"
              />

              <div className="mt-6 space-y-5 text-lg leading-relaxed text-ink-800">
                <p>
                  Most of what goes wrong with a heating and cooling system is
                  measurable: airflow that is too low, a charge that is off, a
                  duct system fighting the blower, a control that is staging
                  badly. When those get measured, the repair is obvious and the
                  bill is predictable.
                </p>
                <p>
                  That is the whole approach here. Readings first, options second,
                  work third — and nothing gets replaced because it is easier
                  than finding out what actually failed.
                </p>
              </div>

              {/*
                The founding story is the one part of this page that cannot be
                written generically — it is the reason a homeowner picks you
                over the contractor with the same list of services.
              */}
              <Alert tone="info" title="Add the founding story here" className="mt-8">
                Replace this block in{" "}
                <code>src/app/about/page.tsx</code> with the real history: who
                started {business.name} and in what year, what they were doing
                before, and what made them go out on their own. Two or three
                honest paragraphs beat any amount of polished filler — this is
                the part visitors actually read.
              </Alert>

              <dl className="mt-10 grid gap-6 sm:grid-cols-3">
                <div>
                  {/*
                    The year rather than a running total. "Established 2026"
                    labels the year plainly; "In business 2026" would read as
                    a duration and invite the question of which was meant.
                  */}
                  <dt className="eyebrow text-flame-600">Established</dt>
                  <dd className="mt-1 font-display text-3xl font-bold text-ink-950">
                    {business.foundedYear}
                  </dd>
                </div>
                <div>
                  <dt className="eyebrow text-flame-600">Focus</dt>
                  {/* Balanced wrapping: this one is longer than its siblings. */}
                  <dd className="mt-1 font-display text-3xl font-bold text-balance text-ink-950">
                    Residential and commercial
                  </dd>
                </div>
                <div>
                  <dt className="eyebrow text-flame-600">Coverage</dt>
                  <dd className="mt-1 font-display text-3xl font-bold text-ink-950">
                    Local
                  </dd>
                </div>
              </dl>
            </div>

            <MediaFrame
              image={{
                src: "",
                alt: "Service team standing in front of a branded work van outside a residential home",
                width: 1000,
                height: 750,
              }}
              icon="building"
              aspect="4/3"
              sizes="(min-width: 1024px) 45vw, 100vw"
            />
          </div>
        </Container>
      </Section>

      <TeamSection />

      <Section>
        <Container>
          <SectionHeading
            eyebrow="What that means for you"
            title="Four habits that change the outcome"
          />
          <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {differentiators.map((item) => (
              <li
                key={item.title}
                className="rounded-2xl border border-ink-900/8 bg-white p-6 shadow-card"
              >
                <span className="flex size-11 items-center justify-center rounded-xl bg-ink-950 text-chill-300">
                  <Icon name={item.icon} size={22} />
                </span>
                <h3 className="mt-4 text-lg text-ink-950">{item.title}</h3>
                <p className="mt-2 text-[0.95rem] leading-relaxed text-ink-700">
                  {item.body}
                </p>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      <Section tone="muted">
        <Container>
          <SectionHeading
            eyebrow="Credentials"
            title="Licensing and insurance"
            lead="Only verifiable credentials are published here."
          />

          {hasCredentials ? (
            <TrustBadgeRow className="mt-10" />
          ) : (
            <Alert tone="info" title="Not published yet" className="mt-10">
              No licence number, insurance status or certification has been
              entered yet, so nothing is claimed on this page. Add the real
              values to <code>business.credentials</code> in{" "}
              <code>src/config/business.ts</code> and they will appear here and
              in the trust badges site-wide.
            </Alert>
          )}
        </Container>
      </Section>

      <ProcessSteps />
      <CtaBand title="Work with us" lead="Book a visit or ask a question — either is fine." />
    </>
  );
}
