/**
 * Authentication-related types and interfaces
 */

import {NotificationPermission} from '@motorove/shared';

/**
 * User entity interface
 */
export interface AuthUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  hasCompletedSetup?: boolean;
  notificationPermission?: NotificationPermission;
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
  } | null;
}

/**
 * Authentication state in the app
 */
export interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
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

export interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<AuthResponse>;
  signUp: (
    firstName: string,
    lastName: string,
    email: string,
    password: string,
  ) => Promise<AuthResponse>;
  signOut: () => Promise<void>;
  loadAuthState: () => Promise<void>;
}
