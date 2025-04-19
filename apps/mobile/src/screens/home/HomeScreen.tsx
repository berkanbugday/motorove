import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {useAuth} from '../../navigation';

export function HomeScreen() {
  const {logout} = useAuth();

  const handleLogout = async () => {
    await logout();
    // Navigation to login screen will happen automatically
    // because the useAuth hook updates isAuthenticated state
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Motorove</Text>
      <Text style={styles.subtitle}>You are logged in!</Text>

      <TouchableOpacity style={styles.button} onPress={handleLogout}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 30,
    color: '#666',
  },
  button: {
    backgroundColor: '#FF3B30',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
