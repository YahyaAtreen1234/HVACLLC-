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
export async function ServiceAreasSection({
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

        {await getServiceAreasArePlaceholder() ? (
          <Alert tone="info" title="Placeholder service areas" className="mt-8">
            Some of these city names are stand-ins. Edit them at{" "}
            <code>/admin/areas</code> so they match the towns the office
            actually dispatches to — this list feeds each city page and the
            structured data search engines use for local results. Stand-in
            cities are set to noindex until you confirm them.
          </Alert>
        ) : null}

        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {(await getServiceAreas()).map((area) => (
            <li key={area.slug} id={area.slug} className="scroll-mt-32">
              <div className="relative flex h-full flex-col rounded-2xl border border-ink-900/8 bg-white p-5 shadow-card transition-shadow hover:shadow-card-hover">
                <span className="flex items-center gap-2 font-display text-lg font-bold text-ink-950">
                  <Icon name="map-pin" size={18} className="text-flame-500" />
                  <Link
                    href={`/service-areas/${area.slug}`}
                    className="after:absolute after:inset-0 after:content-[''] hover:text-flame-600"
                  >
                    {area.city}
                  </Link>
                  <span className="text-sm font-semibold text-ink-500">
                    {area.state}
                  </span>
                </span>

                {area.neighborhoods?.length ? (
                  <p className="mt-2 text-sm leading-relaxed text-ink-600">
                    {area.neighborhoods.join(" · ")}
                  </p>
                ) : null}

                <span className="mt-4 inline-flex items-center gap-1.5 font-display text-sm font-semibold text-flame-600">
                  HVAC service in {area.city}
                  <Icon name="arrow-right" size={15} />
                </span>
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
