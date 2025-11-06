import AsyncStorage from '@react-native-async-storage/async-storage';
import {apolloClient} from '@configs/apolloClientConfig';
import {useMutation} from '@apollo/client';
import {
  SIGN_IN,
  SIGN_UP,
  REFRESH_TOKEN,
  RESET_PASSWORD,
  UPDATE_EMAIL,
  UPDATE_PASSWORD,
  RESEND,
  SIGN_OUT,
} from './graphql';
import {AuthUser, AuthResponse, AuthState} from '../types/auth.types';
import {loggingService} from './logging.service';
import {showToast} from '@components';
import {useTranslation} from '@hooks/useTranslation';

// Import refactored modules
import {TokenRefreshManager} from './auth/TokenRefreshManager';
import {TokenValidator} from './auth/TokenValidator';
import {AuthStorage} from './auth/AuthStorage';
import {BackgroundRefreshManager} from './auth/BackgroundRefreshManager';
import {Language} from '@motorove/shared';

/**
 * Hook for resetting password
 */
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
        onSuccess?.();
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
        variables: {input: {email}},
      });
      return result.data?.resetPassword || false;
    } catch (err) {
      loggingService.error('Error in resetPassword:', err);
      return false;
    }
  };

  return {resetPassword, loading, error};
};

/**
 * Hook for updating email
 */
export const useUpdateEmail = (onSuccess?: () => void) => {
  const {t} = useTranslation();
  const [updateEmailMutation, {loading, error}] = useMutation(UPDATE_EMAIL, {
    onCompleted: _data => {
      showToast({
        type: 'success',
        text1: t('common.success'),
        text2: t('screens.changeEmail.success_updated'),
      });
      onSuccess?.();
    },
    onError: errorObj => {
      loggingService.error('Error updating email:', errorObj);
      showToast({
        type: 'error',
        text1: t('common.error'),
        text2: errorObj.message || t('screens.changeEmail.update_failed'),
      });
    },
  });

  const updateEmail = async (
    email: string,
    newEmail: string,
  ): Promise<boolean> => {
    try {
      const result = await updateEmailMutation({
        variables: {input: {email, newEmail}},
      });
      return result.data?.updateEmail;
    } catch (err) {
      loggingService.error('Error in updateEmail:', err);
      return false;
    }
  };

  return {updateEmail, loading, error};
};

/**
 * Hook for updating password
 */
export const useUpdatePassword = (onSuccess?: () => void) => {
  const {t} = useTranslation();
  const [updatePasswordMutation, {loading, error}] = useMutation(
    UPDATE_PASSWORD,
    {
      onCompleted: _data => {
        showToast({
          type: 'success',
          text1: t('common.success'),
          text2: t('screens.changePassword.success_updated'),
        });
        onSuccess?.();
      },
      onError: errorObj => {
        loggingService.error('Error updating password:', errorObj);
        showToast({
          type: 'error',
          text1: t('common.error'),
          text2: errorObj.message || t('screens.changePassword.update_failed'),
        });
      },
    },
  );

  const updatePassword = async (newPassword: string): Promise<boolean> => {
    try {
      const result = await updatePasswordMutation({
        variables: {
          newPassword,
        },
      });
      return result.data?.updatePassword;
    } catch (err) {
      loggingService.error('Error in updatePassword:', err);
      return false;
    }
  };

  return {updatePassword, loading, error};
};

/**
 * Authentication Service
 * Handles user authentication, token management, and session persistence
 */
class AuthService {
  private readonly tokenRefreshManager = TokenRefreshManager.getInstance();
  private readonly backgroundRefreshManager =
    BackgroundRefreshManager.getInstance();
  private authStatePromise: Promise<AuthState> | null = null;
  private isLoadingAuthState = false;

  // ==================== Public Authentication Methods ====================

  async signUp(
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    preferredLanguage: Language,
  ): Promise<AuthResponse> {
    try {
      const {data, errors} = await apolloClient.mutate({
        mutation: SIGN_UP,
        variables: {
          input: {firstName, lastName, email, password, preferredLanguage},
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

  async signIn(email: string, password: string): Promise<AuthResponse> {
    try {
      const {data, errors} = await apolloClient.mutate({
        mutation: SIGN_IN,
        variables: {input: {email, password}},
      });

      if (errors) {
        loggingService.error('Signin error:', errors[0]);
        throw errors[0];
      }

      const authResponse = this.convertGraphQLResponse(data.signIn);

      if (authResponse.session) {
        await this.saveAuthData(authResponse);
        this.setupBackgroundRefresh(authResponse);
      }

      return authResponse;
    } catch (error) {
      loggingService.error('Signin error:', error);
      throw error;
    }
  }

  async signOut(): Promise<void> {
    try {
      // Clear background refresh first
      this.backgroundRefreshManager.clear();

      // Stop all active queries to prevent errors during cleanup
      apolloClient.stop();

      // Clear auth storage
      await AuthStorage.clearAll();

      // Reset Apollo client cache (use resetStore instead of clearStore)
      // This will refetch active queries after reset, but since we're logged out, they'll fail gracefully
      await apolloClient.resetStore();

      // Call sign out mutation (best effort - don't block on errors)
      try {
        await apolloClient.mutate({
          mutation: SIGN_OUT,
          context: {skipAuth: true},
        });
      } catch (signOutError) {
        loggingService.info(
          'Sign out mutation failed (expected after token cleared)',
        );
      }
    } catch (error) {
      loggingService.error('Signout error:', error);
      // Ensure cleanup even if error occurs
      try {
        apolloClient.stop();
        await AuthStorage.clearAll();
        await AsyncStorage.clear();
        await apolloClient.resetStore();
      } catch (cleanupError) {
        loggingService.error('Cleanup error during signout:', cleanupError);
      }
    }
  }

  async resend(email: string): Promise<boolean> {
    try {
      const {data, errors} = await apolloClient.mutate({
        mutation: RESEND,
        variables: {email},
      });

      if (errors) {
        loggingService.error('Resend error:', errors[0]);
        throw errors[0];
      }

      return data.resend;
    } catch (error) {
      loggingService.error('Resend error:', error);
      throw error;
    }
  }

  // ==================== Token Refresh ====================

  async refreshToken(): Promise<AuthResponse> {
    return this.tokenRefreshManager.executeRefresh(async () => {
      this.backgroundRefreshManager.clear();
      return await this.performTokenRefresh();
    });
  }

  private async performTokenRefresh(): Promise<AuthResponse> {
    const refreshToken = await AuthStorage.getRefreshToken();

    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    loggingService.info('Refreshing access token');

    try {
      const {data, errors} = await apolloClient.mutate({
        mutation: REFRESH_TOKEN,
        variables: {token: refreshToken},
        context: {skipAuth: true},
      });

      if (errors || !data?.refreshToken) {
        throw new Error(errors?.[0]?.message || 'Token refresh failed');
      }

      await AuthStorage.removeRefreshToken();
      const authResponse = this.convertGraphQLResponse(data.refreshToken);
      await this.saveAuthData(authResponse);

      loggingService.info('Token refresh successful');
      return authResponse;
    } catch (error) {
      await this.handleRefreshError(error);
      throw error;
    }
  }

  private async handleRefreshError(error: unknown): Promise<void> {
    if (!TokenValidator.isTokenAlreadyUsedError(error)) {
      return;
    }

    loggingService.info(
      'Refresh token already used - checking for concurrent success',
    );

    // Check if another concurrent request succeeded
    const currentAuthData = await AuthStorage.getAuthState();

    if (
      currentAuthData &&
      currentAuthData.expiresAt &&
      currentAuthData.expiresAt > Date.now()
    ) {
      loggingService.info(
        'Found valid auth data from concurrent refresh, not clearing',
      );
      return;
    }

    // Only clear if we don't have valid tokens
    loggingService.info('No valid auth data found, clearing auth data');
    await this.signOut();
  }

  // ==================== Auth State Management ====================

  async getAuthState(): Promise<AuthState> {
    // Prevent concurrent auth state loading
    if (this.isLoadingAuthState && this.authStatePromise) {
      loggingService.info('Auth state already loading, waiting for completion');
      return this.authStatePromise;
    }

    try {
      this.isLoadingAuthState = true;
      this.authStatePromise = this.loadAuthState();
      return await this.authStatePromise;
    } finally {
      this.isLoadingAuthState = false;
      this.authStatePromise = null;
    }
  }

  private async loadAuthState(): Promise<AuthState> {
    try {
      const authData = await AuthStorage.getAuthState();

      if (!authData) {
        return this.createEmptyAuthState();
      }

      // Handle expired token without refresh token
      if (
        TokenValidator.isExpired(authData.expiresAt) &&
        !authData.refreshToken
      ) {
        await this.signOut();
        return this.createEmptyAuthState();
      }

      // Handle token refresh if needed
      if (
        TokenValidator.needsRefresh(authData.expiresAt) &&
        authData.refreshToken
      ) {
        return await this.handleTokenRefresh(authData);
      }

      // Setup background refresh for valid tokens
      this.setupBackgroundRefreshIfNeeded(authData);

      return authData;
    } catch (error) {
      loggingService.error('Error getting auth state:', error);
      return this.createEmptyAuthState();
    }
  }

  private async handleTokenRefresh(
    currentAuthData: AuthState,
  ): Promise<AuthState> {
    const refreshPromise = this.tokenRefreshManager.getRefreshPromise();

    // If refresh is already in progress, wait for it
    if (refreshPromise) {
      return await this.waitForRefreshCompletion(currentAuthData);
    }

    // Initiate new refresh
    try {
      loggingService.info('Token needs refresh, initiating refresh...');
      await this.refreshToken();
      return await this.getUpdatedAuthData(currentAuthData);
    } catch (refreshError) {
      return await this.handleRefreshFailure(refreshError, currentAuthData);
    }
  }

  private async waitForRefreshCompletion(
    currentAuthData: AuthState,
  ): Promise<AuthState> {
    loggingService.info(
      'Token refresh already in progress, waiting for completion...',
    );

    try {
      const refreshPromise = this.tokenRefreshManager.getRefreshPromise();
      if (refreshPromise) {
        await refreshPromise;
      }
      return await this.getUpdatedAuthData(currentAuthData);
    } catch (waitError) {
      loggingService.error('Error waiting for refresh:', waitError);
      return await this.handleWaitError(waitError, currentAuthData);
    }
  }

  private async handleWaitError(
    error: unknown,
    currentAuthData: AuthState,
  ): Promise<AuthState> {
    // Check if refresh succeeded despite error
    const updatedAuthData = await AuthStorage.getAuthState();

    if (
      updatedAuthData &&
      updatedAuthData.accessToken !== currentAuthData.accessToken
    ) {
      loggingService.info(
        'Refresh succeeded despite wait error, using updated token',
      );
      this.setupBackgroundRefreshIfNeeded(updatedAuthData);
      return updatedAuthData;
    }

    // If token is expired, sign out
    if (TokenValidator.isExpired(currentAuthData.expiresAt)) {
      await this.signOut();
      return this.createEmptyAuthState();
    }

    // Continue with existing token
    loggingService.info('Using existing token despite wait error');
    return currentAuthData;
  }

  private async handleRefreshFailure(
    error: unknown,
    currentAuthData: AuthState,
  ): Promise<AuthState> {
    loggingService.error('Token refresh failed:', error);

    // Handle "already used" error gracefully
    if (TokenValidator.isTokenAlreadyUsedError(error)) {
      loggingService.info(
        'Refresh token already used, checking for updated auth data',
      );

      const updatedAuthData = await AuthStorage.getAuthState();

      if (
        updatedAuthData &&
        updatedAuthData.accessToken !== currentAuthData.accessToken
      ) {
        loggingService.info('Found updated auth data from concurrent refresh');
        this.setupBackgroundRefreshIfNeeded(updatedAuthData);
        return updatedAuthData;
      }
    }

    // If token is expired and refresh failed, sign out
    if (TokenValidator.isExpired(currentAuthData.expiresAt)) {
      await this.signOut();
      return this.createEmptyAuthState();
    }

    // Continue with existing token if not expired
    loggingService.info('Using existing token despite refresh failure');
    return currentAuthData;
  }

  private async getUpdatedAuthData(
    currentAuthData: AuthState,
  ): Promise<AuthState> {
    const updatedAuthData = await AuthStorage.getAuthState();

    if (updatedAuthData) {
      this.setupBackgroundRefreshIfNeeded(updatedAuthData);
      return updatedAuthData;
    }

    return currentAuthData;
  }

  // ==================== Helper Methods ====================

  async isAuthenticated(): Promise<boolean> {
    const {user, accessToken, expiresAt} = await this.getAuthState();
    return !!(user && accessToken && expiresAt && expiresAt > Date.now());
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    const {user} = await this.getAuthState();
    return user;
  }

  async getAccessToken(): Promise<string | null> {
    const {accessToken} = await this.getAuthState();
    return accessToken;
  }

  async saveAuthDataToEncryptedStorage(authState: AuthState): Promise<void> {
    await AuthStorage.saveAuthState(authState);
  }

  // ==================== Private Helper Methods ====================

  private setupBackgroundRefresh(authResponse: AuthResponse): void {
    if (!authResponse.session?.expires_at) {
      loggingService.error(
        'Cannot setup token refresh: missing expiration time',
      );
      return;
    }

    this.backgroundRefreshManager.setupRefresh(
      authResponse.session.expires_at,
      async () => {
        if (this.tokenRefreshManager.isCurrentlyRefreshing()) {
          loggingService.info(
            'Skipping background refresh - refresh already in progress',
          );
          return;
        }

        await this.refreshToken();
        const state = await this.getAuthState();

        if (state.accessToken && state.expiresAt && state.user) {
          this.setupBackgroundRefresh({
            user: state.user,
            session: {
              access_token: state.accessToken,
              refresh_token: state.refreshToken || '',
              expires_at: state.expiresAt,
            },
          });
        }
      },
    );
  }

  private setupBackgroundRefreshIfNeeded(authData: AuthState): void {
    if (
      authData.accessToken &&
      authData.expiresAt &&
      authData.user &&
      !this.backgroundRefreshManager.isActive() &&
      !TokenValidator.isExpired(authData.expiresAt)
    ) {
      this.setupBackgroundRefresh({
        user: authData.user,
        session: {
          access_token: authData.accessToken,
          refresh_token: authData.refreshToken || '',
          expires_at: authData.expiresAt,
        },
      });
    }
  }

  private convertGraphQLResponse(graphQLResponse: any): AuthResponse {
    const {user, session} = graphQLResponse;

    if (!session) {
      return {user, session: null};
    }

    const expiresAtMs = this.normalizeExpiresAt(session);

    return {
      user,
      session: {
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        expires_at: expiresAtMs,
      },
    };
  }

  private normalizeExpiresAt(session: any): number {
    if (session.expires_at) {
      // Check if already in milliseconds (> 1 year from now means it's in ms)
      const oneYearFromNow = Date.now() + 365 * 24 * 60 * 60 * 1000;
      return session.expires_at * 1000 > oneYearFromNow
        ? session.expires_at
        : session.expires_at * 1000;
    }

    // Fallback to expires_in (default 1 hour)
    const expiresIn = session.expires_in || 3600;
    return Date.now() + expiresIn * 1000;
  }

  private async saveAuthData(authResponse: AuthResponse): Promise<void> {
    if (!authResponse.session) {
      throw new Error('Missing session data');
    }

    const authState: AuthState = {
      user: authResponse.user,
      accessToken: authResponse.session.access_token || null,
      refreshToken: authResponse.session.refresh_token || null,
      expiresAt: authResponse.session.expires_at || null,
    };

    await AuthStorage.saveAuthState(authState);
  }

  private createEmptyAuthState(): AuthState {
    return {
      user: null,
      accessToken: null,
      refreshToken: null,
      expiresAt: null,
    };
  }
}

// Singleton instance
const authService = new AuthService();
export default authService;

// Export hooks
export const AuthHooks = {
  useResetPassword,
  useUpdateEmail,
  useUpdatePassword,
};
