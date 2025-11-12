/**
 * Error utilities for converting various error types to user-friendly messages
 */
import i18n from '../i18n/i18n';

/**
 * Convert any error to a user-friendly message
 * @param error The error object to convert
 * @param fallbackMessage Optional fallback message if no specific message can be derived
 * @returns A user-friendly error message
 */
export function errorToMessage(
  error: any,
  fallbackMessage = i18n.t('errors.general.something_wrong'),
): string {
  if (!error) {
    return fallbackMessage;
  }

  // Handle different types of errors
  if (typeof error === 'string') {
    return error;
  }
  // Handle GraphQL errors
  if (error.graphQLErrors && error.graphQLErrors.length > 0) {
    return error.graphQLErrors[0].message;
  }

  // Handle network errors
  if (error.networkError) {
    if (error.networkError.result && error.networkError.result.errors) {
      return error.networkError.result.errors[0].message;
    }
    return i18n.t('errors.network.check_connection');
  }

  // Handle HTTP errors
  if (error.response) {
    return extractHttpErrorMessage(error);
  }

  // Fall back to a generic message
  return fallbackMessage;
}

/**
 * Extract a user-friendly message from an HTTP error
 */
function extractHttpErrorMessage(error: any): string {
  // Use HTTP status code to generate a message
  switch (error.response.status) {
    case 400:
      return i18n.t('errors.http.400');
    case 401:
      return i18n.t('errors.http.401');
    case 403:
      return i18n.t('errors.http.403');
    case 404:
      return i18n.t('errors.http.404');
    case 408:
      return i18n.t('errors.http.408');
    case 500:
      return i18n.t('errors.http.500');
    case 502:
    case 503:
    case 504:
      return i18n.t('errors.http.503');
    default:
      return `${i18n.t('errors.general.error')}: ${error.response.status}`;
  }
}
