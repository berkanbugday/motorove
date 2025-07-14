import React, {createContext, useContext, useEffect, useState} from 'react';
import authService from '../services/auth.service';
import {AuthState, AuthResponse} from '../types/auth.types';
import {loggingService} from '@services/logging.service';
import {
  notificationService,
  useRemoveDeviceToken,
} from '@services/notification.service';

// Default auth state
const defaultAuthState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  expiresAt: null,
  isLoading: true,
};

// Context type
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

// Create the context
const AuthContext = createContext<AuthContextType>({
  ...defaultAuthState,
  signIn: async () => {
    throw new Error('Not implemented');
  },
  signUp: async () => {
    throw new Error('Not implemented');
  },
  signOut: async () => {
    throw new Error('Not implemented');
  },
  loadAuthState: async () => {
    throw new Error('Not implemented');
  },
});

// Provider props
interface AuthProviderProps {
  children: React.ReactNode;
}

// Auth provider component
export const AuthProvider: React.FC<AuthProviderProps> = ({children}) => {
  const [authState, setAuthState] = useState<AuthState>(defaultAuthState);
  const {removeDeviceToken} = useRemoveDeviceToken();

  // Load authentication state on component mount
  useEffect(() => {
    loadAuthState();
  }, []);

  // Load authentication state
  const loadAuthState = async (): Promise<void> => {
    try {
      setAuthState(prevState => ({...prevState, isLoading: true}));
      const state = await authService.getAuthState();

      // Log authentication state for debugging
      loggingService.info('Auth state loaded:', {
        hasUser: !!state.user,
        hasToken: !!state.accessToken,
        expiresAt: state.expiresAt,
      });

      setAuthState({...state, isLoading: false});

      // Setup token refresh if needed
      if (state.user && state.accessToken && state.expiresAt) {
        // We already have background refresh in the auth service, this is just a safety check
        loggingService.info('Auth context loaded with valid auth state');
      }
    } catch (error) {
      loggingService.error('Error loading auth state:', error);
      setAuthState({...defaultAuthState, isLoading: false});
    }
  };

  // Sign in
  const signIn = async (
    email: string,
    password: string,
  ): Promise<AuthResponse> => {
    try {
      setAuthState(prevState => ({...prevState, isLoading: true}));
      const response = await authService.signIn(email, password);

      // Ensure we're setting the state correctly after signin
      const newState = {
        user: response.user,
        accessToken: response.session?.access_token || null,
        refreshToken: response.session?.refresh_token || null,
        expiresAt: response.session?.expires_at || null,
        isLoading: false,
      };

      loggingService.info('Setting auth state after signin:', {
        hasUser: !!newState.user,
        hasToken: !!newState.accessToken,
      });

      setAuthState(newState);

      return response;
    } catch (error) {
      setAuthState(prevState => ({...prevState, isLoading: false}));
      throw error;
    }
  };

  // Sign up
  const signUp = async (
    firstName: string,
    lastName: string,
    email: string,
    password: string,
  ): Promise<AuthResponse> => {
    try {
      setAuthState(prevState => ({...prevState, isLoading: true}));
      const response = await authService.signUp(
        firstName,
        lastName,
        email,
        password,
      );

      // Ensure we're setting the state correctly after signup
      const newState = {
        user: response.user,
        accessToken: response.session?.access_token || null,
        refreshToken: response.session?.refresh_token || null,
        expiresAt: response.session?.expires_at || null,
        isLoading: false,
      };

      loggingService.info('Setting auth state after signup:', {
        hasUser: !!newState.user,
        hasToken: !!newState.accessToken,
      });

      setAuthState(newState);

      return response;
    } catch (error) {
      setAuthState(prevState => ({...prevState, isLoading: false}));
      throw error;
    }
  };

  // Sign out
  const signOut = async (): Promise<void> => {
    try {
      setAuthState(prevState => ({...prevState, isLoading: true}));
      // Clean up notification service if user was logged in
      if (authState.user && authState.user.id) {
        try {
          const token = await notificationService.service.getDeviceToken();
          if (token) {
            removeDeviceToken(authState.user.id, token);
          }
        } catch (tokenError) {
          loggingService.error('Error clearing device token:', tokenError);
        }
      }

      await authService.signOut();
      setAuthState({...defaultAuthState, isLoading: false});
    } catch (error) {
      setAuthState(prevState => ({...prevState, isLoading: false}));
      loggingService.error('Error signing out:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        signIn,
        signUp,
        signOut,
        loadAuthState,
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
