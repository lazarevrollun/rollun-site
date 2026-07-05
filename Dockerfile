# syntax=docker/dockerfile:1

# ---------------------------------------------------------------------------
# Multi-stage build producing a single-process Next.js 16 + Payload runtime
# from Next's standalone output (AD-12). No prototype scaffolding (AD-11).
# ---------------------------------------------------------------------------

# 1. Install dependencies
FROM node:22-alpine AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json* ./
RUN npm ci

# 2. Build the app. `next build` does NOT need a *reachable* Postgres, but the
#    Payload config is loaded during build and now fails fast if PAYLOAD_SECRET
#    or DATABASE_URI is unset — so both must be *defined* (DATABASE_URI is never
#    connected to at build time; any value satisfies the config load).
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ARG PAYLOAD_SECRET
ARG DATABASE_URI
ENV PAYLOAD_SECRET=${PAYLOAD_SECRET}
ENV DATABASE_URI=${DATABASE_URI}
RUN npm run build

# 2b. Migrator: reuse the full builder (deps + source + TS loader + payload CLI)
#     to run committed migrations before the app serves. DATABASE_URI is supplied
#     at run time by the one-shot compose `migrate` service.
FROM builder AS migrator
CMD ["npm", "run", "migrate"]

# 3. Minimal runtime image
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

# Standalone server + static assets.
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

# Single process (AD-12): the standalone server serves site + /admin + API.
CMD ["node", "server.js"]
