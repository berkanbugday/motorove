import AsyncStorage from '@react-native-async-storage/async-storage';
import EncryptedStorage from 'react-native-encrypted-storage';
import {apolloClient, resetApolloStore} from '@configs/apolloClientConfig';
import {useMutation} from '@apollo/client';
import {
  SIGN_IN,
  SIGN_UP,
  REFRESH_TOKEN,
  RESET_PASSWORD,
  // UPDATE_PASSWORD,
} from './graphql';
import {
  AuthUser,
  AuthResponse,
  AuthState,
  AUTH_STORAGE_KEYS as STORAGE_KEYS,
} from '../types/auth.types';
import {loggingService} from './logging.service';
import {showToast} from '@components';
import {useTranslation} from '@hooks/useTranslation';

// Hook for resetting password
export const useResetPassword = (onSuccess?: () => void) => {
  const {t} = useTranslation();
  const [resetPasswordMutation, {loading, error}] = useMutation(
    RESET_PASSWORD,
    {
      onCompleted: _data => {
        showToast({
          type: 'success',
          text1: t('common.success'),
          text2: t('screens.resetPassword.emailSent'),
        });

        if (onSuccess) {
          onSuccess();
        }
      },
      onError: errorObj => {
        loggingService.error('Error resetting password:', errorObj);
        showToast({
          type: 'error',
          text1: t('common.error'),
          text2: errorObj.message || t('screens.resetPassword.emailSendFailed'),
        });
      },
    },
  );

  const resetPassword = async (email: string): Promise<boolean> => {
    try {
      const result = await resetPasswordMutation({
        variables: {
          input: {
            email,
          },
        },
      });
      return result.data?.resetPassword || false;
    } catch (err) {
      loggingService.error('Error in resetPassword:', err);
      // Error is already handled in onError callback
      return false;
    }
  };

  return {
    resetPassword,
    loading,
    error,
  };
};

// Hook for updating password
// export const useUpdatePassword = (onSuccess?: () => void) => {
//   const {t} = useTranslation();
//   const [updatePasswordMutation, {loading, error}] = useMutation(
//     UPDATE_PASSWORD,
//     {
//       onCompleted: _data => {
//         showToast({
//           type: 'success',
//           text1: t('common.success'),
//           text2: t('auth.passwordUpdated'),
//         });

//         if (onSuccess) {
//           onSuccess();
//         }
//       },
//       onError: errorObj => {
//         loggingService.error('Error updating password:', errorObj);
//         showToast({
//           type: 'error',
//           text1: t('common.error'),
//           text2: errorObj.message || t('auth.passwordUpdateFailed'),
//         });
//       },
//     },
//   );

//   const updatePassword = async (
//     email: string,
//     token: string,
//     password: string,
//   ): Promise<boolean> => {
//     try {
//       const result = await updatePasswordMutation({
//         variables: {
//           input: {
//             password,
//             email,
//             token,
//           },
//         },
//       });
//       return result.data?.updatePassword || false;
//     } catch (err) {
//       loggingService.error('Error in updatePassword:', err);
//       // Error is already handled in onError callback
//       return false;
//     }
//   };

//   return {
//     updatePassword,
//     loading,
//     error,
//   };
// };

// Simple mutex for token refresh to avoid concurrent refresh attempts
let isRefreshing = false;
let refreshPromise: Promise<AuthResponse> | null = null;
// Background refresh timer
let tokenRefreshTimer: NodeJS.Timeout | null = null;

class AuthService {
  // Sign up a new user
  async signUp(
    firstName: string,
    lastName: string,
    email: string,
    password: string,
  ): Promise<AuthResponse> {
    try {
      const {data, errors} = await apolloClient.mutate({
        mutation: SIGN_UP,
        variables: {
          input: {
            firstName,
            lastName,
            email,
            password,
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

      // Start background token refresh
      this.setupBackgroundTokenRefresh(authResponse);

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

      // Start background token refresh
      this.setupBackgroundTokenRefresh(authResponse);

      return authResponse;
    } catch (error) {
      loggingService.error('Signin error:', error);
      throw error;
    }
  }

  // Sign out the current user
  async signOut(): Promise<void> {
    try {
      // Clear background refresh timer
      this.clearBackgroundTokenRefresh();

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

  // Setup background token refresh
  private setupBackgroundTokenRefresh(authResponse: AuthResponse): void {
    // Clear any existing timer
    this.clearBackgroundTokenRefresh();

    if (!authResponse.session?.expires_at) {
      loggingService.error(
        'Cannot setup token refresh: missing expiration time',
      );
      return;
    }

    const expiresAt = authResponse.session.expires_at;
    const now = Date.now();

    // Calculate time until next refresh (60% of total token lifetime or 5 minutes before expiry, whichever is earlier)
    const tokenLifetime = expiresAt - now;
    const refreshTime = Math.min(
      tokenLifetime * 0.6, // Refresh at 60% of the token lifetime
      tokenLifetime - 300000, // Or 5 minutes before expiration
    );

    // Only set up refresh if we have a reasonable time (at least 10 seconds)
    if (refreshTime > 10000) {
      loggingService.info(
        `Setting up background token refresh in ${Math.round(
          refreshTime / 1000,
        )} seconds`,
      );

      tokenRefreshTimer = setTimeout(async () => {
        try {
          loggingService.info('Executing background token refresh');
          await this.refreshToken();

          // After successful refresh, get the new auth state and set up the next refresh
          const state = await this.getAuthState();
          if (state.accessToken && state.expiresAt && state.user) {
            this.setupBackgroundTokenRefresh({
              user: state.user,
              session: {
                access_token: state.accessToken,
                refresh_token: state.refreshToken || '',
                expires_at: state.expiresAt,
              },
            });
          }
        } catch (error) {
          loggingService.error('Background token refresh failed:', error);
          // Don't sign out immediately - the regular token refresh mechanism will handle this
        }
      }, refreshTime);
    } else {
      loggingService.warning('Token lifetime too short for background refresh');
    }
  }

  // Clear background token refresh timer
  private clearBackgroundTokenRefresh(): void {
    if (tokenRefreshTimer) {
      clearTimeout(tokenRefreshTimer);
      tokenRefreshTimer = null;
    }
  }

  // Public method to refresh token with mutex protection
  async refreshToken(): Promise<AuthResponse> {
    // If already refreshing, return the existing promise
    if (isRefreshing && refreshPromise) {
      return refreshPromise;
    }

    try {
      // Set the mutex
      isRefreshing = true;
      // Create and store the refresh promise
      refreshPromise = this._refreshToken();
      // Wait for the refresh to complete
      return await refreshPromise;
    } catch (error) {
      // Log and rethrow the error
      loggingService.error('Refresh token failed:', error);
      throw error;
    } finally {
      // Reset the mutex state
      isRefreshing = false;
      refreshPromise = null;
    }
  }

  // Internal refresh token implementation
  private async _refreshToken(): Promise<AuthResponse> {
    try {
      loggingService.info('Starting token refresh process');
      const refreshToken = await EncryptedStorage.getItem(
        STORAGE_KEYS.REFRESH_TOKEN,
      );

      if (!refreshToken) {
        loggingService.error('No refresh token found in storage');
        throw new Error('No refresh token available');
      }

      const parsedRefreshToken = JSON.parse(refreshToken);

      // Store the refresh token in a variable but don't remove it yet
      // We'll only remove it after successful refresh to prevent token loss on network issues

      try {
        loggingService.info('Making refresh token request to server');
        const {data, errors} = await apolloClient.mutate({
          mutation: REFRESH_TOKEN,
          variables: {
            token: parsedRefreshToken,
          },
          // Skip the auth link to avoid circular dependency
          context: {skipAuth: true},
        });

        if (errors) {
          loggingService.error('Token refresh error from GraphQL:', errors[0]);
          throw errors[0];
        }

        if (!data || !data.refreshToken) {
          loggingService.error('Refresh token response missing data');
          throw new Error('Invalid refresh token response');
        }

        // Now that we have a successful response, remove the old refresh token
        await EncryptedStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);

        // Convert GraphQL response to our AuthResponse format
        const authResponse = this.convertGraphQLAuthResponse(data.refreshToken);

        if (!authResponse.session || !authResponse.session.access_token) {
          loggingService.error('Refresh token response missing token data');
          throw new Error('Invalid token data in refresh response');
        }

        loggingService.info('Token refresh successful, saving new auth data');
        await this.saveAuthData(authResponse);
        return authResponse;
      } catch (error) {
        // If this is a "token already used" error, we need to remove the token
        if (
          error instanceof Error &&
          (error.message.includes('Token already used') ||
            error.message.includes('Invalid Refresh Token'))
        ) {
          await EncryptedStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        }

        // Log and rethrow the error
        loggingService.error('Token refresh request failed:', error);
        throw error;
      }
    } catch (error) {
      // If we get here, there was either no token or another error
      loggingService.error('Refresh token operation failed:', error);
      // Force clear auth data in case of critical errors
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

        // Check if token is expired or will expire soon and needs refresh
        const now = Date.now();
        const isTokenExpired =
          parsedData.expiresAt && parsedData.expiresAt <= now;
        const willExpireSoon =
          parsedData.expiresAt &&
          parsedData.expiresAt > now &&
          parsedData.expiresAt < now + 300000; // Will expire in less than 5 minutes (increased from 1 minute)

        // Only try to refresh if we have both an expired/expiring token AND a refresh token
        if ((isTokenExpired || willExpireSoon) && parsedData.refreshToken) {
          try {
            loggingService.info(
              `Token ${
                isTokenExpired ? 'expired' : 'expiring soon'
              }, refreshing`,
            );
            await this.refreshToken();

            // Get the updated auth data from storage after refresh
            const updatedAuthData = await EncryptedStorage.getItem(
              STORAGE_KEYS.AUTH_DATA,
            );

            if (updatedAuthData) {
              const updatedParsedData = JSON.parse(updatedAuthData);

              // Setup background refresh with the new token data
              if (
                updatedParsedData.accessToken &&
                updatedParsedData.expiresAt &&
                updatedParsedData.user
              ) {
                this.setupBackgroundTokenRefresh({
                  user: updatedParsedData.user,
                  session: {
                    access_token: updatedParsedData.accessToken,
                    refresh_token: updatedParsedData.refreshToken || '',
                    expires_at: updatedParsedData.expiresAt,
                  },
                });
              }

              return {
                ...updatedParsedData,
                isLoading: false,
              };
            }

            // If we couldn't get updated data, try again recursively
            return this.getAuthState();
          } catch (refreshError) {
            // If refresh fails, return logged out state
            loggingService.error(
              'Token refresh failed during getAuthState:',
              refreshError as Error,
            );

            // If token is expired, return logged out state
            if (isTokenExpired) {
              // Force sign out if token is expired and refresh failed
              await this.signOut();
              return {
                user: null,
                accessToken: null,
                refreshToken: null,
                expiresAt: null,
                isLoading: false,
              };
            }

            // If token is not expired but will soon, still use the existing token
            // rather than logging the user out immediately
            return {
              user: parsedData.user,
              accessToken: parsedData.accessToken,
              refreshToken: parsedData.refreshToken,
              expiresAt: parsedData.expiresAt,
              isLoading: false,
            };
          }
        }

        // Setup background refresh if we have a valid token but no timer
        if (
          !isTokenExpired &&
          parsedData.accessToken &&
          parsedData.expiresAt &&
          parsedData.user &&
          !tokenRefreshTimer
        ) {
          this.setupBackgroundTokenRefresh({
            user: parsedData.user,
            session: {
              access_token: parsedData.accessToken,
              refresh_token: parsedData.refreshToken || '',
              expires_at: parsedData.expiresAt,
            },
          });
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

        // Setup background refresh if we have a valid token
        if (accessToken && expiresAt && expiresAt > Date.now() && parsedUser) {
          this.setupBackgroundTokenRefresh({
            user: parsedUser,
            session: {
              access_token: accessToken,
              refresh_token: refreshToken || '',
              expires_at: expiresAt,
            },
          });
        }

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
      // Handle expires_at if it's already provided
      if (session.expires_at) {
        // Ensure expires_at is a valid timestamp by ensuring it's a number in seconds, not milliseconds
        // Convert to milliseconds if it's in seconds (Unix timestamp is typically in seconds)
        const expiresAtMs =
          session.expires_at * 1000 > Date.now() + 365 * 24 * 60 * 60 * 1000
            ? session.expires_at // Already in milliseconds
            : session.expires_at * 1000; // Convert from seconds to milliseconds

        processedSession = {
          access_token: session.access_token,
          refresh_token: session.refresh_token,
          expires_at: expiresAtMs,
        };
      } else {
        // If expires_at is not provided, use expires_in
        const expiresIn = session.expires_in || 3600; // Default to 1 hour if not provided
        const expiresAt = Date.now() + expiresIn * 1000;

        processedSession = {
          access_token: session.access_token,
          refresh_token: session.refresh_token,
          expires_at: expiresAt,
        };
      }
    }

    return {
      user,
      session: processedSession,
    };
  }

  // Save authentication data
  private async saveAuthData(authResponse: AuthResponse): Promise<void> {
    try {
      if (!authResponse.session) {
        loggingService.error('Cannot save auth data: missing session data');
        throw new Error('Missing session data');
      }

      const authState = {
        user: authResponse.user,
        accessToken: authResponse.session.access_token || null,
        refreshToken: authResponse.session.refresh_token || null,
        expiresAt: authResponse.session.expires_at || null,
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
      // Save the main auth data and refresh token atomically (as much as possible)
      const promises = [
        EncryptedStorage.setItem(
          STORAGE_KEYS.AUTH_DATA,
          JSON.stringify(authState),
        ),
      ];

      // Only save the refresh token if it exists
      if (authState.refreshToken) {
        promises.push(
          EncryptedStorage.setItem(
            STORAGE_KEYS.REFRESH_TOKEN,
            JSON.stringify(authState.refreshToken),
          ),
        );
      }

      await Promise.all(promises);
    } catch (error) {
      loggingService.error('Error saving to encrypted storage:', error);
      throw error;
    }
  }

  // Clear authentication data
  private async clearAuthData(): Promise<void> {
    try {
      // Clear background refresh timer
      this.clearBackgroundTokenRefresh();

      // Remove auth data from all storage sources
      await EncryptedStorage.removeItem(STORAGE_KEYS.AUTH_DATA);
      await EncryptedStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);

      // Clear AsyncStorage items just to be thorough
      await this.clearAsyncStorageAuthData();

      // Reset Apollo client store
      await resetApolloStore();

      loggingService.info('Auth data cleared successfully');
    } catch (error) {
      loggingService.error('Error clearing auth data:', error);
      // Try the fallback method for AsyncStorage
      await this.clearAsyncStorageAuthData();
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

  // Debug method to check token validity and status
  async debugTokenStatus(): Promise<void> {
    try {
      const encryptedAuthData = await EncryptedStorage.getItem(
        STORAGE_KEYS.AUTH_DATA,
      );

      if (encryptedAuthData) {
        const parsedData = JSON.parse(encryptedAuthData);
        const now = Date.now();

        // Check if we have valid tokens
        const hasAccessToken = !!parsedData.accessToken;
        const hasRefreshToken = !!parsedData.refreshToken;

        // Check expiration
        const expiresAt = parsedData.expiresAt;
        const isExpired = expiresAt && expiresAt <= now;
        const timeToExpire = expiresAt ? expiresAt - now : 0;

        loggingService.info('Token Debug Information', {
          hasAccessToken,
          hasRefreshToken,
          isExpired,
          timeToExpire: isExpired
            ? 'Already expired'
            : `${Math.floor(timeToExpire / 1000)} seconds remaining`,
          tokenFirstChars: hasAccessToken
            ? parsedData.accessToken.substring(0, 10) + '...'
            : 'No token',
        });

        // Force token refresh to get a new token
        if (hasRefreshToken) {
          try {
            loggingService.info('Attempting force token refresh');
            await this.refreshToken();
            loggingService.info('Force token refresh successful');
          } catch (error) {
            loggingService.error('Force token refresh failed:', error);
          }
        }
      } else {
        loggingService.error('No auth data found in encrypted storage');

        // Check AsyncStorage as fallback
        const accessToken = await AsyncStorage.getItem(
          STORAGE_KEYS.ACCESS_TOKEN,
        );
        loggingService.info('AsyncStorage fallback check:', {
          hasToken: !!accessToken,
        });
      }
    } catch (error) {
      loggingService.error('Token debug check failed:', error);
    }
  }
}

// Singleton instance
const authService = new AuthService();
export default authService;

// Export hooks in a service object, similar to GroupService pattern
export const AuthHooks = {
  useResetPassword,
  // useUpdatePassword,
};
