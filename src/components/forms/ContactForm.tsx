"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { Icon } from "@/components/ui/Icon";
import {
  HoneypotField,
  SelectField,
  TextAreaField,
  TextField,
} from "./FormField";
import { submitServiceRequest } from "@/lib/actions";
import { initialServiceRequestState } from "@/lib/form-state";
import { URGENCY_OPTIONS } from "@/lib/validation";
import { phoneDisplay, telHref } from "@/lib/phone";
import { cn } from "@/lib/utils";

/**
 * Service request form.
 *
 * Built on a server action with `useActionState`, so it submits and validates
 * server-side even if JavaScript never loads — the form still posts, and the
 * same validation rules run. Field errors come back keyed by field name and are
 * wired to the inputs through `aria-describedby`/`aria-invalid` in FormField.
 *
 * The phone number stays visible next to the submit button: some people will
 * always prefer to call, and a form should never be the only way through.
 */
export function ContactForm({
  /**
   * The live service list. Passed in rather than imported because this is a
   * client component and the catalogue now lives in the database — a service
   * added in the admin panel has to show up in this dropdown.
   */
  services,
  /** Pre-selects a service, e.g. from a service page CTA. */
  defaultService,
  className,
}: {
  services: Array<{ slug: string; name: string }>;
  defaultService?: string;
  className?: string;
}) {
  const [state, formAction, pending] = useActionState(
    submitServiceRequest,
    initialServiceRequestState,
  );

  if (state.status === "success") {
    return (
      <div
        className={cn(
          "rounded-2xl border border-success-500/20 bg-white p-8 text-center shadow-card",
          className,
        )}
      >
        <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-success-50 text-success-500">
          <Icon name="check" size={28} />
        </span>
        <h3 className="mt-5 text-2xl text-ink-950">Request sent</h3>
        <p className="mx-auto mt-3 max-w-md text-[0.95rem] leading-relaxed text-ink-700">
          {state.message}
        </p>
        {state.reference ? (
          <p className="mt-4 text-xs text-ink-500">
            Reference:{" "}
            <code className="rounded bg-ink-50 px-1.5 py-0.5 font-mono">
              {state.reference.slice(0, 8)}
            </code>{" "}
            — quote this if you call about the same job.
          </p>
        ) : null}
        <Button
          href={telHref}
          variant="phone"
          size="lg"
          iconLeft="phone"
          className="mt-6"
        >
          {phoneDisplay}
        </Button>
      </div>
    );
  }

  const values = state.values ?? {};

  return (
    <form
      action={formAction}
      noValidate
      className={cn(
        "relative rounded-2xl border border-ink-900/8 bg-white p-6 shadow-card sm:p-8",
        className,
      )}
    >
      <HoneypotField />

      <div className="flex flex-col gap-5">
        {state.status === "error" && state.message ? (
          <Alert tone="error" title="We could not send that">
            {state.message}
          </Alert>
        ) : null}

        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            id="name"
            label="Your name"
            required
            autoComplete="name"
            placeholder="Jordan Rivera"
            defaultValue={values.name}
            error={state.errors.name}
            maxLength={100}
          />
          <TextField
            id="phone"
            label="Phone"
            type="tel"
            required
            inputMode="tel"
            autoComplete="tel"
            placeholder="(555) 555-0100"
            defaultValue={values.phone}
            error={state.errors.phone}
          />
          <TextField
            id="email"
            label="Email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@example.com"
            defaultValue={values.email}
            error={state.errors.email}
          />
          <TextField
            id="zip"
            label="ZIP code"
            required
            inputMode="numeric"
            autoComplete="postal-code"
            placeholder="00000"
            maxLength={10}
            defaultValue={values.zip}
            error={state.errors.zip}
            hint="Confirms you are inside the service area."
          />
        </div>

        <SelectField
          id="serviceSlug"
          label="What do you need?"
          required
          placeholder="Choose a service…"
          defaultValue={defaultService ?? values.serviceSlug}
          error={state.errors.serviceSlug}
          options={[
            ...services.map((service) => ({
              value: service.slug,
              label: service.name,
            })),
            { value: "other", label: "Something else / not sure" },
          ]}
        />

        <SelectField
          id="urgency"
          label="How soon do you need us?"
          required
          placeholder="Choose an option…"
          defaultValue={values.urgency}
          error={state.errors.urgency}
          options={URGENCY_OPTIONS.map((option) => ({
            value: option.value,
            label: option.label,
          }))}
        />

        <TextAreaField
          id="message"
          label="What is the system doing?"
          placeholder="Age and brand of the system, what changed, any noises or error codes…"
          defaultValue={values.message}
          error={state.errors.message}
          maxLength={2000}
          hint="The more detail, the better the chance of a first-visit fix."
        />

        <div className="flex flex-col gap-4 border-t border-ink-900/8 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs leading-relaxed text-ink-600">
            By submitting, you agree we may contact you about this request by
            phone, text or email. We do not sell your information.
            {/* TODO: confirm this matches the published privacy policy. */}
          </p>
          <Button type="submit" size="lg" loading={pending} className="max-sm:w-full">
            {pending ? "Sending…" : "Request Service"}
          </Button>
        </div>

        <p className="text-center text-sm text-ink-600 sm:text-left">
          Prefer to talk it through?{" "}
          <a
            href={telHref}
            data-analytics="phone-call"
            className="font-display font-semibold text-flame-600 underline underline-offset-2 hover:text-flame-700"
          >
            Call {phoneDisplay}
          </a>
        </p>
      </div>
    </form>
  );
}
