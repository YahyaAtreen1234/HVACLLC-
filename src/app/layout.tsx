import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

import { business } from "@/config/business";
import { site } from "@/config/site";

/**
 * Two typefaces, served from this origin rather than from Google:
 *   Archivo — headings, buttons, anything structural
 *   Inter   — body copy
 *
 * The variable-weight woff2 files live in `src/fonts/` (sourced from the
 * @fontsource packages; both faces are SIL Open Font Licence). Self-hosting
 * means no third-party request on page load — better for privacy and for
 * consent requirements in the EU — and no build-time dependency on
 * fonts.gstatic.com being reachable.
 *
 * `next/font/local` still handles preloading, `size-adjust` fallback metrics
 * to prevent layout shift, and the CSS variable wiring.
 */
const archivo = localFont({
  src: "../fonts/archivo-latin-wght-normal.woff2",
  variable: "--font-archivo",
  display: "swap",
  weight: "100 900",
  style: "normal",
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
});

const inter = localFont({
  src: "../fonts/inter-latin-wght-normal.woff2",
  variable: "--font-inter",
  display: "swap",
  weight: "100 900",
  style: "normal",
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: site.defaultTitle,
    template: site.titleTemplate,
  },
  description: site.defaultDescription,
  applicationName: business.name,
  authors: [{ name: business.legalName }],
  formatDetection: { telephone: true, address: true },
  openGraph: {
    type: "website",
    locale: site.locale,
    siteName: business.name,
    title: site.defaultTitle,
    description: site.defaultDescription,
    url: site.url,
    // Declaring an openGraph object here replaces what the generated
    // opengraph-image would have contributed, rather than merging with it. The
    // image has to be named for any route that falls back to this metadata.
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    // A large card with no image is downgraded to a bare text row.
    images: ["/opengraph-image"],
  },
  // TODO: add verification tokens once Google Search Console is set up.
};

export const viewport: Viewport = {
  themeColor: "#001c41",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // `suppressHydrationWarning` here is about browser extensions, not about
    // anything this app renders. Password managers, translators and similar
    // add their own attributes to <html> and <body> before React hydrates,
    // which React then reports as a mismatch against the server HTML.
    //
    // It is deliberately only on these two elements: the flag applies one
    // level deep — to that element's own attributes and text — and does not
    // extend to its children. Real hydration bugs anywhere inside the app
    // are still reported.
    <html
      lang="en"
      className={`${archivo.variable} ${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/*
          Scroll-reveal starts elements at zero opacity and JavaScript brings
          them in. If that script never runs — blocked, failed, still loading
          on a bad connection — the page would render as a blank column of
          nothing. This makes the finished state the default whenever scripting
          is unavailable, so the content is a broken animation at worst rather
          than an invisible page.
        */}
        <noscript>
          <style>{`.reveal{opacity:1!important;transform:none!important}
.img-fade{opacity:1!important}`}</style>
        </noscript>
      </head>
      <body
        className="flex min-h-full flex-col bg-sand-50"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
