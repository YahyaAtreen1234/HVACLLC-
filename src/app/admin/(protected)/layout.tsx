import Link from "next/link";
import { redirect } from "next/navigation";
import { isLoggedIn } from "@/server/admin/session";
import { logout } from "../actions";
import { AdminNav } from "../AdminNav";

export const dynamic = "force-dynamic";

/**
 * Panel chrome, and the session gate for every admin page.
 *
 * This guard protects *pages*. Server actions re-check the session themselves
 * (see `actions.ts`) because an action is its own addressable endpoint and does
 * not pass through a layout.
 */
export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!(await isLoggedIn())) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-dvh bg-sand-50">
      <header className="sticky top-0 z-40 bg-ink-950">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3 lg:px-8">
          <div className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="flex size-9 items-center justify-center rounded-lg bg-flame-600 font-display text-sm font-bold text-white"
            >
              A
            </span>
            <div>
              <p className="font-display text-sm font-bold text-white">
                Site admin
              </p>
              <p className="text-xs text-ink-400">Manage your website content</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-white/15 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              View site
            </Link>
            <form action={logout}>
              <button
                type="submit"
                className="rounded-lg bg-white/10 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/20"
              >
                Log out
              </button>
            </form>
          </div>
        </div>

        <AdminNav />
      </header>

      <main className="mx-auto max-w-7xl px-5 py-8 lg:px-8">{children}</main>
    </div>
  );
}
