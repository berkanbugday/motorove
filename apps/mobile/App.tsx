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
import {RootNavigator} from './src/navigation';
import {AuthProvider} from './src/contexts/AuthContext';
import {ApolloProvider} from '@apollo/client';
import {apolloClient} from './src/configs/apollo';
import EncryptedStorage from 'react-native-encrypted-storage';

function App(): React.JSX.Element {
  const [isStorageReady, setIsStorageReady] = useState(false);

  // Initialize encrypted storage
  useEffect(() => {
    const initializeStorage = async () => {
      try {
        // Test that encrypted storage is working
        await EncryptedStorage.setItem('storage_test', 'test');
        await EncryptedStorage.removeItem('storage_test');
        setIsStorageReady(true);
      } catch (error) {
        console.error('Error initializing encrypted storage:', error);
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
    <ApolloProvider client={apolloClient}>
      <GestureHandlerRootView style={{flex: 1}}>
        <SafeAreaProvider>
          <AuthProvider>
            <RootNavigator />
          </AuthProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ApolloProvider>
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
