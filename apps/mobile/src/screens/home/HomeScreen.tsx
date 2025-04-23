import React, {useState} from 'react';
import {View, StyleSheet, SafeAreaView, Image, Platform} from 'react-native';
import {Button, Title, Body} from '@components';
import {LocationPermissionOverlay} from '../../components/LocationPermissionOverlay/LocationPermissionOverlay';
import {colors, spacing, commonStyles} from '@theme';

export function HomeScreen() {
  const [showLocationPermission, setShowLocationPermission] = useState(false);

  const handleLogout = async () => {
    setShowLocationPermission(true);
    // Navigation to login screen will happen automatically
    // because the useAuth hook updates isAuthenticated state
  };

  const handleAllowLocationAccess = () => {
    // Request location permission
    // This would typically use the Geolocation API or a library like
    // react-native-permissions to request location access
    if (Platform.OS === 'ios') {
      // iOS permission logic
      console.log('Requesting iOS location permission');
    } else {
      // Android permission logic
      console.log('Requesting Android location permission');
    }

    // Close the overlay
    setShowLocationPermission(false);
  };

  const handleDismissLocationPermission = () => {
    // User declined location permission
    console.log('User declined location permission');
    setShowLocationPermission(false);
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

      {/* Location Permission Overlay */}
      <LocationPermissionOverlay
        visible={showLocationPermission}
        onAllowPress={handleAllowLocationAccess}
        onDismiss={handleDismissLocationPermission}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    ...commonStyles.container,
    backgroundColor: colors.neutral.backgroundLight,
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
