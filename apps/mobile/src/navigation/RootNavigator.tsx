import React, {useEffect, useRef, useCallback} from 'react';
import {View, StyleSheet, ActivityIndicator, Image} from 'react-native';
import {
  NavigationContainer,
  LinkingOptions,
  NavigationContainerRef,
} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {AuthNavigator} from './stacks/AuthNavigator';
import {MainNavigator} from './stacks/MainNavigator';
import {useFirstTimeCheck} from './utils/navigationUtils';
import {useAuth} from '@contexts';
import {colors} from '@theme';
import {RootStackParamList} from '@navigation/types/navigationTypes';
import {AccountSetupScreen} from '@screens/auth/AccountSetupScreen';
import {NotificationPermission} from '@motorove/shared';
import {NotificationPermissionScreen} from '@screens/notification/NotificationPermissionScreen';
import {notificationService} from '@services/notification.service';

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
  const navigationRef =
    useRef<NavigationContainerRef<RootStackParamList>>(null);
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

  // Set navigation ref for notification service when navigation is ready
  const handleNavigationReady = useCallback(() => {
    if (navigationRef.current && isAuthenticated) {
      notificationService.service.setNavigationRef(navigationRef.current);
    }
  }, [isAuthenticated]);
  // Show loading screen with logo when checking auth, session revival, or first time status
  if (isInitializing || firstTimeLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Image
          source={require('@assets/images/motorove_logo_light.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <ActivityIndicator
          size="small"
          color={colors.neutral.white}
          style={styles.spinner}
        />
      </View>
    );
  }

  return (
    <NavigationContainer
      ref={navigationRef}
      linking={linking}
      onReady={handleNavigationReady}>
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

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.neutral.black,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  spinner: {
    marginTop: 10,
  },
});
