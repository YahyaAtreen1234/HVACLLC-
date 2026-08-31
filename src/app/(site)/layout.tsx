import { Header } from "@/components/layout/Header";
import { RouteTransition } from "@/components/layout/RouteTransition";
import { Footer } from "@/components/layout/Footer";
import { HiringBanner } from "@/components/sections/HiringBanner";
import { MobileCallBar } from "@/components/layout/MobileCallBar";
import { PlaceholderNotice } from "@/components/dev/PlaceholderNotice";
import { JsonLd } from "@/components/seo/JsonLd";
import { localBusinessSchema } from "@/lib/seo";
import { business } from "@/config/business";
import { getServiceAreas } from "@/server/content/read";

/**
 * Chrome for the public marketing site.
 *
 * Separated from the root layout so /admin does not inherit a customer-facing
 * header, footer and "call now" bar — the panel is a different product with a
 * different audience. Route groups do not appear in the URL, so every page in
 * here keeps the path it always had.
 */

/**
 * Rendered per request, for the whole public site.
 *
 * Every page here reads content the owner edits in the admin panel. Baking
 * that in at build time would mean an edit shows correctly, then silently
 * reverts to the deploy-time copy on the next deploy — the database keeps the
 * change, but the served HTML does not. It also means the build no longer
 * needs the database to be reachable.
 */
export const dynamic = "force-dynamic";
export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Read once here so the client Header does not need database access.
  //
  // Only confirmed towns are named. The previous version listed the first
  // three areas regardless, which put Scottsdale and Mesa in the header of
  // every page while those same towns were deliberately kept out of search
  // results as unconfirmed — the site was advertising coverage it was
  // simultaneously refusing to claim to Google.
  const confirmed = (await getServiceAreas()).filter(
    (area) => !area.isPlaceholder,
  );

  const areaSummary = confirmed.length
    ? `${confirmed[0].city} and surrounding cities`
    : `${business.address.city} and surrounding cities`;

  return (
    <>
      {/* Keyboard users can jump straight past the navigation. */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-ink-950 focus:px-4 focus:py-3 focus:font-display focus:font-semibold focus:text-white"
      >
        Skip to main content
      </a>

      <PlaceholderNotice />
      <Header areaSummary={areaSummary} />

      {/* Bottom padding clears the sticky mobile call bar. */}
      <main id="main" className="flex-1 pb-20 lg:pb-0">
        <RouteTransition>{children}</RouteTransition>
      </main>

      <HiringBanner />
      <Footer />
      <MobileCallBar />

      <JsonLd data={await localBusinessSchema()} />
    </>
  );
}
