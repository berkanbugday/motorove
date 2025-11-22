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
import { I18nService } from '../i18n/i18n.service';
import { TranslatedException } from '../exceptions/translated-exception';
import { Language } from '../../enums/models/language.enum';
import { AuthUser } from '../../auth/models/auth-user.model';

interface GqlContext {
  req: Request & {
    user?: AuthUser;
  };
  operation?: {
    name?: { value: string };
    operation: string;
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
    private readonly i18nService: I18nService,
  ) {
    this.logger.setContext(GraphqlExceptionFilter.name);
  }

  catch(exception: unknown, host: ArgumentsHost): GraphQLError {
    // Only handle GraphQL requests, let HTTP filter handle REST requests
    if (host.getType<string>() !== 'graphql') {
      throw exception;
    }

    const gqlHost = GqlArgumentsHost.create(host);
    const context = gqlHost.getContext<GqlContext>();
    const request = context?.req;

    // Add user information if available
    if (request?.user) {
      this.sentryService.setUser({
        id: request.user.id,
        email: request.user.email,
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
    const { error, message, statusCode, stack } = this.transformException(
      exception,
      request?.user,
    );

    // Log exception
    this.logger.error(
      {
        message: `GraphQL Exception: ${message}`,
        error: error as Record<string, unknown>,
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
        context: this.extractSafeContext(context),
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
        extensions.exception.originalError =
          typeof error === 'string' ? error : JSON.stringify(error);
      }
    }

    return new GraphQLError(message, {
      extensions,
    });
  }

  private extractSafeContext(
    context: GqlContext | null | undefined,
  ): Record<string, unknown> | undefined {
    if (!context) return undefined;

    // Extract only safe properties from context that won't cause circular reference issues
    const safeContext: Record<string, unknown> = {};

    try {
      // Add user info if available
      if (context.req?.user) {
        safeContext.user = {
          id: context.req.user.id,
          email: context.req.user.email,
        };
      }

      // Add GraphQL operation info if available
      if (context.operation) {
        safeContext.operationName = context.operation.name?.value;
        safeContext.operationType = context.operation.operation;
      }

      // Add any additional safe context properties you need

      return safeContext;
    } catch {
      return { error: 'Failed to extract safe context' };
    }
  }

  private transformException(
    exception: unknown,
    user?: AuthUser,
  ): {
    error: unknown;
    message: string;
    statusCode: number;
    stack?: string;
  } {
    // Get user's preferred language or default to EN
    const preferredLanguage = user?.preferredLanguage || Language.EN;

    if (exception instanceof TranslatedException) {
      // Translate the exception message
      const translatedMessage = this.translateException(
        exception,
        preferredLanguage,
      );
      return {
        error: exception,
        message: translatedMessage,
        statusCode: exception.getStatus(),
        stack: exception.stack,
      };
    }

    if (exception instanceof HttpException) {
      // Check if it's a regular HttpException that might have a translation key
      // For backward compatibility, we'll try to translate common error messages
      const message =
        exception.message || 'errors.common.internal_server_error';

      // Try to extract translation values from the exception if it's a TranslatedException
      let translationValues: Record<string, any> | undefined;
      if (exception instanceof TranslatedException) {
        translationValues = exception.translationValues;
      }

      // Translate resource values if present
      const translatedValues = this.translateResourceValues(
        translationValues,
        preferredLanguage,
      );

      const translatedMessage = this.tryTranslateMessage(
        message,
        preferredLanguage,
        translatedValues,
      );
      return {
        error: exception,
        message: translatedMessage,
        statusCode: exception.getStatus(),
        stack: exception.stack,
      };
    }

    if (exception instanceof Error) {
      const message =
        exception.message || 'errors.common.internal_server_error';
      const translatedMessage = this.tryTranslateMessage(
        message,
        preferredLanguage,
      );
      return {
        error: exception,
        message: translatedMessage,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        stack: exception.stack,
      };
    }

    // For unknown errors
    const safeMessage =
      typeof exception === 'string'
        ? exception
        : 'errors.common.internal_server_error';
    const translatedMessage = this.tryTranslateMessage(
      safeMessage,
      preferredLanguage,
    );
    return {
      error: exception,
      message: translatedMessage,
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      stack: undefined,
    };
  }

  /**
   * Translate a TranslatedException
   */
  private translateException(
    exception: TranslatedException,
    language: Language,
  ): string {
    try {
      if (exception.hasTranslationKey()) {
        // Translate resource parameters if present
        const translatedValues = this.translateResourceValues(
          exception.translationValues,
          language,
        );
        return this.i18nService.translate(
          exception.translationKey,
          language,
          translatedValues,
        );
      }
    } catch (error) {
      this.logger.warn(
        `Failed to translate exception: ${exception.translationKey}`,
        error,
      );
    }
    // Fallback to original message
    return exception.originalMessage;
  }

  /**
   * Translate resource values in translation parameters
   */
  private translateResourceValues(
    values?: Record<string, any>,
    language?: Language,
  ): Record<string, any> | undefined {
    if (!values || !language) {
      return values;
    }

    const translatedValues = { ...values };

    // If resource key exists and is a string, try to translate it
    if (
      translatedValues.resource &&
      typeof translatedValues.resource === 'string'
    ) {
      const resourceKey = `resources.${translatedValues.resource}`;
      try {
        const translatedResource = this.i18nService.translate(
          resourceKey,
          language,
        );
        // Only use translated value if translation was successful (not the key itself)
        if (translatedResource !== resourceKey) {
          translatedValues.resource = translatedResource;
        }
      } catch {
        // If translation fails, keep original resource value
        this.logger.debug(`Resource translation failed for: ${resourceKey}`);
      }
    }

    return translatedValues;
  }

  /**
   * Try to translate a message if it looks like a translation key
   */
  private tryTranslateMessage(
    message: string,
    language: Language,
    translationValues?: Record<string, any>,
  ): string {
    // If the message looks like a translation key (starts with 'errors.'), try to translate it
    if (message.startsWith('errors.')) {
      try {
        // Translate resource values if present
        const translatedValues = this.translateResourceValues(
          translationValues,
          language,
        );
        return this.i18nService.translate(message, language, translatedValues);
      } catch {
        // If translation fails, return original message
        this.logger.debug(`Translation key not found: ${message}`);
      }
    }
    // Return original message if it's not a translation key or translation failed
    return message;
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
