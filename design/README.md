# Design references

Source material for the brand, kept for reference. **Nothing in this folder is
served.** It sits outside `public/`, so Next never exposes it at a URL — which
is deliberate, and the reason the mockup below was moved here.

## `brand-identity-mockup.jpg`

The designer's presentation board: a website comp, polo shirts and the van wrap.
It is the reference for the navy/orange treatment and the van livery.

**It must not be published as a page image.** It is a mockup, not a photograph
of this business, and the comp inside it carries details that contradict the
live site:

| On the mockup | Actually true |
| --- | --- |
| `(602) 555-0187` | `(602) 203-2395` — see `src/config/business.ts` |
| `info@hvacheatingcooling.com` | `northshvac@gmail.com` |
| `Mon – Fri 7:00 AM – 6:00 PM` | Open 24/7, every day |
| "500+ Happy Clients", "10+ Years Experience", "1000+ Projects Completed", "100% Satisfaction" | Unverified — the site does not claim these |

A wrong phone number on a contractor's page is the most expensive error the site
can make: the call goes to a number that is not the business. The invented
counts are the same class of problem the rest of the codebase already refuses —
`localBusinessSchema()` leaves `aggregateRating` out until there are real
reviews, and `MediaFrame` ships a branded panel rather than stock photography.

## What the About page is still waiting for

`src/app/(site)/about/page.tsx` renders a placeholder where a real photograph
should go. The brief is in the `alt` text: the crew in front of a branded work
van outside a home. A phone photo of the actual team and van is worth more here
than any mockup — it is the shot that proves the business is real. Drop it in at
`public/images/about/about.jpg` and set `image.src` to that path.

Use lowercase paths. This repo is developed on Windows, where the filesystem
ignores case, and deployed to Linux, where it does not: `ABOUT/ABOUT.jpg`
referenced as `about/about.jpg` works locally and 404s in production.
