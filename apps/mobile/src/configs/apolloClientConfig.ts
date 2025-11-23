import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  from,
} from '@apollo/client';
import {setContext} from '@apollo/client/link/context';
import {onError} from '@apollo/client/link/error';
import {AppConfig} from './appConfig';
import {captureException} from '@sentry/react-native';
import NetInfo from '@react-native-community/netinfo';
import {errorService, ErrorType, loggingService} from '@services/index';
import {RetryLink} from '@apollo/client/link/retry';
import {Platform} from 'react-native';
import {getBasePathFromSignedUrl} from '@utils/imageUtils';
import EncryptedStorage from 'react-native-encrypted-storage';

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
const errorLink = onError(({graphQLErrors, networkError, operation}) => {
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
        errorService.handleError(networkError, ErrorType.NETWORK, {
          showToast: true,
        });
      } else {
        loggingService.warning('Device is offline. Network error expected.');
      }
    });
  }
});

// Get access token from Supabase session
// Supabase automatically refreshes the token if expired
async function getAccessToken(): Promise<string | null> {
  try {
    const authString = await EncryptedStorage.getItem('supabase.auth.token');
    if (!authString) {
      return null;
    }

    const auth = JSON.parse(authString);
    return auth?.access_token || null;
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
      Query: {
        fields: {
          events: {
            // Custom merge function for events query to handle pagination and updates
            merge(existing, incoming, {args, canRead, isReference}) {
              // If no existing data or different query params, just return incoming
              if (!existing || !args) {
                return incoming;
              }

              // If incoming is null/undefined, keep existing
              if (!incoming) {
                return existing;
              }

              // If skip is 0, it's a fresh fetch (refetch or initial load)
              if (args.skip === 0) {
                return incoming;
              }

              // For pagination (skip > 0), merge the arrays
              const existingArray = Array.isArray(existing)
                ? existing
                : Object.values(existing || {});
              const incomingArray = Array.isArray(incoming)
                ? incoming
                : Object.values(incoming || {});

              // Deduplicate by event ID using a Map
              const eventMap = new Map();

              existingArray.forEach((event: any) => {
                // Only include valid references that exist in the cache
                if (event && isReference(event) && canRead(event)) {
                  const id = event.__ref.split(':')[1];
                  if (id) {
                    eventMap.set(id, event);
                  }
                }
              });

              incomingArray.forEach((event: any) => {
                // Incoming data should always be valid, but check just in case
                if (event && isReference(event)) {
                  const id = event.__ref.split(':')[1];
                  if (id) {
                    eventMap.set(id, event);
                  }
                }
              });

              return Array.from(eventMap.values());
            },
          },
        },
      },
      Post: {
        // Handle nullable ids with a custom key field function
        keyFields: (object: any) => {
          // If id exists, use it as the key
          if (object.id) {
            return ['id'];
          }
          return false;
        },
        fields: {
          // Merge functions to handle counters like likesCount
          likesCount: {
            merge(_, incoming) {
              return incoming;
            },
          },
        },
      },
      EventDto: {
        // Handle EventDto with id as key field (similar to Post)
        keyFields: ['id'],
        fields: {
          images: {
            // Merge strategy for EventDto images - deduplicate by base path (without query params)
            // to handle signed URLs with different tokens
            // When backend returns images from mutation, it's the complete list, so we use incoming as source of truth
            merge(existing, incoming) {
              if (!existing) {
                return incoming;
              }

              if (!incoming) {
                return existing;
              }

              const incomingArray = Array.isArray(incoming)
                ? incoming
                : Object.values(incoming || {});

              const imageMap = new Map<string, any>();

              // Start with incoming images (complete list from backend mutation/query)
              // This ensures deleted images are removed, existing images are kept with latest signed URLs,
              // and new images are added. The backend returns the complete list after update.
              incomingArray.forEach((img: any) => {
                if (img && img.url) {
                  const basePath = getBasePathFromSignedUrl(img.url);
                  if (basePath) {
                    imageMap.set(basePath, img);
                  }
                }
              });

              // For any existing images that match by base path but have different signed URLs,
              // we've already added the incoming (latest) version above.
              // This handles the case where the same image comes back with a new signed URL token.

              return Array.from(imageMap.values());
            },
          },
          participants: {
            // Custom merge function to properly handle participants array
            merge(existing, incoming) {
              // If no existing data, just return incoming
              if (!existing) {
                return incoming;
              }

              // If incoming is null/undefined, keep existing
              if (!incoming) {
                return existing;
              }

              // Both exist - merge them properly
              // Apollo stores arrays as objects with numeric keys, so we need to handle that
              const existingArray = Array.isArray(existing)
                ? existing
                : Object.values(existing || {});
              const incomingArray = Array.isArray(incoming)
                ? incoming
                : Object.values(incoming || {});

              // Create a map to deduplicate participants by reference ID
              const participantMap = new Map();

              // Add existing participants
              existingArray.forEach((participant: any) => {
                if (participant && participant.__ref) {
                  participantMap.set(participant.__ref, participant);
                }
              });

              // Add/update with incoming participants
              incomingArray.forEach((participant: any) => {
                if (participant && participant.__ref) {
                  participantMap.set(participant.__ref, participant);
                }
              });

              // Return as array
              return Array.from(participantMap.values());
            },
          },
          participantsCount: {
            merge(_, incoming) {
              return incoming;
            },
          },
        },
      },
      PostDto: {
        // Handle PostDto with id as key field (similar to Post and EventDto)
        keyFields: ['id'],
        fields: {
          images: {
            // Merge strategy for PostDto images - deduplicate by base path (without query params)
            // to handle signed URLs with different tokens
            merge(existing, incoming) {
              if (!existing) {
                return incoming;
              }

              if (!incoming) {
                return existing;
              }

              const existingArray = Array.isArray(existing)
                ? existing
                : Object.values(existing || {});
              const incomingArray = Array.isArray(incoming)
                ? incoming
                : Object.values(incoming || {});

              const imageMap = new Map<string, any>();

              // Add existing images, keyed by base path
              existingArray.forEach((img: any) => {
                if (img && img.url) {
                  const basePath = getBasePathFromSignedUrl(img.url);
                  if (basePath) {
                    imageMap.set(basePath, img);
                  }
                }
              });

              // Add/update with incoming images (prefer incoming for latest signed URLs)
              incomingArray.forEach((img: any) => {
                if (img && img.url) {
                  const basePath = getBasePathFromSignedUrl(img.url);
                  if (basePath) {
                    imageMap.set(basePath, img);
                  }
                }
              });

              return Array.from(imageMap.values());
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
