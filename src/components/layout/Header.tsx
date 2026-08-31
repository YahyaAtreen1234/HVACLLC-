"use client";

import { useEffect, useState } from "react";
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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Computed by the server layout — this component is client-side and cannot
  // read the database itself.

  return (
    <header
      className={cn(
        "sticky top-0 z-40 transition-shadow duration-300",
        scrolled ? "shadow-bar" : "shadow-none",
      )}
    >
      {/* Utility bar — desktop only, low-priority information. */}
      <div className="on-dark hidden bg-ink-950 text-ink-200 lg:block">
        <Container size="wide">
          <div className="flex items-center justify-between py-2 text-xs">
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
          <div className="flex items-center justify-between gap-4 py-3 lg:py-4">
            <Logo />

            <DesktopNav className="ml-auto" />

            <div className="flex items-center gap-2 sm:gap-3">
              {/* Desktop: number as a readable click-to-call block. */}
              <a
                href={telHref}
                data-analytics="phone-call"
                className="hidden items-center gap-2.5 rounded-lg px-3 py-2 transition-colors hover:bg-ink-900/5 md:flex"
              >
                <span className="flex size-9 items-center justify-center rounded-lg bg-flame-50 text-flame-600">
                  <Icon name="phone" size={18} />
                </span>
                <span className="leading-tight">
                  <span className="block text-[0.6875rem] font-semibold uppercase tracking-wider text-ink-500">
                    {cta.secondary}
                  </span>
                  <span className="block font-display text-base font-bold text-ink-950">
                    {phoneDisplay}
                  </span>
                </span>
              </a>

              {/* Mobile: compact call button, always within thumb reach. */}
              <a
                href={telHref}
                aria-label={`Call ${phoneDisplay}`}
                data-analytics="phone-call"
                className="flex size-11 items-center justify-center rounded-lg bg-ink-900 text-white transition-colors hover:bg-ink-800 md:hidden"
              >
                <Icon name="phone" size={20} />
              </a>

              <Button href="/contact" variant="primary" className="max-lg:hidden">
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
