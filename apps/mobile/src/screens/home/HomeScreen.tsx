import React, {useState, useCallback, useEffect, useRef} from 'react';
import {
  StyleSheet,
  SafeAreaView,
  View,
  ScrollView,
  RefreshControl,
  FlatList,
  Dimensions,
} from 'react-native';
import {LocationPermissionOverlay} from '@components/LocationPermissionOverlay';
import {
  Header,
  Banner,
  Card,
  Subtitle,
  GroupEventBanner,
  PageIndicator,
} from '@components';
import {colors, commonStyles, fontSizes, radius, spacing} from '@theme';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
// Route data
const recommendedRoutes = [
  {
    id: 1,
    title: 'Coastal Highway Ride',
    subtitle: '80km - 2h 15m',
    image: 'https://picsum.photos/id/88/500/300', // Coast/ocean image
  },
  {
    id: 2,
    title: 'Mountain Trail Adventure',
    subtitle: '65km - 3h 30m',
    image: 'https://picsum.photos/id/29/500/300', // Mountain image
  },
  {
    id: 3,
    title: 'City Loop Tour',
    subtitle: '35km - 1h 45m',
    image: 'https://picsum.photos/id/43/500/300', // Urban image
  },
  {
    id: 4,
    title: 'Forest Exploration Route',
    subtitle: '50km - 2h 10m',
    image: 'https://picsum.photos/id/11/500/300', // Forest image
  },
];

// Define event interface
interface EventItem {
  id: string;
  day: string;
  month: string;
  time: string;
  title: string;
  organizer: string;
  participantCount: number;
  memberCount: number;
}

// Group events data
const upcomingEvents: EventItem[] = [
  {
    id: '1',
    day: '15',
    month: 'JUN',
    time: '10:00',
    title: 'Sunday Breakfast Ride',
    organizer: 'Coastal Riders Club',
    participantCount: 10,
    memberCount: 34,
  },
  {
    id: '2',
    day: '22',
    month: 'JUN',
    time: '09:30',
    title: 'Mountain Pass Challenge',
    organizer: 'Adventure Motorcycles',
    participantCount: 16,
    memberCount: 40,
  },
  {
    id: '3',
    day: '28',
    month: 'JUN',
    time: '14:00',
    title: 'Evening City Tour',
    organizer: 'Urban Moto Group',
    participantCount: 8,
    memberCount: 25,
  },
];

export function HomeScreen() {
  const [showLocationPermission, setShowLocationPermission] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [currentRouteIndex, setCurrentRouteIndex] = useState(0);
  const [currentRoute, setCurrentRoute] = useState(recommendedRoutes[0]);
  const [currentEventIndex, setCurrentEventIndex] = useState(0);

  // Reference to the FlatList for programmatic scrolling
  const eventsListRef = useRef<FlatList>(null);
  const insets = useSafeAreaInsets();
  const rotateRecommendedRoute = useCallback(() => {
    const nextIndex = (currentRouteIndex + 1) % recommendedRoutes.length;
    setCurrentRouteIndex(nextIndex);
    setCurrentRoute(recommendedRoutes[nextIndex]);
  }, [currentRouteIndex]);

  const handleAllowLocationAccess = () => {
    // Request location permission logic would go here
    setShowLocationPermission(false);
  };

  const handleDismissLocationPermission = () => {
    setShowLocationPermission(false);
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Change route on refresh
    rotateRecommendedRoute();
    // Simulate data fetching delay
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, [rotateRecommendedRoute]);

  // Set initial route
  useEffect(() => {
    setCurrentRoute(recommendedRoutes[currentRouteIndex]);
  }, [currentRouteIndex]);

  // Handle FlatList scroll event to update the current page
  const handleEventScroll = useCallback((event: any) => {
    const contentOffset = event.nativeEvent.contentOffset;
    const viewSize = event.nativeEvent.layoutMeasurement;

    // Calculate page number by dividing offset by width
    const pageNum = Math.floor(contentOffset.x / (viewSize.width - spacing.xl));
    setCurrentEventIndex(pageNum);
  }, []);

  // Handle page indicator press to scroll to that event
  const handleEventPageChange = useCallback((pageIndex: number) => {
    // Scroll to the selected event
    eventsListRef.current?.scrollToIndex({
      index: pageIndex,
      animated: true,
      viewPosition: 0.5,
    });
  }, []);

  // Event scroll fail handler for cases where the index doesn't exist
  const handleScrollToIndexFailed = useCallback(
    (info: {
      index: number;
      highestMeasuredFrameIndex: number;
      averageItemLength: number;
    }) => {
      // This handles situations where we might try to scroll to an item that isn't rendered yet
      setTimeout(() => {
        eventsListRef.current?.scrollToIndex({
          index: info.index,
          animated: true,
          viewPosition: 0.5,
        });
      }, 100);
    },
    [],
  );

  // Render event banner item
  const renderEventBanner = useCallback(
    ({item}: {item: EventItem}) => (
      <GroupEventBanner
        day={item.day}
        month={item.month}
        time={item.time}
        title={item.title}
        organizer={item.organizer}
        participantCount={item.participantCount}
        memberCount={item.memberCount}
        onChatPress={() => console.log(`Chat pressed for event: ${item.title}`)}
        onPress={() => console.log(`Event banner pressed: ${item.title}`)}
        style={styles.eventBanner}
      />
    ),
    [],
  );

  // Event keyExtractor
  const keyExtractor = useCallback((item: EventItem) => item.id, []);

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
      <SafeAreaView
        style={[styles.container, {marginBottom: 70 + insets.bottom}]}>
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
              title={currentRoute.title}
              subtitle={currentRoute.subtitle}
              image={{uri: currentRoute.image}}
              variant="elevated"
              fullImage
              size="small"
              style={styles.card}
              titleStyle={styles.cardTitle}
              subtitleStyle={styles.cardSubtitle}
              onPress={() => console.log('Card pressed')}
            />
            <Card
              title={currentRoute.title}
              subtitle={currentRoute.subtitle}
              image={{uri: currentRoute.image}}
              variant="elevated"
              fullImage
              size="small"
              style={styles.card}
              titleStyle={styles.cardTitle}
              subtitleStyle={styles.cardSubtitle}
              onPress={() => console.log('Card pressed')}
            />
            <Card
              title={currentRoute.title}
              subtitle={currentRoute.subtitle}
              image={{uri: currentRoute.image}}
              variant="elevated"
              fullImage
              size="small"
              style={styles.card}
              titleStyle={styles.cardTitle}
              subtitleStyle={styles.cardSubtitle}
              onPress={() => console.log('Card pressed')}
            />
            <Card
              title={currentRoute.title}
              subtitle={currentRoute.subtitle}
              image={{uri: currentRoute.image}}
              variant="elevated"
              fullImage
              size="small"
              style={styles.card}
              titleStyle={styles.cardTitle}
              subtitleStyle={styles.cardSubtitle}
              onPress={() => console.log('Card pressed')}
            />
          </View>

          <View>
            <Subtitle weight="bold" style={styles.sectionTitle}>
              Upcoming Group Events
            </Subtitle>
            <FlatList
              ref={eventsListRef}
              data={upcomingEvents}
              renderItem={renderEventBanner}
              keyExtractor={keyExtractor}
              horizontal
              showsHorizontalScrollIndicator={false}
              snapToInterval={Dimensions.get('window').width - spacing.xl} // Adjust based on item width
              decelerationRate="fast"
              onScroll={handleEventScroll}
              scrollEventThrottle={16} // For smooth scrolling performance
              onScrollToIndexFailed={handleScrollToIndexFailed}
            />
            <PageIndicator
              totalPages={upcomingEvents.length}
              currentPage={currentEventIndex}
              onPageChange={handleEventPageChange}
              containerStyle={styles.pageIndicator}
              type="pill"
              indicatorSize={8}
              activeIndicatorSize={10}
              spacing={8}
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
  eventBanner: {
    marginRight: spacing.sm,
    marginLeft: spacing.sm,
    width: Dimensions.get('window').width - spacing.xxl,
  },
  pageIndicator: {
    marginTop: spacing.sm,
  },
});
