# Production image for a host with a persistent disk (Railway, Render, Fly.io,
# or any VPS running Docker).
#
# The site stores leads, editable content and uploaded photos on the
# filesystem, so it needs a real disk mounted at /data. That is the whole
# reason this runs as a container rather than on a serverless platform.

# Debian slim rather than Alpine: Next's image optimizer pulls in sharp, whose
# prebuilt binaries target glibc. Alpine's musl means either a slower source
# build or a runtime failure on the first optimized image.
FROM node:24-slim AS base


# --- dependencies ----------------------------------------------------------
# Installed in their own layer so a source-only change does not reinstall.
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci


# --- build -----------------------------------------------------------------
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Baked into the client bundle at build time, so it cannot be supplied later
# as a runtime variable. Passed with --build-arg; see README.
ARG NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL

ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build


# --- runtime ---------------------------------------------------------------
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Leads and editable content live in PostgreSQL, supplied at runtime via
# DATABASE_URL — deliberately not baked in, since it carries a password.
#
# Uploaded photos are still files, so a disk mounted at /data is still needed.
# Anything written outside it lives in the container's own layer and is
# destroyed on the next deploy.
ENV UPLOADS_PATH=/data/uploads

# Bind to all interfaces; the default of localhost is unreachable from outside
# the container.
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

# `output: "standalone"` in next.config.ts produces a self-contained server
# with only the modules actually imported.
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

RUN mkdir -p /data

# Deliberately left as root. Managed hosts mount volumes owned by root, so an
# unprivileged user cannot write to /data without a host-specific chown — and
# that failure surfaces as a customer's enquiry vanishing, which is a worse
# outcome than root in a single-tenant container.
VOLUME ["/data"]
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server.js"]
