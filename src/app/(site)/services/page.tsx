import type { Metadata } from "next";
import { PageHero } from "@/components/sections/PageHero";
import { ServicesGrid } from "@/components/sections/ServicesGrid";
import { EmergencyCta } from "@/components/cta/EmergencyCta";
import { ProcessSteps } from "@/components/sections/ProcessSteps";
import { FaqSection } from "@/components/sections/FaqSection";
import { ReviewsSection } from "@/components/sections/ReviewsSection";
import { CtaBand } from "@/components/cta/CtaBand";
import { Container, Section } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ComparisonTable } from "@/components/ComparisonTable";
import { PhoneCta } from "@/components/cta/CtaButtons";
import { getServices } from "@/server/content/read";
import { repairVsReplace } from "@/data/comparison";
import { getFaqsByTopic } from "@/server/content/read";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "HVAC Services",
  description:
    "Air conditioning and heating repair, system replacement, heat pumps, maintenance, indoor air quality, ductwork and light commercial HVAC.",
  path: "/services",
});

export default function ServicesPage() {
  return (
    <>
      <PageHero
        eyebrow="Services"
        title="Everything we service, repair and install"
        lead="One team for the whole system — the equipment, the ducts that feed it and the controls that run it."
        crumbs={[{ name: "Services", href: "/services" }]}
      />

      <ServicesGrid
        services={getServices()}
        eyebrow="Full catalogue"
        title="Pick the job you need"
        lead="Not sure which one applies? Describe the symptom when you call and we will sort it out."
      />

      <EmergencyCta />

      {/*
        The comparison a homeowner actually needs before spending money.
        Deliberately not a price table: see the note in data/comparison.ts.
      */}
      <Section tone="muted">
        <Container size="wide">
          <SectionHeading
            eyebrow="Repair or replace?"
            title="The honest way to decide"
            lead="Nobody should sell you a system you did not need. These are the factors that actually decide it — bring them up when we quote your job."
          />

          <ComparisonTable
            className="mt-10"
            caption="Factors that indicate whether to repair or replace an HVAC system"
            criterionLabel="What to look at"
            optionALabel="Lean toward repair"
            optionBLabel="Lean toward replacement"
            rows={repairVsReplace}
          />

          <p className="mt-6 max-w-2xl text-sm leading-relaxed text-ink-600">
            No single row decides it. Two or three pointing the same way usually
            does — and you should always be given both numbers and left to
            choose.
          </p>

          <PhoneCta size="md" className="mt-6 max-sm:w-full" />
        </Container>
      </Section>

      <ProcessSteps />
      <ReviewsSection tone="light" />
      <FaqSection faqs={getFaqsByTopic("general")} tone="muted" />
      <CtaBand />
    </>
  );
}
