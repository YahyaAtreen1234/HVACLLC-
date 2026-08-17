import { business } from "@/config/business";
import { cn } from "@/lib/utils";

export type SocialKey = keyof typeof business.social;

const LABELS: Record<SocialKey, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  youtube: "YouTube",
  linkedin: "LinkedIn",
  google: "Google Business Profile",
  yelp: "Yelp",
};

/**
 * Profiles that actually have a URL. Empty strings in the config are skipped,
 * so the site never links to a profile that does not exist.
 */
export function getSocialProfiles(): Array<{
  key: SocialKey;
  url: string;
  label: string;
}> {
  return (Object.keys(business.social) as SocialKey[])
    .map((key) => ({ key, url: business.social[key], label: LABELS[key] }))
    .filter((profile) => profile.url.length > 0);
}

/**
 * Row of social profile links, shared by the footer and the contact page.
 *
 * Each link carries an accessible name (the glyph alone tells a screen reader
 * nothing) and opens in a new tab with `rel="noopener noreferrer"`.
 */
export function SocialLinks({
  tone = "dark",
  className,
}: {
  tone?: "light" | "dark";
  className?: string;
}) {
  const profiles = getSocialProfiles();
  if (!profiles.length) return null;

  const dark = tone === "dark";

  return (
    <ul className={cn("flex flex-wrap gap-2", className)}>
      {profiles.map(({ key, url, label }) => (
        <li key={key}>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            className={cn(
              "flex size-10 items-center justify-center rounded-lg border transition-colors",
              dark
                ? "border-white/12 text-white hover:border-white/40 hover:bg-white/10"
                : "border-ink-900/10 bg-white text-ink-800 shadow-card hover:border-flame-500/40 hover:text-flame-600",
            )}
          >
            <SocialGlyph name={key} />
          </a>
        </li>
      ))}
    </ul>
  );
}

/** Brand glyphs, drawn inline so no third-party icon request is made. */
export function SocialGlyph({ name }: { name: SocialKey }) {
  const common = {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    "aria-hidden": true as const,
    fill: "currentColor",
  };

  switch (name) {
    case "facebook":
      return (
        <svg {...common}>
          <path d="M14 9h3V6h-3c-2.2 0-4 1.8-4 4v2H8v3h2v7h3v-7h2.5l.5-3H13v-2c0-.6.4-1 1-1Z" />
        </svg>
      );
    case "instagram":
      return (
        <svg {...common}>
          <path d="M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 1.8.3 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.4 1 .4 2.2.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c0 1.2-.2 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1 .4-2.2.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2 0-1.8-.2-2.2-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.2-.4-.4-1-.4-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.9c0-1.2.2-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1-.4 2.2-.4C8.4 2.2 8.8 2.2 12 2.2Zm0 3.1a6.7 6.7 0 1 0 0 13.4 6.7 6.7 0 0 0 0-13.4Zm0 11a4.3 4.3 0 1 1 0-8.6 4.3 4.3 0 0 1 0 8.6Zm6.9-11.3a1.6 1.6 0 1 1-3.1 0 1.6 1.6 0 0 1 3.1 0Z" />
        </svg>
      );
    case "youtube":
      return (
        <svg {...common}>
          <path d="M22 12s0-3.3-.4-4.9a2.6 2.6 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4a2.6 2.6 0 0 0-1.8 1.8C2 8.7 2 12 2 12s0 3.3.4 4.9c.2.9.9 1.5 1.8 1.8 1.6.3 7.8.3 7.8.3s6.2 0 7.8-.4c.9-.2 1.6-.9 1.8-1.8.4-1.5.4-4.8.4-4.8Zm-12 3.2V8.8l5.2 3.2-5.2 3.2Z" />
        </svg>
      );
    case "linkedin":
      return (
        <svg {...common}>
          <path d="M6.9 8.2H3.6V21h3.3V8.2ZM5.2 3a1.9 1.9 0 1 0 0 3.9 1.9 1.9 0 0 0 0-3.9ZM21 14.1c0-3.5-1.9-5.2-4.4-5.2-2 0-2.9 1.1-3.4 1.9V8.2H9.9c0 1 0 12.8 0 12.8h3.3v-7.1c0-.4 0-.8.1-1 .3-.7.9-1.5 2-1.5 1.4 0 2 1.1 2 2.7V21H21v-6.9Z" />
        </svg>
      );
    case "google":
      return (
        <svg {...common}>
          <path d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.9h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.4Z" />
          <path d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.7-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22Z" />
          <path d="M6.4 14a6 6 0 0 1 0-3.8V7.6H3.1a10 10 0 0 0 0 8.9L6.4 14Z" />
          <path d="M12 5.9c1.5 0 2.8.5 3.8 1.5l2.8-2.8A10 10 0 0 0 3.1 7.6l3.3 2.6C7.2 7.7 9.4 5.9 12 5.9Z" />
        </svg>
      );
    case "yelp":
      return (
        <svg {...common}>
          <path d="M11 3.5v8.1c0 .9-1.1 1.3-1.7.6L4.7 7.4a1 1 0 0 1 .2-1.6l4.6-2.6c.6-.4 1.5 0 1.5.8ZM11 20.4v-3.6c0-.9-1.1-1.3-1.7-.6l-2.4 2.7a1 1 0 0 0 .2 1.6l2.4 1.4c.6.3 1.5-.1 1.5-.9ZM13.6 14.3l3.4 1.2c.8.3.9 1.3.3 1.8l-2 1.6c-.5.4-1.3.2-1.6-.4l-1.4-2.8c-.4-.9.4-1.8 1.3-1.4ZM13.6 11.3l3.9-1.6c.8-.3.9-1.4.2-1.9l-1.9-1.2c-.5-.4-1.3-.1-1.5.5l-1.9 3.1c-.4.8.4 1.5 1.2 1.1Z" />
        </svg>
      );
  }
}
