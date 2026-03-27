# ---------- BASE ----------
FROM node:24-alpine AS base
RUN corepack enable

# ---------- BUILDER ----------
FROM base AS builder

WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json tsconfig.base.json ./
COPY apps/driver-service ./apps/driver-service

RUN pnpm install --frozen-lockfile

WORKDIR /app/apps/driver-service

RUN pnpm prisma generate
RUN pnpm build

# ---------- RUNTIME ----------
FROM base AS runner

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/driver-service ./apps/driver-service

WORKDIR /app/apps/driver-service

ENV NODE_ENV=production

CMD ["node", "dist/main.js"]
