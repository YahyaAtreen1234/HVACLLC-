import { Button, type ButtonProps, type ButtonSize } from "@/components/ui/Button";
import { cta } from "@/config/site";
import { phoneDisplay, telHref } from "@/lib/phone";
import { cn } from "@/lib/utils";

type Overrides = Partial<Pick<ButtonProps, "size" | "className" | "fullWidth">>;

/**
 * The three site-wide calls to action, wrapped so their label, destination and
 * styling are defined once. Pages compose these instead of hand-rolling buttons,
 * which is what keeps the CTA wording identical on every page.
 */

/** "Request Service" — the primary conversion action. */
export function PrimaryCta({
  label = cta.primary,
  href = "/contact",
  ...overrides
}: Overrides & { label?: string; href?: string }) {
  return (
    <Button href={href} variant="primary" iconRight="arrow-right" {...overrides}>
      {label}
    </Button>
  );
}

/** Secondary action — used for estimates and lower-commitment paths. */
export function SecondaryCta({
  label = cta.quote,
  href = "/contact?intent=quote",
  variant = "secondary",
  ...overrides
}: Overrides & {
  label?: string;
  href?: string;
  variant?: "secondary" | "light" | "ghost";
}) {
  return (
    <Button href={href} variant={variant} {...overrides}>
      {label}
    </Button>
  );
}

/**
 * Click-to-call. Shows the number itself, because a visible number converts
 * better than a bare "Call Now" and still works when tel: links do not.
 */
export function PhoneCta({
  label,
  showNumber = true,
  variant = "phone",
  ...overrides
}: Overrides & {
  label?: string;
  /** When false, renders just the label (used in tight mobile bars). */
  showNumber?: boolean;
  variant?: "phone" | "light" | "secondary" | "emergency";
}) {
  return (
    <Button
      href={telHref}
      variant={variant}
      iconLeft="phone"
      data-analytics="phone-call"
      aria-label={`Call ${phoneDisplay}`}
      {...overrides}
    >
      {showNumber ? phoneDisplay : (label ?? cta.secondary)}
    </Button>
  );
}

/**
 * Primary + phone pairing used at the end of most sections.
 * Stacks on mobile so both stay full-width thumb targets.
 */
export function CtaPair({
  size = "lg",
  tone = "light",
  className,
  primaryHref = "/contact",
}: {
  size?: ButtonSize;
  tone?: "light" | "dark";
  className?: string;
  primaryHref?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-3 sm:flex-row sm:items-center", className)}>
      <PrimaryCta size={size} href={primaryHref} className="max-sm:w-full" />
      <PhoneCta
        size={size}
        variant={tone === "dark" ? "light" : "phone"}
        className="max-sm:w-full"
      />
    </div>
  );
}
