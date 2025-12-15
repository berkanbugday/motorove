FROM node:20-alpine AS base

# Docker Hub metadata for motorove/images:landing
LABEL org.opencontainers.image.title="Motorove Landing Page"
LABEL org.opencontainers.image.description="Next.js landing page for Motorove motorcycle community platform"
LABEL org.opencontainers.image.vendor="Motorove"
LABEL org.opencontainers.image.source="https://github.com/berkanbugday/motorove"
LABEL org.opencontainers.image.documentation="https://github.com/berkanbugday/motorove/blob/main/apps/landing/README.md"

# Install pnpm globally using npm (more reliable for multi-arch builds)
RUN npm install -g pnpm@9.6.0

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

# Build-time environment variables for Next.js (NEXT_PUBLIC_* are baked into the bundle)
# These MUST be provided via --build-arg or docker-compose args
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_BASE_URL

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_BASE_URL=$NEXT_PUBLIC_BASE_URL

RUN pnpm build

# Production stage
FROM node:20-alpine AS runner
WORKDIR /app

# Install pnpm globally using npm (more reliable for multi-arch builds)
RUN npm install -g pnpm@9.6.0

# Install sharp for image optimization in standalone mode
RUN pnpm add sharp

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

# Start the application - server.js is in apps/landing subdirectory of standalone output
CMD ["node", "apps/landing/server.js"]
