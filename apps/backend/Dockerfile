FROM node:20-alpine AS base

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# ---- Development build ----
FROM base AS development

# Install all dependencies including devDependencies
RUN pnpm install

# Copy source files
COPY . .

# Generate Prisma client
RUN pnpm prisma generate

# Build the application
RUN pnpm build

# Expose port
EXPOSE 3000

# Start the app in development mode
CMD ["pnpm", "start:dev"]

# ---- Staging build ----
FROM base AS staging

# Install all dependencies including devDependencies
RUN pnpm install

# Copy source files
COPY . .

# Generate Prisma client
RUN pnpm prisma generate

# Build the application
RUN pnpm build

# Expose port
EXPOSE 3000

# Start the app in staging mode
CMD ["pnpm", "start:staging"]

# ---- Production build ----
FROM base AS production

# Install only production dependencies
RUN pnpm install --prod

# Copy source files
COPY . .

# Generate Prisma client
RUN pnpm prisma generate

# Build the application
RUN pnpm build

# Expose port
EXPOSE 3000

# Start the app in production mode
CMD ["pnpm", "start:prod"] 