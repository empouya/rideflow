# ---------- BASE ----------
FROM node:24-alpine AS base
RUN corepack enable

# ---------- BUILDER ----------
FROM base AS builder

WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json tsconfig.base.json ./

COPY apps/api-gateway ./apps/api-gateway

RUN pnpm install --frozen-lockfile

WORKDIR /app/apps/api-gateway

RUN pnpm build

# ---------- RUNTIME ----------
FROM base AS runner

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api-gateway ./apps/api-gateway

WORKDIR /app/apps/api-gateway

ENV NODE_ENV=production

CMD ["node", "dist/main.js"]