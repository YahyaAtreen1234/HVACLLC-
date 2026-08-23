# Brand assets

Save the files here with **exactly these names** — the site loads them by
filename, so a different name means a missing image.

| Save as | What it is | Notes |
| --- | --- | --- |
| `logo.png` | The NorthStar HVAC logo on white | Square, the full mark plus wordmark. Used in the header, footer and structured data. |
| `logo-mark.png` | *Optional.* Just the N/star, no wordmark | Used where space is tight. If absent, `logo.png` is used instead. |
| `hero.jpg` | The condenser + air handler photograph from the banner | The equipment shot only — **not** the whole banner with text baked in. See below. |

Also save the logo as `src/app/icon.png` (square, at least 512×512). Next.js
picks that filename up automatically and generates the browser-tab icon and the
Apple touch icon from it.

## Why the hero is the photo and not the banner

The banner artwork has its headline, buttons and trust badges baked into the
pixels. Using it as-is would mean:

- text that is an image cannot be read by search engines or a screen reader,
- it cannot reflow, so it becomes illegibly small on a phone,
- every wording change needs the designer again.

Those elements are already built as real HTML on the home page, styled to match
the artwork. So only the photograph is needed here, and the words stay editable.

## Merchandise mockups

The t-shirt, mug and tote images are brand collateral rather than site content.
Customers looking for a repair do not need them, so they are not used by
default. If you want them shown, `about/brand-*.jpg` and a strip on the About
page is the sensible home — ask and it takes a few minutes.

## Photography licence

Only put files here that the business owns or has licensed. Stock photography
lifted from a search engine is a copyright claim waiting to happen, and HVAC
manufacturers do pursue unlicensed use of their equipment photography.
