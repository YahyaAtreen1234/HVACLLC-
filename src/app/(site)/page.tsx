import type { Metadata } from "next";
import { Hero } from "@/components/sections/Hero";
import { TrustStrip } from "@/components/sections/TrustStrip";
import { AboutBand } from "@/components/sections/AboutBand";
import { ContactBar } from "@/components/sections/ContactBar";
import { ServicesGrid } from "@/components/sections/ServicesGrid";
import { WhyUs } from "@/components/sections/WhyUs";
import { ProcessSteps } from "@/components/sections/ProcessSteps";
import { ReviewsSection } from "@/components/sections/ReviewsSection";
import { FaqSection } from "@/components/sections/FaqSection";
import { ServiceAreasSection } from "@/components/sections/ServiceAreasSection";
import { EmergencyCta } from "@/components/cta/EmergencyCta";
import { CtaBand } from "@/components/cta/CtaBand";
import { getFeaturedServices, getHomeFaqs } from "@/server/content/read";
import { pageMetadata } from "@/lib/seo";
import { business } from "@/config/business";

export const metadata: Metadata = pageMetadata({
  title: `HVAC Repair, Installation & Maintenance`,
  description: `${business.description} Call ${business.phone.display} to book a visit.`,
  path: "/",
});

export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustStrip />

      <ServicesGrid
        services={getFeaturedServices()}
        eyebrow="What we do"
        title="Heating and cooling work, done properly"
        lead="Repairs when something fails, replacements when repair stops making sense, and maintenance so neither happens at the worst possible moment."
        showAllLink
      />

      <AboutBand />
      <ContactBar />
      <EmergencyCta />

      <WhyUs />
      <ProcessSteps />
      <ReviewsSection />
      <ServiceAreasSection tone="light" />
      <FaqSection faqs={getHomeFaqs()} tone="muted" />
      <CtaBand />
    </>
  );
}
