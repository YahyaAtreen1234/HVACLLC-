import Link from "next/link";
import { Container, Section } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Icon } from "@/components/ui/Icon";
import { Alert } from "@/components/ui/Alert";
import { PrimaryCta } from "@/components/cta/CtaButtons";
import { getServiceAreas, getServiceAreasArePlaceholder } from "@/server/content/read";
import { business } from "@/config/business";

/**
 * Service-area list. Doubles as local-SEO content, so the city names here must
 * be the real ones — a development warning appears while they are placeholders.
 */
export function ServiceAreasSection({
  tone = "light",
  showHeading = true,
}: {
  tone?: "light" | "muted";
  showHeading?: boolean;
}) {
  return (
    <Section tone={tone} id="service-areas">
      <Container>
        {showHeading ? (
          <SectionHeading
            eyebrow="Service areas"
            title={`Where we work`}
            lead={`Local crews mean shorter drive times and same-region parts. If your town is not listed, call ${business.phone.display} — we may still cover you.`}
          />
        ) : null}

        {getServiceAreasArePlaceholder() ? (
          <Alert tone="info" title="Placeholder service areas" className="mt-8">
            These city names are stand-ins. Replace them in{" "}
            <code>src/data/service-areas.ts</code> with the towns the business
            actually covers — this list also feeds the structured data search
            engines use for local results.
          </Alert>
        ) : null}

        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {getServiceAreas().map((area) => (
            <li key={area.slug} id={area.slug} className="scroll-mt-32">
              <div className="flex h-full flex-col rounded-2xl border border-ink-900/8 bg-white p-5 shadow-card transition-shadow hover:shadow-card-hover">
                <span className="flex items-center gap-2 font-display text-lg font-bold text-ink-950">
                  <Icon name="map-pin" size={18} className="text-flame-500" />
                  {area.city}
                  <span className="text-sm font-semibold text-ink-500">
                    {area.state}
                  </span>
                </span>

                {area.neighborhoods?.length ? (
                  <p className="mt-2 text-sm leading-relaxed text-ink-600">
                    {area.neighborhoods.join(" · ")}
                  </p>
                ) : null}

                <Link
                  href="/contact"
                  className="mt-4 inline-flex items-center gap-1.5 font-display text-sm font-semibold text-flame-600 hover:text-flame-700"
                >
                  Book in {area.city}
                  <Icon name="arrow-right" size={15} />
                </Link>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-10">
          <PrimaryCta size="lg" label="Check my address" />
        </div>
      </Container>
    </Section>
  );
}
