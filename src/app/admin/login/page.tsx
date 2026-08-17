import { redirect } from "next/navigation";
import { isLoggedIn } from "@/server/admin/session";
import { LoginForm } from "./LoginForm";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  // Already signed in — no reason to show the form again.
  if (await isLoggedIn()) redirect("/admin");

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

        <LoginForm />
      </div>
    </div>
  );
}
