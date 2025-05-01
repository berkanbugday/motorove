import React, {useEffect} from 'react';
import {ActivityIndicator, View} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {AuthNavigator} from './stacks/AuthNavigator';
import {MainNavigator} from './stacks/MainNavigator';
import {useFirstTimeCheck, useAuth} from './utils/navigationUtils';
import {RootStackParamList} from '../types/navigation.types';

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * Root navigator - determines which stack to show based on auth state
 * Uses a NativeStackNavigator but hides all screen headers
 */
export function RootNavigator() {
  const {isAuthenticated, isLoading: authLoading} = useAuth();
  const {isFirstTime, isLoading: firstTimeLoading} = useFirstTimeCheck();

  // Debug log for authentication state
  useEffect(() => {
    console.log('RootNavigator: Authentication state changed', {
      isAuthenticated,
      authLoading,
      isFirstTime,
      firstTimeLoading,
    });
  }, [isAuthenticated, authLoading, isFirstTime, firstTimeLoading]);

  // Show loading indicator when checking auth or first time status
  if (authLoading || firstTimeLoading) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        {isAuthenticated ? (
          // User is authenticated, show main app screens
          <Stack.Screen name="Main" component={MainNavigator} />
        ) : (
          // User is not authenticated, show auth flow
          <Stack.Screen name="Auth">
            {props => <AuthNavigator {...props} isFirstTime={isFirstTime} />}
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
