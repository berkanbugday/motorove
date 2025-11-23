import {createClient} from '@supabase/supabase-js';
import type {SupportedStorage} from '@supabase/supabase-js';
import Config from 'react-native-config';
import EncryptedStorage from 'react-native-encrypted-storage';
import {loggingService} from '@services/logging.service';

// Get Supabase credentials from environment
const supabaseUrl = Config.SUPABASE_URL;
const supabaseKey = Config.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  loggingService.error('Missing Supabase credentials in environment');
  throw new Error('Missing Supabase credentials');
}

/**
 * Custom storage adapter using EncryptedStorage for secure session persistence
 * Implements Supabase's SupportedStorage interface
 */
const supabaseStorage: SupportedStorage = {
  async getItem(key: string): Promise<string | null> {
    try {
      const value = await EncryptedStorage.getItem(key);
      return value;
    } catch (error) {
      loggingService.error('Error getting item from storage:', error);
      return null;
    }
  },
  async setItem(key: string, value: string): Promise<void> {
    try {
      await EncryptedStorage.setItem(key, value);
      console.log(value);
    } catch (error) {
      loggingService.error('Error setting item in storage:', error);
    }
  },
  async removeItem(): Promise<void> {
    try {
      await EncryptedStorage.clear();
    } catch (error) {
      loggingService.error('Error removing item from storage:', error);
    }
  },
};

/**
 * Supabase client for mobile app
 * Configured for complete automatic session management:
 * - Auto token refresh (no manual intervention needed)
 * - Secure session persistence with EncryptedStorage
 * - PKCE flow for enhanced security
 * - No backend proxy required
 */
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    // Use PKCE flow for better security
    flowType: 'pkce',
    // Don't detect session in URL (not applicable for mobile)
    detectSessionInUrl: false,
    // Enable automatic token refresh - Supabase handles everything
    autoRefreshToken: true,
    // Persist session in encrypted storage
    persistSession: true,
    // Use our custom encrypted storage adapter
    storage: supabaseStorage,
    // Storage key for session data
    storageKey: 'supabase.auth.token',
    // Lock is handled internally by Supabase to prevent concurrent refresh operations
  },
});

loggingService.info('Supabase client initialized');
