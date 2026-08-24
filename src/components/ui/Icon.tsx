import type { IconName } from "@/types";
import { cn } from "@/lib/utils";

/**
 * One inline SVG sprite for the whole site — no icon-font download, no runtime
 * request, and the icons inherit `currentColor` so they work on light and dark
 * sections without extra classes.
 *
 * Icons are decorative by default (aria-hidden). Pass a `title` only when the
 * icon carries meaning that is not already in adjacent text.
 */
const PATHS: Record<IconName, React.ReactNode> = {
  snowflake: (
    <>
      <path d="M12 2v20M4.2 6.5l15.6 9M19.8 6.5l-15.6 9" />
      <path d="M9 4.5 12 7l3-2.5M9 19.5 12 17l3 2.5" />
    </>
  ),
  flame: (
    <path d="M12 22c3.9 0 7-2.7 7-6.4 0-4.4-4.4-5.9-4.4-10.3 0 0-3 1.4-3 4.9 0 1.5-.9 2.4-1.9 2.4s-1.9-.9-1.9-2.4C6.5 11.6 5 13.2 5 15.6 5 19.3 8.1 22 12 22Z" />
  ),
  "heat-pump": (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="12" cy="12" r="3.5" />
      <path d="M12 8.5V5M12 19v-3.5M8.5 12H5M19 12h-3.5" />
    </>
  ),
  wrench: (
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.8-3.8a6 6 0 0 1-8 7.9l-6.9 6.9a2.1 2.1 0 0 1-3-3l6.9-6.9a6 6 0 0 1 7.9-8l-3.7 3.9Z" />
  ),
  briefcase: (
    <>
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
      <path d="M2 13h20" />
    </>
  ),
  shield: (
    <>
      <path d="M12 22s8-3.6 8-10V5.2L12 2 4 5.2V12c0 6.4 8 10 8 10Z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  wind: <path d="M3 8h11a3 3 0 1 0-3-3M3 12h15a3 3 0 1 1-3 3M3 16h9" />,
  duct: (
    <>
      <path d="M3 7h10v10H3zM13 9h5a3 3 0 0 1 3 3v5" />
      <path d="M6 7v10M9.5 7v10" />
    </>
  ),
  thermostat: (
    <>
      <path d="M14 14.8V4.5a2.5 2.5 0 0 0-5 0v10.3a4.5 4.5 0 1 0 5 0Z" />
      <path d="M11.5 14.5V8" />
    </>
  ),
  building: (
    <>
      <path d="M4 21V6a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v15M15 10h3a2 2 0 0 1 2 2v9M2 21h20" />
      <path d="M8 8h3M8 12h3M8 16h3" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5.2l3.2 2" />
    </>
  ),
  phone: (
    <path d="M15.7 21a17.6 17.6 0 0 1-12.7-12.7 2 2 0 0 1 1.3-2.3l2.3-.8a1.5 1.5 0 0 1 1.8.8l1.1 2.3a1.5 1.5 0 0 1-.4 1.8l-1.1.9a13.4 13.4 0 0 0 5.2 5.2l.9-1.1a1.5 1.5 0 0 1 1.8-.4l2.3 1.1a1.5 1.5 0 0 1 .8 1.8l-.8 2.3a2 2 0 0 1-2.3 1.3Z" />
  ),
  check: <path d="m20 6-11 11-5-5" />,
  star: (
    <path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z" />
  ),
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </>
  ),
  "map-pin": (
    <>
      <path d="M20 10.5c0 6-8 11.5-8 11.5s-8-5.5-8-11.5a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10.5" r="2.8" />
    </>
  ),
  mail: (
    <>
      <rect x="2.5" y="5" width="19" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </>
  ),
  alert: (
    <>
      <path d="M10.3 3.9 1.9 18a2 2 0 0 0 1.7 3h16.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
      <path d="M12 9v4M12 17h.01" />
    </>
  ),
  "chevron-down": <path d="m6 9 6 6 6-6" />,
  "arrow-right": <path d="M4 12h15M13 6l6 6-6 6" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  quote: (
    <path d="M9.5 6C6.5 7.4 5 9.9 5 13.5V18h6v-6H8.2c.1-1.7.9-2.9 2.5-3.6L9.5 6Zm9 0c-3 1.4-4.5 3.9-4.5 7.5V18h6v-6h-2.8c.1-1.7.9-2.9 2.5-3.6L18.5 6Z" />
  ),
};

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: IconName;
  /** Pixel size for width and height. Defaults to 24. */
  size?: number;
  /** Accessible name. Omit for decorative icons (the default). */
  title?: string;
}

export function Icon({ name, size = 24, title, className, ...rest }: IconProps) {
  const filled = name === "star" || name === "quote";

  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill={filled ? "currentColor" : "none"}
      stroke={filled ? "none" : "currentColor"}
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      className={cn("shrink-0", className)}
      {...rest}
    >
      {title ? <title>{title}</title> : null}
      {PATHS[name]}
    </svg>
  );
}
