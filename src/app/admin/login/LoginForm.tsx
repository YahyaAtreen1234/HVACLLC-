"use client";

import { useActionState } from "react";
import { login, type LoginState } from "../actions";

const initial: LoginState = { error: null };

/**
 * `disabled` is set when the server has no password configured. The form is
 * left visible rather than hidden so the page still looks like what it is, but
 * nothing can be submitted — the notice above it explains why.
 */
export function LoginForm({ disabled = false }: { disabled?: boolean }) {
  const [state, formAction, pending] = useActionState(login, initial);

  return (
    <form
      action={formAction}
      className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl"
    >
      {state.error ? (
        <p
          role="alert"
          className="mb-5 rounded-lg border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm leading-relaxed text-red-200"
        >
          {state.error}
        </p>
      ) : null}

      <div className="space-y-4">
        <div>
          <label
            htmlFor="username"
            className="mb-1.5 block text-sm font-semibold text-white"
          >
            Username
          </label>
          <input
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            required
            disabled={disabled}
            className="w-full rounded-lg border border-white/15 bg-ink-900 px-3.5 py-2.5 text-white placeholder:text-ink-500 focus:border-flame-500 focus:outline-none focus:ring-2 focus:ring-flame-500/40"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-1.5 block text-sm font-semibold text-white"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            disabled={disabled}
            className="w-full rounded-lg border border-white/15 bg-ink-900 px-3.5 py-2.5 text-white placeholder:text-ink-500 focus:border-flame-500 focus:outline-none focus:ring-2 focus:ring-flame-500/40"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={pending || disabled}
        className="mt-6 w-full rounded-lg bg-flame-600 px-4 py-3 font-display font-bold text-white transition-colors hover:bg-flame-700 focus:outline-none focus:ring-2 focus:ring-flame-500/50 focus:ring-offset-2 focus:ring-offset-ink-950 disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
