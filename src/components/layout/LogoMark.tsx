"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * The logo image, with a fallback for when the file is not there.
 *
 * `next/image` renders a broken-image icon if the file is missing, and the
 * header appears on every page — so one wrong filename puts a broken icon in
 * front of every customer. This falls back to a monogram in the brand colours
 * instead: not the real logo, but not visibly broken either.
 *
 * A client component purely for the `onError` handler. It is rendered from
 * both server and client trees, which is why the fallback lives here rather
 * than in `Logo`.
 */
export function LogoMark({
  src,
  size = 44,
  className,
}: {
  src: string;
  size?: number;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span
        aria-hidden="true"
        className={cn(
          "flex shrink-0 items-center justify-center rounded-xl bg-ink-950 font-display font-bold text-white",
          className,
        )}
        style={{ width: size, height: size, fontSize: size * 0.5 }}
      >
        {/* The star of the real mark, in the brand orange. */}
        <svg viewBox="0 0 24 24" width={size * 0.62} height={size * 0.62} fill="none">
          <path
            d="M12 2.5 14.6 9.4 21.5 12 14.6 14.6 12 21.5 9.4 14.6 2.5 12 9.4 9.4Z"
            fill="var(--color-flame-500)"
          />
        </svg>
      </span>
    );
  }

  return (
    <Image
      src={src}
      alt=""
      width={size}
      height={size}
      priority
      onError={() => setFailed(true)}
      className={cn("shrink-0 object-contain", className)}
      style={{ width: size, height: size }}
    />
  );
}
