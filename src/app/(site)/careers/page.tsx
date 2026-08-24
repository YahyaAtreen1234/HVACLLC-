import type { Metadata } from "next";
import Link from "next/link";

import { PageHero } from "@/components/sections/PageHero";
import { Container, Section } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Icon } from "@/components/ui/Icon";
import { Alert } from "@/components/ui/Alert";
import { CtaBand } from "@/components/cta/CtaBand";

import { jobOpenings, jobPerks } from "@/data/jobs";
import { pageMetadata } from "@/lib/seo";
import { business } from "@/config/business";

export const metadata: Metadata = pageMetadata({
  title: "Careers",
  description: `HVAC technician and installer jobs at ${business.name} in ${business.address.city}, ${business.address.state}.`,
  path: "/careers",
  // Indexed when there is either a listed role or an open invitation to apply.
  // With both off the page says nobody is being hired, and ranking for "hvac
  // jobs" would only produce applications nobody can act on.
  index: jobOpenings.length > 0 || business.hiring.active,
});

export default function CareersPage() {
  const hasOpenings = jobOpenings.length > 0;

  return (
    <>
      <PageHero
        eyebrow="Careers"
        title="Work with us"
        lead={`Good technicians are the whole business. If you measure before you replace parts and explain your findings plainly, we would like to hear from you.`}
        crumbs={[{ name: "Careers", href: "/careers" }]}
      />

      <Section>
        <Container size="narrow">
          {hasOpenings ? (
            <ul className="space-y-6">
              {jobOpenings.map((job) => (
                <li key={job.slug}>
                  <div className="rounded-2xl border border-ink-900/8 bg-white p-7 shadow-card">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <h2 className="font-display text-xl font-bold text-ink-950">
                          {job.title}
                        </h2>
                        <p className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-600">
                          <span className="flex items-center gap-1.5">
                            <Icon
                              name="map-pin"
                              size={15}
                              className="text-flame-600"
                            />
                            {job.location}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Icon
                              name="clock"
                              size={15}
                              className="text-flame-600"
                            />
                            {job.type}
                          </span>
                          {job.payRange ? (
                            <span className="font-semibold text-ink-800">
                              {job.payRange}
                            </span>
                          ) : null}
                        </p>
                      </div>
                    </div>

                    <p className="mt-5 leading-relaxed text-ink-700">
                      {job.summary}
                    </p>

                    {job.responsibilities.length ? (
                      <>
                        <h3 className="mt-6 font-display text-base font-bold text-ink-950">
                          What the job involves
                        </h3>
                        <ul className="mt-3 space-y-2">
                          {job.responsibilities.map((item) => (
                            <li
                              key={item}
                              className="flex gap-2.5 text-sm leading-relaxed text-ink-700"
                            >
                              <Icon
                                name="check"
                                size={16}
                                className="mt-0.5 shrink-0 text-success-500"
                              />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </>
                    ) : null}

                    {job.requirements.length ? (
                      <>
                        <h3 className="mt-6 font-display text-base font-bold text-ink-950">
                          What you need
                        </h3>
                        <ul className="mt-3 space-y-2">
                          {job.requirements.map((item) => (
                            <li
                              key={item}
                              className="flex gap-2.5 text-sm leading-relaxed text-ink-700"
                            >
                              <Icon
                                name="check"
                                size={16}
                                className="mt-0.5 shrink-0 text-success-500"
                              />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </>
                    ) : null}

                    <Link
                      href={`/contact?job=${job.slug}`}
                      className="mt-7 inline-flex items-center gap-2 rounded-lg bg-flame-600 px-5 py-3 font-display text-sm font-semibold text-white transition-colors hover:bg-flame-700"
                    >
                      Apply for this role
                      <Icon name="arrow-right" size={16} />
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="rounded-2xl border border-ink-900/8 bg-white p-8 text-center shadow-card">
              <h2 className="font-display text-xl font-bold text-ink-950">
                {business.hiring.active
                  ? "No specific roles listed right now"
                  : "No open roles right now"}
              </h2>
              {/*
                Worded from the same switch that drives the hiring banner. With
                recruiting on, a visitor who arrived from that strip must not
                land on a page telling them nobody is being hired — having no
                role listed is not the same as not wanting applications.
              */}
              <p className="mx-auto mt-3 max-w-md leading-relaxed text-ink-600">
                {business.hiring.active
                  ? "We are not advertising a particular vacancy at the moment, but we are always glad to hear from good technicians. Send your details and we will be in touch when something fits."
                  : "We are not actively recruiting at the moment. Good technicians are worth making room for, though — send your details and we will keep them on file for when something opens up."}
              </p>
              <Link
                href="/contact?job=general"
                className="mt-6 inline-flex items-center gap-2 rounded-lg bg-flame-600 px-5 py-3 font-display text-sm font-semibold text-white transition-colors hover:bg-flame-700"
              >
                Send your details
                <Icon name="arrow-right" size={16} />
              </Link>

              <Alert tone="info" className="mt-8 text-left">
                <strong>Got a specific vacancy?</strong> Add it to{" "}
                <code>src/data/jobs.ts</code> and it will be listed here. The
                green hiring strip and the wording above both follow{" "}
                <code>business.hiring.active</code> — turn that off and they
                disappear together, and the page returns to noindex.
              </Alert>
            </div>
          )}
        </Container>
      </Section>

      {jobPerks.length ? (
        <Section tone="muted" spacing="tight">
          <Container size="narrow">
            <SectionHeading eyebrow="Why here" title="What we offer" />
            <ul className="mt-8 grid gap-4 sm:grid-cols-2">
              {jobPerks.map((perk) => (
                <li
                  key={perk}
                  className="flex gap-3 leading-relaxed text-ink-700"
                >
                  <Icon
                    name="check"
                    size={18}
                    className="mt-1 shrink-0 text-flame-600"
                  />
                  {perk}
                </li>
              ))}
            </ul>
          </Container>
        </Section>
      ) : null}

      <CtaBand
        title="Questions about working here?"
        lead={`Call ${business.phone.display} and ask for the office.`}
      />
    </>
  );
}
