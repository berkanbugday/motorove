import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from 'react';
import {AppState, AppStateStatus} from 'react-native';
import authService from '../services/auth.service';
import {AuthUser} from '../types/auth.types';
import {loggingService} from '@services/logging.service';
import {firebaseService} from '@services/firebase.service';
import {NotificationPermission} from '@motorove/shared';
import {useRemoveDeviceToken} from '@services/notification.service';
import {useUpdateUserSetting} from '@services/user-setting.service';
import {useLanguage} from './LanguageContext';
import {useLocationPermission} from '@hooks/useLocationPermission';
import {LocationPermissionOverlay} from '@components/LocationPermissionOverlay/LocationPermissionOverlay';
import {supabase} from '@configs/supabase';

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
  const appState = useRef<AppStateStatus>(AppState.currentState);
  const sessionRefreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Location permission hook - only active when user is authenticated
  const isAuthenticated = isValidAuthUser(authUser);
  const {
    showPermissionOverlay,
    onAllowPermission,
    onDismissOverlay,
    onOpenSettings,
  } = useLocationPermission(isAuthenticated);

  /**
   * Setup periodic session refresh to keep user active
   * Refreshes session every 30 minutes to ensure 1 month active period
   */
  const setupPeriodicRefresh = useCallback((user: AuthUser) => {
    // Clear any existing interval
    if (sessionRefreshIntervalRef.current) {
      clearInterval(sessionRefreshIntervalRef.current);
      sessionRefreshIntervalRef.current = null;
    }

    // Only set up periodic refresh if user is authenticated
    if (isValidAuthUser(user)) {
      // Refresh session every 30 minutes to keep user active
      // This ensures the session doesn't expire due to inactivity
      sessionRefreshIntervalRef.current = setInterval(async () => {
        loggingService.info('Periodic session refresh check');
        try {
          await authService.validateAndRefreshSession();
        } catch (error) {
          loggingService.error('Error in periodic session refresh:', error);
        }
      }, 30 * 60 * 1000); // 30 minutes
    }
  }, []);

  /**
   * Setup Supabase session state change listeners
   * This ensures we stay in sync with Supabase auth state
   * and handle token refresh automatically
   */
  const setupSessionListeners = useCallback(() => {
    // Listen to auth state changes (sign in, sign out, token refresh)
    const {
      data: {subscription},
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      loggingService.info('Supabase auth state changed', {event});

      try {
        switch (event) {
          case 'SIGNED_IN':
          case 'TOKEN_REFRESHED':
            // Session was refreshed or user signed in
            // Reload user data to ensure we have the latest state
            if (session) {
              loggingService.info('Session active, reloading user data');
              const user = await authService.getAuthUser();
              setAuthUser(user);
              if (isValidAuthUser(user)) {
                setupPeriodicRefresh(user);
              }
            }
            break;

          case 'SIGNED_OUT':
            // User signed out, clear auth state
            // Only handle if we're not already in the process of signing out
            // (prevents infinite loop when signOut triggers this event)
            if (authService.getIsSigningOut()) {
              loggingService.info(
                'SIGNED_OUT event received during sign out process, ignoring',
              );
              break;
            }
            loggingService.info('User signed out, clearing auth state');
            setAuthUser(createEmptyAuthUser());
            if (sessionRefreshIntervalRef.current) {
              clearInterval(sessionRefreshIntervalRef.current);
              sessionRefreshIntervalRef.current = null;
            }
            break;

          case 'USER_UPDATED':
            // User data was updated, reload asynchronously without blocking
            // This event is triggered after email/password updates, so we refresh
            // user data in the background without affecting UI loading states
            loggingService.info('User updated, reloading user data');
            authService
              .getAuthUser()
              .then(updatedUser => {
                setAuthUser(updatedUser);
              })
              .catch(error => {
                loggingService.error(
                  'Error reloading user data after USER_UPDATED:',
                  error,
                );
                // Don't throw - this is a background refresh, shouldn't break the flow
              });
            break;

          default:
            loggingService.info(`Unhandled auth event: ${event}`);
        }
      } catch (error) {
        loggingService.error('Error handling auth state change:', error);
      }
    });

    // Store subscription for cleanup
    return () => {
      subscription.unsubscribe();
    };
  }, [setupPeriodicRefresh]);

  /**
   * Setup app state listener to refresh session when app comes to foreground
   * This ensures users stay active even after app was in background
   */
  const setupAppStateListener = useCallback(() => {
    const subscription = AppState.addEventListener(
      'change',
      async (nextAppState: AppStateStatus) => {
        if (
          appState.current.match(/inactive|background/) &&
          nextAppState === 'active'
        ) {
          // App has come to the foreground
          loggingService.info('App came to foreground, validating session');

          try {
            // Validate and refresh session if needed
            const isValid = await authService.validateAndRefreshSession();
            if (isValid) {
              // Reload user data to ensure we have latest state
              const user = await authService.getAuthUser();
              setAuthUser(user);
              if (isValidAuthUser(user)) {
                setupPeriodicRefresh(user);
              }
            } else {
              // Session invalid, clear auth state
              setAuthUser(createEmptyAuthUser());
              if (sessionRefreshIntervalRef.current) {
                clearInterval(sessionRefreshIntervalRef.current);
                sessionRefreshIntervalRef.current = null;
              }
            }
          } catch (error) {
            loggingService.error(
              'Error refreshing session on foreground:',
              error,
            );
          }
        }

        appState.current = nextAppState;
      },
    );

    return () => {
      subscription.remove();
    };
  }, [setupPeriodicRefresh]);

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
        // Setup periodic refresh when user is authenticated
        setupPeriodicRefresh(state);
        // Set user ID for Firebase Analytics
        await firebaseService.setUserId(state.id);
        // Set user properties for Analytics
        await firebaseService.setUserProperty('user_id', state.id);
        await firebaseService.setUserProperty('email', state.email || '');
        await firebaseService.logEvent('user_login', {
          method: 'auto', // Auto login from stored session
        });
      } else {
        loggingService.info('Auth context loaded with no valid session');
        // Clear interval if user is not authenticated
        if (sessionRefreshIntervalRef.current) {
          clearInterval(sessionRefreshIntervalRef.current);
          sessionRefreshIntervalRef.current = null;
        }
      }
    } catch (error) {
      loggingService.error('Error loading auth state:', error);
      setAuthUser(createEmptyAuthUser());
    } finally {
      setIsInitializing(false);
    }
  }, [setupPeriodicRefresh]);

  // Load authentication state on mount and setup listeners
  useEffect(() => {
    let sessionCleanup: (() => void) | undefined;
    let appStateCleanup: (() => void) | undefined;
    let isMounted = true;

    const initialize = async () => {
      try {
        await loadAuthUser();
        if (isMounted) {
          sessionCleanup = setupSessionListeners();
          appStateCleanup = setupAppStateListener();
        }
      } catch (error) {
        loggingService.error('Error initializing auth:', error);
      }
    };

    initialize();

    return () => {
      isMounted = false;
      // Cleanup session listeners
      if (sessionCleanup) {
        sessionCleanup();
      }
      // Cleanup app state listener
      if (appStateCleanup) {
        appStateCleanup();
      }
      // Clear periodic refresh interval
      if (sessionRefreshIntervalRef.current) {
        clearInterval(sessionRefreshIntervalRef.current);
        sessionRefreshIntervalRef.current = null;
      }
    };
  }, [loadAuthUser, setupSessionListeners, setupAppStateListener]);

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
        // Setup periodic refresh after successful sign in
        setupPeriodicRefresh(response);

        // Set user ID and properties for Firebase Analytics
        await firebaseService.setUserId(response.id);
        await firebaseService.setUserProperty('user_id', response.id);
        await firebaseService.setUserProperty('email', response.email || '');
        if (response.preferredLanguage) {
          await firebaseService.setUserProperty(
            'preferred_language',
            response.preferredLanguage,
          );
        }
        // Log login event
        await firebaseService.logEvent('user_login', {
          method: 'email',
        });

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
    [setupPeriodicRefresh, setLanguage],
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
      // Log logout event before clearing user data
      await firebaseService.logEvent('user_logout');

      // Clear periodic refresh interval
      if (sessionRefreshIntervalRef.current) {
        clearInterval(sessionRefreshIntervalRef.current);
        sessionRefreshIntervalRef.current = null;
      }

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

      // Reset Firebase Analytics user data
      await firebaseService.resetUserId();

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
