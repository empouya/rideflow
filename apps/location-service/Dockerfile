# ---------- BASE ----------
FROM node:24-alpine AS base
RUN corepack enable

# ---------- BUILDER ----------
FROM base AS builder

WORKDIR /app

# Copy workspace essentials
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json tsconfig.base.json ./

# Copy service
COPY apps/location-service ./apps/location-service

# Copy kafka client package
COPY packages/kafka-client ./packages/kafka-client

# Install ONLY this service deps
RUN pnpm install --frozen-lockfile

# build kafka client package
RUN pnpm --filter @rideflow/kafka-client build

# Move into service
WORKDIR /app/apps/location-service

# Build NestJS app
RUN pnpm build

# ---------- RUNTIME ----------
FROM base AS runner

WORKDIR /app

# Copy node_modules (only filtered ones)
COPY --from=builder /app/node_modules ./node_modules

# Copy built service
COPY --from=builder /app/apps/location-service ./apps/location-service

# Copy built kafka client package
COPY --from=builder /app/packages/kafka-client ./packages/kafka-client

WORKDIR /app/apps/location-service

ENV NODE_ENV=production

CMD ["node", "dist/main.js"]
