import React, {useState} from 'react';
import {StyleSheet, SafeAreaView, Platform, View} from 'react-native';
import {LocationPermissionOverlay} from '@components/LocationPermissionOverlay';
import {Header, Banner} from '@components';
import {colors, commonStyles, fontSizes, radius} from '@theme';
export function HomeScreen() {
  const [showLocationPermission, setShowLocationPermission] = useState(false);

  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     setShowLocationPermission(true);
  //   }, 3000); // 3 seconds delay

  //   return () => clearTimeout(timer); // Cleanup the timer on component unmount
  // }, []);

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
    <View style={styles.container}>
      {/* Header Component */}
      <Header
        title="Hi there 👋🏻"
        subtitle="Michael Thompson"
        titleStyle={styles.title}
        subtitleStyle={styles.subtitle}
        rightIconName="bell"
        rightIconBadgeCount={5}
        onRightButtonPress={() => console.log('Notifications pressed')}
      />
      <SafeAreaView style={styles.container}>
        {/* Location Permission Overlay */}
        <LocationPermissionOverlay
          visible={showLocationPermission}
          onAllowPress={handleAllowLocationAccess}
          onDismiss={handleDismissLocationPermission}
        />

        <Banner
          title="Today's weather"
          subtitle="25°C"
          message="Perfect conditions for riding!"
          style={styles.banner}
          titleStyle={styles.bannerTitle}
          subtitleStyle={styles.bannerSubtitle}
          variant="contrast"
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...commonStyles.container,
  },
  title: {
    alignSelf: 'flex-start',
    fontWeight: 'light',
    fontSize: fontSizes.md,
  },
  subtitle: {
    alignSelf: 'flex-start',
    fontWeight: 'bold',
    fontSize: fontSizes.lg,
  },
  banner: {
    backgroundColor: colors.neutral.black,
    borderRadius: radius.lg,
  },
  bannerTitle: {
    fontSize: fontSizes.sm,
    fontWeight: 'light',
  },
  bannerSubtitle: {
    fontSize: fontSizes.xxl,
    fontWeight: 'bold',
  },
});
