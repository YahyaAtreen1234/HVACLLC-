import Link from "next/link";
import { business } from "@/config/business";
import { cn } from "@/lib/utils";

/**
 * Logo mark + wordmark.
 *
 * The mark is inline SVG (no image request, sharp at any size, recolours for
 * dark backgrounds). The wordmark reads from the business config, so renaming
 * the company updates the header, footer and mobile menu at once.
 *
 * TODO: swap `LogoMark` for the company's real logo file when one exists.
 */
export function LogoMark({
  size = 40,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
      className={cn("shrink-0", className)}
    >
      <defs>
        <linearGradient id="logo-cool" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#35b6e6" />
          <stop offset="100%" stopColor="#127cad" />
        </linearGradient>
        <linearGradient id="logo-heat" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#d93f0c" />
          <stop offset="100%" stopColor="#fd7136" />
        </linearGradient>
      </defs>

      {/* Split field: cool half / heat half — the two things an HVAC company does. */}
      <rect width="48" height="48" rx="12" fill="#0c1e2e" />
      <path d="M12 36 36 12v24H12Z" fill="url(#logo-heat)" opacity="0.95" />
      <path d="M12 36 36 12H12v24Z" fill="url(#logo-cool)" opacity="0.28" />

      {/* Airflow: three chevrons moving across the split. */}
      <g stroke="#ffffff" strokeWidth="2.6" strokeLinecap="round" fill="none">
        <path d="M13 18h11" opacity="0.95" />
        <path d="M13 24h7" opacity="0.7" />
        <path d="M27 30h8" opacity="0.95" />
      </g>
    </svg>
  );
}

export function Logo({
  tone = "light",
  href = "/",
  size = 40,
  className,
}: {
  tone?: "light" | "dark";
  href?: string;
  size?: number;
  className?: string;
}) {
  const dark = tone === "dark";

  return (
    <Link
      href={href}
      className={cn("group flex items-center gap-3", className)}
      aria-label={`${business.name} — home`}
    >
      <LogoMark
        size={size}
        className="transition-transform duration-300 group-hover:scale-105 motion-reduce:group-hover:scale-100"
      />
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
          Heating · Cooling · Air Quality
        </span>
      </span>
    </Link>
  );
}
