import React from 'react';
import {View, Text, StyleSheet, SafeAreaView, Image} from 'react-native';
import {useAuth} from '@navigation/index';
import {Button} from '@components/index';

export function HomeScreen() {
  const {logout} = useAuth();

  const handleLogout = async () => {
    await logout();
    // Navigation to login screen will happen automatically
    // because the useAuth hook updates isAuthenticated state
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Image
          source={require('@assets/images/motorove_logo_dark.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.title}>Welcome to Motorove</Text>
        <Text style={styles.subtitle}>You are logged in!</Text>

        <Button
          title="Logout"
          onPress={handleLogout}
          variant="primary"
          testID="logout-button"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  logo: {
    width: 180,
    height: 60,
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 30,
    color: '#666',
  },
});
