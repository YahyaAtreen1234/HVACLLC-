"use client";

import Image, { type ImageProps } from "next/image";
import { useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";

/**
 * A photograph that fades in once it has decoded.
 *
 * Without this an image pops in the instant the bytes arrive, which is the
 * most jarring moment on a page that is otherwise easing everything else into
 * place.
 *
 * The fade is skipped for a `priority` image. Those are the ones above the
 * fold, and starting the largest visible element at zero opacity delays the
 * moment the page looks loaded — it would trade a real Largest Contentful
 * Paint score for a flourish nobody sees.
 */
export function FadeImage({
  className,
  priority,
  // Pulled out of the spread on purpose: alt is required by ImageProps, but a
  // linter cannot see that through `{...props}`, and an image silently losing
  // its alt text is worth keeping visible at the call site.
  alt,
  ...props
}: ImageProps & { className?: string }) {
  const ref = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(Boolean(priority));

  // A cached image can finish before React attaches onLoad, which would leave
  // it invisible for good. `complete` catches that case on mount.
  useEffect(() => {
    if (ref.current?.complete) setLoaded(true);
  }, []);

  return (
    <Image
      ref={ref}
      alt={alt}
      priority={priority}
      onLoad={() => setLoaded(true)}
      data-loaded={loaded ? "true" : undefined}
      className={cn(!priority && "img-fade", className)}
      {...props}
    />
  );
}
