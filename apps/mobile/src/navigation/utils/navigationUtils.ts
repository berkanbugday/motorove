import {useEffect, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Check if this is the first time the user is opening the app
export const useFirstTimeCheck = () => {
  const [isFirstTime, setIsFirstTime] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkFirstTimeUser = async () => {
      try {
        const value = await AsyncStorage.getItem('isFirstTime');
        setIsFirstTime(value === null); // If value is null, this is the first time
        setIsLoading(false);
      } catch (error) {
        console.error('Error checking first time status:', error);
        setIsFirstTime(true);
        setIsLoading(false);
      }
    };

    checkFirstTimeUser();
  }, []);

  // Mark user as not first time
  const markAsNotFirstTime = async () => {
    try {
      await AsyncStorage.setItem('isFirstTime', 'false');
      setIsFirstTime(false);
    } catch (error) {
      console.error('Error marking as not first time:', error);
    }
  };

  return {isFirstTime, isLoading, markAsNotFirstTime};
};

// Hook to handle authentication
export function useAuth() {
  // For simplicity, we're using state here
  // In a real app, this would use Supabase Auth or similar
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = async (email: string, password: string) => {
    // TODO: Implement actual login with Supabase
    // Example: const { error } = await supabase.auth.signInWithPassword({ email, password });

    // For demo purposes:
    return new Promise<{success: boolean; error?: string}>(resolve => {
      setTimeout(() => {
        // Simulate successful login
        if (email && password) {
          setIsAuthenticated(true);
          resolve({success: true});
        } else {
          resolve({success: false, error: 'Invalid credentials'});
        }
      }, 1000);
    });
  };

  const signup = async (fullName: string, email: string, password: string) => {
    // TODO: Implement actual signup with Supabase
    // Example: const { error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } });

    // For demo purposes:
    return new Promise<{success: boolean; error?: string}>(resolve => {
      setTimeout(() => {
        // Simulate successful signup
        if (fullName && email && password) {
          setIsAuthenticated(true);
          resolve({success: true});
        } else {
          resolve({success: false, error: 'Registration failed'});
        }
      }, 1000);
    });
  };

  const logout = async () => {
    // TODO: Implement actual logout with Supabase
    // Example: await supabase.auth.signOut();

    setIsAuthenticated(false);
    return {success: true};
  };

  return {
    isAuthenticated,
    login,
    signup,
    logout,
  };
}
