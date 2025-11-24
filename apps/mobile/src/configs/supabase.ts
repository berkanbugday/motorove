import {createClient} from '@supabase/supabase-js';
import Config from 'react-native-config';
import {loggingService} from '@services/logging.service';

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
  },
});

loggingService.info('Supabase client initialized');
