import {useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {loggingService} from '@services/logging.service';
import authService from '@services/auth.service';

// Storage key
const FIRST_TIME_KEY = 'isFirstTime';

// Check if this is the first time the user is opening the app
export const useFirstTimeCheck = () => {
  const [isFirstTime, setIsFirstTime] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  const checkFirstTimeUser = async () => {
    try {
      // This is not sensitive data, so we can use AsyncStorage
      const value = await AsyncStorage.getItem(FIRST_TIME_KEY);
      setIsLoading(false);
      if (value === null) {
        setIsFirstTime(true); // If value is null, this is the first time
        await authService.signOut();
      } else {
        setIsFirstTime(false);
      }
    } catch (error) {
      loggingService.error('Error checking first time status:', error);
      setIsFirstTime(true);
      setIsLoading(false);
      await authService.signOut();
    }
  };

  // Mark user as not first time
  const markAsNotFirstTime = async () => {
    try {
      await AsyncStorage.setItem(FIRST_TIME_KEY, 'false');
      setIsFirstTime(false);
    } catch (error) {
      loggingService.error('Error marking as not first time:', error);
    }
  };

  return {isFirstTime, isLoading, markAsNotFirstTime, checkFirstTimeUser};
};
