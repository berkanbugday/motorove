FROM node:20-alpine AS base

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9.6.0 --activate

# Set working directory
WORKDIR /app

# Copy workspace files
FROM base AS deps
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/landing/package.json ./apps/landing/
COPY shared/package.json ./shared/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build stage
FROM base AS builder
WORKDIR /app

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/landing/node_modules ./apps/landing/node_modules
COPY --from=deps /app/shared/node_modules ./shared/node_modules

# Copy source files
COPY apps/landing ./apps/landing
COPY shared ./shared
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./

# Build shared package first
WORKDIR /app/shared
RUN pnpm build

# Build landing page
WORKDIR /app/apps/landing
RUN pnpm build

# Production stage
FROM node:20-alpine AS runner
WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9.6.0 --activate

# Copy built files
COPY --from=builder /app/apps/landing/.next/standalone ./
COPY --from=builder /app/apps/landing/.next/static ./apps/landing/.next/static
COPY --from=builder /app/apps/landing/public ./apps/landing/public

# Set environment
ENV NODE_ENV=production
ENV PORT=8080
ENV HOSTNAME="0.0.0.0"

# Expose port
EXPOSE 8080

# Start the application
CMD ["node", "apps/landing/server.js"]
