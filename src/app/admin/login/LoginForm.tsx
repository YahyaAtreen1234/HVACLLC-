"use client";

import { useActionState } from "react";
import { login, type LoginState } from "../actions";

const initial: LoginState = { error: null };

export function LoginForm() {
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
            className="w-full rounded-lg border border-white/15 bg-ink-900 px-3.5 py-2.5 text-white placeholder:text-ink-500 focus:border-flame-500 focus:outline-none focus:ring-2 focus:ring-flame-500/40"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="mt-6 w-full rounded-lg bg-flame-500 px-4 py-3 font-display font-bold text-white transition-colors hover:bg-flame-600 focus:outline-none focus:ring-2 focus:ring-flame-500/50 focus:ring-offset-2 focus:ring-offset-ink-950 disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
