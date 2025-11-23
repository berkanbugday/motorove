import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import authService from '../services/auth.service';
import {AuthUser} from '../types/auth.types';
import {loggingService} from '@services/logging.service';
import {NotificationPermission} from '@motorove/shared';
import {useRemoveDeviceToken} from '@services/notification.service';
import {useUpdateUserSetting} from '@services/user-setting.service';
import {useLanguage} from './LanguageContext';
import {useLocationPermission} from '@hooks/useLocationPermission';
import {LocationPermissionOverlay} from '@components/LocationPermissionOverlay/LocationPermissionOverlay';

// Import helpers
import {createEmptyAuthUser, isValidAuthUser} from './auth/authUserHelpers';
import EncryptedStorage from 'react-native-encrypted-storage';

/**
 * Authentication Context Type
 */
export interface AuthContextType extends AuthUser {
  signIn: (email: string, password: string) => Promise<AuthUser>;
  accountSetup: (hasCompletedSetup: boolean) => Promise<void>;
  signOut: () => Promise<void>;
  loadAuthUser: () => Promise<void>;
  updateNotificationPermission: (
    permission: NotificationPermission,
  ) => Promise<void>;
  updateCurrentUser: (
    firstName: string,
    lastName: string,
    avatar: string | null,
  ) => Promise<void>;
  isInitializing: boolean;
}

/**
 * Default context value with error-throwing implementations
 */
const createDefaultContextValue = (): AuthContextType => ({
  ...createEmptyAuthUser(),
  signIn: async () => {
    throw new Error('AuthContext not initialized');
  },
  accountSetup: async () => {
    throw new Error('AuthContext not initialized');
  },
  signOut: async () => {
    throw new Error('AuthContext not initialized');
  },
  loadAuthUser: async () => {
    throw new Error('AuthContext not initialized');
  },
  updateNotificationPermission: async () => {
    throw new Error('AuthContext not initialized');
  },
  updateCurrentUser: async () => {
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
 *
 * Senior Developer Implementation:
 * - Simple state management (no complex refresh logic here)
 * - Auth service handles all token refresh automatically
 * - Clean separation: Context manages state, Service handles auth logic
 * - Automatic token refresh on app foreground (handled by auth service)
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({children}) => {
  const [authUser, setAuthUser] = useState<AuthUser>(createEmptyAuthUser());
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const {removeDeviceToken} = useRemoveDeviceToken();
  const {updateUserSetting} = useUpdateUserSetting();
  const {setLanguage} = useLanguage();

  // Location permission hook - only active when user is authenticated
  const isAuthenticated = isValidAuthUser(authUser);
  const {
    showPermissionOverlay,
    onAllowPermission,
    onDismissOverlay,
    onOpenSettings,
  } = useLocationPermission(isAuthenticated);

  // Load authentication state on mount
  useEffect(() => {
    loadAuthUser();
  }, []);

  /**
   * Load authentication state from storage
   */
  const loadAuthUser = useCallback(async (): Promise<void> => {
    try {
      setIsInitializing(true);
      loggingService.info('Loading authentication state');

      const state = await authService.getAuthUser();
      setAuthUser(state);

      if (isValidAuthUser(state)) {
        loggingService.info('Auth context loaded with valid auth state');
      } else {
        loggingService.info('Auth context loaded with no valid session');
      }
    } catch (error) {
      loggingService.error('Error loading auth state:', error);
      setAuthUser(createEmptyAuthUser());
    } finally {
      setIsInitializing(false);
    }
  }, []);

  /**
   * Sign in user
   */
  const signIn = useCallback(
    async (email: string, password: string): Promise<AuthUser> => {
      const response = await authService.signIn(email, password);

      if (response.id) {
        loggingService.info('Setting auth state after signin', {
          hasUser: !!response.id,
        });

        setAuthUser(response);

        if (response.preferredLanguage) {
          try {
            setLanguage(response.preferredLanguage.toLowerCase());
            loggingService.info('Language set from stored user preference:', {
              preferredLanguage: response.preferredLanguage,
            });
          } catch (error) {
            loggingService.error(
              'Error setting language from stored auth:',
              error,
            );
          }
        }
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
      const newUser = {
        ...authUser,
        hasCompletedSetup,
      };
      setAuthUser(newUser);
      await EncryptedStorage.setItem('auth_user', JSON.stringify(newUser));
    },
    [authUser],
  );

  /**
   * Sign out user
   */
  const signOut = useCallback(async (): Promise<void> => {
    try {
      // Remove device token first (requires authentication)
      // Don't block sign out if this fails
      try {
        await removeDeviceToken();
      } catch (tokenError) {
        loggingService.warning(
          'Failed to remove device token during sign out',
          {error: tokenError},
        );
      }

      // Perform sign out cleanup
      await authService.signOut();

      // Clear auth state last to stop any active queries
      setAuthUser(createEmptyAuthUser());
    } catch (error) {
      loggingService.error('Error signing out:', error);
      // Ensure state is cleared even on error
      setAuthUser(createEmptyAuthUser());
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

      const newUser = {
        ...authUser,
        notificationPermission: permission,
      };
      setAuthUser(newUser);
      await EncryptedStorage.setItem('auth_user', JSON.stringify(newUser));
    },
    [authUser, updateUserSetting],
  );

  /**
   * Update user profile
   */
  const updateCurrentUser = useCallback(
    async (
      firstName: string,
      lastName: string,
      avatar: string | null,
    ): Promise<void> => {
      const newUser = {
        ...authUser,
        firstName,
        lastName,
        avatar,
      };
      setAuthUser(newUser);
      await EncryptedStorage.setItem('auth_user', JSON.stringify(newUser));
    },
    [authUser],
  );

  const contextValue: AuthContextType = {
    ...authUser,
    signIn,
    accountSetup,
    signOut,
    loadAuthUser,
    updateNotificationPermission,
    updateCurrentUser,
    isInitializing,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
      {/* Show location permission overlay only when user is authenticated */}
      {isAuthenticated && (
        <LocationPermissionOverlay
          visible={showPermissionOverlay}
          onAllowPress={onAllowPermission}
          onDismiss={onDismissOverlay}
          onOpenSettings={onOpenSettings}
        />
      )}
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
