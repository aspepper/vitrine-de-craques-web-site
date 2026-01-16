# syntax=docker/dockerfile:1

FROM node:20-slim AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

FROM base AS deps
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
      ca-certificates \
      openssl \
    # Optional: uncomment if your app requires ffmpeg at runtime.
    #  ffmpeg \
    && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
RUN npm ci

FROM deps AS builder
ARG DATABASE_URL="postgresql://postgres:postgres@localhost:5432/postgres?schema=public"
ENV DATABASE_URL=$DATABASE_URL
COPY prisma ./prisma
COPY prisma.config.ts ./prisma.config.ts
RUN npx prisma generate
COPY . .
RUN npm run build

FROM base AS runner
ENV NODE_ENV=production
ENV PORT=3000
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
      ca-certificates \
      openssl \
    # Optional: uncomment if your app requires ffmpeg at runtime.
    #  ffmpeg \
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

USER node
EXPOSE 3000
CMD ["node", "server.js"]
