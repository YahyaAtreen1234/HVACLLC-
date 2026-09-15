import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { Container, Section } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Icon } from "@/components/ui/Icon";
import { BuildNote } from "@/components/ui/BuildNote";
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
          <BuildNote title="Placeholder service areas" className="mt-8">
            Some of these city names are stand-ins. Edit them at{" "}
            <code>/admin/areas</code> so they match the towns the office
            actually dispatches to — this list feeds each city page and the
            structured data search engines use for local results. Stand-in
            cities are set to noindex until you confirm them.
          </BuildNote>
        ) : null}

        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {(await getServiceAreas()).map((area, index) => (
            <Reveal
              as="li"
              key={area.slug}
              id={area.slug}
              delay={index * 80}
              className="scroll-mt-32"
            >
              <div className="area-ribbon flex h-full flex-col items-center rounded-2xl p-6 text-center shadow-card transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:shadow-card-hover motion-reduce:hover:translate-y-0">
                {/*
                  The drifting layer. Offset per card so the eight ribbons are
                  at different points in the same ten-second cycle — in step
                  they would read as one flashing block rather than ambient
                  movement. Negative delays start each one mid-cycle instead of
                  holding it still, so the row is already in motion on arrival.
                */}
                <span
                  aria-hidden="true"
                  className="area-ribbon-glow"
                  style={{ animationDelay: `-${(index % 8) * 1.25}s` }}
                />

                <Icon
                  name="map-pin"
                  size={20}
                  className="text-flame-500"
                  aria-hidden="true"
                />

                <span className="mt-2 font-display text-xl font-bold text-white">
                  <Link
                    href={`/service-areas/${area.slug}`}
                    className="after:absolute after:inset-0 after:content-[''] hover:text-flame-300"
                  >
                    {area.city}
                  </Link>
                </span>

                <span className="mt-0.5 text-sm font-semibold tracking-wide text-chill-300">
                  {area.state}
                </span>

                {area.neighborhoods?.length ? (
                  <p className="mt-2 text-sm leading-relaxed text-white/70">
                    {area.neighborhoods.join(" · ")}
                  </p>
                ) : null}

                <span className="mt-auto inline-flex items-center gap-1.5 pt-4 font-display text-sm font-semibold text-flame-300">
                  HVAC service in {area.city}
                  <Icon name="arrow-right" size={15} aria-hidden="true" />
                </span>
              </div>
            </Reveal>
          ))}
        </ul>

        <div className="mt-10">
          <PrimaryCta size="lg" label="Check my address" />
        </div>
      </Container>
    </Section>
  );
}
