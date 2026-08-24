import { cn } from "@/lib/utils";
import { Icon } from "./Icon";
import type { IconName } from "@/types";

type AlertTone = "error" | "success" | "info";

const TONES: Record<AlertTone, { wrap: string; icon: IconName; text: string }> =
  {
    error: {
      wrap: "border-danger-500/25 bg-danger-50 text-danger-700",
      icon: "alert",
      text: "text-danger-700",
    },
    success: {
      wrap: "border-success-500/25 bg-success-50 text-success-700",
      icon: "check",
      text: "text-success-700",
    },
    info: {
      wrap: "border-ink-900/10 bg-ink-50 text-ink-800",
      icon: "alert",
      text: "text-ink-800",
    },
  };

/**
 * Inline status message for forms and error states.
 *
 * Errors announce themselves to screen readers (`role="alert"`); success and
 * info use a polite live region so they do not interrupt.
 */
export function Alert({
  tone = "info",
  title,
  children,
  className,
}: {
  tone?: AlertTone;
  title?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  const styles = TONES[tone];

  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      aria-live={tone === "error" ? "assertive" : "polite"}
      className={cn(
        // Eased in rather than appearing instantly. `animate-rise` is the same
        // curve the rest of the page uses, and it animates only opacity and
        // transform, so a validation message appearing cannot shove the fields
        // below it around mid-read.
        "animate-rise flex items-start gap-3 rounded-xl border p-4 text-sm leading-relaxed",
        styles.wrap,
        className,
      )}
    >
      <Icon name={styles.icon} size={20} className="mt-0.5" />
      <div>
        {title ? (
          <p className={cn("font-display font-semibold", styles.text)}>
            {title}
          </p>
        ) : null}
        {children ? <div className={title ? "mt-1" : undefined}>{children}</div> : null}
      </div>
    </div>
  );
}
