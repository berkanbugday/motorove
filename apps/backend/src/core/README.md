# Error Handling and Logging System

This directory contains a comprehensive error handling and logging system for our NestJS GraphQL backend. It leverages Sentry for error tracking and Winston for logging.

## Architecture

The error handling system consists of the following components:

- **Sentry Integration**: Captures errors and sends them to the Sentry service for monitoring and alerting.
- **Custom Logger**: A NestJS-compatible logger built on Winston that provides structured logging.
- **GraphQL Exception Filter**: Captures all GraphQL errors, formats them appropriately, and logs them to both the console and Sentry.
- **Logging Interceptor**: Logs all GraphQL queries and mutations with execution time and other metadata.

## Configuration

### Environment Variables

The following environment variables need to be set in your `.env` file:

```
SENTRY_DSN=your_sentry_dsn_here
NODE_ENV=development  # or 'production' in production environments
LOG_LEVEL=info  # or 'debug', 'warn', 'error' as needed
```

## Usage

### Logging

Use the `CustomLogger` service in your components for consistent logging:

```typescript
import { Injectable } from '@nestjs/common';
import { CustomLogger } from '../core/utils/logger.service';

@Injectable()
export class YourService {
  constructor(private readonly logger: CustomLogger) {
    this.logger.setContext(YourService.name);
  }

  someMethod() {
    this.logger.log('This is an info message');
    this.logger.debug('This is a debug message');
    this.logger.warn('This is a warning message');

    try {
      // Some code that might throw
    } catch (error) {
      this.logger.error('An error occurred', error.stack);
    }
  }
}
```

### Error Handling

The `GraphqlExceptionFilter` automatically handles all uncaught exceptions in GraphQL resolvers, formats them appropriately, and reports them to Sentry.

To throw custom exceptions with specific status codes:

```typescript
import { HttpException, HttpStatus } from '@nestjs/common';

// In your service or resolver
throw new HttpException('Your error message', HttpStatus.BAD_REQUEST);
```

### Manual Sentry Reporting

If you need to manually report events to Sentry:

```typescript
import { Injectable } from '@nestjs/common';
import { SentryService } from '../core/sentry/sentry.service';

@Injectable()
export class YourService {
  constructor(private readonly sentryService: SentryService) {}

  someMethod() {
    try {
      // Some code that might throw
    } catch (error) {
      this.sentryService.captureException(error, {
        extra: {
          context: 'Additional context',
        },
      });
    }

    // Or to capture a message
    this.sentryService.captureMessage('Something happened', 'info', {
      context: 'Additional context',
    });
  }
}
```

## Best Practices

1. Always use the `CustomLogger` instead of `console.log`.
2. Set a context for your logger to identify the source of logs.
3. Include relevant metadata in your logs to make debugging easier.
4. Use appropriate log levels (debug, info, warn, error) based on the significance of the event.
5. Use structured logging (passing objects to the logger) when possible for easier filtering and analysis.
6. Throw appropriate HTTP exceptions with meaningful status codes for different error scenarios.

## Extending

To extend this system:

1. Add custom exception filters for other protocols (REST, WebSockets) if needed.
2. Add custom interceptors for specific modules or controllers.
3. Create custom exception classes for domain-specific errors.
4. Configure additional transports for Winston (file, database, external services).
