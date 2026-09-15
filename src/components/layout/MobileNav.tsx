"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { mainNav } from "@/config/navigation";
import { business } from "@/config/business";
import { cta, emergencyLabel } from "@/config/site";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Logo } from "./Logo";
import { isActivePath, navCurrent } from "./DesktopNav";
import { phoneDisplay, telHref } from "@/lib/phone";
import { getWeekdaySummary } from "@/lib/hours";
import { cn } from "@/lib/utils";

/**
 * Mobile navigation: hamburger trigger + full-screen panel.
 *
 * Accessibility behaviour:
 *   • the panel is a modal dialog (`role="dialog"`, `aria-modal`)
 *   • Escape closes it and focus returns to the trigger
 *   • focus is moved into the panel on open and trapped inside it
 *   • background scrolling is locked while it is open
 *   • it closes automatically when the route changes
 *
 * The call button sits first in the panel because a phone call is the fastest
 * path to a booked job on a phone-sized screen.
 */
export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on navigation — including browser back/forward, which no click
  // handler would catch. Comparing the previous value during render is React's
  // documented way to adjust state when a value changes, and avoids the extra
  // render pass an effect would cost.
  const [lastPathname, setLastPathname] = useState(pathname);
  if (lastPathname !== pathname) {
    setLastPathname(pathname);
    if (open) setOpen(false);
  }

  // Lock background scroll while the panel is open.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  // Escape to close, Tab kept inside the panel.
  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        triggerRef.current?.focus();
        return;
      }

      if (event.key !== "Tab" || !panelRef.current) return;

      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    // Move focus into the panel once it exists.
    const timer = window.setTimeout(() => {
      panelRef.current
        ?.querySelector<HTMLElement>("button, a[href]")
        ?.focus();
    }, 20);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      window.clearTimeout(timer);
    };
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label="Open menu"
        className="flex size-11 items-center justify-center rounded-lg border-2 border-ink-900/12 bg-white text-ink-900 transition-colors hover:border-ink-900/25 xl:hidden"
      >
        <Icon name="menu" size={22} />
      </button>

      {/* Backdrop */}
      <div
        onClick={() => setOpen(false)}
        aria-hidden="true"
        className={cn(
          "fixed inset-0 z-50 bg-ink-950/60 backdrop-blur-sm transition-opacity duration-300 xl:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      {/* Panel */}
      <div
        id="mobile-menu"
        ref={panelRef}
        role="dialog"
        aria-modal={open || undefined}
        aria-label="Site menu"
        // `inert` (rather than `hidden`) keeps the slide animation while still
        // removing the closed panel from the accessibility tree and tab order.
        inert={!open}
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col bg-sand-50 shadow-2xl transition-transform duration-300 ease-out xl:hidden",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex items-center justify-between border-b border-ink-900/10 px-5 py-4">
          <Logo size={36} />
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              triggerRef.current?.focus();
            }}
            aria-label="Close menu"
            className="flex size-11 items-center justify-center rounded-lg border-2 border-ink-900/12 bg-white text-ink-900"
          >
            <Icon name="close" size={22} />
          </button>
        </div>

        <div className="flex flex-col gap-3 border-b border-ink-900/10 px-5 py-5">
          <Button
            href={telHref}
            variant="phone"
            size="lg"
            iconLeft="phone"
            fullWidth
            aria-label={`Call ${phoneDisplay}`}
          >
            {cta.secondary}: {phoneDisplay}
          </Button>
          <Button href="/contact" variant="primary" size="lg" fullWidth iconRight="arrow-right">
            {cta.primary}
          </Button>
          {business.emergency.offered ? (
            <p className="flex items-start gap-2 text-xs leading-relaxed text-ink-600">
              <Icon name="alert" size={14} className="mt-0.5 text-flame-600" />
              {emergencyLabel()} — {business.emergency.note}
            </p>
          ) : null}
        </div>

        <nav aria-label="Mobile" className="flex-1 overflow-y-auto px-2 py-3">
          <ul>
            {mainNav.map((item) => {
              const active = isActivePath(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={navCurrent(pathname, item.href)}
                    className={cn(
                      "flex items-center justify-between rounded-xl px-4 py-3.5 transition-colors",
                      active
                        ? "bg-white text-flame-600 shadow-card"
                        : "text-ink-900 hover:bg-white/70",
                    )}
                  >
                    <span>
                      <span className="block font-display text-lg font-semibold">
                        {item.label}
                      </span>
                      {item.description ? (
                        <span className="mt-0.5 block text-xs text-ink-600">
                          {item.description}
                        </span>
                      ) : null}
                    </span>
                    <Icon name="arrow-right" size={18} className="text-ink-400" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-ink-900/10 bg-white px-5 py-4 text-sm text-ink-700">
          <p className="flex items-center gap-2">
            <Icon name="clock" size={16} className="text-ink-500" />
            {getWeekdaySummary()}
          </p>
          <p className="mt-2 flex items-center gap-2">
            <Icon name="mail" size={16} className="text-ink-500" />
            <a
              href={`mailto:${business.email}`}
              className="underline underline-offset-2 hover:text-flame-600"
            >
              {business.email}
            </a>
          </p>
        </div>
      </div>
    </>
  );
}
