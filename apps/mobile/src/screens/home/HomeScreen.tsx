import React from 'react';
import {View, StyleSheet, SafeAreaView, Image} from 'react-native';
import {useAuth} from '@navigation/index';
import {Button, Title, Body} from '@components';
import {colors, spacing, commonStyles} from '@theme';

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

        <Title style={styles.title}>Welcome to Motorove</Title>
        <Body style={styles.subtitle}>You are logged in!</Body>

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
    ...commonStyles.container,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  logo: {
    width: 180,
    height: 60,
    marginBottom: spacing.xl,
  },
  title: {
    marginBottom: spacing.xs,
    color: colors.neutral.darkGrey,
  },
  subtitle: {
    marginBottom: spacing.lg,
    color: colors.neutral.grey,
  },
});
