import React, {useState, useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {LoginScreen, ForgotPasswordScreen} from '../screens/auth';
import {HomeScreen} from '../screens/home';
import {WelcomeScreen} from '../screens/welcome';

// Define our navigation types
type AuthStackParamList = {
  Login: undefined;
  Welcome: undefined;
  ForgotPassword: undefined;
};

type MainStackParamList = {
  Home: undefined;
};

// Create the navigation stacks
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const MainStack = createNativeStackNavigator<MainStackParamList>();

// Auth Stack Navigator - shown when user is NOT authenticated
function AuthNavigator({isFirstTime}: {isFirstTime: boolean}) {
  return (
    <AuthStack.Navigator
      screenOptions={{headerShown: false}}
      initialRouteName={isFirstTime ? 'Welcome' : 'Login'}>
      <AuthStack.Screen name="Welcome" component={WelcomeScreen} />
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen
        name="ForgotPassword"
        component={ForgotPasswordScreen}
      />
    </AuthStack.Navigator>
  );
}

// Main Stack Navigator - shown when user IS authenticated
function MainNavigator() {
  return (
    <MainStack.Navigator>
      <MainStack.Screen name="Home" component={HomeScreen} />
    </MainStack.Navigator>
  );
}

// Root Navigator - determines which stack to show based on auth state
export function RootNavigator() {
  // This would typically come from a context or auth provider
  const [isAuthenticated, _setIsAuthenticated] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // Check first time user status and auth state
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

    // TODO: Replace with actual auth state check from Supabase
    // Example of how this would be implemented:
    // const checkAuthState = async () => {
    //   const { data } = await supabase.auth.getSession();
    //   _setIsAuthenticated(!!data.session);
    // };
    // checkAuthState();

    checkFirstTimeUser();
  }, []);

  if (isLoading) {
    // You could show a splash screen here
    return null;
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? (
        <MainNavigator />
      ) : (
        <AuthNavigator isFirstTime={isFirstTime} />
      )}
    </NavigationContainer>
  );
}

// Helper hook to expose auth methods to screens
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

  const logout = async () => {
    // TODO: Implement actual logout with Supabase
    // Example: await supabase.auth.signOut();

    setIsAuthenticated(false);
    return {success: true};
  };

  return {
    isAuthenticated,
    login,
    logout,
  };
}
