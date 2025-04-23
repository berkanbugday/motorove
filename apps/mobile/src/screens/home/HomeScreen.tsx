import React, {useState, useCallback} from 'react';
import {
  StyleSheet,
  SafeAreaView,
  View,
  ScrollView,
  RefreshControl,
} from 'react-native';
import {LocationPermissionOverlay} from '@components/LocationPermissionOverlay';
import {Header, Banner, Card, Subtitle} from '@components';
import {colors, commonStyles, fontSizes, radius, spacing} from '@theme';

export function HomeScreen() {
  const [showLocationPermission, setShowLocationPermission] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleAllowLocationAccess = () => {
    // Request location permission logic would go here
    setShowLocationPermission(false);
  };

  const handleDismissLocationPermission = () => {
    setShowLocationPermission(false);
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate data fetching
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  return (
    <View style={styles.container}>
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
          textContainerStyle={styles.textContainer}
          titleStyle={styles.bannerTitle}
          subtitleStyle={styles.bannerSubtitle}
          messageStyle={styles.bannerMessage}
          variant="contrast"
        />

        <ScrollView
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.neutral.black]}
              tintColor={colors.neutral.black}
            />
          }>
          <View>
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
              style={styles.card}
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
    height: 85,
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
  card: {
    height: 180,
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
  sectionTitle: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
});
