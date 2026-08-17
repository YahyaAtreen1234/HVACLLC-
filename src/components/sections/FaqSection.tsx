import { Container, Section } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FaqAccordion } from "@/components/FaqAccordion";
import { JsonLd } from "@/components/seo/JsonLd";
import { faqSchema } from "@/lib/seo";
import { PhoneCta } from "@/components/cta/CtaButtons";
import type { Faq } from "@/types";

/**
 * FAQ block with matching FAQPage structured data, which is what makes these
 * questions eligible to appear directly in search results.
 */
export function FaqSection({
  faqs,
  eyebrow = "Questions",
  title = "Straight answers before you book",
  lead,
  tone = "light",
  withSchema = true,
}: {
  faqs: Faq[];
  eyebrow?: string;
  title?: string;
  lead?: string;
  tone?: "light" | "muted";
  withSchema?: boolean;
}) {
  if (!faqs.length) return null;

  return (
    <Section tone={tone} id="faq">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <div className="lg:sticky lg:top-32 lg:self-start">
            <SectionHeading eyebrow={eyebrow} title={title} lead={lead} />
            <div className="mt-8 rounded-2xl border border-ink-900/8 bg-white p-6 shadow-card">
              <p className="text-[0.95rem] leading-relaxed text-ink-700">
                Not covered here? Ask us directly — describing the symptom over
                the phone is usually faster than reading about it.
              </p>
              <PhoneCta size="md" className="mt-4 max-sm:w-full" />
            </div>
          </div>

          <FaqAccordion faqs={faqs} />
        </div>
      </Container>

      {withSchema ? <JsonLd data={faqSchema(faqs)} /> : null}
    </Section>
  );
}
