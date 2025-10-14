import EncryptedStorage from 'react-native-encrypted-storage';
import {AuthState, AUTH_STORAGE_KEYS as STORAGE_KEYS} from '../../types/auth.types';
import {loggingService} from '../logging.service';

/**
 * Handles secure storage of authentication data
 * Single Responsibility: Manage auth data persistence
 */
export class AuthStorage {
  /**
   * Retrieve auth state from encrypted storage
   */
  static async getAuthState(): Promise<AuthState | null> {
    try {
      const encryptedAuthData = await EncryptedStorage.getItem(
        STORAGE_KEYS.AUTH_DATA,
      );

      if (!encryptedAuthData) {
        return null;
      }

      return JSON.parse(encryptedAuthData);
    } catch (error) {
      loggingService.error('Error reading auth state from storage:', error);
      return null;
    }
  }

  /**
   * Save auth state to encrypted storage
   */
  static async saveAuthState(authState: AuthState): Promise<void> {
    try {
      const promises = [
        EncryptedStorage.setItem(
          STORAGE_KEYS.AUTH_DATA,
          JSON.stringify(authState),
        ),
      ];

      // Save refresh token separately if it exists
      if (authState.refreshToken) {
        promises.push(
          EncryptedStorage.setItem(
            STORAGE_KEYS.REFRESH_TOKEN,
            JSON.stringify(authState.refreshToken),
          ),
        );
      }

      await Promise.all(promises);

      loggingService.info('Auth data saved to encrypted storage', {
        hasUser: !!authState.user,
        hasAccessToken: !!authState.accessToken,
        expiresAt: authState.expiresAt,
      });
    } catch (error) {
      loggingService.error('Error saving auth state to storage:', error);
      throw error;
    }
  }

  /**
   * Get refresh token from storage
   */
  static async getRefreshToken(): Promise<string | null> {
    try {
      const refreshToken = await EncryptedStorage.getItem(
        STORAGE_KEYS.REFRESH_TOKEN,
      );

      if (!refreshToken) {
        return null;
      }

      return JSON.parse(refreshToken);
    } catch (error) {
      loggingService.error('Error reading refresh token from storage:', error);
      return null;
    }
  }

  /**
   * Remove refresh token from storage
   */
  static async removeRefreshToken(): Promise<void> {
    try {
      await EncryptedStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    } catch (error) {
      loggingService.error('Error removing refresh token:', error);
    }
  }

  /**
   * Clear all auth data from storage
   */
  static async clearAll(): Promise<void> {
    try {
      await EncryptedStorage.clear();
      loggingService.info('All auth data cleared from storage');
    } catch (error) {
      loggingService.error('Error clearing auth storage:', error);
      throw error;
    }
  }
}
