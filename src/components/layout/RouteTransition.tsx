"use client";

import { usePathname } from "next/navigation";

/**
 * A short fade between routes, so a navigation is not a hard cut.
 *
 * Keying on the pathname is what makes it replay: React tears down the old
 * subtree and mounts a new one, restarting the CSS animation. Without the key
 * the wrapper would persist and animate only on first load.
 *
 * Kept to 350ms and 6px. A page transition is in the way of what someone came
 * to read, so it should register as smoothness rather than as a wait — and it
 * must not delay the content, which is why this animates the already-rendered
 * markup instead of holding it back.
 */
export function RouteTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div key={pathname} className="page-enter">
      {children}
    </div>
  );
}
