import React, {useState} from 'react';
import {
  StyleSheet,
  SafeAreaView,
  Platform,
  View,
  ScrollView,
  Text,
} from 'react-native';
import {LocationPermissionOverlay} from '@components/LocationPermissionOverlay';
import {Header, Banner, Card, Title, Subtitle} from '@components';
import {colors, commonStyles, fontSizes, radius, spacing} from '@theme';
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
        <ScrollView
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}>
          <Banner
            title="Today's weather"
            subtitle="25°C"
            message="Perfect conditions for riding!"
            style={styles.banner}
            textContainerStyle={styles.textContainer}
            titleStyle={styles.bannerTitle}
            subtitleStyle={styles.bannerSubtitle}
            messageStyle={styles.bannerMessage}
            variant="contrast"
          />

          <View style={styles.sectionContainer}>
            <Subtitle weight="bold" style={styles.sectionTitle}>
              Recommended Route of the Week
            </Subtitle>
            <Card
              title="Coastal Highway Ride"
              subtitle="80km - 2h 15m"
              image={{uri: 'https://picsum.photos/500/300'}}
              variant="elevated"
              fullImage
              size="small"
              titleStyle={styles.cardTitle}
              subtitleStyle={styles.cardSubtitle}
              onPress={() => console.log('Card pressed')}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...commonStyles.container,
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
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
    borderRadius: radius.lg,
    height: 80,
  },
  textContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'relative',
  },
  bannerTitle: {
    fontSize: fontSizes.sm,
    fontWeight: 'light',
    color: colors.neutral.lightGrey,
  },
  bannerSubtitle: {
    fontSize: fontSizes.xxl,
    fontWeight: 'bold',
    position: 'absolute',
    top: 20,
    left: 0,
  },
  bannerMessage: {
    fontSize: fontSizes.sm,
    fontWeight: 'light',
    color: colors.neutral.lightGrey,
    position: 'absolute',
    top: 30,
    right: 0,
  },
  cardTitle: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
  },
  cardSubtitle: {
    fontSize: fontSizes.md,
    fontWeight: 'light',
    marginTop: spacing.sm,
    paddingLeft: spacing.lg,
    color: colors.neutral.lightGrey,
  },
  sectionContainer: {
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    marginBottom: spacing.sm,
  },
});
