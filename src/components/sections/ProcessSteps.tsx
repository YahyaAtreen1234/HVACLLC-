import { Container, Section } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { processSteps } from "@/data/trust";

/** Numbered "how it works" strip. Sets expectations before the first call. */
export function ProcessSteps() {
  return (
    <Section tone="dark" spacing="default" className="overflow-hidden">
      <div aria-hidden="true" className="absolute inset-0 hairline-grid opacity-60" />
      <Container className="relative">
        <SectionHeading
          eyebrow="How it works"
          title="Four steps, no surprises"
          tone="dark"
          lead="From the first call to a working system, here is exactly what happens."
        />

        <ol className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
          {processSteps.map((step, index) => (
            <Reveal as="li" key={step.title} delay={index * 80}>
              <div className="h-full bg-ink-950 p-6">
                <span
                  aria-hidden="true"
                  className="font-display text-5xl font-bold text-flame-500/40"
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-3 text-lg text-white">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-300">
                  {step.body}
                </p>
              </div>
            </Reveal>
          ))}
        </ol>
      </Container>
    </Section>
  );
}
