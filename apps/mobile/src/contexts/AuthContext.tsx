import React, {createContext, useContext, useEffect, useState, useCallback} from 'react';
import authService from '../services/auth.service';
import {AuthState, AuthResponse} from '../types/auth.types';
import {loggingService} from '@services/logging.service';
import {NotificationPermission} from '@motorove/shared';
import {useRemoveDeviceToken} from '@services/notification.service';
import {useUpdateUserSetting} from '@services/user-setting.service';

// Import refactored helpers
import {useAppStateRefresh} from './auth/useAppStateRefresh';
import {
  createEmptyAuthState,
  convertAuthResponseToState,
  updateAuthStateWithSetup,
  updateAuthStateWithNotificationPermission,
  isValidAuthState,
} from './auth/authStateHelpers';

/**
 * Authentication Context Type
 */
export interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<AuthResponse>;
  accountSetup: (hasCompletedSetup: boolean) => Promise<void>;
  signOut: () => Promise<void>;
  loadAuthState: () => Promise<void>;
  updateNotificationPermission: (permission: NotificationPermission) => Promise<void>;
  isInitializing: boolean;
}

/**
 * Default context value with error-throwing implementations
 */
const createDefaultContextValue = (): AuthContextType => ({
  ...createEmptyAuthState(),
  signIn: async () => {
    throw new Error('AuthContext not initialized');
  },
  accountSetup: async () => {
    throw new Error('AuthContext not initialized');
  },
  signOut: async () => {
    throw new Error('AuthContext not initialized');
  },
  loadAuthState: async () => {
    throw new Error('AuthContext not initialized');
  },
  updateNotificationPermission: async () => {
    throw new Error('AuthContext not initialized');
  },
  isInitializing: false,
});

// Create the context
const AuthContext = createContext<AuthContextType>(createDefaultContextValue());

/**
 * Provider props
 */
interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * Authentication Provider Component
 * Manages global authentication state and provides auth operations
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({children}) => {
  const [authState, setAuthState] = useState<AuthState>(createEmptyAuthState());
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const {removeDeviceToken} = useRemoveDeviceToken();
  const {updateUserSetting} = useUpdateUserSetting();

  // Load authentication state on mount
  useEffect(() => {
    loadAuthState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle app foreground token refresh
  useAppStateRefresh(authState, setAuthState);

  /**
   * Load authentication state from storage
   */
  const loadAuthState = useCallback(async (): Promise<void> => {
    try {
      setIsInitializing(true);
      loggingService.info('Loading authentication state');

      const state = await authService.getAuthState();
      setAuthState(state);

      if (isValidAuthState(state)) {
        loggingService.info('Auth context loaded with valid auth state');
      } else {
        loggingService.info('Auth context loaded with no valid session');
      }
    } catch (error) {
      loggingService.error('Error loading auth state:', error);
      setAuthState(createEmptyAuthState());
    } finally {
      setIsInitializing(false);
    }
  }, []);

  /**
   * Sign in user
   */
  const signIn = useCallback(
    async (email: string, password: string): Promise<AuthResponse> => {
      const response = await authService.signIn(email, password);

      if (response.session) {
        const newState = convertAuthResponseToState(response);

        loggingService.info('Setting auth state after signin', {
          hasUser: !!newState.user,
          hasToken: !!newState.accessToken,
        });

        setAuthState(newState);
      }

      return response;
    },
    [],
  );

  /**
   * Update account setup status
   */
  const accountSetup = useCallback(
    async (hasCompletedSetup: boolean): Promise<void> => {
      const newState = updateAuthStateWithSetup(authState, hasCompletedSetup);
      setAuthState(newState);
      await authService.saveAuthDataToEncryptedStorage(newState);
    },
    [authState],
  );

  /**
   * Sign out user
   */
  const signOut = useCallback(async (): Promise<void> => {
    try {
      await removeDeviceToken();
      await authService.signOut();
      setAuthState(createEmptyAuthState());
    } catch (error) {
      loggingService.error('Error signing out:', error);
      throw error;
    }
  }, [removeDeviceToken]);

  /**
   * Update notification permission
   */
  const updateNotificationPermission = useCallback(
    async (permission: NotificationPermission): Promise<void> => {
      const userSetting = await updateUserSetting({
        notificationPermission: permission,
      });

      if (!userSetting) {
        throw new Error('Failed to update notification permission');
      }

      const newState = updateAuthStateWithNotificationPermission(
        authState,
        permission,
      );
      setAuthState(newState);
      await authService.saveAuthDataToEncryptedStorage(newState);
    },
    [authState, updateUserSetting],
  );

  const contextValue: AuthContextType = {
    ...authState,
    signIn,
    accountSetup,
    signOut,
    loadAuthState,
    updateNotificationPermission,
    isInitializing,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to use auth context
 * @throws {Error} If used outside of AuthProvider
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};

export default AuthContext;
