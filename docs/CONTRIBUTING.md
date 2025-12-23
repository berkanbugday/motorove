# Contributing to Motorove

Thank you for your interest in contributing to Motorove! This document provides guidelines for contributing to our monorepo.

## 🏗️ Monorepo Structure

We use a **pnpm workspace** with **Turborepo**.

- `apps/backend`: NestJS GraphQL API
- `apps/mobile`: React Native mobile app
- `apps/landing`: Next.js landing page
- `shared`: Shared TypeScript types and utilities

## 🛠️ Prerequisites

- **Node.js** >= 18.0.0
- **pnpm** >= 9.6.0
- **Docker** (optional, for backend services)

## 🚀 Getting Started

1.  **Clone the repository**:
    ```bash
    git clone <repository-url>
    cd motorove
    ```

2.  **Install dependencies**:
    ```bash
    pnpm install
    ```

3.  **Build shared packages**:
    ```bash
    pnpm build:shared
    ```

## 🔧 Development Workflow

### Branching Strategy

- **`main`**: Production-ready code.
- **Feature Branches**: Create branches from `main` for new features or fixes.
  - Format: `feature/your-feature-name` or `fix/your-fix-name`

### Making Changes

1.  Create a new branch: `git checkout -b feature/my-new-feature`
2.  Make your changes in the relevant packages.
3.  If you change code in `shared`, run `pnpm build:shared` to update dependent apps.

### Linting and formatting

We use ESLint and Prettier.

```bash
# Run linting
pnpm lint

# Fix linting issues
pnpm lint --fix
```

### Testing

Run tests to ensure your changes don't break existing functionality.

```bash
# Run all tests
pnpm test

# Run tests for a specific package
pnpm --filter @motorove/backend test
```

## 📝 Commit Messages

We encourage using [Conventional Commits](https://www.conventionalcommits.org/):

- `feat: add new login screen`
- `fix: resolve crash on startup`
- `docs: update README`
- `style: format code`
- `refactor: simplify auth logic`

## 📮 Pull Requests

1.  Push your branch to the repository.
2.  Open a Pull Request (PR) against `main`.
3.  Describe your changes clearly in the PR description.
4.  Wait for code review and address any feedback.

## 📄 License

This project is currently private and unlicensed.
