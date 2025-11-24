import EncryptedStorage from 'react-native-encrypted-storage';
import {loggingService} from '@services/logging.service';

/**
 * Custom storage adapter for Supabase using EncryptedStorage
 * This ensures all session data is stored securely in encrypted storage
 * instead of AsyncStorage (which is not encrypted)
 *
 * Implements the Supabase StorageAdapter interface for secure session persistence
 */
export const supabaseStorage = {
  /**
   * Get item from encrypted storage
   * @param key - Storage key
   * @returns Stored value or null if not found/error
   */
  getItem: async (key: string): Promise<string | null> => {
    try {
      const value = await EncryptedStorage.getItem(key);
      return value;
    } catch (error) {
      loggingService.error(
        `Error getting item from encrypted storage: ${key}`,
        error,
      );
      // Return null on error to allow Supabase to handle gracefully
      return null;
    }
  },

  /**
   * Set item in encrypted storage
   * @param key - Storage key
   * @param value - Value to store
   * @throws Error if storage operation fails
   */
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      await EncryptedStorage.setItem(key, value);
    } catch (error) {
      loggingService.error(
        `Error setting item in encrypted storage: ${key}`,
        error,
      );
      // Re-throw to let Supabase handle the error
      throw error;
    }
  },

  /**
   * Remove item from encrypted storage
   * @param key - Storage key
   * @throws Error if storage operation fails (except when key doesn't exist)
   */
  removeItem: async (key: string): Promise<void> => {
    try {
      // Check if item exists before trying to remove it
      const existingValue = await EncryptedStorage.getItem(key);
      if (existingValue === null || existingValue === undefined) {
        // Item doesn't exist, nothing to remove - this is fine
        loggingService.debug(
          `Item ${key} does not exist in encrypted storage, skipping removal`,
        );
        return;
      }
      await EncryptedStorage.removeItem(key);
    } catch (error: any) {
      // If the error is about the key not existing, that's fine - just log and continue
      if (
        error?.message?.includes('does not exist') ||
        error?.message?.includes('not found') ||
        error?.message?.includes('removing value')
      ) {
        loggingService.debug(
          `Item ${key} already removed or does not exist, continuing`,
        );
        return;
      }
      // For other errors, log but don't throw - Supabase can handle missing keys
      loggingService.warning(
        `Error removing item from encrypted storage: ${key}`,
        error,
      );
      // Don't re-throw - allow Supabase to continue sign out process
    }
  },
};
