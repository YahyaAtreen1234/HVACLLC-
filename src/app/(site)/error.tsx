"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { phoneDisplay, telHref } from "@/lib/phone";

/**
 * Route-level error boundary.
 *
 * A visitor whose system just failed does not care why the page broke — the
 * phone number is the recovery path, so it is the most prominent thing here.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // TODO: forward to an error reporting service (Sentry, Axiom, …).
    console.error("[route-error]", error);
  }, [error]);

  return (
    <Container size="narrow">
      <div className="flex flex-col items-center py-24 text-center sm:py-32">
        <span className="flex size-16 items-center justify-center rounded-2xl bg-danger-50 text-danger-500">
          <Icon name="alert" size={32} />
        </span>

        <h1 className="mt-6 text-3xl text-ink-950 sm:text-4xl">
          Something went wrong on our end
        </h1>
        <p className="mt-4 max-w-md leading-relaxed text-ink-700">
          The page did not load properly. You can try again, or call us — we can
          take your details over the phone right now.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button onClick={reset} variant="secondary" size="lg">
            Try again
          </Button>
          <Button href={telHref} variant="primary" size="lg" iconLeft="phone">
            {phoneDisplay}
          </Button>
        </div>

        {error.digest ? (
          <p className="mt-8 text-xs text-ink-500">
            Reference: {error.digest}
          </p>
        ) : null}
      </div>
    </Container>
  );
}
