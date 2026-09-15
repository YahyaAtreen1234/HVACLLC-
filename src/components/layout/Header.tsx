"use client";

import { useEffect, useRef, useState } from "react";
import { Logo } from "./Logo";
import { DesktopNav } from "./DesktopNav";
import { MobileNav } from "./MobileNav";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Container } from "@/components/ui/Container";
import { business } from "@/config/business";
import { cta, emergencyLabel } from "@/config/site";
import { phoneDisplay, telHref } from "@/lib/phone";
import { getWeekdaySummary } from "@/lib/hours";
import { nextScrollState, type ScrollState } from "@/lib/hide-on-scroll";
import { cn } from "@/lib/utils";

/**
 * Site header: utility bar, logo, navigation, phone number and the primary CTA.
 *
 * It is sticky, and gains a shadow once the page scrolls so it separates from
 * content without a permanent heavy border. On small screens the nav collapses
 * into <MobileNav /> and the phone number becomes an icon button, with the
 * full-width call button living in the menu and the sticky bottom bar.
 */
export function Header({ areaSummary }: { areaSummary: string }) {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);

  const headerRef = useRef<HTMLElement>(null);
  const state = useRef<ScrollState>({ hidden: false, lastY: 0 });

  useEffect(() => {
    // Scroll fires far faster than the screen refreshes. Reading the position
    // inside a frame callback means the work happens once per painted frame
    // instead of once per event, and reading scrollY in a handler that also
    // writes would force a synchronous layout on every one.
    let frame = 0;

    const measure = () => {
      frame = 0;
      const y = window.scrollY;

      setScrolled(y > 8);

      // Hiding the header while keyboard focus is inside it would take the
      // focused control off-screen mid-tab, leaving the ring somewhere the
      // reader cannot see.
      const holdsFocus =
        headerRef.current?.contains(document.activeElement) ?? false;

      // Body scroll is locked while the mobile menu is open, so this is really
      // a guard against a programmatic scroll doing something surprising.
      const menuOpen = document.body.style.overflow === "hidden";

      const next = nextScrollState(state.current, y, {
        locked: holdsFocus || menuOpen,
      });

      state.current = next;
      setHidden(next.hidden);
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  // Computed by the server layout — this component is client-side and cannot
  // read the database itself.

  return (
    <header
      ref={headerRef}
      className={cn(
        "sticky top-0 z-40",
        // Translate rather than display or height: it runs on the compositor,
        // so the page underneath never reflows and the text does not reflow
        // with it. The element also keeps its place in the layout, so nothing
        // below jumps up to fill the gap.
        "transition-[transform,box-shadow] duration-300 ease-out will-change-transform",
        hidden ? "-translate-y-full" : "translate-y-0",
        scrolled ? "shadow-bar" : "shadow-none",
        // With motion reduced, the header still hides — the point is to get it
        // out of the way — but it does so without the sliding movement.
        "motion-reduce:transition-none",
      )}
    >
      {/* Utility bar — desktop only, low-priority information. */}
      <div className="on-dark hidden bg-ink-950 text-ink-200 lg:block">
        <Container size="wide">
          <div className="flex items-center justify-between py-1.5 text-xs">
            <p className="flex items-center gap-2">
              <Icon name="map-pin" size={14} className="text-chill-400" />
              {/* areaSummary already reads "<City> and surrounding cities". */}
              Serving {areaSummary}
            </p>
            <div className="flex items-center gap-6">
              <span className="flex items-center gap-2">
                <Icon name="clock" size={14} className="text-chill-400" />
                {getWeekdaySummary()}
              </span>
              <a
                href={`mailto:${business.email}`}
                className="flex items-center gap-2 transition-colors hover:text-white"
              >
                <Icon name="mail" size={14} className="text-chill-400" />
                {business.email}
              </a>
              {business.emergency.offered ? (
                <span className="flex items-center gap-2 font-semibold text-flame-300">
                  <Icon name="alert" size={14} />
                  {emergencyLabel()}
                </span>
              ) : null}
            </div>
          </div>
        </Container>
      </div>

      {/* Main bar */}
      <div className="border-b border-ink-900/8 bg-white/95 backdrop-blur-md">
        <Container size="wide">
          {/*
            `min-w-0` on the flex children below, plus `whitespace-nowrap` on
            the things that must never break, is what keeps this bar short.
            Without it the phone number wrapped onto two lines and the CTA onto
            three, and since every child stretches to the tallest one, that
            alone drove the bar to 110px at a 1280px laptop width — a third of
            the fold spent on a strip the visitor has already read.
          */}
          <div className="flex items-center justify-between gap-3 py-2 lg:gap-4 lg:py-2.5">
            <Logo />

            <DesktopNav className="ml-auto" />

            <div className="flex items-center gap-2 sm:gap-2.5">
              {/*
                The number is written out at every width from md up, including
                the tight band where the navigation appears.

                It was briefly reduced to an icon between lg and xl to buy room.
                That is the wrong thing to trade away on a contractor's site:
                the phone number is the conversion, and a visitor should be able
                to read it without tapping anything. Everything in this row
                gives up a little size below xl instead — the number, its label,
                the nav labels and the service line under the wordmark — so all
                of it stays on the bar.
              */}
              <a
                href={telHref}
                data-analytics="phone-call"
                className="hidden items-center gap-1.5 whitespace-nowrap rounded-lg px-1.5 py-1.5 transition-colors hover:bg-ink-900/5 md:flex lg:max-roomy:hidden xl:gap-2 xl:px-2.5"
              >
                <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-flame-50 text-flame-600 xl:size-8">
                  <Icon name="phone" size={15} />
                </span>
                <span className="leading-tight">
                  <span className="block text-[0.5625rem] font-semibold uppercase tracking-wider text-ink-500 xl:text-[0.625rem]">
                    {cta.secondary}
                  </span>
                  <span className="block font-display text-[0.8125rem] font-bold text-ink-950 xl:text-[0.9375rem]">
                    {phoneDisplay}
                  </span>
                </span>
              </a>

              {/*
                The number as a call button: on phones, and in the 1024–1149
                band where the bar cannot hold it written out.

                Measured rather than guessed. With the service line already
                stepping aside there, the wordmark, seven links, the written
                number and the CTA still ran 51px past a 1024px viewport, and
                every remaining lever — nav size, padding, gaps — costs
                legibility for a few pixels each. Losing the written number for
                125 of them is the one trade that pays, and it is confined to a
                125px-wide band rather than every laptop under 1280.
              */}
              <a
                href={telHref}
                aria-label={`Call ${phoneDisplay}`}
                data-analytics="phone-call"
                className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-ink-900 text-white transition-colors hover:bg-ink-800 md:hidden lg:max-roomy:flex lg:max-roomy:size-10"
              >
                <Icon name="phone" size={20} />
              </a>

              <Button
                href="/contact"
                variant="primary"
                className="whitespace-nowrap max-lg:hidden"
              >
                {cta.primary}
              </Button>

              <MobileNav />
            </div>
          </div>
        </Container>
      </div>
    </header>
  );
}
