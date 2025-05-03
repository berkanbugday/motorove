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

// Enhanced error handling link
const errorLink = onError(
  ({graphQLErrors, networkError, operation, forward}) => {
    // Handle GraphQL errors
    if (graphQLErrors) {
      for (const err of graphQLErrors) {
        const {message, locations, path, extensions} = err;
        // Log error details to console for debugging
        const pathString = path ? path.join('.') : '';
        loggingService.error(
          `[GraphQL error]: Message: ${message}, Path: ${pathString}`,
        );

        // Send to Sentry with relevant metadata
        captureException(err, {
          tags: {
            graphql: true,
            operationName: operation.operationName,
            errorCode: extensions?.code as string,
          },
          extra: {
            operationName: operation.operationName,
            variables: operation.variables,
            path,
            locations,
            extensions,
          },
        });

        // Handle authentication errors with automatic token refresh
        if (extensions?.code === 'UNAUTHENTICATED') {
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

                // Clear auth if refresh token is invalid
                authService.signOut();

                // Forward the original error
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
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'network-only',
      errorPolicy: 'all',
    },
    query: {
      fetchPolicy: 'network-only',
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
