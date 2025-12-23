# Import Aliases

This project uses import aliases to improve code readability and maintainability. Instead of using relative imports like `../../components/Button`, you can use aliases like `@components/Button`.

## Available Aliases

The following import aliases are available:

| Alias         | Path               | Example Usage                                      |
| ------------- | ------------------ | -------------------------------------------------- |
| `@components` | `./src/components` | `import { Button } from '@components/Button'`      |
| `@screens`    | `./src/screens`    | `import { HomeScreen } from '@screens/home'`       |
| `@navigation` | `./src/navigation` | `import { RootNavigator } from '@navigation'`      |
| `@utils`      | `./src/utils`      | `import { formatDate } from '@utils/date'`         |
| `@hooks`      | `./src/hooks`      | `import { useAppState } from '@hooks/useAppState'` |
| `@types`      | `./src/types`      | `import { UserType } from '@types/user'`           |
| `@assets`     | `./src/assets`     | `require('@assets/images/logo.png')`               |
| `@`           | `./src`            | `import { anything } from '@/anywhere'`            |

## Configuration

These aliases are configured in three places:

1. **TypeScript Configuration** (`tsconfig.json`):

   - Provides TypeScript compiler with path mappings
   - Enables code completion and navigation in your IDE

2. **Babel Configuration** (`babel.config.js`):

   - Configures the babel-plugin-module-resolver
   - Enables transpilation of imports with aliases

3. **Metro Configuration** (`metro.config.js`):
   - Configures the Metro bundler to resolve aliases
   - Required for React Native bundling to work with aliases

## Best Practices

- Always use aliases for imports from outside the current directory
- Prefer the most specific alias that applies (e.g., use `@components/Button` instead of `@/components/Button`)
- For imports within the same directory, relative imports (`./SomeFile`) are acceptable
