import { business } from "@/config/business";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

/**
 * Location map.
 *
 * Renders a real embedded map when `business.address.mapEmbedUrl` is set, and a
 * styled placeholder with a directions link when it is not — so the section
 * looks finished either way and no broken frame ever ships.
 *
 * Two deliberate choices on the iframe:
 *   • `loading="lazy"` — the map is below the fold and weighs more than the
 *     rest of the page put together.
 *   • `referrerPolicy="no-referrer-when-downgrade"` and a descriptive `title`,
 *     which is what a screen reader announces for the frame.
 *
 * Note that an embedded Google map is a third-party frame that can set cookies
 * on load. If the site later needs a consent banner, this is the component that
 * should sit behind it.
 */
export function MapEmbed({ className }: { className?: string }) {
  if (!business.address.showAddress) return null;

  const { mapEmbedUrl, mapUrl, street, suite, city, state, postalCode } =
    business.address;
  const fullAddress = [street, suite, `${city}, ${state} ${postalCode}`]
    .filter(Boolean)
    .join(", ");

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-ink-900/8 bg-white shadow-card",
        className,
      )}
    >
      {mapEmbedUrl ? (
        <iframe
          src={mapEmbedUrl}
          title={`Map showing the location of ${business.name}`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
          className="block h-72 w-full border-0 sm:h-80"
        />
      ) : (
        <div className="relative flex h-72 flex-col items-center justify-center gap-4 bg-linear-135 from-ink-800 via-ink-900 to-ink-950 p-6 text-center sm:h-80">
          <div
            aria-hidden="true"
            className="absolute inset-0 hairline-grid opacity-60"
          />
          <span className="relative flex size-14 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-chill-300">
            <Icon name="map-pin" size={26} />
          </span>
          <div className="relative">
            <p className="eyebrow text-chill-300">Map placeholder</p>
            <p className="mt-2 text-sm leading-relaxed text-ink-200">
              Add an embed URL to{" "}
              <code className="text-white">address.mapEmbedUrl</code> in
              <br className="hidden sm:inline" /> src/config/business.ts
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3 border-t border-ink-900/8 p-5 sm:flex-row sm:items-center sm:justify-between">
        <address className="not-italic text-[0.9375rem] leading-relaxed text-ink-700">
          {fullAddress}
        </address>
        {mapUrl ? (
          <Button
            href={mapUrl}
            variant="secondary"
            size="sm"
            iconLeft="map-pin"
            className="max-sm:w-full"
          >
            Get directions
          </Button>
        ) : null}
      </div>
    </div>
  );
}
