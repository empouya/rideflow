# ---------- BASE ----------
FROM node:24-alpine AS base
RUN corepack enable

# ---------- BUILDER ----------
FROM base AS builder

WORKDIR /app

# Copy only workspace essentials
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json tsconfig.base.json ./

# Copy service
COPY apps/user-service ./apps/user-service

# Install ONLY this service deps
RUN pnpm install --frozen-lockfile

# Move into service
WORKDIR /app/apps/user-service

# Generate Prisma client
RUN pnpm prisma generate

# Build NestJS app
RUN pnpm build

# ---------- RUNTIME ----------
FROM base AS runner

WORKDIR /app

# Copy node_modules (only filtered ones)
COPY --from=builder /app/node_modules ./node_modules

# Copy built service
COPY --from=builder /app/apps/user-service ./apps/user-service

WORKDIR /app/apps/user-service

ENV NODE_ENV=production

CMD ["node", "dist/main.js"]