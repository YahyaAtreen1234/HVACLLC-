import { business } from "@/config/business";
import { emergencyLabel } from "@/config/site";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { emergencyPhone, emergencyTelHref } from "@/lib/phone";
import { cn } from "@/lib/utils";

/**
 * Emergency call-to-action.
 *
 * Two guards keep this honest:
 *   1. It renders nothing at all unless `business.emergency.offered` is true.
 *   2. The words "24/7" only appear when `business.emergency.available247` is
 *      explicitly true — `emergencyLabel()` is the single source of that string,
 *      so the claim cannot be hard-coded into a page by mistake.
 */
export function EmergencyCta({
  variant = "band",
  className,
}: {
  /** `band` = full-width section, `inline` = compact block inside a page. */
  variant?: "band" | "inline";
  className?: string;
}) {
  if (!business.emergency.offered || !emergencyTelHref || !emergencyPhone) {
    return null;
  }

  const label = emergencyLabel();

  if (variant === "inline") {
    return (
      <div
        className={cn(
          "flex flex-col gap-4 rounded-2xl border-2 border-flame-500/25 bg-flame-50 p-6 sm:flex-row sm:items-center sm:justify-between",
          className,
        )}
      >
        <div className="flex items-start gap-3">
          <span className="mt-0.5 text-flame-600">
            <Icon name="alert" size={22} />
          </span>
          <div>
            <p className="font-display text-lg font-bold text-ink-950">
              {label}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-ink-700">
              {business.emergency.note}
            </p>
          </div>
        </div>
        <Button
          href={emergencyTelHref}
          variant="primary"
          size="md"
          iconLeft="phone"
          className="max-sm:w-full"
        >
          {emergencyPhone.display}
        </Button>
      </div>
    );
  }

  return (
    <aside
      aria-label={label}
      className={cn("on-dark relative overflow-hidden bg-flame-600", className)}
    >
      <div aria-hidden="true" className="absolute inset-0 hairline-grid opacity-40" />
      <Container>
        <div className="relative flex flex-col items-start gap-6 py-8 sm:flex-row sm:items-center sm:justify-between sm:py-10">
          <div className="flex items-start gap-4">
            <span className="mt-1 rounded-xl bg-white/15 p-2.5 text-white">
              <Icon name="alert" size={24} />
            </span>
            <div>
              <p className="font-display text-2xl font-bold text-white sm:text-3xl">
                {label}
              </p>
              <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-white/85 sm:text-base">
                {business.emergency.note}
              </p>
            </div>
          </div>

          <Button
            href={emergencyTelHref}
            variant="emergency"
            size="lg"
            iconLeft="phone"
            className="max-sm:w-full"
          >
            {emergencyPhone.display}
          </Button>
        </div>
      </Container>
    </aside>
  );
}
