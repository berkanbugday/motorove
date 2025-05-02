import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {SigninScreen, ForgotPasswordScreen, SignupScreen} from '@screens/auth';
import {WelcomeScreen} from '@screens/welcome';
import {AccountSetupScreen} from '@screens/auth';
import {AuthStackParamList} from '../types/navigationTypes';

const Stack = createNativeStackNavigator<AuthStackParamList>();

type AuthNavigatorProps = {
  isFirstTime: boolean;
};

/**
 * Authentication navigation stack - shown when user is NOT authenticated
 * Includes Welcome, Signin, and ForgotPassword screens
 */
export function AuthNavigator({isFirstTime}: AuthNavigatorProps) {
  return (
    <Stack.Navigator
      screenOptions={{headerShown: false}}
      initialRouteName={isFirstTime ? 'Welcome' : 'Signin'}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Signin" component={SigninScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="AccountSetup" component={AccountSetupScreen} />
    </Stack.Navigator>
  );
}
