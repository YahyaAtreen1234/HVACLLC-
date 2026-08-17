import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { business } from "@/config/business";
import { getFeaturedServices, getServiceAreas } from "@/server/content/read";

/**
 * Home page hero.
 *
 * Light ground, a heavy uppercase headline whose last line carries the brand
 * orange, and the equipment photo sitting inside a navy swoosh on the right.
 *
 * The swoosh is a decorative SVG rather than an image so it stays crisp at
 * every width and costs nothing to download; it is `aria-hidden` because it
 * carries no meaning for a screen reader.
 */
export function Hero() {
  const areas = getServiceAreas();
  const areaSummary = areas
    .slice(0, 2)
    .map((area) => area.city)
    .join(" & ");

  return (
    <section className="relative overflow-hidden bg-sand-50">
      <Container size="wide" className="relative">
        <div className="grid items-center gap-10 py-14 sm:py-16 lg:grid-cols-[1fr_1.05fr] lg:gap-8 lg:py-20">
          {/* Copy */}
          <div className="animate-rise relative z-10">
            <h1 className="font-display text-4xl leading-[1.02] font-bold tracking-tight text-ink-950 uppercase sm:text-5xl lg:text-6xl">
              Comfort
              <br />
              you can
              <br />
              <span className="text-flame-500">count on</span>
            </h1>

            <p className="mt-6 max-w-md text-[1.05rem] leading-relaxed text-ink-700">
              Professional heating and cooling for homes and businesses in{" "}
              {areaSummary}. {business.tagline}.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-lg bg-flame-500 px-6 py-3.5 font-display text-sm font-semibold tracking-wide text-white uppercase shadow-sm transition-colors hover:bg-flame-600"
              >
                Get a free quote
                <Icon name="arrow-right" size={16} />
              </Link>
              <Link
                href="/services"
                className="inline-flex items-center gap-2 rounded-lg border border-ink-900/15 bg-white px-6 py-3.5 font-display text-sm font-semibold tracking-wide text-ink-950 uppercase transition-colors hover:border-flame-500/40 hover:text-flame-600"
              >
                Our services
                <Icon name="arrow-right" size={16} />
              </Link>
            </div>
          </div>

          {/* Equipment photo inside the navy swoosh */}
          <div className="relative">
            {/* The swoosh: a navy blade with an orange leading edge. */}
            <svg
              aria-hidden="true"
              viewBox="0 0 600 460"
              preserveAspectRatio="none"
              className="pointer-events-none absolute -inset-x-8 -inset-y-6 h-[calc(100%+3rem)] w-[calc(100%+4rem)]"
            >
              <path
                d="M120 0 H600 V460 H40 C40 460 -20 330 60 210 C120 120 120 60 120 0 Z"
                fill="var(--color-ink-950)"
              />
              <path
                d="M96 0 C96 60 96 120 36 210 C-44 330 16 460 16 460 L52 460 C52 460 -8 330 72 210 C132 120 132 60 132 0 Z"
                fill="var(--color-flame-500)"
              />
            </svg>

            <div className="relative px-4 py-6 sm:px-8 lg:px-10 lg:py-10">
              <MediaFrame
                image={{
                  src: "",
                  alt: "Outdoor condensing unit installed beside a Phoenix home",
                  width: 1200,
                  height: 900,
                }}
                icon="snowflake"
                priority
                aspect="4/3"
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="shadow-2xl ring-1 ring-white/10"
              />
            </div>
          </div>
        </div>
      </Container>

      {/* Quick service row — high-intent shortcuts, scrollable on mobile. */}
      <div className="relative border-t border-ink-900/8 bg-white">
        <Container size="wide">
          <ul className="scrollbar-none -mx-1 flex snap-x gap-2 overflow-x-auto py-4">
            {getFeaturedServices().map((service) => (
              <li key={service.slug} className="snap-start">
                <Link
                  href={`/services/${service.slug}`}
                  className="flex items-center gap-2 rounded-full border border-ink-900/12 px-4 py-2 text-sm whitespace-nowrap text-ink-700 transition-colors hover:border-flame-500/50 hover:bg-flame-50 hover:text-flame-700"
                >
                  <Icon name={service.icon} size={16} className="text-flame-500" />
                  {service.name}
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </div>
    </section>
  );
}
