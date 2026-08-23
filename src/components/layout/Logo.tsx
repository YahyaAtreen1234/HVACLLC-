import Image from "next/image";
import Link from "next/link";
import { business } from "@/config/business";
import { cn } from "@/lib/utils";

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

export function LogoMark({
  size = 44,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <Image
      src={LOGO_SRC}
      alt=""
      width={size}
      height={size}
      priority
      className={cn("shrink-0 object-contain", className)}
      style={{ width: size, height: size }}
    />
  );
}

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
        <LogoMark size={size} />
      </span>

      {showWordmark ? (
        <span className="flex min-w-0 flex-col leading-none">
          <span
            className={cn(
              "font-display text-[1.0625rem] font-bold tracking-tight sm:text-lg",
              dark ? "text-white" : "text-ink-950",
            )}
          >
            {business.name}
          </span>
          <span
            className={cn(
              "eyebrow mt-1 truncate text-[0.625rem]",
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
