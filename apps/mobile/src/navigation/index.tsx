import React, {useState, useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {LoginScreen} from '../screens/auth';
import {HomeScreen} from '../screens/home';

// Define our navigation types
type AuthStackParamList = {
  Login: undefined;
};

type MainStackParamList = {
  Home: undefined;
};

// Create the navigation stacks
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const MainStack = createNativeStackNavigator<MainStackParamList>();

// Auth Stack Navigator - shown when user is NOT authenticated
function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{headerShown: false}}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // TODO: Replace with actual auth state check from Supabase
  useEffect(() => {
    // Check if user is logged in
    // Example: supabase.auth.getSession().then(({ data }) => {
    //   setIsAuthenticated(!!data.session);
    // });
  }, []);

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainNavigator /> : <AuthNavigator />}
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
