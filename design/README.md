# Design references

Source material for the brand, kept for reference. **Nothing in this folder is
served.** It sits outside `public/`, so Next never exposes it at a URL — which
is deliberate, and the reason the files below live here.

Anything dropped into `public/` is published the moment it is committed, at a
URL derived from its filename. These arrived there as
`WhatsApp Image 2026-08-22 at 9.09.08 AM (1).jpeg` and friends, one `git add -A`
away from being live at
`https://northstarhvacllc.us/WhatsApp%20Image%20...%20(1).jpeg` — including the
business card described below.

## Contents

| File | What it is | Publishable? |
| --- | --- | --- |
| `business-card.jpg` | The printed business card | **No** — see below |
| `brand-identity-mockup.jpg` | Presentation board: site comp, polos, van wrap | **No** — see below |
| `merch-paper-bag.jpg` | Logo on a paper bag | Mockup, not a photo |
| `merch-tshirt.jpg` | Logo on a t-shirt, front and back | Mockup, not a photo |
| `merch-mug.jpg` | Logo on a mug | Mockup, not a photo |

## `business-card.jpg` — carries the wrong phone number

**Do not publish this, and check what has been printed.** Three details on the
card disagree with the live site:

| On the card | Actually correct |
| --- | --- |
| `+1 (314) 435 2394` | **`(602) 203-2395`** — see `src/config/business.ts` |
| `northstarhvacllc,us` (comma, not a dot) | `northstarhvacllc.us` |
| `HEATING. COOLING. INSTALLATION. REPAIR` | `Heating · Cooling · Refrigeration` |

The phone number is the serious one. A card in a customer's hand with the wrong
number sends the call somewhere else entirely, and no amount of website work
recovers a call that was never dialled. The domain typo has the same shape:
`northstarhvacllc,us` is not a working address, so "VISIT OUR WEBSITE" leads
nowhere.

## `brand-identity-mockup.jpg` — same problem

A designer's presentation board, not a photograph of this business. The website
comp inside it prints `(602) 555-0187`, `info@hvacheatingcooling.com`,
`Mon – Fri 7:00 AM – 6:00 PM`, and invented counts ("500+ Happy Clients",
"10+ Years Experience"). Useful as a reference for the van livery and the
navy/orange treatment; not usable as page imagery.

## Why the merchandise mockups are not on the site

The bag, t-shirt and mug carry no wrong information — they are only the logo —
so nothing stops them being published. They are simply not what any page needs.
They are renders of products, not photographs of the business, and a customer
deciding who to call about a failed compressor learns nothing from a mug. The
same reasoning the rest of the codebase already follows: `MediaFrame` ships a
branded panel rather than stock photography, and `localBusinessSchema()` leaves
`aggregateRating` out until there are real reviews.

If branded merchandise is ever wanted on the site, the honest place is a
careers or culture page, alongside a photograph of the crew actually wearing it.

## What the site is still waiting for

Three image slots render a placeholder panel because no real photograph exists
yet. Each one names the shot it needs:

| Where | The shot |
| --- | --- |
| `src/app/(site)/about/page.tsx` | The crew in front of a branded work van, outside a home |
| `src/components/sections/AboutBand.tsx` | A Phoenix living room at a comfortable temperature, thermostat in frame |
| `src/components/sections/WhyUs.tsx` | A technician writing measured readings on a service report at a customer's home |

A phone photo of the real crew and the real van beats any mockup here — it is
the shot that proves the business exists and turns a visitor into a caller. Drop
one in at `public/images/about/about.jpg` and set `image.src` to that path.

Use lowercase filenames with no spaces. This repo is developed on Windows, where
the filesystem ignores case, and deployed to Linux, where it does not:
`ABOUT/ABOUT.jpg` referenced as `about/about.jpg` works locally and 404s in
production. Spaces become `%20` in the URL.

Team member photos are the exception — those are uploaded through the admin
panel at `/admin/team` and stored in Vercel Blob, not committed here.
