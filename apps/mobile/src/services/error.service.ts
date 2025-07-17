import {captureException} from '@sentry/react-native';
import NetInfo from '@react-native-community/netinfo';
import {showToast} from '@components';
import {errorToMessage} from '@utils/errorUtils';
import i18n from '../i18n/i18n';

/**
 * Types of errors that can be handled
 */
export enum ErrorType {
  NETWORK = 'NETWORK',
  API = 'API',
  VALIDATION = 'VALIDATION',
  AUTHORIZATION = 'AUTHORIZATION',
  UNKNOWN = 'UNKNOWN',
}

/**
 * Error handling options
 */
export interface ErrorHandlingOptions {
  showToast?: boolean;
  logToSentry?: boolean;
  context?: Record<string, any>;
  fallbackMessage?: string;
}

/**
 * Default options for error handling
 */
const defaultOptions: ErrorHandlingOptions = {
  showToast: false,
  logToSentry: true,
};

/**
 * Error service for handling different types of errors
 */
class ErrorService {
  /**
   * Handle any error with optional context
   */
  async handleError(
    error: any,
    errorType = ErrorType.UNKNOWN,
    options: ErrorHandlingOptions = {},
  ): Promise<void> {
    const opts = {...defaultOptions, ...options};
    const {
      showToast: shouldShowToast,
      logToSentry,
      context,
      fallbackMessage,
    } = opts;

    // Get user-friendly error message
    const errorMessage = errorToMessage(error, fallbackMessage);

    // Check if it's a network error
    if (errorType === ErrorType.NETWORK || this.isNetworkError(error)) {
      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected) {
        this.handleNetworkError(errorMessage, {
          showToast: shouldShowToast,
          logToSentry,
          context: {...context, netInfo},
        });
        return;
      }
    }

    // Log to Sentry if enabled
    if (logToSentry) {
      captureException(error, {
        tags: {errorType},
        extra: context,
      });
    }

    // Show toast if enabled
    if (shouldShowToast) {
      this.showErrorToast(errorMessage);
    }
  }

  /**
   * Handle network-specific errors
   */
  private handleNetworkError(
    message: string = i18n.t('errors.network.default'),
    options: ErrorHandlingOptions = {},
  ): void {
    const {showToast: shouldShowToast, logToSentry, context} = options;

    // Log to Sentry if enabled
    if (logToSentry) {
      captureException(new Error(message), {
        tags: {errorType: ErrorType.NETWORK},
        extra: context,
      });
    }

    // Show toast if enabled
    if (shouldShowToast) {
      this.showErrorToast(message || i18n.t('errors.network.check_connection'));
    }
  }

  /**
   * Check if an error is likely a network error
   */
  private isNetworkError(error: any): boolean {
    if (!error) {
      return false;
    }

    // Common network error patterns
    return (
      error.message?.includes('Network request failed') ||
      error.message?.includes('Network Error') ||
      error.message?.includes('timeout') ||
      error.message?.includes('connection') ||
      error.message?.toLowerCase().includes('network') ||
      error.code === 'ECONNABORTED' ||
      error.status === 0 ||
      error.name === 'AbortError'
    );
  }

  /**
   * Show an error toast message
   */
  showErrorToast(message: string): void {
    showToast({
      type: 'error',
      text1: i18n.t('common.error'),
      text2: message,
    });
  }

  /**
   * Show a success toast message
   */
  showSuccessToast(message: string): void {
    showToast({
      type: 'success',
      text1: i18n.t('common.success'),
      text2: message,
    });
  }

  /**
   * Show an info toast message
   */
  showInfoToast(message: string): void {
    showToast({
      type: 'info',
      text1: i18n.t('common.info'),
      text2: message,
    });
  }
}

export const errorService = new ErrorService();
