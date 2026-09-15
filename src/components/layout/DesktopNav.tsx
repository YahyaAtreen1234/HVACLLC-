"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { mainNav } from "@/config/navigation";
import { cn } from "@/lib/utils";

/** Returns true for the exact route, or any child route below it. */
export function isActivePath(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * `aria-current="page"` belongs to the page you are actually on — the
 * breadcrumb's last crumb already claims it. A nav item for an ancestor
 * section (Services, while on a service detail page) gets "true" instead, so
 * screen readers do not announce two current pages.
 */
export function navCurrent(
  pathname: string,
  href: string,
): "page" | "true" | undefined {
  if (pathname === href) return "page";
  return isActivePath(pathname, href) ? "true" : undefined;
}

/**
 * Primary navigation for large screens. Hidden below `xl`, where MobileNav
 * takes over. The active item is marked with `aria-current` as well as the
 * underline, so it is not communicated by colour alone.
 *
 * The switch is at `xl`, not `lg`: seven items plus the wordmark, the phone
 * block and the CTA measure wider than a 1024px viewport can hold. It used to
 * be set at `lg` and appeared to work only because the labels wrapped onto
 * second lines — which quietly pushed the header to 142px. Once wrapping was
 * turned off the real width showed up as 243px of horizontal page scroll, so
 * the breakpoint moved to where the row genuinely fits.
 */
export function DesktopNav({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Main" className={cn("hidden xl:block", className)}>
      <ul className="flex items-center gap-0.5">
        {mainNav.map((item) => {
          const active = isActivePath(pathname, item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={navCurrent(pathname, item.href)}
                className={cn(
                  // `whitespace-nowrap` because "Service Areas" was breaking
                  // across two lines, and a wrapped nav item stretches the
                  // whole bar. The underline inset tracks the horizontal
                  // padding, so the two move together.
                  "relative block whitespace-nowrap rounded-md px-2 py-1.5 font-display text-[0.9375rem] font-semibold transition-colors",
                  "after:absolute after:inset-x-2 after:-bottom-0.5 after:h-0.5 after:rounded-full after:transition-transform after:duration-300 after:content-['']",
                  active
                    ? "text-flame-600 after:scale-x-100 after:bg-flame-500"
                    : "text-ink-800 after:scale-x-0 after:bg-flame-500 hover:text-flame-600 hover:after:scale-x-100",
                )}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
