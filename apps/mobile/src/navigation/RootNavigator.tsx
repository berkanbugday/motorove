import React, {useEffect, useRef, useCallback, useState} from 'react';
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
import {firebaseService} from '@services/firebase.service';

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
  const {id, hasCompletedSetup, notificationPermission, isInitializing} =
    useAuth();
  const navigationRef =
    useRef<NavigationContainerRef<RootStackParamList>>(null);
  const {
    checkFirstTimeUser,
    isFirstTime,
    isLoading: firstTimeLoading,
  } = useFirstTimeCheck();
  const [showLoading, setShowLoading] = useState(true);

  useEffect(() => {
    async function init() {
      await checkFirstTimeUser();
    }
    init();
  }, [checkFirstTimeUser]);

  // Add minimum loading time to prevent flickering
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoading(false);
    }, 300); // Minimum 300ms loading time

    return () => clearTimeout(timer);
  }, []);

  // Set navigation ref for notification service when navigation is ready
  const handleNavigationReady = useCallback(() => {
    if (navigationRef.current && id) {
      notificationService.service.setNavigationRef(navigationRef.current);
    }
  }, [id]);

  // Track screen changes for Firebase Analytics
  const handleNavigationStateChange = useCallback(() => {
    const currentRoute = navigationRef.current?.getCurrentRoute();
    if (currentRoute) {
      // Get the full route name including nested routes
      const routeName = currentRoute.name;
      const params = currentRoute.params as any;

      // Handle nested routes (e.g., Main -> Tabs -> HomeTab)
      let screenName: string = routeName;
      if (params?.screen) {
        screenName = `${routeName}_${params.screen}`;
      }

      // Track screen view
      firebaseService.setCurrentScreen(screenName, routeName);
    }
  }, []);

  // Check if user is authenticated - if id exists, user is authenticated
  const isAuthenticated = !!id;

  // Show loading screen with logo when checking auth, session revival, or first time status
  if (isInitializing || firstTimeLoading || showLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Image
          source={require('@assets/images/motorove_logo_dark.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <ActivityIndicator
          size="small"
          color={colors.neutral.black}
          style={styles.spinner}
        />
      </View>
    );
  }

  return (
    <NavigationContainer
      ref={navigationRef}
      linking={linking}
      onReady={handleNavigationReady}
      onStateChange={handleNavigationStateChange}>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        {!isAuthenticated || isFirstTime ? (
          // User is not authenticated, show login screen
          // Use key to force remount when auth state changes to ensure clean navigation state
          // When user signs out (not first time), force navigation to Signin screen
          <Stack.Screen
            name="Auth"
            key={`auth-${isAuthenticated}-${isFirstTime}`}>
            {props => (
              <AuthNavigator
                {...props}
                isFirstTime={isFirstTime}
                initialRoute={!isFirstTime ? 'Signin' : undefined}
              />
            )}
          </Stack.Screen>
        ) : // User is authenticated, decide whether to show main app or account setup
        !hasCompletedSetup ? (
          <Stack.Screen
            name="Auth"
            component={AccountSetupScreen}
            key="accountSetup"
          />
        ) : notificationPermission === NotificationPermission.UNKNOWN ? (
          <Stack.Screen
            key="notificationPermission"
            name="Auth"
            component={NotificationPermissionScreen}
          />
        ) : (
          <Stack.Screen key="main" name="Main" component={MainNavigator} />
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
    backgroundColor: colors.neutral.white,
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
