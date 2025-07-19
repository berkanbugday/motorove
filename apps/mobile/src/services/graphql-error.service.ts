import {GraphQLFormattedError} from 'graphql';
import {errorService, ErrorType} from './error.service';
import authService from './auth.service';
import {loggingService} from './index';
import {ApolloError} from '@apollo/client';
import i18n from '../i18n/i18n';

/**
 * Service for handling GraphQL errors outside of React components
 * This implementation mirrors the logic in useGraphQLErrorHandler hook
 * but is usable outside of React components.
 */
class GraphQLErrorService {
  /**
   * Handle specific GraphQL error codes
   */
  async handleGraphQLError(
    error: GraphQLFormattedError,
    options: {
      fallbackMessage?: string;
      showToast?: boolean;
    } = {},
  ): Promise<boolean> {
    // Default error type
    let errorType = ErrorType.API;
    let handled = false;

    // Get error code(s) from the GraphQL error
    const errorCode = error.extensions?.code;
    const errorMessage = error.message;

    // Handle based on error code
    if (errorCode) {
      switch (errorCode) {
        case 'UNAUTHORIZED':
          // Handle authentication errors
          errorType = ErrorType.AUTHORIZATION;

          loggingService.error(errorMessage);
          await errorService.handleError(error, errorType, {
            fallbackMessage: errorMessage,
            showToast: true,
          });
          await authService.signOut();
          handled = true;
          break;
        case 'INVALID_REFRESH_TOKEN':
          loggingService.error('Refresh token error, signing out user');
          await authService.signOut();
          handled = true;
          break;
        case 'FORBIDDEN':
          errorType = ErrorType.AUTHORIZATION;
          loggingService.error('Forbidden error:', error);
          await errorService.handleError(error, errorType, {
            fallbackMessage: i18n.t('errors.graphql.forbidden'),
          });
          handled = true;
          break;
        case 'CONFLICT':
          errorType = ErrorType.VALIDATION;
          loggingService.error('Conflict error:', error);
          await errorService.handleError(error, errorType, {
            showToast: true,
            fallbackMessage: errorMessage || i18n.t('errors.graphql.conflict'),
          });
          handled = true;
          break;
        case 'BAD_USER_INPUT':
          errorType = ErrorType.VALIDATION;
          loggingService.error('Bad user input error:', error);
          await errorService.handleError(error, errorType, {
            fallbackMessage: i18n.t('errors.graphql.bad_user_input'),
          });
          handled = true;
          break;
        case 'INTERNAL_SERVER_ERROR':
          loggingService.error('Internal server error:', error);
          await errorService.handleError(error, errorType, {
            fallbackMessage: i18n.t('errors.graphql.internal_server_error'),
          });
          handled = true;
          break;
        case 'PERSISTED_QUERY_NOT_FOUND':
        case 'PERSISTED_QUERY_NOT_SUPPORTED':
          // Handle Apollo specific errors
          loggingService.error('Apollo client error:', errorCode);
          await errorService.handleError(error, ErrorType.API, {
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
      loggingService.error('Unhandled GraphQL error:', error);
      await errorService.handleError(error, errorType, {
        showToast: options.showToast,
        fallbackMessage:
          options.fallbackMessage || i18n.t('errors.api.default'),
      });
    }

    return false; // Error was not recovered from
  }

  /**
   * Create a wrapper for GraphQL operations that handles errors
   */
  withGraphQLErrorHandling<T extends any[], R>(
    fn: (...args: T) => Promise<R>,
    options: {
      onSuccess?: (result: R) => void;
      successMessage?: string;
      fallbackErrorMessage?: string;
    } = {},
  ) {
    return async (...args: T): Promise<R | null> => {
      try {
        const result = await fn(...args);

        // Call onSuccess callback if provided
        if (options.onSuccess) {
          options.onSuccess(result);
        }

        // Show success message if provided
        if (options.successMessage) {
          errorService.showSuccessToast(options.successMessage);
        }

        return result;
      } catch (error) {
        if (error instanceof ApolloError && error.graphQLErrors?.length > 0) {
          await this.handleGraphQLError(error.graphQLErrors[0], {
            fallbackMessage: options.fallbackErrorMessage,
          });
        } else {
          await errorService.handleError(error, ErrorType.API, {
            fallbackMessage:
              options.fallbackErrorMessage || i18n.t('errors.api.default'),
          });
        }
        return null;
      }
    };
  }
}

export const graphQLErrorService = new GraphQLErrorService();
