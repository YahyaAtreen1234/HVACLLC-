"use client";

import { useActionState, type ReactNode } from "react";
import type { SaveState } from "./actions";

/**
 * Declared here rather than alongside the actions: a "use server" module may
 * only export async functions, so a shared constant object in that file fails
 * the build. The type is fine — it is erased before the rule applies.
 */
const NO_ERROR: SaveState = { error: null };

/**
 * Wraps an admin form so a failed save reports why, in place.
 *
 * Without this a server action that throws — an image in the wrong format, or
 * an upload with nowhere to be written — becomes Next's generic error screen.
 * That loses the reason and discards everything already typed, which is worst
 * for the longest forms, where retyping a service description is the actual
 * cost of the mistake.
 *
 * Keeping the fields as `defaultValue` uncontrolled inputs is what preserves
 * them: React re-renders in place rather than navigating, so the browser's own
 * values survive.
 */
export function FormShell({
  action,
  children,
  className,
}: {
  action: (prev: SaveState, formData: FormData) => Promise<SaveState>;
  children: ReactNode;
  className?: string;
}) {
  const [state, formAction] = useActionState(action, NO_ERROR);

  return (
    <form action={formAction} encType="multipart/form-data" className={className}>
      {state.error ? (
        <p
          role="alert"
          className="mb-6 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm leading-relaxed text-red-800"
        >
          <strong className="font-display font-bold">Not saved.</strong>{" "}
          {state.error}
        </p>
      ) : null}

      {children}
    </form>
  );
}
