import type { Metadata } from "next";
import { Hero } from "@/components/sections/Hero";
import { TrustStrip } from "@/components/sections/TrustStrip";
import { AboutBand } from "@/components/sections/AboutBand";
import { ContactBar } from "@/components/sections/ContactBar";
import { ServicesGrid } from "@/components/sections/ServicesGrid";
import { WhyUs } from "@/components/sections/WhyUs";
import { ProcessSteps } from "@/components/sections/ProcessSteps";
import { ReviewsSection } from "@/components/sections/ReviewsSection";
import { TeamSection } from "@/components/sections/TeamSection";
import { FaqSection } from "@/components/sections/FaqSection";
import { ServiceAreasSection } from "@/components/sections/ServiceAreasSection";
import { BrandWall } from "@/components/sections/BrandWall";
import { EmergencyCta } from "@/components/cta/EmergencyCta";
import { CtaBand } from "@/components/cta/CtaBand";
import { getFeaturedServices, getHomeFaqs } from "@/server/content/read";
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
  title: `HVAC Repair, Installation & Maintenance`,
  description: `${business.description} Call ${business.phone.display} to book a visit.`,
  path: "/",
});

export default async function HomePage() {
  return (
    <>
      <Hero />
      <TrustStrip />

      <ServicesGrid
        services={await getFeaturedServices()}
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

      {/*
        Faces before testimonials. A customer is deciding whether to let a
        stranger into their home, so showing who actually turns up carries more
        weight than a quote from someone they have never met.
      */}
      <TeamSection tone="light" />

      <ReviewsSection />
      <ServiceAreasSection tone="light" />
      {/*
        Near the foot of the page, after the reasons to trust the company and
        before the closing call to action. Someone still reading this far is
        checking whether their own equipment is covered, which is exactly the
        question this section answers.
      */}
      <BrandWall />
      <FaqSection faqs={await getHomeFaqs()} tone="muted" />
      <CtaBand />
    </>
  );
}
