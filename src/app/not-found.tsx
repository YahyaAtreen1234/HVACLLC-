import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { business } from "@/config/business";
import NotFoundContent from "./(site)/not-found";


/**
 * Rendered per request. The content comes from a database the owner edits in
 * the admin panel, so pre-rendering it at build time would serve the
 * deploy-time copy until the next deploy — and would make the build depend on
 * the database being reachable.
 */
export const dynamic = "force-dynamic";

/**
 * Global 404, for URLs that match no route group at all.
 *
 * `(site)/not-found.tsx` handles misses inside the marketing site and gets its
 * chrome from that group's layout. This one sits above every group, so it has
 * to bring the header and footer itself — a 404 with no way to navigate out is
 * a dead end.
 */
export default async function GlobalNotFound() {
  // Matches the header on every other page. Listing the first three towns here
  // meant the 404 announced a different coverage sentence than the rest of the
  // site, and changed whenever the area list was reordered.
  const areaSummary = `${business.address.city} and surrounding cities`;

  return (
    <>
      <Header areaSummary={areaSummary} />
      <main id="main" className="flex-1 pb-20 lg:pb-0">
        <NotFoundContent />
      </main>
      <Footer />
    </>
  );
}
