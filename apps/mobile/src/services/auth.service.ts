import {apolloClient} from '@configs/apolloClientConfig';
import {SIGN_UP, GET_ME} from './graphql';
import {AuthUser} from '../types/auth.types';
import {loggingService} from './logging.service';
import {supabase} from '@configs/supabase';
import {Language, NotificationPermission} from '@motorove/shared';
import EncryptedStorage from 'react-native-encrypted-storage';
import {errorToMessage} from '@utils/errorUtils';
import {errorService} from './error.service';
import i18n from '../i18n/i18n';
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
  ): Promise<boolean> {
    try {
      loggingService.info('Signing up...');

      const {data, errors} = await apolloClient.mutate({
        mutation: SIGN_UP,
        variables: {
          input: {firstName, lastName, email, password, preferredLanguage},
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

      return userData.me;
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
    try {
      loggingService.info('Signing out...');

      loggingService.info('User data cleared from encrypted storage');

      // Clear Apollo cache
      apolloClient.stop();
      await apolloClient.resetStore();

      await EncryptedStorage.clear();

      // Sign out from Supabase - it clears session from storage automatically
      const {error} = await supabase.auth.signOut();
      if (error) {
        loggingService.warning('Supabase sign out error:', error);
      }

      loggingService.info('Sign out successful');
    } catch (error) {
      loggingService.error('Sign out error:', error);
      // Force cleanup
      await apolloClient.resetStore();
      try {
        await EncryptedStorage.clear();
      } catch (storageError) {
        loggingService.error('Failed to clear user data:', storageError);
      }
    }
  }

  /**
   * Reset password - Send password reset email
   * Uses Supabase directly, no backend request needed
   */
  async resetPassword(email: string): Promise<boolean> {
    try {
      loggingService.info('Sending password reset email...');

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

      loggingService.info('Password reset email sent successfully');
      errorService.showSuccessToast(i18n.t('screens.resetPassword.email_sent'));
      return true;
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
  async updateEmail(newEmail: string): Promise<boolean> {
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

      loggingService.info(
        'Email updated - Supabase updated session automatically',
      );
      errorService.showSuccessToast(
        i18n.t('screens.changeEmail.success_updated'),
      );
      return true;
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
  async updatePassword(newPassword: string): Promise<boolean> {
    try {
      loggingService.info('Updating password...');

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

      loggingService.info('Password updated successfully');
      errorService.showSuccessToast(
        i18n.t('screens.changePassword.success_updated'),
      );
      return true;
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
  async resend(email: string): Promise<boolean> {
    try {
      loggingService.info('Resending verification email via Supabase...');

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

      loggingService.info('Verification email resent successfully');
      errorService.showSuccessToast(i18n.t('screens.resetPassword.email_sent'));
      return true;
    } catch (error) {
      loggingService.error('Resend error:', error);
      const errorMessage = errorToMessage(error);
      errorService.showErrorToast(errorMessage);
      throw error;
    }
  }

  // ==================== Auth State Management ====================

  /**
   * Get current auth state - Supabase handles everything automatically
   * - Retrieves session from EncryptedStorage
   * - Auto-refreshes if token expired
   * - Retrieves complete user data from encrypted storage
   */
  async getAuthUser(force: boolean = false): Promise<AuthUser> {
    try {
      // Get user data from encrypted storage
      const userDataString = await EncryptedStorage.getItem('auth_user');

      let user: AuthUser | null = null;

      if (!userDataString || force) {
        // Fallback: fetch from backend if not in storage
        loggingService.info(
          'User data not in storage, fetching from backend...',
        );
        try {
          const {data: userData} = await apolloClient.query({
            query: GET_ME,
            fetchPolicy: 'network-only',
          });

          if (userData?.me) {
            const backendUser = userData.me;
            user = {
              id: backendUser.id,
              email: backendUser.email,
              firstName: backendUser.firstName,
              lastName: backendUser.lastName,
              avatar: backendUser.avatar,
              hasCompletedSetup: backendUser.hasCompletedSetup,
              notificationPermission: backendUser.userSetting
                ?.notificationPermission as NotificationPermission,
              preferredLanguage: backendUser.userSetting
                ?.preferredLanguage as Language,
            };

            // Store for future use
            await EncryptedStorage.setItem('auth_user', JSON.stringify(user));
            loggingService.info('User data fetched and stored');
          }
        } catch (fetchError) {
          loggingService.error('Failed to fetch user data:', fetchError);
        }
      } else {
        // Use stored user data
        user = JSON.parse(userDataString);
        loggingService.info('Retrieved user data from encrypted storage');
      }

      if (!user) {
        return createEmptyAuthUser();
      }

      return user;
    } catch (error) {
      loggingService.error('Error getting auth state:', error);
      return createEmptyAuthUser();
    }
  }
}

// Singleton instance
const authService = new AuthService();
export default authService;
