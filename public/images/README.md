# Photography

The site ships with **no stock photography**. Every `MediaFrame` whose
`image.src` is an empty string renders a clearly-marked placeholder showing the
shot that belongs there, so nothing fictional or unlicensed goes live by
accident.

## Adding real photos

1. Drop the file in here — `services/` for service pages, `team/` for people,
   the root of `images/` for hero and general shots.
2. Set the path and alt text where the image is defined:
   - service photos → `src/data/services.ts` (`image` on each service)
   - hero / about / why-us photos → the `image` prop in the matching component
     under `src/components/sections/`
3. Set `width` and `height` to the real pixel dimensions of the file (they set
   the aspect ratio and prevent layout shift).

```ts
image: {
  src: "/images/services/ac-repair.jpg",
  alt: "Technician measuring refrigerant pressures at an outdoor condensing unit",
  width: 1600,
  height: 1067,
}
```

## Requirements

- **Licensing** — use photos of this company's own work, or images you hold a
  licence for. Never a competitor's marketing photos.
- **Format** — upload JPEG or PNG; `next/image` converts to AVIF/WebP and
  generates the responsive sizes automatically. Do not pre-optimise into WebP.
- **Size** — roughly 1600–2400px on the long edge is plenty. Anything larger is
  wasted bytes at build time.
- **Alt text** — describe what is happening in the frame, for someone who
  cannot see it. Not "HVAC repair Primary City" — keyword-stuffed alt text hurts
  both accessibility and SEO.
- **People** — get written permission before publishing photos of customers or
  their homes.

## Still to add

- `favicon.ico`, `icon.png` and `apple-icon.png` in `src/app/` — replace the
  Next.js default with the company mark.
- An Open Graph image (1200×630) at `src/app/opengraph-image.png` for link
  previews on social and in messaging apps.
