import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Custom exception class that supports translation keys
 * The message will be translated based on user's preferred language in the exception filter
 */
export class TranslatedException extends HttpException {
  /**
   * Translation key (e.g., 'errors.auth.user_not_found')
   */
  public readonly translationKey: string;

  /**
   * Optional interpolation values for the translation
   */
  public readonly translationValues?: Record<string, any>;

  /**
   * Original message (fallback if translation fails)
   */
  public readonly originalMessage: string;

  constructor(
    translationKey: string,
    statusCode: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
    translationValues?: Record<string, any>,
    originalMessage?: string,
  ) {
    // Use original message or translation key as fallback
    const message = originalMessage || translationKey;
    super(message, statusCode);

    this.translationKey = translationKey;
    this.translationValues = translationValues;
    this.originalMessage = originalMessage || translationKey;
  }

  /**
   * Check if this exception has a translation key
   */
  hasTranslationKey(): boolean {
    return !!this.translationKey && this.translationKey.startsWith('errors.');
  }
}
