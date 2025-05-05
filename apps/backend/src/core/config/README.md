# Multi-Environment Configuration System

This module provides a comprehensive, type-safe configuration system for the NestJS application with support for multiple environments (development, staging, production, test).

## Features

- Environment-specific configuration files
- Type-safe configuration access with sensible defaults
- Validation of required configuration values
- Helper methods for common configuration tasks
- Environment-specific overrides

## Environment Files

The application uses the following environment files in order of precedence:

1. `.env.{NODE_ENV}` - Environment-specific configuration (e.g., `.env.development`, `.env.staging`, `.env.production`)
2. `.env` - Base configuration shared across all environments

## Required Environment Variables

| Variable       | Description                    | Required | Default       |
| -------------- | ------------------------------ | -------- | ------------- |
| NODE_ENV       | Application environment        | No       | `development` |
| PORT           | HTTP server port               | No       | `3000`        |
| HOST           | IP address to bind server to   | No       | `0.0.0.0`     |
| DATABASE_URL   | PostgreSQL connection string   | Yes      | -             |
| JWT_SECRET     | Secret key for JWT signing     | Yes      | -             |
| JWT_EXPIRATION | JWT token expiration           | No       | `1d`          |
| SENTRY_DSN     | Sentry DSN for error reporting | No       | -             |
| API_PREFIX     | API route prefix               | No       | `api`         |
| SWAGGER_ENABLE | Whether to enable Swagger docs | No       | `true`        |
| CORS_ORIGIN    | CORS allowed origins           | No       | `*`           |

## Sample Environment Files

### `.env.development`

```
# DEVELOPMENT ENVIRONMENT

# APPLICATION SETTINGS
NODE_ENV=development
PORT=3000
HOST=0.0.0.0
APP_NAME="Motorove API (Dev)"
API_PREFIX=api
CORS_ORIGIN=*
SWAGGER_ENABLE=true

# DATABASE
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/motorove_dev?schema=public"

# AUTHENTICATION
JWT_SECRET=dev_jwt_secret_replace_in_production
JWT_EXPIRATION=1d

# LOGGING
LOG_LEVEL=debug

# MONITORING
SENTRY_DSN=

# FEATURE FLAGS
FEATURE_X_ENABLED=true
FEATURE_Y_ENABLED=true
```

### `.env.staging`

```
# STAGING ENVIRONMENT

# APPLICATION SETTINGS
NODE_ENV=staging
PORT=3000
HOST=0.0.0.0
APP_NAME="Motorove API (Staging)"
API_PREFIX=api
CORS_ORIGIN=https://staging.example.com
SWAGGER_ENABLE=true

# DATABASE
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/motorove_staging?schema=public"

# AUTHENTICATION
JWT_SECRET=staging_jwt_secret_replace_in_production
JWT_EXPIRATION=1d

# LOGGING
LOG_LEVEL=info

# MONITORING
SENTRY_DSN=your_sentry_dsn_here

# FEATURE FLAGS
FEATURE_X_ENABLED=true
FEATURE_Y_ENABLED=true
```

### `.env.production`

```
# PRODUCTION ENVIRONMENT

# APPLICATION SETTINGS
NODE_ENV=production
PORT=3000
HOST=0.0.0.0
APP_NAME="Motorove API"
API_PREFIX=api
CORS_ORIGIN=https://example.com
SWAGGER_ENABLE=false

# DATABASE
DATABASE_URL="postgresql://postgres:strong_password@production-db:5432/motorove_prod?schema=public"

# AUTHENTICATION
JWT_SECRET=strong_production_jwt_secret
JWT_EXPIRATION=1d

# LOGGING
LOG_LEVEL=warn

# MONITORING
SENTRY_DSN=your_sentry_dsn_here

# FEATURE FLAGS
FEATURE_X_ENABLED=false
FEATURE_Y_ENABLED=false
```

## Usage

### Accessing Configuration Values

```typescript
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@core/config/config.service';

@Injectable()
export class MyService {
  constructor(private readonly configService: ConfigService) {}

  someMethod() {
    // Get application config
    const appConfig = this.configService.getAppConfig();
    console.log(appConfig.name); // "Motorove API (Dev)" in development

    // Get database config
    const dbConfig = this.configService.getDatabaseConfig();
    console.log(dbConfig.url);

    // Check environment
    if (this.configService.isDevelopment()) {
      // Development-specific code
    }

    // Get raw config value
    const customValue = this.configService.get<string>('CUSTOM_VALUE');
  }
}
```

## Switching Environments

To run the application in a specific environment:

```bash
# Development
NODE_ENV=development pnpm start:dev

# Staging
NODE_ENV=staging pnpm start:dev

# Production
NODE_ENV=production pnpm start:prod
```

## Docker Usage

When running in Docker, you can set the environment using:

```dockerfile
ENV NODE_ENV=production
```

Or via docker-compose:

```yaml
services:
  api:
    build: .
    environment:
      NODE_ENV: production
```
