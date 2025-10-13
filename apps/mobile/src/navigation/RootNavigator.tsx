import React, {useEffect} from 'react';
import {ActivityIndicator, View} from 'react-native';
import {NavigationContainer, LinkingOptions} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {AuthNavigator} from './stacks/AuthNavigator';
import {MainNavigator} from './stacks/MainNavigator';
import {useFirstTimeCheck} from './utils/navigationUtils';
import {useAuth} from '@contexts';
import {RootStackParamList} from '@navigation/types/navigationTypes';
import {AccountSetupScreen} from '@screens/auth/AccountSetupScreen';
import {NotificationPermission} from '@motorove/shared';
import {NotificationPermissionScreen} from '@screens/notification/NotificationPermissionScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

// Define the linking configuration
const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ['motorove://', 'https://motorove.app'],
  config: {
    screens: {
      Auth: 'auth',
      Main: 'main',
    },
  },
};

/**
 * Root navigator - determines which stack to show based on auth state
 * Uses a NativeStackNavigator but hides all screen headers
 */
export function RootNavigator() {
  const {user, accessToken, isInitializing} = useAuth();
  const {
    checkFirstTimeUser,
    isFirstTime,
    isLoading: firstTimeLoading,
  } = useFirstTimeCheck();

  useEffect(() => {
    async function init() {
      await checkFirstTimeUser();
    }
    init();
  }, [checkFirstTimeUser]);

  const isAuthenticated = Boolean(user) && Boolean(accessToken);
  // Show loading indicator when checking auth, session revival, or first time status
  if (isInitializing || firstTimeLoading) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        {isAuthenticated && !isFirstTime ? (
          // User is authenticated, decide whether to show main app or account setup
          !user?.hasCompletedSetup ? (
            <Stack.Screen
              name="Auth"
              component={AccountSetupScreen}
              key="accountSetup"
            />
          ) : user?.notificationPermission ===
            NotificationPermission.UNKNOWN ? (
            <Stack.Screen
              key="notificationPermission"
              name="Auth"
              component={NotificationPermissionScreen}
            />
          ) : (
            <Stack.Screen key="main" name="Main" component={MainNavigator} />
          )
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
