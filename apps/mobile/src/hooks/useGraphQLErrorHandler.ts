import {useCallback} from 'react';
import {ApolloError} from '@apollo/client';
import {useErrorHandler} from './useErrorHandler';
import {ErrorType} from '@services/error.service';
import authService from '@services/auth.service';
import {loggingService} from '@services/logging.service';
import {GraphQLFormattedError} from 'graphql';

/**
 * Custom hook for handling GraphQL errors with more detailed control
 */
export const useGraphQLErrorHandler = () => {
  const {handleError, showSuccessToast} = useErrorHandler();

  /**
   * Handle specific GraphQL error codes
   */
  const handleGraphQLError = useCallback(
    async (error: GraphQLFormattedError) => {
      // Default error type
      let errorType = ErrorType.API;
      let handled = false;

      // Get error code(s) from the GraphQL error
      const errorCode = error.extensions?.code;
      const errorMessage = error.message;

      // Handle based on error code
      if (errorCode) {
        switch (errorCode) {
          case 'UNAUTHENTICATED':
            // Handle authentication errors
            errorType = ErrorType.AUTHENTICATION;

            // Check for specific refresh token errors
            if (
              errorMessage &&
              errorMessage.includes('Invalid Refresh Token: Already Used')
            ) {
              loggingService.warning(
                'Refresh token already used, signing out user',
              );
              await handleError(error, errorType, {
                fallbackMessage:
                  'Your session has expired. Please sign in again.',
                showToast: true,
              });
              authService.signOut();
              handled = true;
              break;
            }

            // Attempt to refresh token if available
            try {
              await authService.refreshToken();
              // Don't show an error toast if we successfully refreshed the token
              return true;
            } catch (refreshError) {
              // If refresh fails, handle as a regular auth error
              await handleError(error, errorType, {
                fallbackMessage:
                  'Your session has expired. Please sign in again.',
              });
              // Redirect to sign in or clear auth state
              authService.signOut();
              handled = true;
            }
            break;
          case 'UNAUTHORIZED':
            errorType = ErrorType.AUTHORIZATION;
            await handleError(error, errorType, {
              showToast: true,
              fallbackMessage:
                errorMessage === 'Invalid login credentials'
                  ? 'Invalid email or password'
                  : errorMessage ||
                    'You do not have permission to perform this action.',
            });
            handled = true;
            break;

          case 'FORBIDDEN':
            errorType = ErrorType.AUTHORIZATION;
            await handleError(error, errorType, {
              fallbackMessage:
                'You do not have permission to perform this action.',
            });
            handled = true;
            break;

          case 'CONFLICT':
            errorType = ErrorType.VALIDATION;
            await handleError(error, errorType, {
              showToast: true,
              fallbackMessage:
                errorMessage ||
                'A conflict occurred. This resource may already exist.',
            });
            handled = true;
            break;

          case 'BAD_USER_INPUT':
            errorType = ErrorType.VALIDATION;
            await handleError(error, errorType, {
              fallbackMessage: 'Please check your information and try again.',
            });
            handled = true;
            break;

          case 'INTERNAL_SERVER_ERROR':
            await handleError(error, errorType, {
              fallbackMessage:
                'Something went wrong on our end. Please try again later.',
            });
            handled = true;
            break;

          case 'PERSISTED_QUERY_NOT_FOUND':
          case 'PERSISTED_QUERY_NOT_SUPPORTED':
            // Handle Apollo specific errors
            loggingService.warning('Apollo client error:', errorCode);
            await handleError(error, ErrorType.API, {
              showToast: false, // Don't show toast for these technical errors
            });
            handled = true;
            break;

          default:
            // Will be handled by the general case below
            break;
        }
      }

      // If not handled by specific cases above, handle as a general API error
      if (!handled) {
        await handleError(error, errorType);
      }

      return false; // Error was not recovered from
    },
    [handleError],
  );

  /**
   * Create a wrapper for GraphQL operations that handles errors
   */
  const withGraphQLErrorHandling = useCallback(
    <T extends any[], R>(
      fn: (...args: T) => Promise<R>,
      options: {
        onSuccess?: (result: R) => void;
        successMessage?: string;
        fallbackErrorMessage?: string;
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
          if (error instanceof ApolloError) {
            await handleGraphQLError(error.graphQLErrors[0]);
          } else {
            await handleError(error, ErrorType.API, {
              fallbackMessage: options.fallbackErrorMessage,
            });
          }
          return null;
        }
      };
    },
    [handleError, handleGraphQLError, showSuccessToast],
  );

  return {
    handleGraphQLError,
    withGraphQLErrorHandling,
  };
};

export default useGraphQLErrorHandler;
