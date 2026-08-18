import type { Metadata } from "next";
import { PageHero } from "@/components/sections/PageHero";
import { ServiceAreasSection } from "@/components/sections/ServiceAreasSection";
import { FaqSection } from "@/components/sections/FaqSection";
import { CtaBand } from "@/components/cta/CtaBand";
import { EmergencyCta } from "@/components/cta/EmergencyCta";
import { getServiceAreas, getFaqsByTopic } from "@/server/content/read";
import { pageMetadata } from "@/lib/seo";
import { business } from "@/config/business";


/**
 * Rendered per request. The content comes from a database the owner edits in
 * the admin panel, so pre-rendering it at build time would serve the
 * deploy-time copy until the next deploy — and would make the build depend on
 * the database being reachable.
 */
export const dynamic = "force-dynamic";

/**
 * Built per request rather than as a module-level constant.
 *
 * The city list is a database read, and a top-level `await` runs the moment
 * Next imports this file to inspect its route config — before any request, and
 * during the build. That made the whole build depend on the database being
 * reachable. Inside `generateMetadata` it runs when the page is actually
 * rendered.
 */
export async function generateMetadata(): Promise<Metadata> {
  const areaNames = (await getServiceAreas())
    .map((area) => area.city)
    .join(", ");

  return pageMetadata({
    title: "Service Areas",
    description: `${business.name} provides HVAC repair, installation and maintenance in ${areaNames}.`,
    path: "/service-areas",
  });
}

export default async function ServiceAreasPage() {
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
      <FaqSection faqs={await getFaqsByTopic("general")} tone="muted" />
      <CtaBand
        title="Not sure if you are in range?"
        lead="Call and give us your ZIP — we will tell you straight away."
      />
    </>
  );
}
