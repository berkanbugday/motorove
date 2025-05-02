import {useEffect, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useAuth as useAuthContext} from '@contexts';
import {AuthContextType} from '../../types/auth.types';
import {loggingService} from '@services/logging.service';
// Storage key
const FIRST_TIME_KEY = 'isFirstTime';

// Check if this is the first time the user is opening the app
export const useFirstTimeCheck = () => {
  const [isFirstTime, setIsFirstTime] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkFirstTimeUser = async () => {
      try {
        // This is not sensitive data, so we can use AsyncStorage
        const value = await AsyncStorage.getItem(FIRST_TIME_KEY);
        setIsFirstTime(value === null); // If value is null, this is the first time
        setIsLoading(false);
      } catch (error) {
        loggingService.error(
          'Error checking first time status:',
          error as Error,
        );
        setIsFirstTime(true);
        setIsLoading(false);
      }
    };

    checkFirstTimeUser();
  }, []);

  // Mark user as not first time
  const markAsNotFirstTime = async () => {
    try {
      await AsyncStorage.setItem(FIRST_TIME_KEY, 'false');
      setIsFirstTime(false);
    } catch (error) {
      loggingService.error('Error marking as not first time:', error as Error);
    }
  };

  return {isFirstTime, isLoading, markAsNotFirstTime};
};

// Hook to handle authentication
export function useAuth() {
  // Use the context from our AuthContext
  const authContext: AuthContextType = useAuthContext();

  // Create a memoized isAuthenticated value to prevent unnecessary rerenders
  const isAuthenticated =
    Boolean(authContext.user) && Boolean(authContext.accessToken);

  // Debug log when auth state changes
  useEffect(() => {
    loggingService.info('Auth state in useAuth hook:', {
      hasUser: Boolean(authContext.user),
      hasToken: Boolean(authContext.accessToken),
      isAuthenticated,
    });
  }, [authContext.user, authContext.accessToken, isAuthenticated]);

  return {
    isAuthenticated,
    isLoading: authContext.isLoading,
    user: authContext.user,
    signin: authContext.signIn,
    signup: authContext.signUp,
    logout: authContext.signOut,
  };
}
