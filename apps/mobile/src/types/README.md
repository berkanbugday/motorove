# Types Organization

This directory contains all TypeScript types and interfaces used throughout the application, organized by their domain and purpose.

## Structure

```
types/
├── models/                 # Domain models representing core business entities
│   ├── user.model.ts       # User-related models
│   ├── post.model.ts       # Post-related models
│   └── index.ts            # Export all models
├── auth.types.ts           # Authentication-related types
├── navigation.types.ts     # Navigation-related types
├── api.types.ts            # API-related types
├── env.d.ts                # Environment variable type definitions
├── svg.d.ts                # SVG module declarations
└── index.ts                # Main entry point that exports all types
```

## Usage Guidelines

1. **Keep related types together**: Group types by their domain or feature.
2. **Use descriptive names**: Use clear, descriptive names for interfaces and types.
3. **Document complex types**: Add JSDoc comments to explain complex interfaces.
4. **Use composition**: Break down complex types into smaller, reusable pieces.
5. **Export from index files**: Make types easily importable via the index files.

## Importing Types

Import types from the centralized location:

```typescript
// Preferred way - import from the main index
import {UserProfile, Post, ApiResponse} from '@types';

// Alternative - import directly from specific files
import {UserProfile} from '@types/models/user.model';
```

## Type Naming Conventions

- Use PascalCase for interface and type names: `UserProfile`, `ApiResponse`
- Use descriptive suffixes:
  - `...Model` for domain models
  - `...Response` for API responses
  - `...Params` for parameters
  - `...Props` for component props
  - `...State` for state types

## Adding New Types

When adding new types:

1. Determine if they belong to an existing category or need a new file
2. Add JSDoc comments to document the type
3. Export the type from the appropriate index file
4. Follow the existing naming conventions
