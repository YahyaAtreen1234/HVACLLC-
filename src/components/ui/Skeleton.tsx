import { cn } from "@/lib/utils";

/** Grey placeholder block used by the route-level loading states. */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("animate-pulse rounded-lg bg-ink-900/8", className)}
    />
  );
}

/** Card-shaped skeleton matching the ServiceCard footprint. */
export function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-ink-900/8 bg-white p-6 shadow-card">
      <Skeleton className="h-12 w-12 rounded-xl" />
      <Skeleton className="mt-5 h-5 w-2/3" />
      <Skeleton className="mt-3 h-4 w-full" />
      <Skeleton className="mt-2 h-4 w-5/6" />
      <Skeleton className="mt-6 h-4 w-28" />
    </div>
  );
}

/**
 * Full-page loading state shared by every route-level `loading.tsx`.
 * The visually hidden status text is what assistive tech announces.
 */
export function PageSkeleton({ cards = 6 }: { cards?: number }) {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-6 sm:py-20 lg:px-8">
      <span role="status" className="sr-only">
        Loading page content…
      </span>
      <Skeleton className="h-4 w-40" />
      <Skeleton className="mt-6 h-12 w-3/4" />
      <Skeleton className="mt-4 h-5 w-full max-w-xl" />
      <Skeleton className="mt-2 h-5 w-full max-w-md" />
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: cards }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
