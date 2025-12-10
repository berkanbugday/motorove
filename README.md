# Motorove Monorepo

A comprehensive motorcycle community platform monorepo containing backend API, mobile applications, landing page, and shared packages.

## 🏍️ About Motorove

Motorove is a social platform for motorcycle enthusiasts that enables riders to:

- **Connect** with fellow riders in their community
- **Discover** scenic routes and riding destinations
- **Join** events and group rides
- **Share** experiences through posts and photos
- **Report** road hazards and emergencies
- **Find** motorcycle businesses and services

## 📁 Project Structure

```
motorove/
├── apps/
│   ├── backend/          # NestJS GraphQL API
│   ├── mobile/           # React Native mobile app (iOS & Android)
│   └── landing/          # Next.js landing page
├── shared/               # Shared types, interfaces, and enums
├── scripts/              # Build and utility scripts
├── patches/              # Package patches (patch-package)
├── templates/            # Code templates
├── turbo.json            # Turborepo configuration
├── pnpm-workspace.yaml   # pnpm workspace configuration
└── package.json          # Root package configuration
```

## 🛠️ Tech Stack

| Package     | Technology                                                                  |
| ----------- | --------------------------------------------------------------------------- |
| **Backend** | NestJS 11, GraphQL (Apollo), Prisma 6, PostgreSQL (Supabase), Redis, BullMQ |
| **Mobile**  | React Native 0.79, TypeScript, Apollo Client, React Navigation 7            |
| **Landing** | Next.js 14, TypeScript, Tailwind CSS, Framer Motion                         |
| **Shared**  | TypeScript interfaces, enums, and utilities                                 |

## 📋 Prerequisites

- **Node.js** >= 18.0.0
- **pnpm** >= 9.6.0
- **Xcode** (for iOS development)
- **Android Studio** (for Android development)
- **Docker** (optional, for backend containerization)

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd motorove
pnpm install
```

### 2. Build Shared Package

```bash
pnpm build:shared
```

### 3. Start Development

```bash
# Start backend
pnpm backend:dev

# Start mobile (in separate terminal)
pnpm mobile:start

# Run mobile on device/simulator
pnpm mobile:android:dev  # Android
pnpm mobile:ios:dev      # iOS
```

## 📦 Available Scripts

### Root Level Commands

| Command           | Description                      |
| ----------------- | -------------------------------- |
| `pnpm build`      | Build all packages               |
| `pnpm dev`        | Start all packages in dev mode   |
| `pnpm lint`       | Run linting across all packages  |
| `pnpm test`       | Run tests across all packages    |
| `pnpm clean`      | Clean build artifacts            |
| `pnpm clean:deps` | Remove all node_modules          |
| `pnpm reset`      | Clean and reinstall dependencies |

### Backend Commands

| Command                           | Description                       |
| --------------------------------- | --------------------------------- |
| `pnpm backend:dev`                | Start backend in development mode |
| `pnpm backend:build`              | Build backend for production      |
| `pnpm backend:prisma:migrate:dev` | Run database migrations           |
| `pnpm backend:prisma:studio:dev`  | Open Prisma Studio                |
| `pnpm backend:prisma:seed:dev`    | Seed the database                 |
| `pnpm backend:test`               | Run backend tests                 |

### Mobile Commands

| Command                       | Description              |
| ----------------------------- | ------------------------ |
| `pnpm mobile:start`           | Start Metro bundler      |
| `pnpm mobile:android:dev`     | Run on Android (dev)     |
| `pnpm mobile:android:staging` | Run on Android (staging) |
| `pnpm mobile:ios:dev`         | Run on iOS (dev)         |
| `pnpm mobile:ios:staging`     | Run on iOS (staging)     |
| `pnpm mobile:clear-cache`     | Clear Metro cache        |
| `pnpm mobile:lint`            | Run mobile linting       |

### Shared Package Commands

| Command             | Description                   |
| ------------------- | ----------------------------- |
| `pnpm shared:build` | Build shared package          |
| `pnpm shared:dev`   | Watch mode for shared package |
| `pnpm shared:lint`  | Lint shared package           |

## 🔧 Environment Configuration

Each app has its own environment files:

```
apps/backend/
├── .env.dev          # Development environment
├── .env.staging      # Staging environment
└── .env              # Production environment

apps/mobile/
├── .env.dev          # Development environment
├── .env.staging      # Staging environment
└── .env              # Production environment
```

See individual app READMEs for required environment variables.

## 🏗️ Architecture

### Monorepo Benefits

- **Shared Code**: Common types and interfaces across all apps
- **Atomic Changes**: Update backend and mobile in single commits
- **Consistent Tooling**: Same linting, formatting, and testing setup
- **Efficient Builds**: Turborepo caching and incremental builds

### Package Dependencies

```
@motorove/shared
    ↑
    ├── @motorove/backend
    ├── @motorove/mobile
    └── @motorove/landing
```

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run backend tests with coverage
pnpm backend:test:cov

# Run mobile tests
pnpm mobile:test
```

## 📚 Documentation

- **[Backend README](./apps/backend/README.md)** - API documentation, Docker setup, database
- **[Mobile README](./apps/mobile/README.md)** - Mobile app setup, build configurations
- **[Landing README](./apps/landing/README.md)** - Landing page setup, deployment
- **[Shared README](./shared/README.md)** - Shared types and interfaces

## 🔄 Turborepo

This project uses [Turborepo](https://turborepo.org/) for monorepo management:

- **Incremental Builds**: Only rebuild changed packages
- **Remote Caching**: Share build artifacts across machines
- **Task Dependencies**: Automatic dependency resolution
- **Parallel Execution**: Optimized task scheduling

## 📦 Package Management

Using [pnpm](https://pnpm.io/) for:

- **Fast Installations**: Content-addressable storage
- **Disk Efficiency**: Symlinked node_modules
- **Workspace Support**: Native monorepo support
- **Strict Mode**: Prevents phantom dependencies

## 🤝 Contributing

1. Create a feature branch from `main`
2. Make your changes
3. Run linting: `pnpm lint`
4. Run tests: `pnpm test`
5. Submit a pull request

## 📄 License

UNLICENSED - Private repository

---

**Made with ❤️ for the motorcycle community**
