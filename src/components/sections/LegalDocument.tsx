import { Container, Section } from "@/components/ui/Container";
import { Alert } from "@/components/ui/Alert";

export interface LegalSectionContent {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
}

/**
 * Shared renderer for the policy pages, so both documents share one typographic
 * scale and one structure. Content lives in the page files.
 */
export function LegalDocument({
  updated,
  intro,
  sections,
  reviewNotice = true,
}: {
  /** ISO date the document was last reviewed. */
  updated: string;
  intro: string;
  sections: LegalSectionContent[];
  /** Shows the "template — needs legal review" notice. */
  reviewNotice?: boolean;
}) {
  const updatedLabel = new Date(updated).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Section>
      <Container size="narrow">
        <p className="text-sm text-ink-600">Last updated: {updatedLabel}</p>

        {reviewNotice ? (
          <Alert tone="info" title="Template — needs review before launch" className="mt-6">
            This document is a starting point written for a US HVAC contractor.
            It is not legal advice. Have a qualified attorney review and adapt it
            to the business, its state and the tools it actually uses before the
            site goes live, and fill in every TODO.
          </Alert>
        ) : null}

        <p className="mt-8 text-lg leading-relaxed text-ink-800">{intro}</p>

        <div className="mt-10 space-y-10">
          {sections.map((section) => (
            <section key={section.heading}>
              <h2 className="text-2xl text-ink-950">{section.heading}</h2>
              {section.paragraphs.map((paragraph) => (
                <p
                  key={paragraph.slice(0, 40)}
                  className="mt-4 leading-relaxed text-ink-700"
                >
                  {paragraph}
                </p>
              ))}
              {section.bullets?.length ? (
                <ul className="mt-4 list-disc space-y-2 pl-6 text-ink-700 marker:text-flame-500">
                  {section.bullets.map((bullet) => (
                    <li key={bullet} className="leading-relaxed">
                      {bullet}
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}
        </div>
      </Container>
    </Section>
  );
}
