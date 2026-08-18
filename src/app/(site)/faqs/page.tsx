import type { Metadata } from "next";

import { PageHero } from "@/components/sections/PageHero";
import { Container, Section } from "@/components/ui/Container";
import { FaqAccordion } from "@/components/FaqAccordion";
import { CtaBand } from "@/components/cta/CtaBand";
import { JsonLd } from "@/components/seo/JsonLd";

import { getFaqs } from "@/server/content/read";
import { pageMetadata, faqSchema } from "@/lib/seo";
import { business } from "@/config/business";


/**
 * Rendered per request. The content comes from a database the owner edits in
 * the admin panel, so pre-rendering it at build time would serve the
 * deploy-time copy until the next deploy — and would make the build depend on
 * the database being reachable.
 */
export const dynamic = "force-dynamic";

export const metadata: Metadata = pageMetadata({
  title: "Frequently Asked Questions",
  description: `Common questions about HVAC repair, replacement, maintenance and pricing, answered by ${business.name}.`,
  path: "/faqs",
});

/** Topic order and labels for grouping. Anything unrecognised falls to General. */
const TOPICS: Array<{ key: string; label: string }> = [
  { key: "general", label: "General" },
  { key: "cooling", label: "Cooling" },
  { key: "heating", label: "Heating" },
  { key: "maintenance", label: "Maintenance" },
  { key: "billing", label: "Pricing & billing" },
];

export default async function FaqsPage() {
  const all = await getFaqs();

  const groups = TOPICS.map((topic) => ({
    ...topic,
    faqs: all.filter((faq) => faq.topic === topic.key),
  })).filter((group) => group.faqs.length > 0);

  return (
    <>
      <PageHero
        eyebrow="Answers"
        title="Frequently asked questions"
        lead={`The questions the office is asked most. If yours is not here, call ${business.phone.display} — you will reach a person who can answer it.`}
        crumbs={[{ name: "FAQs", href: "/faqs" }]}
      />

      <Section>
        <Container size="narrow">
          {groups.length ? (
            <div className="space-y-14">
              {groups.map((group) => (
                <div key={group.key}>
                  <h2
                    id={group.key}
                    className="scroll-mt-32 font-display text-xl font-bold text-ink-950"
                  >
                    {group.label}
                  </h2>
                  <div className="mt-5">
                    <FaqAccordion faqs={group.faqs} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-ink-600">
              No questions published yet. Add them at{" "}
              <code>/admin/faqs</code>.
            </p>
          )}
        </Container>
      </Section>

      <CtaBand
        title="Still not sure?"
        lead="Describe what the system is doing and we will tell you what it usually means — before anyone is dispatched."
      />

      {all.length ? <JsonLd data={faqSchema(all)} /> : null}
    </>
  );
}
