import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  from,
} from '@apollo/client';
import {setContext} from '@apollo/client/link/context';
import {onError} from '@apollo/client/link/error';
import AsyncStorage from '@react-native-async-storage/async-storage';
import EncryptedStorage from 'react-native-encrypted-storage';
import {AppConfig} from './appConfig';
import {AUTH_STORAGE_KEYS} from '../types/auth.types';
// Create an HTTP link that points to our GraphQL endpoint
const httpLink = createHttpLink({
  uri: `${AppConfig.API_URL}/graphql`,
});

// Error handling link
const errorLink = onError(({graphQLErrors, networkError}) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({message, locations, path}) => {
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
      );
    });
  }
  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
  }
});

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
    console.error('Error getting access token:', error);
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
  link: from([errorLink, authLink, httpLink]),
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
