import React, {createContext, useContext, useEffect, useState} from 'react';
import authService from '../services/auth.service';
import {AuthState, AuthResponse} from '../types/auth.types';
import {loggingService} from '@services/logging.service';
import {NotificationPermission} from '@motorove/shared';
import {useRemoveDeviceToken} from '@services/notification.service';
import {useUpdateUserSetting} from '@services/user-setting.service';

// Default auth state
const defaultAuthState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  expiresAt: null,
};

// Context type
export interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<AuthResponse>;
  accountSetup: (hasCompletedSetup: boolean) => Promise<void>;
  signOut: () => Promise<void>;
  loadAuthState: () => Promise<void>;
  updateNotificationPermission: (
    permission: NotificationPermission,
  ) => Promise<void>;
  isInitializing: boolean;
}

// Create the context
const AuthContext = createContext<AuthContextType>({
  ...defaultAuthState,
  signIn: async () => {
    throw new Error('Not implemented');
  },
  accountSetup: async () => {
    throw new Error('Not implemented');
  },
  signOut: async () => {
    throw new Error('Not implemented');
  },
  loadAuthState: async () => {
    throw new Error('Not implemented');
  },
  updateNotificationPermission: async () => {
    throw new Error('Not implemented');
  },
  isInitializing: false,
});

// Provider props
interface AuthProviderProps {
  children: React.ReactNode;
}

// Auth provider component
export const AuthProvider: React.FC<AuthProviderProps> = ({children}) => {
  const [authState, setAuthState] = useState<AuthState>(defaultAuthState);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const {removeDeviceToken} = useRemoveDeviceToken();
  const {updateUserSetting} = useUpdateUserSetting();
  // Load authentication state on component mount
  useEffect(() => {
    loadAuthState();
  }, []);

  // Load authentication state
  const loadAuthState = async (): Promise<void> => {
    try {
      setIsInitializing(true);
      loggingService.info('Loading authentication state');
      // Use simplified getAuthState which handles refresh automatically
      const state = await authService.getAuthState();
      setAuthState({...state});

      // Log the result
      if (state.user && state.accessToken && state.expiresAt) {
        loggingService.info('Auth context loaded with valid auth state');
      } else {
        loggingService.info('Auth context loaded with no valid session');
      }
    } catch (error) {
      loggingService.error('Error loading auth state:', error);
      setAuthState({...defaultAuthState});
    } finally {
      setIsInitializing(false);
    }
  };

  // Sign in
  const signIn = async (
    email: string,
    password: string,
  ): Promise<AuthResponse> => {
    try {
      const response = await authService.signIn(email, password);

      if (response.session) {
        // Ensure we're setting the state correctly after signin
        const newState = {
          user: response.user,
          accessToken: response.session?.access_token || null,
          refreshToken: response.session?.refresh_token || null,
          expiresAt: response.session?.expires_at || null,
        };

        loggingService.info('Setting auth state after signin:', {
          hasUser: !!newState.user,
          hasToken: !!newState.accessToken,
        });

        setAuthState(newState);
      }

      return response;
    } catch (error) {
      throw error;
    }
  };

  // Account setup
  const accountSetup = async (hasCompletedSetup: boolean): Promise<void> => {
    try {
      const newState: AuthState = {
        ...authState,
        user: {
          ...authState.user!,
          hasCompletedSetup,
        },
      };
      setAuthState(newState);

      await authService.saveAuthDataToEncryptedStorage(newState);
    } catch (error) {}
  };

  // Sign out
  const signOut = async (): Promise<void> => {
    try {
      await removeDeviceToken();
      await authService.signOut();
      setAuthState(defaultAuthState);
    } catch (error) {
      loggingService.error('Error signing out:', error);
      throw error;
    }
  };

  const updateNotificationPermission = async (
    permission: NotificationPermission,
  ): Promise<void> => {
    try {
      const userSetting = await updateUserSetting({
        notificationPermission: permission,
      });

      if (userSetting) {
        const newState: AuthState = {
          ...authState,
          user: {
            ...authState.user!,
            notificationPermission: permission,
          },
        };
        setAuthState(newState);
        await authService.saveAuthDataToEncryptedStorage(newState);
      }
    } catch (error) {
      loggingService.error('Error updating notification permission:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        signIn,
        accountSetup,
        signOut,
        loadAuthState,
        updateNotificationPermission,
        isInitializing,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};

export default AuthContext;
