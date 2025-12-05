/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

// Silence deprecation warnings for React Native Firebase v22+ modular API migration
// Analytics, Crashlytics, and Performance still use the namespaced API pattern
// This flag prevents console warnings during the transition period
if (typeof globalThis !== 'undefined') {
  (globalThis as any).RNFB_SILENCE_MODULAR_DEPRECATION_WARNINGS = true;
}

import React, {useEffect, useState} from 'react';
import {View, StyleSheet, ActivityIndicator, Image} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {RootNavigator} from '@navigation/RootNavigator';
import {AuthProvider, LanguageProvider} from '@contexts';
import {ApolloProvider} from '@apollo/client';
import {apolloClient} from '@configs/apolloClientConfig';
import EncryptedStorage from 'react-native-encrypted-storage';
import * as Sentry from '@sentry/react-native';
import {AppConfig} from '@configs/appConfig';
import ErrorBoundary from '@components/ErrorBoundary';
import {colors} from '@theme';
import {loggingService} from '@services/logging.service';
import {networkService} from '@services/network.service';
import {notificationService} from '@services/notification.service';
import {firebaseService} from '@services/firebase.service';
import ToastMessage from '@components/ToastMessage';
import NetworkStatusBar from '@components/NetworkAware';
import BottomSheetProvider from '@components/BottomSheet/BottomSheetProvider';
import NotificationPermissionHandler from '@components/PermissionHandler/NotificationPermissionHandler';

// Initialize Sentry if DSN is provided
if (
  AppConfig.ENABLE_LOGS &&
  AppConfig.SENTRY_DSN &&
  AppConfig.SENTRY_DSN !== ''
) {
  Sentry.init({
    dsn: AppConfig.SENTRY_DSN,
    environment: AppConfig.APP_ENV || 'development',
    debug: AppConfig.DEBUG_MODE,
    // Enable performance monitoring
    tracesSampleRate: 0.2,
    // Enable session tracking
    enableAutoSessionTracking: true,
  });
}

function App(): React.JSX.Element {
  const [isStorageReady, setIsStorageReady] = useState(false);
  const [showLoading, setShowLoading] = useState(true);

  // Initialize services
  useEffect(() => {
    const initializeServices = async () => {
      try {
        if (AppConfig.DEBUG_MODE) {
          // Initialize logging service
          loggingService.initialize({
            environment: AppConfig.APP_ENV,
          });
        }

        // Initialize network monitoring first (doesn't depend on native modules)
        networkService.initialize();

        // Initialize Firebase and Notification services sequentially
        // Firebase must be initialized first, then NotificationService can set up message handlers
        setTimeout(async () => {
          try {
            // Step 1: Initialize Firebase (Analytics, Crashlytics, Performance)
            await firebaseService.initialize();

            // Step 2: Initialize NotificationService (requires Firebase to be ready)
            await notificationService.service.initialize();

            if (AppConfig.DEBUG_MODE) {
              loggingService.info('All services initialized successfully');
            }
          } catch (error) {
            // Services handle their own errors, just log completion status
            if (AppConfig.DEBUG_MODE) {
              loggingService.warning(
                'Service initialization completed with errors',
                {
                  error: error instanceof Error ? error.message : String(error),
                },
              );
            }
          }
        }, 500); // 500ms delay to ensure native modules are loaded
      } catch (error) {
        // Log but don't block app startup
        loggingService.error('Error initializing services:', error);
      }
    };

    initializeServices();

    // Cleanup when component unmounts
    return () => {
      networkService.cleanup();
      notificationService.service.cleanup();
    };
  }, []);

  // Initialize encrypted storage
  useEffect(() => {
    const initializeStorage = async () => {
      try {
        // Test that encrypted storage is working
        await EncryptedStorage.setItem('storage_test', 'test');
        await EncryptedStorage.removeItem('storage_test');
        setIsStorageReady(true);
      } catch (error) {
        loggingService.error('Error initializing encrypted storage', error);
        // Fall back to continue anyway if there's an issue
        setIsStorageReady(true);
      }
    };

    initializeStorage();
  }, []);

  // Add minimum loading time to prevent flickering
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoading(false);
    }, 300); // Minimum 300ms loading time

    return () => clearTimeout(timer);
  }, []);

  if (!isStorageReady || showLoading) {
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
    <ErrorBoundary>
      <GestureHandlerRootView style={{flex: 1}}>
        <ApolloProvider client={apolloClient}>
          <LanguageProvider>
            <NetworkStatusBar />
            <ToastMessage.Provider>
              <NotificationPermissionHandler />
              <SafeAreaProvider>
                <BottomSheetProvider.Provider>
                  <AuthProvider>
                    <RootNavigator />
                  </AuthProvider>
                </BottomSheetProvider.Provider>
              </SafeAreaProvider>
            </ToastMessage.Provider>
          </LanguageProvider>
        </ApolloProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
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

export default App;
