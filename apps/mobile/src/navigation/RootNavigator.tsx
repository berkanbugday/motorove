import React from 'react';
import {ActivityIndicator, View} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {AuthNavigator} from './stacks/AuthNavigator';
import {MainNavigator} from './stacks/MainNavigator';
import {useFirstTimeCheck, useAuth} from './utils/navigationUtils';
import {RootStackParamList} from './types/navigationTypes';

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * Root navigator - determines which stack to show based on auth state
 * Uses a NativeStackNavigator but hides all screen headers
 */
export function RootNavigator() {
  const {isAuthenticated} = useAuth();
  const {isFirstTime, isLoading} = useFirstTimeCheck();

  if (isLoading) {
    // Show loading indicator when checking first time status
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
          <Stack.Screen name="Main" component={MainNavigator} />
        ) : (
          <Stack.Screen name="Auth">
            {props => <AuthNavigator {...props} isFirstTime={isFirstTime} />}
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
