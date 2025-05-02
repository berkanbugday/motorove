import {useCallback} from 'react';
import {
  errorService,
  ErrorType,
  ErrorHandlingOptions,
} from '@services/error.service';
import {loggingService} from '@services/logging.service';

/**
 * Hook that provides error handling capabilities to functional components
 */
export const useErrorHandler = () => {
  /**
   * Handle an error with optional context
   */
  const handleError = useCallback(
    async (
      error: any,
      errorType: ErrorType = ErrorType.UNKNOWN,
      options: ErrorHandlingOptions = {},
    ) => {
      return errorService.handleError(error, errorType, options);
    },
    [],
  );

  /**
   * Show an error toast message
   */
  const showErrorToast = useCallback((message: string) => {
    errorService.showErrorToast(message);
  }, []);

  /**
   * Show a success toast message
   */
  const showSuccessToast = useCallback((message: string) => {
    errorService.showSuccessToast(message);
  }, []);

  /**
   * Show an info toast message
   */
  const showInfoToast = useCallback((message: string) => {
    errorService.showInfoToast(message);
  }, []);

  /**
   * Log an error with additional context
   */
  const logError = useCallback(
    (message: string, error?: Error, context?: Record<string, any>) => {
      loggingService.error(message, error, context);
    },
    [],
  );

  /**
   * Create a safe async function wrapper that handles errors
   */
  const withErrorHandling = useCallback(
    <T extends any[], R>(
      fn: (...args: T) => Promise<R>,
      options: {
        errorType?: ErrorType;
        errorOptions?: ErrorHandlingOptions;
        onSuccess?: (result: R) => void;
        successMessage?: string;
      } = {},
    ) => {
      return async (...args: T): Promise<R | null> => {
        try {
          const result = await fn(...args);

          // Call onSuccess callback if provided
          if (options.onSuccess) {
            options.onSuccess(result);
          }

          // Show success message if provided
          if (options.successMessage) {
            showSuccessToast(options.successMessage);
          }

          return result;
        } catch (error) {
          await handleError(
            error,
            options.errorType || ErrorType.UNKNOWN,
            options.errorOptions,
          );
          return null;
        }
      };
    },
    [handleError, showSuccessToast],
  );

  return {
    handleError,
    showErrorToast,
    showSuccessToast,
    showInfoToast,
    logError,
    withErrorHandling,
  };
};

export default useErrorHandler;
