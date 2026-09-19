"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { Container, Section } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { brandFamilies, BRAND_ROTATE_MS, totalBrandCount } from "@/data/brands";
import { cn } from "@/lib/utils";

/**
 * The brand wall: every manufacturer the office services, grouped by who
 * actually builds the equipment, cycling one family at a time.
 *
 * Grouped rather than a flat logo grid because the grouping is the useful part.
 * Someone with a Comfortmaker furnace has no reason to know Carrier builds it,
 * and a wall of twenty-six unsorted badges answers "can you fix mine?" worse
 * than six labelled families do.
 *
 * Wording is "brands we service", never "authorised dealer". Servicing a brand
 * and being appointed by its manufacturer are different claims, and only one of
 * them is ours to make — the same rule the rest of the site follows about
 * ratings and credentials.
 *
 * Three things govern the rotation, in order of precedence:
 *
 *   1. Reduced motion. If the visitor's system asks for it, nothing advances on
 *      its own and nothing slides; the tabs are the whole interface.
 *   2. The pause control. Auto-advancing content has to be stoppable by
 *      something other than a mouse, so there is a real button, not only
 *      hover — a keyboard or touch user cannot hover.
 *   3. Hover and focus, which pause it while someone is reading or tabbing
 *      through, and resume when they leave.
 */
export function BrandWall() {
  const [active, setActive] = useState(0);
  const [held, setHeld] = useState(false);
  const [stopped, setStopped] = useState(false);
  const [reduced, setReduced] = useState(false);
  const tabsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  const running = !held && !stopped && !reduced;

  useEffect(() => {
    if (!running) return;
    const timer = window.setTimeout(
      () => setActive((i) => (i + 1) % brandFamilies.length),
      BRAND_ROTATE_MS,
    );
    return () => window.clearTimeout(timer);
    // `active` is a dependency so each family gets a full interval rather than
    // inheriting whatever was left of the previous one.
  }, [running, active]);

  /** Left/right arrows move between tabs, as the tab pattern expects. */
  const onTabKeyDown = useCallback((event: React.KeyboardEvent) => {
    const step =
      event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (!step) return;

    event.preventDefault();
    setActive((i) => {
      const next = (i + step + brandFamilies.length) % brandFamilies.length;
      const buttons = tabsRef.current?.querySelectorAll("button");
      (buttons?.[next] as HTMLButtonElement | undefined)?.focus();
      return next;
    });
  }, []);

  const family = brandFamilies[active];

  return (
    <Section tone="light" id="brands">
      <Container>
        <div
          className="overflow-hidden rounded-3xl bg-ink-950 shadow-2xl"
          onMouseEnter={() => setHeld(true)}
          onMouseLeave={() => setHeld(false)}
          onFocusCapture={() => setHeld(true)}
          onBlurCapture={() => setHeld(false)}
        >
          {/* Heading */}
          <div className="flex flex-wrap items-end justify-between gap-4 px-6 pt-8 sm:px-10 sm:pt-10">
            <div>
              <p className="eyebrow text-flame-400">Equipment we service</p>
              <h2 className="mt-2 font-display text-2xl font-bold text-white sm:text-3xl">
                {totalBrandCount} brands, six manufacturers
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-300">
                Most badges on a furnace belong to one of six parent companies.
                Find yours below — if it is not listed, call and ask; the odds
                are we still carry the parts.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setStopped((s) => !s)}
              aria-pressed={stopped}
              className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-white/15 px-3 py-2 font-display text-xs font-semibold text-ink-200 transition-colors hover:border-white/35 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-flame-400"
            >
              <Icon name={stopped ? "arrow-right" : "check"} size={14} />
              {stopped ? "Resume rotation" : "Pause rotation"}
            </button>
          </div>

          {/* Family tabs */}
          <div
            ref={tabsRef}
            role="tablist"
            aria-label="Equipment manufacturers"
            onKeyDown={onTabKeyDown}
            className="scrollbar-none mt-7 flex gap-2 overflow-x-auto px-6 pb-1 sm:px-10"
          >
            {brandFamilies.map((entry, index) => {
              const current = index === active;
              return (
                <button
                  key={entry.slug}
                  type="button"
                  role="tab"
                  id={`brand-tab-${entry.slug}`}
                  aria-selected={current}
                  aria-controls={`brand-panel-${entry.slug}`}
                  tabIndex={current ? 0 : -1}
                  onClick={() => setActive(index)}
                  style={
                    current
                      ? { backgroundColor: entry.accent, color: "#04122a" }
                      : undefined
                  }
                  className={cn(
                    "shrink-0 rounded-full px-4 py-2 font-display text-xs font-bold whitespace-nowrap transition-colors sm:text-sm",
                    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white",
                    current
                      ? "shadow-lg"
                      : "bg-white/8 text-ink-200 hover:bg-white/15 hover:text-white",
                  )}
                >
                  {entry.name}
                </button>
              );
            })}
          </div>

          {/* Countdown. Keyed on the active family so it restarts each turn. */}
          <div className="mx-6 mt-5 h-0.5 overflow-hidden rounded-full bg-white/10 sm:mx-10">
            <div
              key={`${active}-${running}`}
              className={cn("h-full origin-left", running && "animate-brand-sweep")}
              style={{
                backgroundColor: family.accent,
                animationDuration: `${BRAND_ROTATE_MS}ms`,
                transform: running ? undefined : "scaleX(1)",
              }}
            />
          </div>

          {/* Panel */}
          <div
            role="tabpanel"
            id={`brand-panel-${family.slug}`}
            aria-labelledby={`brand-tab-${family.slug}`}
            className="px-6 pb-9 sm:px-10 sm:pb-11"
          >
            <div key={family.slug} className="animate-brand-in">
              <div className="mt-6 flex items-baseline gap-3">
                <span
                  aria-hidden="true"
                  className="h-4 w-1 shrink-0 rounded-full"
                  style={{ backgroundColor: family.accent }}
                />
                <h3 className="font-display text-lg font-bold text-white">
                  {family.name}
                </h3>
              </div>
              <p className="mt-1 pl-4 text-sm text-ink-300">{family.note}</p>

              <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {family.brands.map((brand) => (
                  <li key={brand.name}>
                    <div
                      className={cn(
                        "group relative flex h-24 flex-col items-center justify-center gap-1.5 rounded-xl px-3 py-3 transition-transform duration-300 ease-out",
                        "hover:-translate-y-1 motion-reduce:hover:translate-y-0",
                        brand.logo
                          ? "bg-white"
                          : "border border-white/12 bg-white/5",
                      )}
                      style={{ outlineColor: family.accent }}
                    >
                      {/*
                        The ring is a pseudo-free overlay rather than a border,
                        so the tile does not shift by a pixel when it appears.
                      */}
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 rounded-xl opacity-0 ring-2 transition-opacity duration-300 group-hover:opacity-100"
                        style={{ boxShadow: `inset 0 0 0 2px ${family.accent}` }}
                      />

                      {brand.logo ? (
                        <span className="relative h-11 w-full">
                          <Image
                            src={brand.logo}
                            alt={`${brand.name} logo`}
                            fill
                            sizes="(min-width: 1024px) 15vw, 40vw"
                            className="object-contain"
                          />
                        </span>
                      ) : (
                        <span
                          className="font-display text-base leading-tight font-bold text-balance"
                          style={{ color: family.accent }}
                        >
                          {brand.name}
                        </span>
                      )}

                      {/*
                        The name is printed under every logo as well. Several of
                        these wordmarks are small, low-contrast or set in a
                        script face, and a customer scanning for the badge on
                        their own furnace should not have to decipher artwork.
                      */}
                      {brand.logo ? (
                        <span className="font-display text-[0.6875rem] font-semibold text-ink-600">
                          {brand.name}
                        </span>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
