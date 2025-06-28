# Motorove

This is a monorepo for the Motorove application, containing:

- **Backend**: NestJS application with GraphQL API
- **Mobile**: React Native mobile application
- **Shared**: Shared types, interfaces, DTOs, and enums

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 8+

### Setup

```bash
# Install dependencies
pnpm install

# Build shared package
pnpm build:shared

# Build backend
pnpm build:backend

# Build mobile
pnpm build:mobile
```

### Development

```bash
# Start backend in development mode
pnpm dev:backend

# Start mobile in development mode
pnpm dev:mobile
```

## Project Structure

```
motorove/
├── apps/
│   ├── backend/           # NestJS backend application
│   └── mobile/            # React Native mobile application
└── shared/                # Shared types for frontend and backend
    ├── interfaces/        # TypeScript interfaces
    ├── dto/               # Data Transfer Objects
    └── enums/             # Shared enums
```

## Shared Package

The shared package contains common types used by both the backend and mobile applications. This ensures type consistency across the stack.

See [shared/README.md](./shared/README.md) for more details.
