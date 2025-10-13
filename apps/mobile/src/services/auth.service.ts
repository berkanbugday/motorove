import AsyncStorage from '@react-native-async-storage/async-storage';
import EncryptedStorage from 'react-native-encrypted-storage';
import {apolloClient} from '@configs/apolloClientConfig';
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
          text2: t('screens.resetPassword.email_sent'),
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
          text2:
            errorObj.message || t('screens.resetPassword.email_send_failed'),
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

      return data.signUp;
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
      if (authResponse.session) {
        await this.saveAuthData(authResponse);
        this.setupBackgroundTokenRefresh(authResponse);
      }

      return authResponse;
    } catch (error) {
      loggingService.error('Signin error:', error);
      throw error;
    }
  }

  // Sign out the current user
  async signOut(): Promise<void> {
    try {
      await this.clearAuthData();
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
    // If already refreshing, wait for it to complete
    if (isRefreshing && refreshPromise) {
      return refreshPromise;
    }

    try {
      isRefreshing = true;
      refreshPromise = this._refreshToken();
      return await refreshPromise;
    } catch (error) {
      loggingService.error('Refresh token failed:', error);

      // If refresh fails, clear auth data to force re-login
      if (
        error instanceof Error &&
        (error.message.includes('Token already used') ||
          error.message.includes('Invalid Refresh Token') ||
          error.message.includes('Already Used'))
      ) {
        loggingService.info('Refresh token invalid, clearing auth data');
        await this.clearAuthData();
      }

      throw error;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  }

  // Simple refresh token implementation
  private async _refreshToken(): Promise<AuthResponse> {
    const refreshToken = await EncryptedStorage.getItem(
      STORAGE_KEYS.REFRESH_TOKEN,
    );

    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const parsedRefreshToken = JSON.parse(refreshToken);

    loggingService.info('Refreshing access token');
    const {data, errors} = await apolloClient.mutate({
      mutation: REFRESH_TOKEN,
      variables: {
        token: parsedRefreshToken,
      },
      context: {skipAuth: true},
    });

    if (errors || !data?.refreshToken) {
      throw new Error(errors?.[0]?.message || 'Token refresh failed');
    }

    // Remove old refresh token and save new auth data
    await EncryptedStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    const authResponse = this.convertGraphQLAuthResponse(data.refreshToken);
    await this.saveAuthData(authResponse);

    loggingService.info('Token refresh successful');
    return authResponse;
  }

  // Check if token needs refresh (5 minutes before expiry)
  private needsRefresh(expiresAt: number | null): boolean {
    if (!expiresAt) {
      return false;
    }
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;
    return expiresAt <= now + fiveMinutes;
  }

  // Check if token is completely expired
  private isExpired(expiresAt: number | null): boolean {
    if (!expiresAt) {
      return true;
    }
    return expiresAt <= Date.now();
  }

  // Get current authentication state with automatic refresh if needed
  async getAuthState(): Promise<AuthState> {
    try {
      const encryptedAuthData = await EncryptedStorage.getItem(
        STORAGE_KEYS.AUTH_DATA,
      );

      if (!encryptedAuthData) {
        return {
          user: null,
          accessToken: null,
          refreshToken: null,
          expiresAt: null,
        };
      }

      const authData = JSON.parse(encryptedAuthData);

      // If token is completely expired and no refresh token, sign out
      if (this.isExpired(authData.expiresAt) && !authData.refreshToken) {
        await this.signOut();
        return {
          user: null,
          accessToken: null,
          refreshToken: null,
          expiresAt: null,
        };
      }

      // If token needs refresh and we have a refresh token, refresh it
      if (
        this.needsRefresh(authData.expiresAt) &&
        authData.refreshToken &&
        !isRefreshing
      ) {
        try {
          loggingService.info('Token needs refresh, refreshing...');
          await this.refreshToken();

          // Get updated auth data after refresh
          const updatedAuthData = await EncryptedStorage.getItem(
            STORAGE_KEYS.AUTH_DATA,
          );

          if (updatedAuthData) {
            const updatedParsedData = JSON.parse(updatedAuthData);
            this.setupBackgroundTokenRefresh({
              user: updatedParsedData.user,
              session: {
                access_token: updatedParsedData.accessToken,
                refresh_token: updatedParsedData.refreshToken || '',
                expires_at: updatedParsedData.expiresAt,
              },
            });
            return updatedParsedData;
          }
        } catch (refreshError) {
          loggingService.error('Token refresh failed:', refreshError);

          // If token is expired and refresh failed, sign out
          if (this.isExpired(authData.expiresAt)) {
            await this.signOut();
            return {
              user: null,
              accessToken: null,
              refreshToken: null,
              expiresAt: null,
            };
          }

          // If token is not expired, continue using it
          loggingService.info('Using existing token despite refresh failure');
        }
      }

      // Setup background refresh if needed
      if (
        authData.accessToken &&
        authData.expiresAt &&
        authData.user &&
        !tokenRefreshTimer &&
        !this.isExpired(authData.expiresAt)
      ) {
        this.setupBackgroundTokenRefresh({
          user: authData.user,
          session: {
            access_token: authData.accessToken,
            refresh_token: authData.refreshToken || '',
            expires_at: authData.expiresAt,
          },
        });
      }

      return authData;
    } catch (error) {
      loggingService.error('Error getting auth state:', error);
      return {
        user: null,
        accessToken: null,
        refreshToken: null,
        expiresAt: null,
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
    let processedSession = null;
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
      user: user,
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
  async saveAuthDataToEncryptedStorage(authState: AuthState): Promise<void> {
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
      await EncryptedStorage.clear();

      // Clear AsyncStorage items just to be thorough
      // await AsyncStorage.clear();

      // Reset Apollo client store
      await apolloClient.clearStore();
    } catch (error) {
      loggingService.error('Error clearing auth data:', error);
      // Try the fallback method for AsyncStorage
      await AsyncStorage.clear();
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
