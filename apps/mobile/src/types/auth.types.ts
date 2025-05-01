/**
 * Authentication-related types and interfaces
 */

/**
 * User entity interface
 */
export interface AuthUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  supabaseId: string;
}

/**
 * Authentication response from API
 */
export interface AuthResponse {
  user: AuthUser;
  session?: {
    access_token: string;
    refresh_token: string;
    expires_at: number;
  };
}

/**
 * Authentication state in the app
 */
export interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
  isLoading: boolean;
}

/**
 * Storage keys for auth data
 */
export const AUTH_STORAGE_KEYS = {
  USER: 'auth_user',
  ACCESS_TOKEN: 'auth_access_token',
  REFRESH_TOKEN: 'auth_refresh_token',
  EXPIRES_AT: 'auth_expires_at',
  AUTH_DATA: 'encrypted_auth_data',
};

export interface AuthContextType {
  user: AuthUser | null;
  accessToken: string | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}
