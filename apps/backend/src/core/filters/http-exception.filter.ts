import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { CustomLogger } from '../utils/logger.service';
import { ConfigService } from '../config/config.service';
import { I18nService } from '../i18n/i18n.service';
import { TranslatedException } from '../exceptions/translated-exception';
import { Language } from '../../enums/models/language.enum';
import { AuthUser } from '../../auth/models/auth-user.model';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly logger: CustomLogger,
    private readonly configService: ConfigService,
    private readonly i18nService: I18nService,
  ) {
    this.logger.setContext(HttpExceptionFilter.name);
  }

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<
      Request & {
        user?: AuthUser;
      }
    >();
    const status = exception.getStatus();

    // Get user's preferred language or default to TR
    const preferredLanguage = request.user?.preferredLanguage || Language.TR;

    // Get the exception response
    const exceptionResponse = exception.getResponse();
    let message = exception.message;
    let translationValues: Record<string, any> | undefined;

    // Handle TranslatedException
    if (exception instanceof TranslatedException) {
      if (exception.hasTranslationKey()) {
        translationValues = this.translateResourceValues(
          exception.translationValues,
          preferredLanguage,
        );
        message = this.i18nService.translate(
          exception.translationKey,
          preferredLanguage,
          translationValues,
        );
      } else {
        message = exception.originalMessage;
      }
    } else if (
      typeof exceptionResponse === 'object' &&
      'message' in exceptionResponse
    ) {
      // Try to translate the message if it looks like a translation key
      const responseMessage = (exceptionResponse as Record<string, unknown>)
        .message;
      if (
        typeof responseMessage === 'string' &&
        responseMessage.startsWith('errors.')
      ) {
        message = this.tryTranslateMessage(responseMessage, preferredLanguage);
      } else if (typeof responseMessage === 'string') {
        message = responseMessage;
      }
    }

    // Log the exception
    this.logger.error(
      {
        message: `HTTP Exception: ${message}`,
        statusCode: status,
        path: request.url,
        method: request.method,
      },
      exception.stack,
    );

    // Build error response
    const errorResponse: Record<string, unknown> = {
      statusCode: status,
      message,
      error: this.getErrorName(status),
    };

    // Add timestamp and path in development mode
    if (this.configService.isDevelopment()) {
      errorResponse.timestamp = new Date().toISOString();
      errorResponse.path = request.url;
    }

    response.status(status).json(errorResponse);
  }

  private translateResourceValues(
    values?: Record<string, any>,
    language?: Language,
  ): Record<string, any> | undefined {
    if (!values || !language) {
      return values;
    }

    const translatedValues = { ...values };

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
        if (translatedResource !== resourceKey) {
          translatedValues.resource = translatedResource;
        }
      } catch {
        this.logger.debug(`Resource translation failed for: ${resourceKey}`);
      }
    }

    return translatedValues;
  }

  private tryTranslateMessage(message: string, language: Language): string {
    if (message.startsWith('errors.')) {
      try {
        return this.i18nService.translate(message, language);
      } catch {
        this.logger.debug(`Translation key not found: ${message}`);
      }
    }
    return message;
  }

  private getErrorName(statusCode: number): string {
    switch (statusCode) {
      case HttpStatus.BAD_REQUEST as number:
        return 'Bad Request';
      case HttpStatus.UNAUTHORIZED as number:
        return 'Unauthorized';
      case HttpStatus.FORBIDDEN as number:
        return 'Forbidden';
      case HttpStatus.NOT_FOUND as number:
        return 'Not Found';
      case HttpStatus.CONFLICT as number:
        return 'Conflict';
      case HttpStatus.INTERNAL_SERVER_ERROR as number:
        return 'Internal Server Error';
      default:
        return 'Error';
    }
  }
}
