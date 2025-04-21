import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {LoginScreen, ForgotPasswordScreen, SignupScreen} from '@screens/auth';
import {WelcomeScreen} from '@screens/welcome';
import {AuthStackParamList} from '../types/navigationTypes';

const Stack = createNativeStackNavigator<AuthStackParamList>();

type AuthNavigatorProps = {
  isFirstTime: boolean;
};

/**
 * Authentication navigation stack - shown when user is NOT authenticated
 * Includes Welcome, Login, and ForgotPassword screens
 */
export function AuthNavigator({isFirstTime}: AuthNavigatorProps) {
  return (
    <Stack.Navigator
      screenOptions={{headerShown: false}}
      initialRouteName={isFirstTime ? 'Welcome' : 'Login'}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
}
