import Link from "next/link";
import { cn } from "@/lib/utils";
import { Icon } from "./Icon";
import { Spinner } from "./Spinner";
import type { IconName } from "@/types";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "phone"
  | "ghost"
  | "light"
  | "emergency";
export type ButtonSize = "sm" | "md" | "lg";

const BASE =
  "relative inline-flex items-center justify-center gap-2.5 rounded-lg font-display font-semibold tracking-tight " +
  "transition-[transform,background-color,border-color,color,box-shadow] duration-200 ease-out " +
  "hover:-translate-y-0.5 active:translate-y-0 disabled:pointer-events-none disabled:opacity-60 " +
  "motion-reduce:hover:translate-y-0";

const VARIANTS: Record<ButtonVariant, string> = {
  // Main conversion action — the only element on a page in flame orange.
  primary:
    "bg-flame-600 text-white shadow-card hover:bg-flame-700 hover:shadow-card-hover",
  // Sits next to primary on light backgrounds.
  secondary:
    "border-2 border-ink-900/15 bg-white text-ink-900 shadow-card hover:border-ink-900/30 hover:shadow-card-hover",
  // Click-to-call. Reads as a phone number rather than a generic button.
  phone: "border-2 border-ink-800 bg-ink-900 text-white hover:bg-ink-800",
  // Low emphasis, inline.
  ghost: "text-ink-800 hover:bg-ink-900/5 hover:text-ink-950",
  // For use on dark navy sections.
  light:
    "border-2 border-white/25 bg-white/5 text-white backdrop-blur-sm hover:border-white/50 hover:bg-white/10",
  // Urgent, used sparingly — never more than one per viewport.
  emergency:
    "bg-white text-flame-700 shadow-card hover:bg-flame-50 hover:shadow-card-hover",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "min-h-9 px-3.5 py-2 text-sm",
  md: "min-h-11 px-5 py-2.5 text-[0.95rem]",
  // Comfortable thumb target on mobile (>= 48px tall).
  lg: "min-h-13 px-7 py-3.5 text-base sm:text-lg",
};

interface StyleProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Icon rendered before the label. */
  iconLeft?: IconName;
  /** Icon rendered after the label. */
  iconRight?: IconName;
  fullWidth?: boolean;
  className?: string;
  children: React.ReactNode;
}

type AnchorProps = StyleProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof StyleProps> & {
    href: string;
  };

type NativeButtonProps = StyleProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof StyleProps> & {
    href?: undefined;
    /** Shows a spinner, sets aria-busy and blocks interaction. */
    loading?: boolean;
  };

export type ButtonProps = AnchorProps | NativeButtonProps;

function styles({ variant = "primary", size = "md", fullWidth, className }: StyleProps) {
  return cn(BASE, VARIANTS[variant], SIZES[size], fullWidth && "w-full", className);
}

function iconPx(size: ButtonSize = "md") {
  return size === "lg" ? 22 : size === "sm" ? 16 : 20;
}

function Content({
  size,
  iconLeft,
  iconRight,
  children,
}: Pick<StyleProps, "size" | "iconLeft" | "iconRight" | "children">) {
  return (
    <>
      {iconLeft ? <Icon name={iconLeft} size={iconPx(size)} /> : null}
      <span>{children}</span>
      {iconRight ? <Icon name={iconRight} size={iconPx(size)} /> : null}
    </>
  );
}

/**
 * The single button used everywhere on the site.
 *
 * It renders the right element for the job automatically:
 *   • `next/link` for internal routes (prefetched client navigation)
 *   • plain `<a>` for tel:, mailto: and external URLs (external gets rel/target)
 *   • `<button>` when there is no href
 */
export function Button(props: ButtonProps) {
  if (props.href !== undefined) return <ButtonLink {...props} />;
  return <ButtonElement {...props} />;
}

function ButtonLink({
  href,
  variant,
  size,
  iconLeft,
  iconRight,
  fullWidth,
  className,
  children,
  ...rest
}: AnchorProps) {
  const classes = styles({ variant, size, fullWidth, className, children });
  const body = (
    <Content size={size} iconLeft={iconLeft} iconRight={iconRight}>
      {children}
    </Content>
  );

  const isInternal = href.startsWith("/") && !href.startsWith("//");
  if (isInternal) {
    return (
      <Link href={href} className={classes} {...rest}>
        {body}
      </Link>
    );
  }

  const isExternalHttp = href.startsWith("http");
  return (
    <a
      href={href}
      className={classes}
      {...(isExternalHttp ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      {...rest}
    >
      {body}
    </a>
  );
}

function ButtonElement({
  variant,
  size,
  iconLeft,
  iconRight,
  fullWidth,
  className,
  children,
  loading = false,
  type = "button",
  disabled,
  ...rest
}: NativeButtonProps) {
  return (
    <button
      type={type}
      className={styles({ variant, size, fullWidth, className, children })}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? <Spinner size={iconPx(size)} /> : null}
      {loading ? (
        <span>{children}</span>
      ) : (
        <Content size={size} iconLeft={iconLeft} iconRight={iconRight}>
          {children}
        </Content>
      )}
    </button>
  );
}
