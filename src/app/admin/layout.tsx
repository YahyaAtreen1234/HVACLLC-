import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin",
  // The panel must never appear in search results.
  robots: { index: false, follow: false },
};

/**
 * Bare wrapper for everything under /admin.
 *
 * The session guard and the panel chrome live in `(protected)/layout.tsx`
 * instead, so the login page — which must be reachable while logged out — is
 * not gated by the thing it exists to get you through. Route groups do not
 * appear in the URL, so `(protected)/page.tsx` is still `/admin`.
 */
export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
