import { Container, Section } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CtaPair } from "./CtaButtons";
import { getWeekdaySummary } from "@/lib/hours";
import { Icon } from "@/components/ui/Icon";

/**
 * Closing conversion block. Every page ends with one of these so there is
 * always an action in reach without the visitor scrolling back to the header.
 */
export function CtaBand({
  title = "Ready to get your system sorted?",
  lead = "Tell us what it is doing and we will tell you what it takes to fix it. No pressure, no jargon.",
  eyebrow = "Next step",
}: {
  title?: string;
  lead?: string;
  eyebrow?: string;
}) {
  return (
    <Section tone="dark" className="overflow-hidden">
      <div aria-hidden="true" className="absolute inset-0 hairline-grid opacity-70" />
      <div
        aria-hidden="true"
        className="absolute -top-32 -right-24 size-96 rounded-full bg-flame-500/20 blur-3xl"
      />
      <Container className="relative">
        <div className="grid items-center gap-10 lg:grid-cols-[1.2fr_1fr]">
          <SectionHeading
            eyebrow={eyebrow}
            title={title}
            lead={lead}
            tone="dark"
          />
          <div className="lg:justify-self-end">
            <CtaPair tone="dark" />
            <p className="mt-5 flex items-center gap-2 text-sm text-ink-300">
              <Icon name="clock" size={16} />
              {getWeekdaySummary()}
            </p>
          </div>
        </div>
      </Container>
    </Section>
  );
}
