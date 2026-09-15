import Link from "next/link";
import { business } from "@/config/business";
import { cn } from "@/lib/utils";
import { LogoMark } from "./LogoMark";

export { LogoMark };

/**
 * Logo mark + wordmark.
 *
 * The real logo is a raster file, so it is loaded through `next/image` rather
 * than inlined — that gets automatic AVIF/WebP conversion and correct sizing
 * for each breakpoint, which matters because this loads on every page.
 *
 * The wordmark beside it is text, not part of the image, so it stays readable
 * to search engines and screen readers and does not blur when scaled.
 *
 * Save the file as `public/brand/logo.png` — see public/brand/README.md.
 */

const LOGO_SRC = "/brand/logo.png";

export function Logo({
  tone = "light",
  href = "/",
  size = 44,
  /**
   * Shows the mark on a white tile. The logo's navy half disappears against a
   * navy background, so on dark surfaces it needs something to sit on.
   */
  plate = false,
  showWordmark = true,
  className,
}: {
  tone?: "light" | "dark";
  href?: string;
  size?: number;
  plate?: boolean;
  showWordmark?: boolean;
  className?: string;
}) {
  const dark = tone === "dark";

  return (
    <Link
      href={href}
      className={cn("group flex items-center gap-3", className)}
      aria-label={`${business.name} — home`}
    >
      <span
        className={cn(
          "flex shrink-0 items-center justify-center transition-transform duration-300 group-hover:scale-105 motion-reduce:group-hover:scale-100",
          plate && "rounded-xl bg-white p-1.5 shadow-sm ring-1 ring-black/5",
        )}
      >
        <LogoMark src={LOGO_SRC} size={size} />
      </span>

      {showWordmark ? (
        <span className="flex min-w-0 flex-col leading-none">
          {/*
            `whitespace-nowrap` for the same reason the nav labels and the phone
            number carry it: the row is a flex line whose height is set by its
            tallest child, so "NorthStar HVAC" breaking after "NorthStar" put
            12px on the whole header. It did that only in the narrow band where
            the navigation competes for width, which is exactly where the bar
            can least afford it.
          */}
          <span
            className={cn(
              "font-display text-[1.0625rem] font-bold tracking-tight whitespace-nowrap sm:text-lg",
              dark ? "text-white" : "text-ink-950",
            )}
          >
            {business.name}
          </span>
          {/*
            Present at every width the row can hold it, which after the
            reductions elsewhere means phones, tablets, and every desktop from
            about 1150px up — so it is there on essentially every real laptop.
            One size step down below xl, full size above.

            The single exception is 1024–1149px: the navigation appears at 1024,
            and between there and 1150 the seven links, the written-out number
            and the CTA together leave no room for it. Something has to go in
            that band, and this is the right thing to lose — it restates what
            the navigation already lists, whereas the links are what a visitor
            is reaching for and the number is what turns them into a call.
          */}
          <span
            className={cn(
              "eyebrow mt-1 truncate text-[0.5625rem] tracking-[0.14em] lg:max-roomy:hidden xl:text-[0.625rem] xl:tracking-[0.18em]",
              dark ? "text-ink-300" : "text-ink-600",
            )}
          >
            {business.serviceLine}
          </span>
        </span>
      ) : null}
    </Link>
  );
}
