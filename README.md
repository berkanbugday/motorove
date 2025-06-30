# Motorove Monorepo

This is a monorepo for the Motorove project containing backend, mobile, and shared packages.

## Project Structure

```
motorove/
  ├── apps/
  │   ├── backend/       # NestJS backend application
  │   └── mobile/        # React Native mobile application
  ├── shared/            # Shared types, interfaces, and enums
  ├── turbo.json         # Turborepo configuration
  └── pnpm-workspace.yaml # pnpm workspace configuration
```

## Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0

## Setup

1. Clone the repository
2. Install dependencies:

```bash
pnpm install
```

## Development

### Build all packages

```bash
pnpm build
```

### Build specific packages

```bash
# Build only the shared package
pnpm build:shared

# Build only the backend package
pnpm build:backend

# Build only the mobile package
pnpm build:mobile
```

### Development mode

```bash
# Run all packages in development mode
pnpm dev

# Run only the backend in development mode
pnpm dev:backend

# Run only the mobile app in development mode
pnpm dev:mobile
```

### Other commands

```bash
# Run tests
pnpm test

# Run linting
pnpm lint

# Clean up build artifacts and node_modules
pnpm clean
```

## Turborepo

This project uses [Turborepo](https://turborepo.org/) to manage the monorepo. Turborepo provides caching, incremental builds, and optimized task execution.

### Key features:

- **Incremental builds**: Only rebuild what's changed
- **Remote caching**: Share build artifacts across machines (optional)
- **Task dependencies**: Define relationships between tasks
- **Parallel execution**: Run tasks in parallel for faster builds

## Package Management

This project uses [pnpm](https://pnpm.io/) for package management. pnpm provides fast, disk-efficient package installations and supports workspaces for monorepos.
