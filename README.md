# HVAC Contractor Website

Production-quality marketing site for a US HVAC contractor, built to generate
phone calls, service requests, quote requests and emergency calls.

**Stack:** Next.js 16 (App Router) · TypeScript (strict) · Tailwind CSS v4 ·
React 19 · zero runtime dependencies beyond the framework.

---

## Quick start

```bash
npm install
```

```bash
npm run dev
```

Then open http://localhost:3000.

| Script              | What it does                                 |
| ------------------- | -------------------------------------------- |
| `npm run dev`       | Dev server with hot reload                   |
| `npm run build`     | Production build (all pages prerender static) |
| `npm start`         | Serve the production build                   |
| `npm run lint`      | ESLint                                       |
| `npm run typecheck` | TypeScript, no emit                          |
| `npm test`          | Backend unit tests (Node test runner)        |
| `npm run admin:setup` | Create/reset the admin login                |

---

## Before this site goes live

A development-only banner at the top of every page lists what is still
placeholder content. It disappears in production builds — do not rely on it as
the launch gate; work through this list instead.

1. **`src/config/business.ts`** — name, phone, email, address, hours, founding
   year, social URLs. Every TODO in that file is a real piece of missing data.
2. **`business.emergency`** — set `available247` to `true` **only** if the
   company genuinely answers and dispatches 24/7. While it is `false` the site
   says "Emergency HVAC Service" instead of "24/7 Emergency HVAC Service".
   Setting `offered: false` removes the emergency CTA site-wide.
3. **`business.credentials`** — licence number, insurance, bonding,
   certifications. These are empty by design; badges only render for
   credentials you actually enter, so nothing is claimed until you claim it.
4. **`src/data/service-areas.ts`** — replace the placeholder cities. This feeds
   the footer, the service-areas page and the `areaServed` structured data that
   drives local search results.
5. **`src/data/reviews.ts`** — empty on purpose. Add only real, attributable
   reviews. Fabricated testimonials are deceptive advertising under FTC rules,
   and the star-rating summary is computed from real data or omitted entirely.
6. **`src/data/financing.ts`** — no lender, APR or term is filled in. Consumer
   credit advertising is regulated; publish only what a lender has confirmed in
   writing.
7. **`src/data/faqs.ts`** — three answers are marked TODO (diagnostic fee,
   payment methods, financing). Answer them or delete the questions.
8. **Legal pages** — `/privacy-policy` and `/terms-conditions` are drafts with
   a visible "needs review" notice. Have an attorney adapt them, then set
   `reviewNotice={false}` on the `LegalDocument` component.
9. **Photography** — see `public/images/README.md`. Every image slot currently
   renders a labelled placeholder with the shot brief.
10. **Icons** — replace `src/app/favicon.ico` and add `icon.png`,
    `apple-icon.png` and `opengraph-image.png` with the company mark.
11. **Environment variables** — see below.

---

## Admin panel

A browser interface at **`/admin`** for managing the site without touching code.

### First-time setup

```bash
npm run admin:setup
```

It asks for a username and password, writes a scrypt hash (never the password
itself) to `.env.local`, and generates a session secret. Restart the dev server,
then sign in at http://localhost:3000/admin.

Forgot the password? Run the same command again to set a new one.

### What you can manage

| Section | What it controls |
| ------- | ---------------- |
| **Overview** | Lead counts, latest requests, content totals, config warnings |
| **Leads** | Every service request; filter by status and move it along the pipeline |
| **Services** | Full CRUD. Each service drives its own page, cards, footer links, the contact-form dropdown and the sitemap |
| **Team** | The people on your About page |
| **FAQs** | Questions shown across the site and marked up for Google |
| **Service areas** | Towns you cover — feeds the footer, the areas page and local search |

Content changes appear on the live site immediately — `revalidatePath` refreshes
the affected pages on save, so there is no rebuild or redeploy step.

### Photos

Service and team forms have a real file picker with a live preview. Choose an
image, save, and it appears on the public site immediately — no copying files
onto the server, no paths to type.

**Uploads are not stored in `public/`.** Next copies that directory into the
build output once, at build time, so a file written there while the server is
running is never served in production — it works in `next dev` and then 404s
on the live site. Uploads go to `.data/uploads/` instead (override with
`UPLOADS_PATH`) and are served by `src/app/uploads/[...path]/route.ts`.

That gives them the same persistence rule as the database: **fine on a VPS or
container with a mounted volume; on a host with an ephemeral filesystem
(Vercel, Netlify functions) they vanish between deploys** and you want S3, R2
or Blob storage instead — swap the body of `saveUpload`/`readUpload` in
`src/server/content/uploads.ts`.

Validation worth knowing about:

- The type is decided by **magic bytes, not the filename or the browser's
  declared MIME type** — both are attacker-controlled. A PHP shell or an `.exe`
  renamed `photo.png` is rejected.
- The uploaded filename is discarded and a UUID generated, so `../../.env` is
  not a usable filename.
- The serving route confirms the resolved path is still inside the uploads
  directory, and sends `X-Content-Type-Options: nosniff`.
- 8 MB cap, JPEG/PNG/WebP/AVIF only.

### Where content lives

Content moved out of the TypeScript data files and into the database. The files
in `src/data/` are now **seed data**: on an empty database they populate it once,
so a fresh install still ships with a complete site. After that the database is
the source of truth and the admin panel edits it.

That is what makes "add, remove, edit" work in production. A panel that edited
`.ts` files would break the moment it hit a read-only filesystem, and nothing
would change until the next deploy.

Public pages read through `src/server/content/read.ts`, which returns the same
shapes the components always used — so moving content into the database did not
require rewriting a single component.

### Security

- Login is a signed, expiring session cookie (HMAC, 7 days), `httpOnly` and
  `secure` in production
- Passwords are hashed with scrypt — deliberately slow, so a stolen hash is
  expensive to attack
- Every server action re-checks the session itself. The layout guard protects
  pages, but a server action is its own addressable endpoint and is not covered
  by it
- `/admin` is `noindex, nofollow`
- With no `ADMIN_PASSWORD_HASH` set, the login refuses everything — an
  unconfigured deploy is closed, not open

This is a single shared login, not per-person accounts. That is honest for a
small business; if several people need separately audited access, it needs a
user table.

---

## Backend

The site is a static marketing front end with one piece of real backend behind
it: **capturing service requests without ever losing one.** That is the whole
business case — a dropped lead is a lost job.

### The pipeline

Both entry points — the website form (a server action) and the public API —
call the same `submitLead` function, so their behaviour cannot drift apart:

```
request → honeypot → validation → rate limit → STORE → notify → response
                                                 │        │
                                       must succeed   may fail safely
```

**Storage happens before notification, on purpose.** If the webhook is down or
an API key expired, the lead is already in the database and shows up in the
admin list flagged with its `notifyError`. A notification failure is
recoverable; a lost customer is not.

| Layer         | File                            | Notes                                        |
| ------------- | ------------------------------- | -------------------------------------------- |
| Orchestration | `src/server/leads/service.ts`   | The only place the order of operations lives  |
| Persistence   | `src/server/leads/store.ts`     | `LeadStore` interface + SQLite implementation |
| Database      | `src/server/db.ts`              | `node:sqlite`, WAL, versioned migrations      |
| Notification  | `src/server/notify.ts`          | Webhook and/or email, each independent        |
| Abuse control | `src/server/rate-limit.ts`      | In-memory window + a durable per-hour cap     |
| Admin auth    | `src/server/auth.ts`            | Bearer token, constant-time compare           |

### Endpoints

| Method  | Path                     | Auth   | Purpose                            |
| ------- | ------------------------ | ------ | ---------------------------------- |
| `POST`  | `/api/service-requests`  | public | Lead intake for anything not the form |
| `GET`   | `/api/health`            | public | Uptime check + config warnings      |
| `GET`   | `/api/admin/leads`       | bearer | List leads (`?status=`, `?limit=`)  |
| `GET`   | `/api/admin/leads/:id`   | bearer | One lead                            |
| `PATCH` | `/api/admin/leads/:id`   | bearer | Move status along the pipeline      |

```bash
curl -H "Authorization: Bearer $ADMIN_API_TOKEN" http://localhost:3000/api/admin/leads
```

Lead statuses: `new` → `contacted` → `scheduled` → `closed`.

The admin endpoints are a **machine interface**, not a login system. If the
office needs a browser UI with per-person accounts, add a real session layer —
do not put this shared token in a cookie.

### Database

PostgreSQL, via `pg`. Set `DATABASE_URL` and the schema creates itself on first
connection — there is no migration command to remember.

Because it is a network service rather than a file, the same code runs on a
container host and on serverless. Any provider works: Neon, Supabase, Render,
Railway, or your own server.

Two things follow from content living in a database the owner edits at runtime:

- **Public pages render per request** rather than at build time. Otherwise an
  edit made in the admin panel would show correctly and then silently revert to
  the deploy-time copy on the next deploy.
- **The build does not need the database.** Nothing is pre-rendered from it, so
  a deploy cannot fail because the database was briefly unreachable.

⚠️ **Uploaded photos are still files, not database rows.** They need a mounted
disk, and they do *not* work on serverless hosting, where the filesystem is
read-only. Everything else does. Moving uploads to object storage (S3, R2,
Vercel Blob) is what would close that last gap.

### Privacy

Raw IP addresses are never stored. They are salted and hashed
(`src/server/request-context.ts`) because rate limiting only needs to know
"same source or not" — so a database leak does not expose visitors' IPs.

---

## Deploying

Leads and editable content live in PostgreSQL, so the only hard requirement is
a database. Uploaded photos are still files and need a mounted disk, which is
the one thing serverless hosting cannot provide.

| Host | Site, form, admin panel | Photo uploads |
| --- | --- | --- |
| Render, Railway, Fly.io, VPS | ✅ | ✅ with a disk at `/data` |
| Vercel, Netlify | ✅ | ❌ read-only filesystem |

Two variables matter:

```
DATABASE_URL=postgres://user:password@host:5432/database
UPLOADS_PATH=/data/uploads
```

On serverless use the provider's **pooled** connection string — each instance
opens its own connections, and the direct one runs out.

### Before the first deploy

Generate the admin credentials locally — the password is never stored, only a
scrypt hash of it:

```bash
npm run admin:setup
```

Keep the printed `ADMIN_USERNAME` and `ADMIN_PASSWORD_HASH`; you set both on
the host in the next step.

### Render

1. Push this repo to GitHub, then choose **New → Blueprint** on Render and
   point it at the repo. It reads `render.yaml` and provisions the service, a
   PostgreSQL database wired to `DATABASE_URL` automatically, the 1 GB disk at
   `/data` for photos, and the generated secrets.
2. Fill in the values marked `sync: false`: `NEXT_PUBLIC_SITE_URL` (your real
   domain, e.g. `https://www.yourcompany.com`), the two admin credentials, and
   at least one notification channel.
3. Deploy, then open `/api/health` — it lists anything still missing.

A paid instance is required. Render does not attach disks to free services,
and without a disk this site loses its data on every deploy.

### Railway or Fly.io

Both build the `Dockerfile` directly. Attach a volume mounted at `/data`, set
the same variables, and pass `NEXT_PUBLIC_SITE_URL` so it reaches the build.

### Your own VPS

```bash
docker compose up -d --build
```

Put the variables in a `.env` file beside `docker-compose.yml` first. Data
lives in the `hvac-data` named volume, which survives rebuilds and
`docker compose down`.

### Why NEXT_PUBLIC_SITE_URL is different

It is compiled into the pages browsers download, not read when the server
starts, so it is a **build argument**. Changing it later requires a rebuild,
not just a restart. Get it right before the first deploy or your canonical
URLs and structured data will point at the wrong domain.

### Vercel

Works, with one exception: photo uploads need a filesystem Vercel does not
provide. Set `DATABASE_URL` (pooled), `NEXT_PUBLIC_SITE_URL`, the two admin
credentials and `ADMIN_SESSION_SECRET`.

`ADMIN_SESSION_SECRET` matters more here than elsewhere. Without it the code
falls back to a per-process random secret, and since serverless runs many
processes, a cookie signed by one instance is rejected by the next — you would
log in and be bounced straight back to the login page.

### Backups

Back up the database — that is your customer enquiries and all site content.
Managed providers do this for you; check that yours is set up and that you know
how to restore it. If you use a disk for photos, back that up too.

---

## Environment

Copy `.env.example` to `.env.local` (and set the same values in your host).
After deploying, hit `/api/health` — it lists whatever is still missing.

| Variable                      | Required        | Purpose                                     |
| ----------------------------- | --------------- | ------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`        | production      | Canonical URLs, Open Graph, sitemap, schema  |
| `LEADS_DB_PATH`               | optional        | SQLite location (default `.data/leads.db`)   |
| `SERVICE_REQUEST_WEBHOOK_URL` | one channel     | POST leads as JSON to Zapier/Make/n8n/CRM    |
| `RESEND_API_KEY`              | one channel     | Email notification via Resend                |
| `NOTIFY_FROM_EMAIL`           | with Resend     | Verified sending address                     |
| `NOTIFY_TO_EMAIL`             | with Resend     | Office inbox (comma-separated for several)   |
| `ADMIN_API_TOKEN`             | to use admin    | Bearer token; unset = admin endpoints closed |
| `IP_HASH_SALT`                | recommended     | Stable IP hashing across restarts            |

Configure **at least one notification channel**. Without one, leads are still
stored safely — but nobody is told they arrived, and `/api/health` says so.

---

## Folder structure

```
src/
├── app/                          # Routes (App Router). One folder per URL.
│   ├── layout.tsx                # Fonts, header/footer, skip link, LocalBusiness schema
│   ├── page.tsx                  # Home
│   ├── globals.css               # Design tokens (@theme) + base styles + utilities
│   ├── error.tsx                 # Route error boundary — offers the phone number
│   ├── not-found.tsx             # 404 with popular services
│   ├── robots.ts / sitemap.ts    # Generated from the same data the pages use
│   ├── (site)/                   # Public marketing site — its layout holds the
│   │                             # header/footer, so /admin does not inherit them
│   ├── admin/                    # Browser admin panel
│   │   ├── login/                # Unguarded, by necessity
│   │   ├── (protected)/          # Session gate + panel chrome
│   │   └── actions.ts            # All admin mutations
│   ├── api/                      # Route handlers (Node runtime, never static)
│   │   ├── service-requests/     # Public lead intake
│   │   ├── health/               # Uptime + configuration check
│   │   └── admin/leads/          # Token-protected lead management
│   ├── services/                 # Index + [slug] detail pages
│   ├── about/  service-areas/  reviews/  financing/  contact/
│   └── privacy-policy/  terms-conditions/
│
├── components/
│   ├── layout/                   # Header, DesktopNav, MobileNav, Footer, MobileCallBar, Logo
│   ├── ui/                       # Button, Icon, Container/Section, SectionHeading,
│   │                             # MediaFrame, Alert, Skeleton, Spinner, Reveal
│   ├── cta/                      # CtaButtons (primary/secondary/phone), EmergencyCta, CtaBand
│   ├── cards/                    # ServiceCard, ReviewCard, TrustBadge
│   ├── forms/                    # ContactForm, FormField primitives
│   ├── sections/                 # Composed page sections (Hero, WhyUs, FaqSection, …)
│   ├── seo/                      # JsonLd
│   ├── dev/                      # PlaceholderNotice (development only)
│   └── Breadcrumbs.tsx  FaqAccordion.tsx
│
├── server/                       # Backend. Never imported by client components.
│   ├── db.ts  env.ts  http.ts
│   ├── notify.ts  rate-limit.ts  request-context.ts
│   ├── admin/                    # Session auth, password hashing
│   ├── content/                  # store.ts (CRUD), read.ts (public), seed.ts
│   └── leads/                    # service.ts (pipeline), store.ts, types.ts
│
├── config/                       # business.ts, site.ts, navigation.ts  ← edit these
├── data/                         # SEED data only — the database is the live source
├── lib/                          # actions, validation, seo, hours, phone, utils, form-state
├── types/                        # Shared content types
└── fonts/                        # Self-hosted Archivo + Inter (woff2)

tests/                            # Node test runner + a resolve hook for the @/ alias
```

### The rule that keeps it maintainable

**Nothing about the business is written in a component.** The phone number,
hours, service list and area list live in `src/config` and `src/data`, and every
component reads from there. Change the phone number in one file and it updates
the header, footer, every CTA, the mobile bar, the contact page and the
structured data at once.

---

## Design system

Tokens are defined once in `src/app/globals.css` under `@theme`, which is what
generates the Tailwind utilities.

- **`ink`** — deep navy, the brand base (headers, dark bands, body text)
- **`flame`** — orange, reserved for the primary action. If it is orange, it is
  the thing you are meant to click.
- **`chill`** — cyan, for cooling/accent details on dark backgrounds
- **`sand`** — warm off-white page background, so the site does not read as
  default-white template
- **Type** — Archivo for headings/buttons, Inter for body, both self-hosted

Fonts are served from this origin rather than Google, which removes a
third-party request on every page load (better for privacy/consent) and means
the build does not depend on `fonts.gstatic.com` being reachable.

### Accessibility

- Semantic landmarks, one `h1` per page, correct heading order
- Skip-to-content link, visible high-contrast focus rings (including a variant
  for dark sections)
- Mobile menu is a proper modal dialog: focus trap, Escape to close, focus
  returned to the trigger, `inert` when closed, background scroll locked
- FAQ accordion follows the WAI-ARIA pattern with arrow-key navigation
- Form errors use `aria-invalid` + `aria-describedby`; the error summary is a
  live region
- Tap targets are at least 44px; the sticky mobile bar uses 48px
- All motion respects `prefers-reduced-motion`

### SEO

- Per-page metadata with canonical URLs via `pageMetadata()` in `src/lib/seo.ts`
- `HVACBusiness` structured data, plus `Service`, `FAQPage` and `BreadcrumbList`
  where relevant. `aggregateRating` is deliberately omitted until real reviews
  exist.
- Sitemap and robots generated from the same navigation/service data
- Every page prerenders to static HTML

---

## Adding content

**A new service** — add an entry to `src/data/services.ts`. That single object
creates the detail page, the card on the index, a footer link, an option in the
contact form and a sitemap entry.

**A new page** — add a folder under `src/app/`, export `metadata` built with
`pageMetadata()`, and open with `<PageHero>` so breadcrumbs and heading rhythm
match the rest of the site.

**Loading states** — `Skeleton`, `CardSkeleton`, `PageSkeleton` and `Spinner`
live in `src/components/ui/`. They are used by the form's pending state today.
Route-level `loading.tsx` files were deliberately **not** included: every page
is statically prerendered, so a route-level Suspense boundary would push the
real content out of the initial HTML (worse LCP and a skeleton flash) for no
benefit. Add one only for a route that genuinely fetches data at request time.
