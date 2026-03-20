FROM node:24-alpine AS builder

RUN npm install -g pnpm@10.24.0

WORKDIR /app

# Copy workspace config
COPY pnpm-workspace.yaml ./
COPY package.json ./
COPY pnpm-lock.yaml ./
COPY tsconfig.base.json ./

# Copy service package.json
COPY apps/auth-service/package.json ./apps/auth-service/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source
COPY apps/auth-service ./apps/auth-service

# Generate Prisma client
RUN cd apps/auth-service && pnpm exec prisma generate

# Build
RUN cd apps/auth-service && pnpm build

# ---- Runner stage ----
FROM node:24-alpine AS runner

RUN npm install -g pnpm@10.24.0

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copy workspace config
COPY pnpm-workspace.yaml ./
COPY package.json ./
COPY pnpm-lock.yaml ./
COPY tsconfig.base.json ./

# Copy service package.json
COPY apps/auth-service/package.json ./apps/auth-service/

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

# Copy built output from builder
COPY --from=builder /app/apps/auth-service/dist ./apps/auth-service/dist

# Copy prisma schema for migrations
COPY apps/auth-service/prisma ./apps/auth-service/prisma

# Generate Prisma client in runner
RUN cd apps/auth-service && pnpm exec prisma generate

# Set correct ownership
RUN chown -R appuser:appgroup /app

USER appuser

WORKDIR /app/apps/auth-service

EXPOSE 3000

CMD ["node", "dist/main.js"]