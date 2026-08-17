import type { Metadata } from "next";
import { PageHero } from "@/components/sections/PageHero";
import { ServiceAreasSection } from "@/components/sections/ServiceAreasSection";
import { FaqSection } from "@/components/sections/FaqSection";
import { CtaBand } from "@/components/cta/CtaBand";
import { EmergencyCta } from "@/components/cta/EmergencyCta";
import { getServiceAreas, getFaqsByTopic } from "@/server/content/read";
import { pageMetadata } from "@/lib/seo";
import { business } from "@/config/business";

const areaNames = getServiceAreas().map((area) => area.city).join(", ");

export const metadata: Metadata = pageMetadata({
  title: "Service Areas",
  description: `${business.name} provides HVAC repair, installation and maintenance in ${areaNames}.`,
  path: "/service-areas",
});

export default function ServiceAreasPage() {
  return (
    <>
      <PageHero
        eyebrow="Service areas"
        title="Communities we cover"
        lead="Drive time matters when your heat is out. These are the areas we serve day to day."
        crumbs={[{ name: "Service Areas", href: "/service-areas" }]}
      />

      <ServiceAreasSection showHeading={false} />
      <EmergencyCta />
      <FaqSection faqs={getFaqsByTopic("general")} tone="muted" />
      <CtaBand
        title="Not sure if you are in range?"
        lead="Call and give us your ZIP — we will tell you straight away."
      />
    </>
  );
}
