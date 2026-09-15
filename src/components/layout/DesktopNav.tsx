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
 * The switch stays at `lg`. Seven items plus the wordmark, a written-out phone
 * number and the CTA do not fit a 1024px viewport — that combination measured
 * 243px too wide, and since the body clips horizontal overflow rather than
 * scrolling it, the right-hand end of the bar was cut off rather than pushed
 * somewhere reachable. Moving this to `xl` fixed the clipping by hiding the
 * navigation on every laptop between 1024 and 1279px, which trades the bug for
 * a worse one: the nav is the part people actually use.
 *
 * So the row gives up width elsewhere in that band instead — the logo's service
 * line and the written phone number both step aside for it, and the number
 * stays reachable as an icon. See Header.tsx.
 */
export function DesktopNav({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Main" className={cn("hidden lg:block", className)}>
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
                  // One type step and a little padding smaller below xl, full
                  // size above it. Those two reductions are worth about 60px
                  // across seven labels, which is the difference between the
                  // whole bar — wordmark, service line, seven links, the
                  // written-out number and the CTA — fitting from 1190px up or
                  // from about 1150px up. The underline inset tracks the
                  // padding at both sizes so it stays aligned to the label.
                  "relative block whitespace-nowrap rounded-md px-1.5 py-1.5 font-display text-sm font-semibold transition-colors xl:px-2 xl:text-[0.9375rem]",
                  "after:absolute after:inset-x-1.5 after:-bottom-0.5 after:h-0.5 after:rounded-full after:transition-transform after:duration-300 after:content-[''] xl:after:inset-x-2",
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
