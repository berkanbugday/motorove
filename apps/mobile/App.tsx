/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useEffect, useState} from 'react';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {View, ActivityIndicator, StyleSheet} from 'react-native';
import {RootNavigator} from '@navigation/RootNavigator';
import {AuthProvider} from '@contexts';
import {ApolloProvider} from '@apollo/client';
import {apolloClient} from '@configs/apolloClientConfig';
import EncryptedStorage from 'react-native-encrypted-storage';
import * as Sentry from '@sentry/react-native';
import {AppConfig} from '@configs/appConfig';
import ErrorBoundary from '@components/ErrorBoundary';
import {loggingService} from '@services/logging.service';
import {networkService} from '@services/network.service';
import {notificationService} from '@services/notification.service';
import ToastMessage from '@components/ToastMessage';
import NetworkStatusBar from '@components/NetworkAware';
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

  // Initialize services
  useEffect(() => {
    if (AppConfig.DEBUG_MODE) {
      // Initialize logging service
      loggingService.initialize({
        environment: AppConfig.APP_ENV,
      });
    }

    // Initialize network monitoring
    networkService.initialize();

    // Initialize notification service
    notificationService.service.initialize();

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

  if (!isStorageReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <NetworkStatusBar />
      <ToastMessage.Provider>
        <ApolloProvider client={apolloClient}>
          <GestureHandlerRootView style={{flex: 1}}>
            <SafeAreaProvider>
              <AuthProvider>
                <RootNavigator />
              </AuthProvider>
            </SafeAreaProvider>
          </GestureHandlerRootView>
        </ApolloProvider>
      </ToastMessage.Provider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default App;
