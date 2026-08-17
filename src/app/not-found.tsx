import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getServiceAreas } from "@/server/content/read";
import NotFoundContent from "./(site)/not-found";

/**
 * Global 404, for URLs that match no route group at all.
 *
 * `(site)/not-found.tsx` handles misses inside the marketing site and gets its
 * chrome from that group's layout. This one sits above every group, so it has
 * to bring the header and footer itself — a 404 with no way to navigate out is
 * a dead end.
 */
export default function GlobalNotFound() {
  const areaSummary = getServiceAreas()
    .slice(0, 3)
    .map((area) => area.city)
    .join(", ");

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
