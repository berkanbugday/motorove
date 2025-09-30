FROM node:20-slim AS base

# Install required system dependencies for TensorFlow and Prisma
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    openssl \
    && rm -rf /var/lib/apt/lists/*

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9.6.0 --activate

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

# Rebuild TensorFlow bindings for ARM64
RUN cd node_modules/.pnpm/@tensorflow+tfjs-node@4.22.0_encoding@0.1.13_seedrandom@3.0.5/node_modules/@tensorflow/tfjs-node && \
    rm -rf lib/napi-v8/tfjs_binding.node && \
    npm run build-addon-from-source

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

# Configure TensorFlow library path in the system
RUN TFJS_LIB=$(find /app/node_modules/.pnpm -path "*/tfjs-node/deps/lib" | head -1) && \
    echo "$TFJS_LIB" > /etc/ld.so.conf.d/tensorflow.conf && \
    ldconfig

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

# Configure TensorFlow library path in the system
RUN TFJS_LIB=$(find /app/node_modules/.pnpm -path "*/tfjs-node/deps/lib" | head -1) && \
    echo "$TFJS_LIB" > /etc/ld.so.conf.d/tensorflow.conf && \
    ldconfig

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

# Configure TensorFlow library path in the system
RUN TFJS_LIB=$(find /app/node_modules/.pnpm -path "*/tfjs-node/deps/lib" | head -1) && \
    echo "$TFJS_LIB" > /etc/ld.so.conf.d/tensorflow.conf && \
    ldconfig

# Expose port
EXPOSE 3000

# Start the app in production mode
CMD ["pnpm", "start:prod"]