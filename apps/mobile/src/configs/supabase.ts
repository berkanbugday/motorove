import {createClient} from '@supabase/supabase-js';
import Config from 'react-native-config';
import {loggingService} from '@services/logging.service';
import {supabaseStorage} from './supabaseStorage';

// Get Supabase credentials from environment
const supabaseUrl = Config.SUPABASE_URL;
const supabaseKey = Config.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  loggingService.error('Missing Supabase credentials in environment');
  throw new Error('Missing Supabase credentials');
}

/**
 * Supabase client for mobile app
 * Configured for complete automatic session management:
 * - Auto token refresh (no manual intervention needed)
 * - Secure session persistence with EncryptedStorage (custom adapter)
 * - PKCE flow for enhanced security
 * - Automatic token refresh before expiry
 * - No backend proxy required
 *
 * Note: Session duration (30 days) is configured in Supabase Dashboard:
 * Authentication > Providers > Advanced Settings
 * - Time-box user sessions: 30 days
 * - Inactivity timeout: 30 days
 */
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    // Use PKCE flow for better security (required for mobile apps)
    flowType: 'pkce',
    // Don't detect session in URL (not applicable for mobile)
    detectSessionInUrl: false,
    // Enable automatic token refresh - Supabase handles everything
    autoRefreshToken: true,
    // Persist session in encrypted storage using custom adapter
    persistSession: true,
    // Use custom encrypted storage adapter for secure storage
    storage: supabaseStorage,
    // Storage key for session data in encrypted storage
    storageKey: 'supabase.auth.token',
  },
});

loggingService.info(
  'Supabase client initialized with EncryptedStorage adapter',
);
