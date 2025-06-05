import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  from,
  Observable,
} from '@apollo/client';
import {setContext} from '@apollo/client/link/context';
import {onError} from '@apollo/client/link/error';
import AsyncStorage from '@react-native-async-storage/async-storage';
import EncryptedStorage from 'react-native-encrypted-storage';
import {AppConfig} from './appConfig';
import {AUTH_STORAGE_KEYS} from '../types/auth.types';
import {captureException} from '@sentry/react-native';
import NetInfo from '@react-native-community/netinfo';
import authService from '@services/auth.service';
import {loggingService} from '@services/index';
import {RetryLink} from '@apollo/client/link/retry';
import {Platform} from 'react-native';

// Create a retry link to automatically retry failed requests
const retryLink = new RetryLink({
  delay: {
    initial: 300,
    max: 10000,
    jitter: true,
  },
  attempts: {
    max: 3,
    retryIf: (error, _operation) => {
      // Only retry on network errors, not user errors
      return !!error && error.name !== 'UserInputError';
    },
  },
});

// Create an HTTP link that points to our GraphQL endpoint
const httpLink = createHttpLink({
  uri: `${AppConfig.API_URL}/graphql`,
  // Add timeout config
  fetchOptions: {
    timeout: AppConfig.API_TIMEOUT,
  },
});

// Error handling link
const errorLink = onError(
  ({graphQLErrors, networkError, operation, forward}) => {
    // Handle GraphQL errors
    if (graphQLErrors) {
      for (let err of graphQLErrors) {
        const {message, locations, path, extensions} = err;

        // Log all GraphQL errors for debugging
        loggingService.error(`[GraphQL error]: ${message}`, {
          locations,
          path,
          extensions,
          operationName: operation.operationName,
        });

        // Track critical errors
        if (extensions?.code === 'INTERNAL_SERVER_ERROR') {
          captureException(err, {
            tags: {
              graphql: true,
              operationName: operation.operationName,
              platform: Platform.OS,
            },
            extra: {
              operationName: operation.operationName,
              variables: operation.variables,
              path,
              extensions,
            },
          });
        }

        // Handle authentication errors with automatic token refresh
        if (extensions?.code === 'UNAUTHENTICATED') {
          // Skip token refresh for operations that are themselves refreshing tokens
          if (operation.operationName === 'RefreshToken') {
            loggingService.info(
              'Skipping auth handling for refresh token operation',
            );
            return;
          }

          // Return a new observable for the refresh token flow
          return new Observable(observer => {
            // Attempt to refresh the token
            authService
              .refreshToken()
              .then(() => {
                // If successful, retry the original operation and chain the results to our observer
                const subscriber = {
                  next: observer.next.bind(observer),
                  error: observer.error.bind(observer),
                  complete: observer.complete.bind(observer),
                };

                // Retry the operation with the new token
                forward(operation).subscribe(subscriber);
              })
              .catch(refreshError => {
                loggingService.error('Token refresh failed:', refreshError);

                const errorMessage =
                  refreshError instanceof Error
                    ? refreshError.message
                    : String(refreshError);

                let isUnrecoverableRefreshTokenError = false;

                // Check if the error is an ApolloError with graphQLErrors
                if (
                  refreshError.graphQLErrors &&
                  refreshError.graphQLErrors.length > 0
                ) {
                  const gqlError = refreshError.graphQLErrors[0];
                  if (
                    gqlError.message.includes('Token has expired') || // Refresh token itself expired
                    gqlError.message.includes(
                      'Invalid Refresh Token: Already Used',
                    ) ||
                    gqlError.message.includes('Invalid Refresh Token') || // General invalid from backend
                    gqlError.message.includes('User not found') || // User associated with token not found
                    (gqlError.extensions?.code === 'UNAUTHENTICATED' &&
                      gqlError.message.includes('Invalid token'))
                  ) {
                    isUnrecoverableRefreshTokenError = true;
                  }
                } else if (
                  // Fallback for client-side errors from _refreshToken or direct network errors
                  errorMessage.includes('No refresh token available') || // From authService._refreshToken
                  errorMessage.includes('Invalid refresh token response') || // From authService._refreshToken
                  // The following client-side checks in _refreshToken might also indicate unrecoverable states
                  // if they echo what the server would say for a permanently bad token.
                  errorMessage.includes('Token already used') ||
                  errorMessage.includes('Invalid Refresh Token')
                ) {
                  isUnrecoverableRefreshTokenError = true;
                }

                if (isUnrecoverableRefreshTokenError) {
                  loggingService.error(
                    'Unrecoverable refresh token error detected during Apollo error handling. User will not be signed out automatically, but authenticated API calls will likely fail.',
                    {
                      errorMessage,
                      originalError: err,
                      refreshErrorDetail: refreshError,
                    },
                  );
                  // User requested not to sign out automatically even on unrecoverable refresh token errors.
                  // authService.signOut().catch(e => {
                  //   loggingService.error(
                  //     'Error during sign out after unrecoverable refresh token error:',
                  //     e,
                  //   );
                  // });
                } else {
                  // For other errors (e.g., temporary network issue during refresh attempt),
                  // log the error but do not sign out immediately.
                  // Let the original error propagate; RetryLink might handle it.
                  loggingService.warning(
                    'Token refresh failed due to a potentially recoverable error. Not signing out immediately.',
                    {
                      errorMessage,
                      originalError: err,
                      refreshErrorDetail: refreshError,
                    },
                  );
                }

                // Forward the original error that triggered the refresh attempt
                observer.error(err);
                observer.complete();
              });
          });
        }
      }
    }

    // Handle network errors
    if (networkError) {
      loggingService.error(`[Network error]: ${networkError}`);

      // Check connectivity
      NetInfo.fetch().then(state => {
        // Only log to Sentry if connected but still getting network error
        if (state.isConnected) {
          captureException(networkError, {
            tags: {
              network: true,
              operationName: operation.operationName,
              platform: Platform.OS,
            },
            extra: {
              operationName: operation.operationName,
              variables: operation.variables,
              networkError,
            },
          });
        } else {
          loggingService.warning('Device is offline. Network error expected.');
        }
      });
    }
  },
);

// Get access token directly from storage to avoid circular dependency
async function getAccessToken(): Promise<string | null> {
  try {
    // Try encrypted storage first
    const encryptedAuthData = await EncryptedStorage.getItem(
      AUTH_STORAGE_KEYS.AUTH_DATA,
    );

    if (encryptedAuthData) {
      const parsedData = JSON.parse(encryptedAuthData);
      return parsedData.accessToken;
    }

    // Fallback to AsyncStorage
    return await AsyncStorage.getItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
  } catch (error) {
    loggingService.error('Error getting access token:', error);
    return null;
  }
}

// Authentication link to add the token to the header
const authLink = setContext(async (_, {headers}) => {
  // Get the authentication token directly from storage
  const token = await getAccessToken();

  // Return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

// Create the Apollo Client instance
export const apolloClient = new ApolloClient({
  link: from([retryLink, errorLink, authLink, httpLink]),
  cache: new InMemoryCache({
    typePolicies: {
      Post: {
        // Properly identify Post objects in the cache
        keyFields: ['id'],
        fields: {
          // Merge functions to handle counters like likesCount
          likesCount: {
            merge(_, incoming) {
              return incoming;
            },
          },
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
      errorPolicy: 'all',
    },
    query: {
      fetchPolicy: 'cache-first',
      errorPolicy: 'all',
    },
    mutate: {
      errorPolicy: 'all',
    },
  },
});

// Reset Apollo store (useful after logout)
export const resetApolloStore = async () => {
  await apolloClient.resetStore();
};
