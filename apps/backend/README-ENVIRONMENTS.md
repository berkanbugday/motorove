# Environment Configuration System Guide

This guide explains how to work with the multiple environments system in the Motorove backend application with Supabase as the database provider.

## Overview

The application supports multiple environments:

- **Development** (`development`): Used for local development
- **Staging** (`staging`): Used for testing in a staging environment
- **Production** (`production`): Used for the production environment
- **Test** (`test`): Used for running tests

## Environment Configuration Files

The application uses a hierarchy of environment files:

1. `.env.{NODE_ENV}` - Environment-specific configuration (development, staging, production, test)
2. `.env` - Base configuration shared across all environments

## Setting Up Environment Files

### Using the Generator Script

We've created a helper script to generate environment files for you:

```bash
pnpm generate:env
```

This will:

1. Create template files in `src/core/config/env-templates/`
2. Ask if you want to generate actual `.env` files
3. If yes, it will ask which environments you want to generate files for

### Manual Setup

If you prefer to set up environment files manually, create the following files:

- `.env.dev` - Development configuration (includes Supabase credentials)
- `.env.staging` - Staging-specific configuration
- `.env` - Production configuration
- `.env.test` - Test-specific configuration (optional)

**Note:** The actual file names are `.env.dev`, `.env.staging`, and `.env` (not `.env.development` or `.env.production`).

You can use the sample files (`.env.sample`, `.env.staging.sample`) as templates.

## Required Environment Variables

At minimum, your environment files should contain:

```bash
# Required variables
NODE_ENV=development

# Supabase Database (use Session pooler connection string)
DATABASE_URL=postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:5432/postgres

# JWT Authentication
JWT_SECRET=your_jwt_secret_key

# Supabase API
SUPABASE_URL=https://[PROJECT-REF].supabase.co
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_STORAGE_BUCKET=images

# Firebase
FIREBASE_SERVICE_ACCOUNT={...your-service-account-json...}

# Weather API
TOMORROW_IO_API_KEY=your_api_key
```

### Getting Supabase Credentials

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. **DATABASE_URL**: Settings → Database → Connection string (Session pooler)
3. **SUPABASE_URL & KEY**: Settings → API

See [README-SUPABASE.md](./README-SUPABASE.md) for detailed setup instructions.

## Running the Application in Different Environments

### Local Development

```bash
# Development environment (default)
pnpm start:dev

# Staging environment
pnpm start:staging

# Production environment
pnpm start:prod

# Test environment
NODE_ENV=test pnpm start:dev
```

### Using Docker

We provide Docker configuration for all environments:

```bash
# Development environment
docker-compose up api-dev

# Staging environment
docker-compose up api-staging

# Production environment
docker-compose up api-prod
```

You can also build and run specific environments:

```bash
# Build and run a specific environment
docker build --target development -t motorove-api-dev .
docker run -p 3000:3000 --env-file .env.dev motorove-api-dev
```

**Note:** All environments connect to Supabase. No local database is required. Each environment should have its own Supabase project for isolation:

- Development: Your development Supabase project
- Staging: Your staging Supabase project
- Production: Your production Supabase project

## Accessing Environment Configuration in Code

The application uses our custom `ConfigService` which provides strongly-typed access to configuration values:

```typescript
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@core/config/config.service';

@Injectable()
export class MyService {
  constructor(private readonly configService: ConfigService) {}

  someMethod() {
    // Check current environment
    if (this.configService.isDevelopment()) {
      // Development-specific code
    }

    // Get application configuration
    const appConfig = this.configService.getAppConfig();
    const port = appConfig.port; // 3000

    // Get database configuration
    const dbConfig = this.configService.getDatabaseConfig();
    const dbUrl = dbConfig.url;

    // Get authentication configuration
    const authConfig = this.configService.getAuthConfig();
    const jwtSecret = authConfig.jwtSecret;

    // Get a specific configuration value
    const customValue = this.configService.get<string>('CUSTOM_VALUE');
  }
}
```

## Environment-Specific Modules

You can create modules that behave differently based on the current environment:

```typescript
import { Module } from '@nestjs/common';
import { ConfigService } from '@core/config/config.service';

@Module({
  imports: [],
  providers: [],
})
export class FeatureModule {
  static forRoot() {
    const environment = process.env.NODE_ENV || 'dev';

    if (environment === 'dev') {
      return {
        module: FeatureModule,
        imports: [
          // Development-specific imports
        ],
        providers: [
          // Development-specific providers
        ],
      };
    } else if (environment === 'production') {
      return {
        module: FeatureModule,
        imports: [
          // Production-specific imports
        ],
        providers: [
          // Production-specific providers
        ],
      };
    }

    // Default configuration
    return {
      module: FeatureModule,
    };
  }
}
```

See `src/core/config/examples/environment.module.ts` for a more detailed example.

## Best Practices

1. **Never commit sensitive information**: Keep secrets out of version control
2. **Use environment variables for configuration**: Don't hardcode configuration values
3. **Provide sensible defaults**: Make the application work with minimal configuration
4. **Validate required configuration**: Fail fast if required configuration is missing
5. **Document available configuration options**: Make it easy for others to understand what can be configured
6. **Use type safety**: Take advantage of TypeScript to ensure type safety
7. **Handle environment-specific behavior in code**: Use environment checks to change behavior based on the environment

## Troubleshooting

If you encounter issues with environment configuration:

1. **Check that environment files exist**: Verify that `.env` and `.env.{NODE_ENV}` files exist
2. **Verify environment variables**: Use `console.log(process.env)` to check if variables are loaded correctly
3. **Check for typos**: Ensure variable names match between code and environment files
4. **Restart the application**: Sometimes changes to environment files require a restart

## Additional Information

- **Configuration Module**: The configuration system is implemented in `src/core/config/`
- **Environment Templates**: Example templates are stored in `src/core/config/env-templates/`
- **Docker Configuration**: See `Dockerfile` and `docker-compose.yml` for Docker environment configuration
