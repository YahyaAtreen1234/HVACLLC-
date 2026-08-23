import { redirect } from "next/navigation";
import { isLoggedIn } from "@/server/admin/session";
import {
  adminConfigWarnings,
  adminEnvReport,
  adminSetupHint,
  isAdminConfigured,
} from "@/server/admin/auth";
import { LoginForm } from "./LoginForm";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  // Already signed in — no reason to show the form again.
  if (await isLoggedIn()) redirect("/admin");

  // Checked before the form renders, not after a submit. Nobody should type a
  // password into a form that cannot accept one, then be told the server was
  // never configured.
  const configured = isAdminConfigured();
  const warnings = adminConfigWarnings();
  const report = adminEnvReport();

  return (
    <div className="flex min-h-dvh items-center justify-center bg-ink-950 px-5 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span
            aria-hidden="true"
            className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl bg-flame-500 font-display text-lg font-bold text-white"
          >
            A
          </span>
          <h1 className="font-display text-2xl font-bold text-white">
            Site admin
          </h1>
          <p className="mt-2 text-sm text-ink-400">
            Sign in to manage your website content.
          </p>
        </div>

        {!configured ? (
          <div
            role="alert"
            className="mb-5 rounded-2xl border border-amber-400/30 bg-amber-500/10 p-5 text-sm leading-relaxed text-amber-100"
          >
            <p className="font-display font-bold text-amber-50">
              Sign-in is not set up yet
            </p>
            <p className="mt-2">{adminSetupHint()}</p>

            {/*
              What the server actually sees. Shapes and lengths only, never any
              part of a value — enough to tell "the variable never arrived"
              apart from "it arrived damaged", which look identical from the
              outside and need completely different fixes.
            */}
            <ul className="mt-4 space-y-2 border-t border-amber-400/20 pt-4">
              {report.checks.map((check) => (
                <li key={check.key} className="flex gap-2.5">
                  <span aria-hidden="true" className="mt-0.5 shrink-0 font-bold">
                    {check.ok ? "✓" : "✗"}
                  </span>
                  <span>
                    <code className="font-semibold">{check.key}</code>
                    <span className="block text-amber-200/80">
                      {check.detail}
                    </span>
                  </span>
                </li>
              ))}
            </ul>

            {report.context.length ? (
              <div className="mt-4 space-y-2 border-t border-amber-400/20 pt-4 text-amber-200/70">
                {report.context.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}

        {warnings.map((warning) => (
          <div
            key={warning}
            role="alert"
            className="mb-5 rounded-2xl border border-amber-400/30 bg-amber-500/10 p-5 text-sm leading-relaxed text-amber-100"
          >
            {warning}
          </div>
        ))}

        <LoginForm disabled={!configured} />
      </div>
    </div>
  );
}
