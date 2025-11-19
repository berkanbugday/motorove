FROM node:20-slim AS base

# Docker Hub metadata for motorove/images:backend
LABEL org.opencontainers.image.title="Motorove Backend API"
LABEL org.opencontainers.image.description="NestJS GraphQL API for Motorove motorcycle community platform"
LABEL org.opencontainers.image.vendor="Motorove"
LABEL org.opencontainers.image.source="https://github.com/berkanbugday/motorove"
LABEL org.opencontainers.image.documentation="https://github.com/berkanbugday/motorove/blob/main/apps/backend/README.md"

# Install required system dependencies for Prisma
RUN apt-get update && apt-get install -y \
    openssl \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install pnpm globally using npm (more reliable than corepack for multi-arch builds)
RUN npm install -g pnpm@9.6.0

# Set working directory
WORKDIR /app

# ---- Dependencies stage ----
FROM base AS dependencies

# Copy workspace configuration files
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./

# Copy shared package
COPY shared/package.json ./shared/package.json
COPY shared/tsconfig.json ./shared/tsconfig.json
COPY shared ./shared

# Copy backend package.json
COPY apps/backend/package.json ./apps/backend/package.json

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build shared package
RUN pnpm --filter @motorove/shared build

# ---- Development build ----
FROM dependencies AS development

# Copy backend source files
COPY apps/backend ./apps/backend

# Generate Prisma client
WORKDIR /app/apps/backend
RUN pnpm prisma generate

# Build the application
RUN pnpm build

# Expose port
EXPOSE 3000

# Start the app in development mode
CMD ["pnpm", "start:dev"]

# ---- Staging build ----
FROM dependencies AS staging

# Copy backend source files
COPY apps/backend ./apps/backend

# Generate Prisma client
WORKDIR /app/apps/backend
RUN pnpm prisma generate

# Build the application
RUN pnpm build

# Expose port
EXPOSE 3000

# Start the app in staging mode
CMD ["pnpm", "start:staging"]

# ---- Production dependencies ----
FROM base AS production-deps

# Copy workspace configuration files
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./

# Copy shared package
COPY shared/package.json ./shared/package.json
COPY shared/tsconfig.json ./shared/tsconfig.json
COPY shared ./shared

# Copy backend package.json
COPY apps/backend/package.json ./apps/backend/package.json

# Install only production dependencies
RUN pnpm install --frozen-lockfile --prod

# Build shared package (needed even in production)
RUN pnpm --filter @motorove/shared build

# ---- Production build ----
FROM production-deps AS production

# Copy backend source files
COPY apps/backend ./apps/backend

# Generate Prisma client
WORKDIR /app/apps/backend
RUN pnpm prisma generate

# Build the application
RUN pnpm build

# Remove source files, keep only dist
RUN rm -rf src test

# Expose port
EXPOSE 3000

# Start the app in production mode
CMD ["pnpm", "start:prod"]