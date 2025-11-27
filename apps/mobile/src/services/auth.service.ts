import {apolloClient} from '@configs/apolloClientConfig';
import {SIGN_UP, GET_ME} from './graphql';
import {AuthUser} from '../types/auth.types';
import {loggingService} from './logging.service';
import {supabase} from '@configs/supabase';
import {Language, NotificationPermission} from '@motorove/shared';
import EncryptedStorage from 'react-native-encrypted-storage';
import {errorToMessage} from '@utils/errorUtils';
import {errorService} from './error.service';
import {createEmptyAuthUser} from '@contexts/auth/authUserHelpers';

// ==================== Auth Service ====================

/**
 * Authentication Service - Supabase Native Implementation
 *
 * Leverages Supabase's built-in session management:
 * - Automatic token refresh (no manual intervention)
 * - Secure session persistence via EncryptedStorage
 * - No backend sign-in mutation needed
 * - Supabase handles all token lifecycle
 * - Clean, simple, maintainable
 */
class AuthService {
  // Flag to prevent re-entrant sign out calls
  private isSigningOut = false;

  // ==================== Public Methods ====================

  /**
   * Sign up new user - Uses backend for user creation
   */
  async signUp(
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    preferredLanguage: Language,
    eulaAccepted: boolean,
  ): Promise<boolean> {
    try {
      loggingService.info('Signing up...');

      const {data, errors} = await apolloClient.mutate({
        mutation: SIGN_UP,
        variables: {
          input: {
            firstName,
            lastName,
            email,
            password,
            preferredLanguage,
            eulaAccepted,
          },
        },
      });

      if (errors) {
        throw errors[0];
      }

      loggingService.info('Sign up successful');
      return data.signUp;
    } catch (error) {
      loggingService.error('Sign up failed:', error);
      throw error;
    }
  }

  /**
   * Sign in - Uses Supabase directly, no backend mutation
   * Supabase automatically:
   * - Stores session in EncryptedStorage
   * - Refreshes tokens before expiry
   * - Manages session lifecycle
   *
   * After successful Supabase signin, fetches complete user data from backend
   * and stores it in encrypted storage
   */
  async signIn(email: string, password: string): Promise<AuthUser> {
    try {
      loggingService.info('Signing in with Supabase...');

      // Sign in with Supabase - it handles everything automatically
      const {data, error} = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error || !data.session) {
        const errorKey = error?.code
          ? `errors.auth.${error.code}`
          : 'errors.auth.invalid_credentials';
        const customError = new Error(errorKey);
        (customError as any).code = error?.code;
        (customError as any).translationKey = errorKey;
        throw customError;
      }

      loggingService.info(
        'Sign in successful - fetching user data from backend...',
      );

      // Fetch complete user data from backend
      const {data: userData, error: userError} = await apolloClient.query({
        query: GET_ME,
        fetchPolicy: 'network-only',
      });

      if (userError) {
        throw userError;
      }

      if (!userData?.me) {
        throw userError;
      }

      // Store user data in encrypted storage for persistence
      const authUser: AuthUser = {
        id: userData.me.id,
        email: userData.me.email,
        firstName: userData.me.firstName,
        lastName: userData.me.lastName,
        avatar: userData.me.avatar,
        hasCompletedSetup: userData.me.hasCompletedSetup,
        notificationPermission: userData.me.userSetting
          ?.notificationPermission as NotificationPermission,
        preferredLanguage: userData.me.userSetting
          ?.preferredLanguage as Language,
      };

      await EncryptedStorage.setItem('auth_user', JSON.stringify(authUser));
      loggingService.info(
        'User data stored in encrypted storage after sign in',
      );

      return authUser;
    } catch (error) {
      loggingService.error('Sign in failed:', error);
      const errorMessage = errorToMessage(error);
      errorService.showErrorToast(errorMessage);
      throw error;
    }
  }

  /**
   * Sign out - Supabase handles session cleanup automatically
   * Also clears user data from encrypted storage
   */
  async signOut(): Promise<void> {
    // Prevent re-entrant calls
    if (this.isSigningOut) {
      loggingService.warning(
        'Sign out already in progress, ignoring duplicate call',
      );
      return;
    }

    this.isSigningOut = true;

    try {
      loggingService.info('Signing out...');

      // Clear Apollo cache first (before Supabase sign out to prevent auth errors)
      try {
        apolloClient.stop();
        await apolloClient.resetStore();
      } catch (apolloError) {
        loggingService.warning(
          'Error clearing Apollo cache:',
          apolloError as unknown as Error,
        );
      }

      // Sign out from Supabase FIRST - it clears session from storage automatically
      // This must happen before we clear all storage, otherwise Supabase will try to
      // remove a key that no longer exists
      try {
        const {error} = await supabase.auth.signOut();
        if (error) {
          loggingService.warning('Supabase sign out error:', error);
        }
      } catch (signOutError) {
        loggingService.warning(
          'Error during Supabase sign out:',
          signOutError as unknown as Error,
        );
        // Continue with cleanup even if Supabase sign out fails
      }

      // Clear encrypted storage AFTER Supabase sign out
      // This ensures Supabase has cleaned up its own token first
      try {
        await EncryptedStorage.clear();
        loggingService.info('User data cleared from encrypted storage');
      } catch (storageError) {
        loggingService.error('Failed to clear user data:', storageError);
      }

      loggingService.info('Sign out successful');
    } catch (error) {
      loggingService.error('Sign out error:', error);
      // Force cleanup
      try {
        await apolloClient.resetStore();
      } catch (resetError) {
        loggingService.error('Error resetting Apollo store:', resetError);
      }
      try {
        await EncryptedStorage.clear();
      } catch (storageError) {
        loggingService.error('Failed to clear user data:', storageError);
      }
    } finally {
      // Always reset the flag, even if there was an error
      this.isSigningOut = false;
    }
  }

  /**
   * Check if sign out is in progress
   */
  getIsSigningOut(): boolean {
    return this.isSigningOut;
  }

  /**
   * Reset password - Send password reset email
   * Uses Supabase directly, no backend request needed
   */
  async resetPassword(email: string): Promise<void> {
    try {
      const {error} = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'motorove://reset-password', // Deep link for mobile app
      });

      if (error) {
        loggingService.error('Reset password error:', error);
        const errorKey = error?.code
          ? `errors.auth.${error.code}`
          : 'errors.general.something_wrong';
        const customError = new Error(errorKey);
        (customError as any).code = error?.code;
        (customError as any).translationKey = errorKey;
        throw customError;
      }
    } catch (error) {
      loggingService.error('Reset password failed:', error);
      const errorMessage = errorToMessage(error);
      errorService.showErrorToast(errorMessage);
      throw error;
    }
  }

  /**
   * Update email - Supabase handles session update automatically
   */
  async updateEmail(newEmail: string): Promise<void> {
    try {
      loggingService.info('Updating email...');

      const {error} = await supabase.auth.updateUser({
        email: newEmail,
      });

      if (error) {
        loggingService.error('Update email error:', error);
        const errorKey = error?.code
          ? `errors.auth.${error.code}`
          : 'errors.general.something_wrong';
        const customError = new Error(errorKey);
        (customError as any).code = error?.code;
        (customError as any).translationKey = errorKey;
        throw customError;
      }
    } catch (error) {
      loggingService.error('Update email failed:', error);
      const errorMessage = errorToMessage(error);
      errorService.showErrorToast(errorMessage);
      throw error;
    }
  }

  /**
   * Update password - Change user's password
   * Uses Supabase directly, no backend request needed
   */
  async updatePassword(newPassword: string): Promise<void> {
    try {
      const {error} = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        loggingService.error('Update password error:', error);
        const errorKey = error?.code
          ? `errors.auth.${error.code}`
          : 'errors.general.something_wrong';
        const customError = new Error(errorKey);
        (customError as any).code = error?.code;
        (customError as any).translationKey = errorKey;
        throw customError;
      }
    } catch (error) {
      loggingService.error('Update password failed:', error);
      const errorMessage = errorToMessage(error);
      errorService.showErrorToast(errorMessage);
      throw error;
    }
  }

  /**
   * Resend verification email - Uses Supabase directly
   */
  async resend(email: string): Promise<void> {
    try {
      const {error} = await supabase.auth.resend({
        type: 'signup',
        email,
      });

      if (error) {
        loggingService.error('Resend verification email error:', error);
        const errorKey = error?.code
          ? `errors.auth.${error.code}`
          : 'errors.general.something_wrong';
        const customError = new Error(errorKey);
        (customError as any).code = error?.code;
        (customError as any).translationKey = errorKey;
        throw customError;
      }
    } catch (error) {
      loggingService.error('Resend error:', error);
      const errorMessage = errorToMessage(error);
      errorService.showErrorToast(errorMessage);
      throw error;
    }
  }

  // ==================== Auth State Management ====================

  /**
   * Validate and refresh session if needed
   * Ensures user stays active for 1 month (30 days)
   * Automatically refreshes tokens before expiry
   *
   * @returns {Promise<boolean>} True if session is valid, false otherwise
   */
  async validateAndRefreshSession(): Promise<boolean> {
    try {
      // Get current session - Supabase automatically refreshes if needed
      const {data: sessionData, error: sessionError} =
        await supabase.auth.getSession();

      if (sessionError) {
        loggingService.error('Session validation error:', sessionError);
        return false;
      }

      if (!sessionData?.session) {
        loggingService.info('No active session found');
        return false;
      }

      const session = sessionData.session;
      const now = Math.floor(Date.now() / 1000);
      const expiresAt = session.expires_at || 0;

      // Check if session has expired
      if (expiresAt <= now) {
        loggingService.warning('Session has expired, attempting refresh...');
        // Try to refresh expired session
        const {data: refreshData, error: refreshError} =
          await supabase.auth.refreshSession();

        if (refreshError || !refreshData?.session) {
          loggingService.error(
            'Failed to refresh expired session:',
            refreshError,
          );
          return false;
        }

        loggingService.info('Expired session refreshed successfully');
        return true;
      }

      // Check if session expires within the next 5 minutes
      // If so, refresh it proactively to keep user active
      const timeUntilExpiry = expiresAt - now;
      const fiveMinutes = 5 * 60; // 5 minutes in seconds

      if (timeUntilExpiry < fiveMinutes) {
        loggingService.info(
          'Session expiring soon, refreshing proactively...',
          {timeUntilExpiry, expiresInMinutes: Math.floor(timeUntilExpiry / 60)},
        );

        // Refresh the session - Supabase handles token refresh automatically
        const {data: refreshData, error: refreshError} =
          await supabase.auth.refreshSession();

        if (refreshError || !refreshData?.session) {
          loggingService.error('Failed to refresh session:', refreshError);
          // Session might still be valid, return true if we're close to expiry
          return timeUntilExpiry > 0;
        }

        loggingService.info('Session refreshed successfully', {
          newExpiresAt: refreshData.session.expires_at
            ? new Date(refreshData.session.expires_at * 1000).toISOString()
            : 'unknown',
        });
        return true;
      }

      // Session is still valid
      loggingService.debug('Session is valid', {
        expiresIn: timeUntilExpiry,
        expiresInMinutes: Math.floor(timeUntilExpiry / 60),
        expiresAt: new Date(expiresAt * 1000).toISOString(),
      });
      return true;
    } catch (error) {
      loggingService.error('Error validating session:', error);
      return false;
    }
  }

  /**
   * Transform backend user data to AuthUser format
   */
  private transformBackendUser(backendUser: any): AuthUser {
    return {
      id: backendUser.id,
      email: backendUser.email,
      firstName: backendUser.firstName,
      lastName: backendUser.lastName,
      avatar: backendUser.avatar,
      hasCompletedSetup: backendUser.hasCompletedSetup,
      notificationPermission: backendUser.userSetting
        ?.notificationPermission as NotificationPermission,
      preferredLanguage: backendUser.userSetting?.preferredLanguage as Language,
    };
  }

  /**
   * Fetch user data from backend and store in encrypted storage
   */
  private async fetchAndStoreUserData(): Promise<AuthUser | null> {
    try {
      loggingService.info('Fetching user data from backend...');
      const {data: userData, error: userError} = await apolloClient.query({
        query: GET_ME,
        fetchPolicy: 'network-only',
      });

      if (userError) {
        throw userError;
      }

      if (!userData?.me) {
        loggingService.warning('No user data returned from backend');
        return null;
      }

      const user = this.transformBackendUser(userData.me);
      await EncryptedStorage.setItem('auth_user', JSON.stringify(user));
      loggingService.info('User data fetched and stored');
      return user;
    } catch (error) {
      loggingService.error('Failed to fetch user data:', error);
      return null;
    }
  }

  /**
   * Get current auth state - Supabase handles everything automatically
   * - Retrieves session from EncryptedStorage
   * - Auto-refreshes if token expired
   * - Validates session and refreshes if needed
   * - Retrieves complete user data from encrypted storage
   *
   * IMPORTANT: This method ensures users stay logged in even after days/weeks
   * by checking stored user data first, then validating/refreshing session
   *
   * @returns {Promise<AuthUser>} Current authenticated user or empty user
   */
  async getAuthUser(): Promise<AuthUser> {
    try {
      // First, check if we have stored user data
      // This allows us to restore sessions even if access token expired
      const userDataString = await EncryptedStorage.getItem('auth_user');

      // If we have stored user data, try to validate/refresh session
      // This ensures users stay logged in even after days
      if (userDataString) {
        try {
          const storedUser = JSON.parse(userDataString) as AuthUser;

          // If stored user has valid ID, check session
          if (storedUser.id && storedUser.email) {
            // Try to validate and refresh session
            // Even if this fails, we'll still return the stored user
            // because refresh token might still be valid
            const hasValidSession = await this.validateAndRefreshSession();

            if (hasValidSession) {
              loggingService.info(
                'Session validated and refreshed, using stored user data',
              );
              return storedUser;
            }

            // Session validation failed, but check if we have a session at all
            // Supabase might have a refresh token even if access token expired
            const {data: sessionData} = await supabase.auth.getSession();

            if (sessionData?.session) {
              // We have a session (even if expired), try to refresh it
              loggingService.info(
                'Found session, attempting refresh for stored user',
              );
              const {data: refreshData, error: refreshError} =
                await supabase.auth.refreshSession();

              if (refreshData?.session && !refreshError) {
                loggingService.info(
                  'Session refreshed successfully, user remains logged in',
                );
                return storedUser;
              }

              // Refresh failed, but if refresh token exists, user should stay logged in
              // Check if refresh token exists in session
              if (sessionData.session.refresh_token) {
                loggingService.info(
                  'Refresh token exists, user stays logged in (will refresh on next API call)',
                );
                return storedUser;
              }
            }

            // No session at all, but we have stored user - might be network issue
            // Return stored user anyway to keep user logged in
            loggingService.info(
              'No active session but stored user exists, keeping user logged in',
            );
            return storedUser;
          }
        } catch (parseError) {
          loggingService.error('Error parsing stored user data:', parseError);
          // Continue to fetch fresh data
        }
      }

      // No stored user data or force refresh - validate session and fetch from backend
      const hasValidSession = await this.validateAndRefreshSession();

      if (!hasValidSession) {
        loggingService.info(
          'No valid session and no stored user, returning empty auth user',
        );
        return createEmptyAuthUser();
      }

      // Fetch fresh user data from backend
      const user = await this.fetchAndStoreUserData();
      return user || createEmptyAuthUser();
    } catch (error) {
      loggingService.error('Error getting auth state:', error);

      // On error, try to return stored user if available
      try {
        const userDataString = await EncryptedStorage.getItem('auth_user');
        if (userDataString) {
          const storedUser = JSON.parse(userDataString) as AuthUser;
          if (storedUser.id && storedUser.email) {
            loggingService.info(
              'Error occurred, returning stored user to keep logged in',
            );
            return storedUser;
          }
        }
      } catch (fallbackError) {
        loggingService.error(
          'Error in fallback to stored user:',
          fallbackError,
        );
      }

      return createEmptyAuthUser();
    }
  }
}

// Singleton instance
const authService = new AuthService();
export default authService;
