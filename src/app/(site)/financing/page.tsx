import type { Metadata } from "next";
import { PageHero } from "@/components/sections/PageHero";
import { Container, Section } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { BuildNote } from "@/components/ui/BuildNote";
import { Icon } from "@/components/ui/Icon";
import { FaqSection } from "@/components/sections/FaqSection";
import { CtaBand } from "@/components/cta/CtaBand";
import {
  financingGuidance,
  financingOffered,
  financingOptions,
  financingPartner,
} from "@/data/financing";
import { getFaqsByTopic } from "@/server/content/read";
import { pageMetadata } from "@/lib/seo";
import { business } from "@/config/business";


/**
 * Rendered per request. The content comes from a database the owner edits in
 * the admin panel, so pre-rendering it at build time would serve the
 * deploy-time copy until the next deploy — and would make the build depend on
 * the database being reachable.
 */
export const dynamic = "force-dynamic";

export const metadata: Metadata = pageMetadata({
  title: "Financing",
  description:
    "How to pay for a new heating or cooling system, what a quote should include, and where to look for rebates.",
  path: "/financing",
});

export default async function FinancingPage() {
  return (
    <>
      <PageHero
        eyebrow="Financing"
        title="Paying for a new system"
        lead="Replacement is rarely planned. Here is how to compare quotes and what to ask before you sign anything."
        crumbs={[{ name: "Financing", href: "/financing" }]}
      />

      <Section>
        <Container size="narrow">
          {financingOffered && financingOptions.length ? (
            <>
              <SectionHeading
                eyebrow="Options"
                title="Available plans"
                lead={
                  financingPartner
                    ? `Offered through ${financingPartner}. Approval, rates and terms are set by the lender, not by us.`
                    : undefined
                }
              />
              <ul className="mt-10 space-y-6">
                {financingOptions.map((option) => (
                  <li
                    key={option.name}
                    className="rounded-2xl border border-ink-900/8 bg-white p-6 shadow-card"
                  >
                    <h2 className="text-xl text-ink-950">{option.name}</h2>
                    <p className="mt-2 leading-relaxed text-ink-700">
                      {option.description}
                    </p>
                    {option.details.length ? (
                      <ul className="mt-4 space-y-2">
                        {option.details.map((detail) => (
                          <li
                            key={detail}
                            className="flex gap-3 text-[0.95rem] text-ink-700"
                          >
                            <Icon
                              name="check"
                              size={18}
                              className="mt-0.5 shrink-0 text-success-500"
                            />
                            {detail}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-xs leading-relaxed text-ink-600">
                Financing is subject to credit approval. Rates and terms are set
                by the lender and may change — confirm current terms before you
                commit.
              </p>
            </>
          ) : (
            <>
              {/*
                Said to the visitor, so this section is never blank. The build
                note below it is development-only, and without something here a
                customer who clicked "Financing" would land on an empty panel.
              */}
              <p className="text-lg leading-relaxed text-ink-800">
                We have not published financing terms on this page yet. Rates
                and terms are the lender&apos;s to set, and we would rather say
                nothing than quote you a figure that has not been confirmed in
                writing.
              </p>
              <p className="mt-4 text-lg leading-relaxed text-ink-800">
                Call {business.phone.display} and we will walk through the
                options that apply to your job, what they cost, and what they
                would mean month to month.
              </p>

              <BuildNote
                title="Financing details not published yet"
                className="mt-8"
              >
                No lender, rate or payment term has been entered, so the visitor
                message above is shown instead. Quoting consumer credit terms is
                regulated advertising, and publishing a rate that has not been
                confirmed in writing by the lender creates real legal exposure.
                <br />
                <br />
                To publish this section: set <code>financingOffered</code>,{" "}
                <code>financingPartner</code> and <code>financingOptions</code>{" "}
                in <code>src/data/financing.ts</code>.
              </BuildNote>
            </>
          )}
        </Container>
      </Section>

      <Section tone="muted">
        <Container size="narrow">
          <SectionHeading
            eyebrow="Before you sign"
            title="Four things worth knowing"
          />
          <ul className="mt-10 grid gap-6 sm:grid-cols-2">
            {financingGuidance.map((item) => (
              <li
                key={item.title}
                className="rounded-2xl border border-ink-900/8 bg-white p-6 shadow-card"
              >
                <h3 className="text-lg text-ink-950">{item.title}</h3>
                <p className="mt-2 text-[0.95rem] leading-relaxed text-ink-700">
                  {item.body}
                </p>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      <FaqSection faqs={await getFaqsByTopic("billing")} title="Payment questions" />
      <CtaBand
        title="Get a replacement quote"
        lead="A written quote with the full scope — equipment, labour, disposal and any duct or electrical work."
      />
    </>
  );
}
