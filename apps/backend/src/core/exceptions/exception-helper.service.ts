import { HttpStatus } from '@nestjs/common';
import { TranslatedException } from './translated-exception';

/**
 * Helper service for throwing translated exceptions
 * Provides convenient methods for common HTTP exceptions
 */
export class ExceptionHelper {
  /**
   * Throw a BadRequestException with translation
   */
  static badRequest(
    translationKey: string,
    translationValues?: Record<string, any>,
  ): never {
    throw new TranslatedException(
      translationKey,
      HttpStatus.BAD_REQUEST,
      translationValues,
    );
  }

  /**
   * Throw an UnauthorizedException with translation
   */
  static unauthorized(
    translationKey: string,
    translationValues?: Record<string, any>,
  ): never {
    throw new TranslatedException(
      translationKey,
      HttpStatus.UNAUTHORIZED,
      translationValues,
    );
  }

  /**
   * Throw a ForbiddenException with translation
   */
  static forbidden(
    translationKey: string,
    translationValues?: Record<string, any>,
  ): never {
    throw new TranslatedException(
      translationKey,
      HttpStatus.FORBIDDEN,
      translationValues,
    );
  }

  /**
   * Throw a NotFoundException with translation
   */
  static notFound(
    translationKey: string,
    translationValues?: Record<string, any>,
  ): never {
    throw new TranslatedException(
      translationKey,
      HttpStatus.NOT_FOUND,
      translationValues,
    );
  }

  /**
   * Throw a ConflictException with translation
   */
  static conflict(
    translationKey: string,
    translationValues?: Record<string, any>,
  ): never {
    throw new TranslatedException(
      translationKey,
      HttpStatus.CONFLICT,
      translationValues,
    );
  }

  /**
   * Throw a custom TranslatedException
   */
  static throw(
    translationKey: string,
    statusCode: HttpStatus,
    translationValues?: Record<string, any>,
  ): never {
    throw new TranslatedException(
      translationKey,
      statusCode,
      translationValues,
    );
  }
}
