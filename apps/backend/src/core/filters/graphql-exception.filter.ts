import {
  ArgumentsHost,
  Catch,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { GqlArgumentsHost, GqlExceptionFilter } from '@nestjs/graphql';
import { GraphQLError } from 'graphql';
import { SentryService } from '../sentry/sentry.service';
import { CustomLogger } from '../utils/logger.service';
import { Request } from 'express';
import { ConfigService } from '../config/config.service';

interface GqlContext {
  req: Request & {
    user?: {
      id: string;
      email?: string;
      username?: string;
    };
  };
}

interface ExceptionExtension {
  stacktrace: string[];
  originalError?: string;
}

@Catch()
export class GraphqlExceptionFilter implements GqlExceptionFilter {
  constructor(
    private readonly sentryService: SentryService,
    private readonly logger: CustomLogger,
    private readonly configService: ConfigService,
  ) {
    this.logger.setContext(GraphqlExceptionFilter.name);
  }

  catch(exception: unknown, host: ArgumentsHost): GraphQLError {
    const gqlHost = GqlArgumentsHost.create(host);
    const context = gqlHost.getContext<GqlContext>();
    const request = context?.req;

    // Add user information if available
    if (request?.user) {
      this.sentryService.setUser({
        id: request.user.id,
        email: request.user.email,
        username: request.user.username,
      });
    }

    // Set request context to Sentry
    if (request) {
      const requestData = {
        path: request.path,
        method: request.method,
        headers: request.headers,
        query: request.query,
        body: request.body,
      };
      this.sentryService.setExtra('request', requestData);
    }

    // Transform and log the exception
    const { error, message, statusCode, stack } =
      this.transformException(exception);

    // Log exception
    this.logger.error(
      {
        message: `GraphQL Exception: ${message}`,
        error,
        statusCode,
        path: request?.path,
      },
      stack,
    );

    // Capture exception in Sentry
    this.sentryService.captureException(exception, {
      level: 'error',
      extra: {
        statusCode,
        path: request?.path,
        context:
          typeof context === 'object' && context !== null
            ? JSON.stringify(context)
            : undefined,
      },
    });

    // Create and return a GraphQL error
    const extensions: {
      code: string;
      exception: ExceptionExtension;
    } = {
      code: this.errorCodeToString(statusCode),
      exception: {
        stacktrace: stack?.split('\n') || [],
      },
    };

    // Only include original error in development mode
    if (this.configService.isDevelopment()) {
      // Handle different error types safely
      if (error === undefined || error === null) {
        extensions.exception.originalError = String(error);
      } else if (error instanceof Error) {
        extensions.exception.originalError = error.message;
      } else if (typeof error === 'object') {
        try {
          extensions.exception.originalError = JSON.stringify(error);
        } catch {
          extensions.exception.originalError = '[Unstringifiable Object]';
        }
      } else {
        extensions.exception.originalError = String(error);
      }
    }

    return new GraphQLError(message, {
      extensions,
    });
  }

  private transformException(exception: unknown): {
    error: unknown;
    message: string;
    statusCode: number;
    stack?: string;
  } {
    if (exception instanceof HttpException) {
      return {
        error: exception,
        message: exception.message || 'Internal server error',
        statusCode: exception.getStatus(),
        stack: exception.stack,
      };
    }

    if (exception instanceof Error) {
      return {
        error: exception,
        message: exception.message || 'Internal server error',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        stack: exception.stack,
      };
    }

    // For unknown errors
    return {
      error: exception,
      message: 'Internal server error',
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      stack: undefined,
    };
  }

  private errorCodeToString(statusCode: number): string {
    switch (statusCode) {
      case HttpStatus.BAD_REQUEST as number:
        return 'BAD_REQUEST';
      case HttpStatus.UNAUTHORIZED as number:
        return 'UNAUTHORIZED';
      case HttpStatus.FORBIDDEN as number:
        return 'FORBIDDEN';
      case HttpStatus.NOT_FOUND as number:
        return 'NOT_FOUND';
      case HttpStatus.CONFLICT as number:
        return 'CONFLICT';
      case HttpStatus.INTERNAL_SERVER_ERROR as number:
        return 'INTERNAL_SERVER_ERROR';
      default:
        return 'INTERNAL_SERVER_ERROR';
    }
  }
}
