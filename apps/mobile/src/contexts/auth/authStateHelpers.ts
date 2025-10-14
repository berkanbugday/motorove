import {AuthState, AuthResponse} from '../../types/auth.types';
import {NotificationPermission} from '@motorove/shared';

/**
 * Helper functions for auth state transformations
 * Single Responsibility: Transform and create auth state objects
 */

/**
 * Create empty auth state
 */
export function createEmptyAuthState(): AuthState {
  return {
    user: null,
    accessToken: null,
    refreshToken: null,
    expiresAt: null,
  };
}

/**
 * Convert AuthResponse to AuthState
 */
export function convertAuthResponseToState(
  response: AuthResponse,
): AuthState {
  return {
    user: response.user,
    accessToken: response.session?.access_token || null,
    refreshToken: response.session?.refresh_token || null,
    expiresAt: response.session?.expires_at || null,
  };
}

/**
 * Update auth state with account setup status
 */
export function updateAuthStateWithSetup(
  currentState: AuthState,
  hasCompletedSetup: boolean,
): AuthState {
  if (!currentState.user) {
    return currentState;
  }

  return {
    ...currentState,
    user: {
      ...currentState.user,
      hasCompletedSetup,
    },
  };
}

/**
 * Update auth state with notification permission
 */
export function updateAuthStateWithNotificationPermission(
  currentState: AuthState,
  permission: NotificationPermission,
): AuthState {
  if (!currentState.user) {
    return currentState;
  }

  return {
    ...currentState,
    user: {
      ...currentState.user,
      notificationPermission: permission,
    },
  };
}

/**
 * Check if auth state is valid (has user and valid token)
 */
export function isValidAuthState(state: AuthState): boolean {
  return !!(state.user && state.accessToken && state.expiresAt);
}
