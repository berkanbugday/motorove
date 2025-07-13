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
  fallbackMessage = i18n.t('errors.general.somethingWrong'),
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
    return extractGraphQLErrorMessage(error.graphQLErrors[0]);
  }

  // Handle network errors
  if (error.networkError) {
    if (error.networkError.result && error.networkError.result.errors) {
      return extractGraphQLErrorMessage(error.networkError.result.errors[0]);
    }
    return i18n.t('errors.network.checkConnection');
  }

  // Handle HTTP errors
  if (error.response) {
    return extractHttpErrorMessage(error);
  }

  // Handle errors with a message property
  if (error.message) {
    return humanizeErrorMessage(error.message);
  }

  // Fall back to a generic message
  return fallbackMessage;
}

/**
 * Extract a user-friendly message from a GraphQL error
 */
function extractGraphQLErrorMessage(graphQLError: any): string {
  if (!graphQLError) {
    return i18n.t('errors.general.default');
  }

  // Try to get the message from various possible locations
  const message =
    graphQLError.message ||
    (graphQLError.extensions && graphQLError.extensions.message) ||
    i18n.t('errors.general.default');

  return humanizeErrorMessage(message);
}

/**
 * Extract a user-friendly message from an HTTP error
 */
function extractHttpErrorMessage(error: any): string {
  // Try to get a message from the response data
  if (error.response.data) {
    if (typeof error.response.data === 'string') {
      return humanizeErrorMessage(error.response.data);
    }

    if (error.response.data.message) {
      return humanizeErrorMessage(error.response.data.message);
    }

    if (error.response.data.error) {
      return humanizeErrorMessage(
        typeof error.response.data.error === 'string'
          ? error.response.data.error
          : error.response.data.error.message ||
              i18n.t('errors.general.default'),
      );
    }
  }

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

/**
 * Convert technical error messages to user-friendly ones
 */
function humanizeErrorMessage(message: string): string {
  if (!message) {
    return i18n.t('errors.general.default');
  }

  // Remove technical prefixes
  message = message.replace(/^error:/i, '').trim();
  message = message.replace(/^exception:/i, '').trim();

  if (message.includes('Invalid login credentials')) {
    return i18n.t('errors.auth.invalidCredentials');
  }

  if (message.includes('Email not confirmed')) {
    return i18n.t('errors.auth.emailNotConfirmed');
  }

  // Make first letter uppercase if it's not
  if (message.length > 0 && /[a-z]/.test(message[0])) {
    message = message.charAt(0).toUpperCase() + message.slice(1);
  }

  // Add a period at the end if there isn't one already
  if (message.length > 0 && !message.endsWith('.')) {
    message += '.';
  }

  return message;
}
