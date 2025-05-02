import AsyncStorage from '@react-native-async-storage/async-storage';
import EncryptedStorage from 'react-native-encrypted-storage';
import {apolloClient, resetApolloStore} from '@configs/apolloClientConfig';
import {SIGN_IN, SIGN_UP, REFRESH_TOKEN} from './graphql';
import {
  AuthUser,
  AuthResponse,
  AuthState,
  AUTH_STORAGE_KEYS as STORAGE_KEYS,
} from '../types/auth.types';
import {loggingService} from './logging.service';

class AuthService {
  // Sign up a new user
  async signUp(
    email: string,
    password: string,
    firstName?: string,
    lastName?: string,
  ): Promise<AuthResponse> {
    try {
      const {data, errors} = await apolloClient.mutate({
        mutation: SIGN_UP,
        variables: {
          input: {
            email,
            password,
            firstName,
            lastName,
          },
        },
      });

      if (errors) {
        loggingService.error('Signup error:', errors[0]);
        throw errors[0];
      }

      // Convert GraphQL response to our AuthResponse format
      const authResponse = this.convertGraphQLAuthResponse(data.signUp);
      await this.saveAuthData(authResponse);
      return authResponse;
    } catch (error) {
      loggingService.error('Signup error:', error);
      throw error;
    }
  }

  // Sign in an existing user
  async signIn(email: string, password: string): Promise<AuthResponse> {
    try {
      const {data, errors} = await apolloClient.mutate({
        mutation: SIGN_IN,
        variables: {
          input: {
            email,
            password,
          },
        },
      });

      if (errors) {
        loggingService.error('Signin error:', errors[0]);
        throw errors[0];
      }

      // Convert GraphQL response to our AuthResponse format
      const authResponse = this.convertGraphQLAuthResponse(data.signIn);
      await this.saveAuthData(authResponse);
      return authResponse;
    } catch (error) {
      loggingService.error('Signin error:', error);
      throw error;
    }
  }

  // Sign out the current user
  async signOut(): Promise<void> {
    try {
      // For GraphQL, we don't need a specific signout endpoint
      // Just clear the local auth data and reset Apollo cache
      await this.clearAuthData();
      await resetApolloStore();
    } catch (error) {
      loggingService.error('Signout error:', error);
      // Still clear local auth data even if something fails
      await this.clearAuthData();
    }
  }

  // Refresh token
  async refreshToken(): Promise<AuthResponse> {
    try {
      const authState = await this.getAuthState();
      const refreshToken = authState.refreshToken;

      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const {data, errors} = await apolloClient.mutate({
        mutation: REFRESH_TOKEN,
        variables: {
          token: refreshToken,
        },
      });

      if (errors) {
        loggingService.error('Token refresh error:', errors[0]);
        throw errors[0];
      }

      // Convert GraphQL response to our AuthResponse format
      const authResponse = this.convertGraphQLAuthResponse(data.refreshToken);
      await this.saveAuthData(authResponse);
      return authResponse;
    } catch (error) {
      loggingService.error('Token refresh error:', error);
      // Clear auth data on refresh failure
      await this.clearAuthData();
      throw error;
    }
  }

  // Get the current authentication state
  async getAuthState(): Promise<AuthState> {
    try {
      // Try to get auth data from encrypted storage first
      const encryptedAuthData = await EncryptedStorage.getItem(
        STORAGE_KEYS.AUTH_DATA,
      );

      if (encryptedAuthData) {
        const parsedData = JSON.parse(encryptedAuthData);

        // Check if token is expired and needs refresh
        if (
          parsedData.expiresAt &&
          parsedData.refreshToken &&
          parsedData.expiresAt < Date.now() + 60000
        ) {
          // Token expires in less than a minute, try to refresh it
          try {
            await this.refreshToken();
            // After refresh, get updated state
            return this.getAuthState();
          } catch (refreshError) {
            // If refresh fails, return logged out state
            loggingService.error(
              'Token refresh failed:',
              refreshError as Error,
            );
            return {
              user: null,
              accessToken: null,
              refreshToken: null,
              expiresAt: null,
              isLoading: false,
            };
          }
        }

        return {
          user: parsedData.user,
          accessToken: parsedData.accessToken,
          refreshToken: parsedData.refreshToken,
          expiresAt: parsedData.expiresAt,
          isLoading: false,
        };
      }

      // Fall back to AsyncStorage for backward compatibility
      // This can be removed after a few app updates when all users have migrated
      const user = await AsyncStorage.getItem(STORAGE_KEYS.USER);
      const accessToken = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      const refreshToken = await AsyncStorage.getItem(
        STORAGE_KEYS.REFRESH_TOKEN,
      );
      const expiresAtStr = await AsyncStorage.getItem(STORAGE_KEYS.EXPIRES_AT);

      // If we have data in AsyncStorage, migrate it to EncryptedStorage
      if (user || accessToken || refreshToken) {
        const expiresAt = expiresAtStr ? parseInt(expiresAtStr, 10) : null;
        const parsedUser = user ? JSON.parse(user) : null;

        const migratedState = {
          user: parsedUser,
          accessToken,
          refreshToken,
          expiresAt,
          isLoading: false,
        };

        // Migrate to encrypted storage
        await this.saveAuthDataToEncryptedStorage(migratedState);

        // Clear from AsyncStorage after migration
        await this.clearAsyncStorageAuthData();

        return migratedState;
      }

      return {
        user: null,
        accessToken: null,
        refreshToken: null,
        expiresAt: null,
        isLoading: false,
      };
    } catch (error) {
      loggingService.error('Error getting auth state:', error);
      return {
        user: null,
        accessToken: null,
        refreshToken: null,
        expiresAt: null,
        isLoading: false,
      };
    }
  }

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    const {user, accessToken, expiresAt} = await this.getAuthState();
    const now = Date.now();

    return !!(user && accessToken && expiresAt && expiresAt > now);
  }

  // Get the current user
  async getCurrentUser(): Promise<AuthUser | null> {
    const {user} = await this.getAuthState();
    return user;
  }

  // Get the access token
  async getAccessToken(): Promise<string | null> {
    const {accessToken} = await this.getAuthState();
    return accessToken;
  }

  // Convert GraphQL auth response to our AuthResponse format
  private convertGraphQLAuthResponse(graphQLResponse: any): AuthResponse {
    const {user, session} = graphQLResponse;

    // If session exists, convert expires_in to expires_at
    let processedSession;
    if (session) {
      const expiresIn = session.expires_in || 3600; // Default to 1 hour if not provided
      const expiresAt = Date.now() + expiresIn * 1000;

      processedSession = {
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        expires_at: expiresAt,
      };
    }

    return {
      user,
      session: processedSession,
    };
  }

  // Save authentication data
  private async saveAuthData(authResponse: AuthResponse): Promise<void> {
    try {
      const authState = {
        user: authResponse.user,
        accessToken: authResponse.session?.access_token || null,
        refreshToken: authResponse.session?.refresh_token || null,
        expiresAt: authResponse.session?.expires_at || null,
      };

      // Save to encrypted storage
      await this.saveAuthDataToEncryptedStorage(authState);

      // Debug log
      loggingService.info('Auth data saved to EncryptedStorage', {
        user: !!authState.user,
        accessToken: !!authState.accessToken,
        expiresAt: authState.expiresAt,
      });
    } catch (error) {
      loggingService.error('Error saving auth data:', error);
      throw error;
    }
  }

  // Save auth data to encrypted storage
  private async saveAuthDataToEncryptedStorage(
    authState: Omit<AuthState, 'isLoading'>,
  ): Promise<void> {
    try {
      await EncryptedStorage.setItem(
        STORAGE_KEYS.AUTH_DATA,
        JSON.stringify(authState),
      );
    } catch (error) {
      loggingService.error('Error saving to encrypted storage:', error);
      throw error;
    }
  }

  // Clear authentication data
  private async clearAuthData(): Promise<void> {
    try {
      // Clear from encrypted storage
      await EncryptedStorage.removeItem(STORAGE_KEYS.AUTH_DATA);

      // Clear from AsyncStorage for backward compatibility
      await this.clearAsyncStorageAuthData();

      loggingService.info('Auth data cleared from storage');
    } catch (error) {
      loggingService.error('Error clearing auth data:', error);
      throw error;
    }
  }

  // Clear auth data from AsyncStorage (for backward compatibility)
  private async clearAsyncStorageAuthData(): Promise<void> {
    try {
      const keys = [
        STORAGE_KEYS.USER,
        STORAGE_KEYS.ACCESS_TOKEN,
        STORAGE_KEYS.REFRESH_TOKEN,
        STORAGE_KEYS.EXPIRES_AT,
      ];
      await AsyncStorage.multiRemove(keys);
    } catch (error) {
      loggingService.error('Error clearing AsyncStorage auth data:', error);
    }
  }
}

// Singleton instance
const authService = new AuthService();
export default authService;
