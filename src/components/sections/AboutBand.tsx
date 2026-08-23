import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { business } from "@/config/business";

/**
 * "About + why choose us" band: a navy copy panel, a photo, and headline
 * numbers.
 *
 * The numbers come from `business.stats`, which ships empty. Whatever is not
 * filled in simply does not render, so the layout degrades to about-plus-photo
 * rather than showing zeros or invented counts.
 */
export function AboutBand() {
  const stats = business.stats;
  const years = new Date().getFullYear() - business.foundedYear;

  return (
    <section className="bg-white">
      <div className="grid lg:grid-cols-2">
        {/* Navy copy panel */}
        <div className="on-dark relative overflow-hidden bg-ink-950 text-white">
          <div
            aria-hidden="true"
            className="absolute inset-0 hairline-grid opacity-60"
          />
          <div
            aria-hidden="true"
            className="absolute -top-24 -left-20 size-96 rounded-full bg-flame-500/15 blur-3xl"
          />

          <div className="relative flex h-full flex-col justify-center px-6 py-14 sm:px-10 lg:py-20 lg:pr-14 lg:pl-[max(1.5rem,calc((100vw-80rem)/2+2rem))]">
            <h2 className="font-display text-2xl font-bold tracking-tight uppercase sm:text-3xl">
              About{" "}
              <span className="text-flame-400">{business.name}</span>
            </h2>

            <p className="mt-5 max-w-md text-[0.975rem] leading-relaxed text-ink-200">
              {business.description}
            </p>

            <ul className="mt-7 space-y-3 text-sm text-ink-200">
              {years ? (
                <li className="flex items-center gap-3">
                  <Icon name="calendar" size={18} className="text-chill-400" />
                  Serving {business.address.city} since {business.foundedYear}
                </li>
              ) : null}
              <li className="flex items-center gap-3">
                <Icon name="wrench" size={18} className="text-chill-400" />
                Diagnosis before parts, priced before the work starts
              </li>
            </ul>

            <div className="mt-9">
              <Link
                href="/about"
                className="inline-flex items-center gap-2 rounded-full bg-flame-600 px-6 py-3 font-display text-sm font-semibold text-white transition-colors hover:bg-flame-700"
              >
                Learn more about us
                <Icon name="arrow-right" size={16} />
              </Link>
            </div>
          </div>
        </div>

        {/* Photo */}
        <div className="relative min-h-[18rem] lg:min-h-0">
          <MediaFrame
            image={{
              src: "",
              alt: "Living room of a Phoenix home at a comfortable temperature, with a wall thermostat in frame",
              width: 1200,
              height: 900,
            }}
            icon="thermostat"
            aspect="4/3"
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="h-full"
          />
        </div>
      </div>

      {/* Headline numbers — renders only what the config actually claims. */}
      {stats.length ? (
        <Container size="wide">
          <div className="border-t border-ink-900/8 py-12">
            <h2 className="text-center font-display text-xl font-bold tracking-wide text-ink-950 uppercase">
              Why choose us
            </h2>
            <dl className="mt-9 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <dt className="sr-only">{stat.label}</dt>
                  <dd>
                    <span className="block font-display text-4xl font-bold text-flame-600">
                      {stat.value}
                    </span>
                    <span className="mt-1 block font-display text-sm font-semibold text-ink-950">
                      {stat.label}
                    </span>
                    {stat.hint ? (
                      <span className="mt-0.5 block text-xs text-ink-500">
                        {stat.hint}
                      </span>
                    ) : null}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </Container>
      ) : null}
    </section>
  );
}
