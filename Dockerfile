# Stage 1: Install deps
FROM node:20-alpine AS deps
WORKDIR /app
COPY packages/web/package.json packages/web/package-lock.json* ./
RUN npm ci

# Stage 2: Build
FROM node:20-alpine AS builder
WORKDIR /app

# Build-time args for NEXT_PUBLIC_* vars (inlined at build time)
ARG NEXT_PUBLIC_FIREBASE_API_KEY
ARG NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
ARG NEXT_PUBLIC_FIREBASE_PROJECT_ID
ARG NEXT_PUBLIC_FIREBASE_APP_ID
ARG NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
ARG NEXT_PUBLIC_FIREBASE_VAPID_KEY

COPY --from=deps /app/node_modules ./node_modules
COPY packages/web/ .
RUN npm run build

# Stage 3: Production
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./next.config.js

RUN rm -f .env.local

USER nextjs
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["npx", "next", "start"]
