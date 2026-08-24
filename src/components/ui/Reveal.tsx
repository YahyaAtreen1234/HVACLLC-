"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * Subtle scroll-in animation.
 *
 * The content is always in the HTML — the animation is purely visual, so
 * nothing is hidden from crawlers or from users without JavaScript (the
 * `.reveal` utility also opts out entirely under `prefers-reduced-motion`).
 *
 * The reveal flips a DOM attribute rather than React state: it is a one-way
 * visual effect, so there is no reason to trigger a re-render for it.
 */
export function Reveal({
  children,
  delay = 0,
  className,
  id,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  /** Stagger in milliseconds. */
  delay?: number;
  className?: string;
  /**
   * Anchor target. Needed because wrapping an element that already carried an
   * id would otherwise break links pointing at it — the footer's city links
   * jump to `/service-areas#phoenix`.
   */
  id?: string;
  as?: "div" | "li" | "section" | "article";
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const reveal = () => node.setAttribute("data-revealed", "true");

    // Very old browsers, or anything without IntersectionObserver: show at once.
    if (typeof IntersectionObserver === "undefined") {
      reveal();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            reveal();
            observer.disconnect();
          }
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.1 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      // @ts-expect-error — one shared ref across the allowed element types.
      ref={ref}
      id={id}
      data-revealed="false"
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      className={cn("reveal", className)}
    >
      {children}
    </Tag>
  );
}
