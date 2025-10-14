import {useEffect} from 'react';
import {AppState, AppStateStatus} from 'react-native';
import {loggingService} from '@services/logging.service';
import authService from '../../services/auth.service';
import {AuthState} from '../../types/auth.types';
import {AUTH_CONSTANTS} from './constants';

/**
 * Custom hook to handle token refresh when app comes to foreground
 * Single Responsibility: Monitor app state and trigger token refresh
 */
export const useAppStateRefresh = (
  authState: AuthState,
  onStateUpdate: (state: AuthState) => void,
): void => {
  useEffect(() => {
    const handleAppStateChange = async (
      nextAppState: AppStateStatus,
    ): Promise<void> => {
      if (nextAppState !== 'active') {
        return;
      }

      loggingService.info('App came to foreground, checking auth state');

      if (!shouldRefreshToken(authState)) {
        return;
      }

      await refreshTokenOnForeground(onStateUpdate);
    };

    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );

    return () => {
      subscription.remove();
    };
  }, [authState.user, authState.expiresAt, onStateUpdate]);
};

/**
 * Check if token should be refreshed based on expiration time
 */
function shouldRefreshToken(authState: AuthState): boolean {
  if (!authState.user || !authState.expiresAt) {
    return false;
  }

  const timeUntilExpiry = authState.expiresAt - Date.now();
  return timeUntilExpiry < AUTH_CONSTANTS.TOKEN_REFRESH_THRESHOLD_MS;
}

/**
 * Refresh token and update state
 */
async function refreshTokenOnForeground(
  onStateUpdate: (state: AuthState) => void,
): Promise<void> {
  loggingService.info('Token expired or expiring soon, refreshing on foreground');

  try {
    const state = await authService.getAuthState();
    onStateUpdate(state);
  } catch (error) {
    loggingService.error('Error refreshing token on foreground:', error);
  }
}
