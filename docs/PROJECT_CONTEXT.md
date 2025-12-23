# Project Context & Architecture Reference

This document serves as a "brain dump" of the Motorove project context, designed to help developers and AI agents quickly understand the system's architecture, technology stack, and domain.

## 🏍️ Project Identity
**Name**: Motorove
**Mission**: A social platform for motorcycle enthusiasts to connect, ride, and share experiences.
**Type**: Monorepo (Turborepo) containing Mobile App, Backend API, and Landing Page.

## 🏗️ Architecture Overview

The project is structured as a monorepo using **Turborepo** and **pnpm workspaces**.

### Apps
| App | Path | Type | Key Tech | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Mobile** | `apps/mobile` | React Native | RN 0.79, Apollo Client, React Navigation 7 | The primary user interface. iOS and Android. |
| **Backend** | `apps/backend` | NestJS | NestJS 11, GraphQL, Prisma 6, Postgres | The API gateway and core logic. |
| **Landing** | `apps/landing` | Next.js | Next.js 14, Tailwind CSS | Marketing website. |

### Shared Code
| Package | Path | Type | Description |
| :--- | :--- | :--- | :--- |
| **Shared** | `shared` | TypeScript | Shared Types, Interfaces (`.interfaces/`), Enums (`.enums/`), and utilities used by both Mobile and Backend. |

### Data Flow
1. **Mobile App** requests data via **GraphQL** (Apollo Client).
2. **Backend** (NestJS) resolves GraphQL queries.
3. **Prisma ORM** contacts **PostgreSQL** (Supabase).
4. **Redis** is used for caching and queue management (BullMQ).

## 🛠️ Technology Stack Detail

### Core
- **Monorepo Manager**: Turborepo
- **Package Manager**: pnpm (>9.6.0)
- **Language**: TypeScript (Strict mode)

### Backend (`apps/backend`)
- **Framework**: NestJS 11
- **API Style**: GraphQL (Code-first approach)
- **Database**: PostgreSQL (hosted on Supabase)
- **ORM**: Prisma 6
- **Cache/Queues**: Redis, BullMQ
- **Authentication**: JWT, internally managed

### Mobile (`apps/mobile`)
- **Framework**: React Native 0.79
- **Navigation**: React Navigation 7
- **State/Data**: Apollo Client (Caching & Data fetching)
- **UI Styling**: Internal Design System (likely based on `src/theme`)
- **Maps**: Mapbox (implied by context of "routes")

### Shared (`shared`)
- Pure TypeScript library.
- **NO** heavy dependencies.
- Build output to `dist/`.

## 📂 Key Directory Map

```text
motorove/
├── apps/
│   ├── backend/
│   │   ├── src/
│   │   │   ├── app.module.ts      # Root Module
│   │   │   ├── [feature]/         # Feature modules (e.g., users, rides)
│   │   │   │   ├── *.resolver.ts  # GraphQL Resolvers
│   │   │   │   ├── *.service.ts   # Business Logic
│   │   │   │   ├── *.module.ts    # Dependency Injection
│   │   │   └── common/            # Guards, Interceptors, Decorators
│   │   └── prisma/
│   │       └── schema.prisma      # DB Schema Source of Truth
│   ├── mobile/
│   │   ├── src/
│   │   │   ├── components/        # Reusable UI components
│   │   │   ├── screens/           # Page/Screen views
│   │   │   ├── navigation/        # Navigators (Stack, Tab)
│   │   │   ├── services/          # API Services & Logic
│   │   │   ├── hooks/             # Custom React Hooks
│   │   │   └── theme/             # Styling constants
│   │   ├── docs/                  # Mobile-specific documentation
│   │   └── ios/ & android/        # Native projects
│   └── landing/
│       └── src/app/               # Next.js App Router
└── shared/
    ├── interfaces/                # Shared DTOs/Types
    └── enums/                     # Shared constants
```

## 🔄 Common Workflows

### 1. Starting Development
```bash
# Root directory
pnpm install
pnpm dev         # Starts all apps
# OR
pnpm backend:dev
pnpm mobile:start
```

### 2. Modifying the Database
1. Edit `apps/backend/prisma/schema.prisma`.
2. Run migration:
   ```bash
   pnpm backend:prisma:migrate:dev
   ```
3. This usually regenerates the Prisma Client automatically.

### 3. Updating Shared Code
1. Edit code in `shared/`.
2. Build it (required for other apps to see changes):
   ```bash
   pnpm shared:build
   # OR run in watch mode
   pnpm shared:dev
   ```

### 4. GraphQL Schema Updates
- The backend is **Code-First**.
- Edit `*.graphql` or `*.model.ts` files in Backend.
- NestJS auto-generates the `schema.gql` file.
- Mobile app's `codegen` (if configured) needs to run to update types.

## ⚠️ Important Context & Gotchas
- **Env Variables**: Managing via `.env.dev`, `.env.staging`, `.env` (prod).
- **Mobile Assets**: Images often accessed via `@assets` alias.
- **Path Aliases**: Extensive use of simple aliases (e.g. `@components`, `@utils`) in Mobile.
