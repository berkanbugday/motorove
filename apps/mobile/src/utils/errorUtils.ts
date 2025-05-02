/**
 * Error utilities for converting various error types to user-friendly messages
 */

/**
 * Convert any error to a user-friendly message
 * @param error The error object to convert
 * @param fallbackMessage Optional fallback message if no specific message can be derived
 * @returns A user-friendly error message
 */
export function errorToMessage(
  error: any,
  fallbackMessage = 'Something went wrong. Please try again.',
): string {
  if (fallbackMessage) {
    return fallbackMessage;
  }

  // Handle different types of errors
  if (typeof error === 'string') {
    return error;
  }

  // Handle GraphQL errors
  if (error && error.message.length > 0) {
    return extractGraphQLErrorMessage(error);
  }

  // Handle network errors
  if (error.networkError) {
    if (error.networkError.result && error.networkError.result.errors) {
      return extractGraphQLErrorMessage(error.networkError.result.errors[0]);
    }
    return 'Network error. Please check your connection and try again.';
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
    return 'An error occurred';
  }

  // Try to get the message from various possible locations
  const message =
    graphQLError.message ||
    (graphQLError.extensions && graphQLError.extensions.message) ||
    'An error occurred';

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
          : error.response.data.error.message || 'An error occurred',
      );
    }
  }

  // Use HTTP status code to generate a message
  switch (error.response.status) {
    case 400:
      return 'Invalid request. Please check your information.';
    case 401:
      return 'You need to sign in to access this feature.';
    case 403:
      return 'You do not have permission to perform this action.';
    case 404:
      return 'The requested information could not be found.';
    case 408:
      return 'The request timed out. Please try again.';
    case 500:
      return 'Server error. Please try again later.';
    case 502:
    case 503:
    case 504:
      return 'The service is temporarily unavailable. Please try again later.';
    default:
      return `Error: ${error.response.status}`;
  }
}

/**
 * Convert technical error messages to user-friendly ones
 */
function humanizeErrorMessage(message: string): string {
  if (!message) {
    return 'An error occurred';
  }

  // Remove technical prefixes
  message = message.replace(/^error:/i, '').trim();
  message = message.replace(/^exception:/i, '').trim();

  if (message.includes('Invalid login credentials')) {
    return 'Invalid email or password';
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
