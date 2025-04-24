import React, {useState, useCallback, useEffect, useRef} from 'react';
import {
  StyleSheet,
  SafeAreaView,
  View,
  RefreshControl,
  FlatList,
  Dimensions,
  Animated,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import {LocationPermissionOverlay} from '@components/LocationPermissionOverlay';
import {
  TopHeaderBar,
  Subtitle,
  GroupEventBanner,
  PageIndicator,
  Button,
  FeedCard,
} from '@components';
import {FullImageCard} from '@components/FullImageCard';
import WeatherWidget from '@components/WeatherWidget/WeatherWidget';
import {colors, commonStyles, fontSizes, spacing} from '@theme';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import type {WeatherData} from '@components/WeatherWidget/weather';
import type {IconName} from '@components/Icon';
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

// Feed post interface
interface FeedPost {
  id: string;
  userName: string;
  avatarSource: any;
  timeAgo: string;
  content: string;
  images?: any[];
  routeTitle?: string;
  likeCount: number;
  commentCount: number;
  isSaved: boolean;
  isLiked: boolean;
  isCommented: boolean;
  labels: Array<{
    icon?: IconName;
    text: string;
  }>;
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

// Sample feed posts data
const feedPosts: FeedPost[] = [
  {
    id: '1',
    userName: 'Alex Johnson',
    avatarSource: {uri: 'https://picsum.photos/id/1005/100/100'},
    timeAgo: '2h ago',
    content:
      'Just completed an amazing coastal ride with perfect weather! The views were breathtaking.',
    images: [{uri: 'https://picsum.photos/id/15/500/300'}],
    routeTitle: 'Pacific Coast Highway',
    likeCount: 24,
    commentCount: 5,
    isSaved: false,
    isLiked: true,
    isCommented: false,
    labels: [
      {icon: 'users', text: 'Coastal Riders Club'},
      {icon: 'map-pin', text: 'San Francisco, CA'},
    ],
  },
  {
    id: '2',
    userName: 'Sarah Miller',
    avatarSource: {uri: 'https://picsum.photos/id/1027/100/100'},
    timeAgo: '5h ago',
    content:
      'First time taking my new bike out on the mountain trails. The handling was superb!',
    images: [{uri: 'https://picsum.photos/id/16/500/300'}],
    likeCount: 18,
    commentCount: 3,
    isSaved: true,
    isLiked: false,
    isCommented: true,
    labels: [{icon: 'map-pin', text: 'Big Bear Mountain, CA'}],
  },
  {
    id: '3',
    userName: 'David Wilson',
    avatarSource: {uri: 'https://picsum.photos/id/1012/100/100'},
    timeAgo: 'Yesterday',
    content:
      "Group night ride through downtown was epic! Can't wait for the next one.",
    images: [
      {uri: 'https://picsum.photos/id/10/500/300'},
      {uri: 'https://picsum.photos/id/11/500/300'}, // Adding duplicate for demo purposes
      {uri: 'https://picsum.photos/id/32/500/300'}, // Another image for carousel demo
    ],
    routeTitle: 'City Lights Tour',
    likeCount: 32,
    commentCount: 7,
    isSaved: false,
    isLiked: true,
    isCommented: false,
    labels: [
      {icon: 'users', text: 'Urban Moto Group'},
      {icon: 'map-pin', text: 'Los Angeles, CA'},
    ],
  },
];

export function HomeScreen() {
  const [showLocationPermission, setShowLocationPermission] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [currentRouteIndex, setCurrentRouteIndex] = useState(0);
  const [currentRoute, setCurrentRoute] = useState(recommendedRoutes[0]);
  const [currentEventIndex, setCurrentEventIndex] = useState(0);

  // Create a stable animated value for scroll position
  const scrollY = useRef(new Animated.Value(0)).current;

  // Track the previous scroll position to determine scroll direction
  const previousScrollY = useRef(0);
  const isScrollingUp = useRef(false);

  // Modified animation approach for ghosting when scrolling up
  const bannerOpacity = scrollY.interpolate({
    inputRange: [-20, 0, 40, 80],
    outputRange: [1, 1, 0.5, 0],
    extrapolate: 'clamp',
  });

  // Use translateY with more subtle transitions
  const bannerTranslateY = scrollY.interpolate({
    inputRange: [-20, 0, 40, 80],
    outputRange: [0, 0, -15, -30],
    extrapolate: 'clamp',
  });

  // Weather data for the widget
  const weatherData: WeatherData = {
    temperature: 25,
    unit: 'C',
    condition: 'sunny',
    location: 'Current Location',
  };

  // Create a separate handler for scroll events to handle both refresh and animation
  const handleScroll = Animated.event(
    [{nativeEvent: {contentOffset: {y: scrollY}}}],
    {
      useNativeDriver: true,
      listener: (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        // Extract scroll position from the event
        const offsetY = event.nativeEvent.contentOffset.y;

        // Determine scroll direction
        isScrollingUp.current = offsetY < previousScrollY.current;
        previousScrollY.current = offsetY;
      },
    },
  );

  // Update hidden state based on scroll position
  useEffect(() => {
    return () => {
      // Cleanup function
      scrollY.removeAllListeners();
    };
  }, [scrollY]);

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

  // Render feed post item
  const renderFeedPost = useCallback(
    ({item}: {item: FeedPost}) => (
      <FeedCard
        avatarSource={item.avatarSource}
        userName={item.userName}
        timeAgo={item.timeAgo}
        labels={item.labels}
        content={item.content}
        images={item.images}
        routeTitle={item.routeTitle}
        likeCount={item.likeCount}
        commentCount={item.commentCount}
        isSaved={item.isSaved}
        isLiked={item.isLiked}
        isCommented={item.isCommented}
        // onPress={() => console.log(`Post pressed: ${item.id}`)}
        onRoutePress={() => console.log(`Route pressed: ${item.routeTitle}`)}
        onLikePress={() => console.log(`Like pressed for post: ${item.id}`)}
        onCommentPress={() =>
          console.log(`Comment pressed for post: ${item.id}`)
        }
        onSavePress={() => console.log(`Save pressed for post: ${item.id}`)}
        style={styles.feedCard}
      />
    ),
    [],
  );

  // Feed keyExtractor
  const feedKeyExtractor = useCallback((item: FeedPost) => item.id, []);

  // Post separator component
  const PostSeparator = useCallback(
    () => <View style={styles.postSeparator} />,
    [],
  );

  return (
    <View style={styles.container}>
      <TopHeaderBar
        title="Hi there 👋🏻"
        subtitle="Michael Thompson"
        titleStyle={styles.title}
        subtitleStyle={styles.subtitle}
        showShadow={true}
        rightIconName="bell"
        rightIconBadgeCount={5}
        onRightButtonPress={() => console.log('Notifications pressed')}
      />
      <SafeAreaView
        style={[styles.container, {marginBottom: 60 + insets.bottom}]}>
        <LocationPermissionOverlay
          visible={showLocationPermission}
          onAllowPress={handleAllowLocationAccess}
          onDismiss={handleDismissLocationPermission}
        />

        {/* Weather Widget with ghost effect when scrolling up */}
        <View style={styles.bannerContainer}>
          <Animated.View
            style={[
              styles.animatedBannerContainer,
              {
                opacity: bannerOpacity,
                transform: [{translateY: bannerTranslateY}],
                zIndex: isScrollingUp.current ? 2 : 1,
              },
            ]}>
            <WeatherWidget
              data={weatherData}
              showDetails={false}
              style={styles.weatherWidget}
            />
          </Animated.View>
        </View>

        <Animated.ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContentContainer}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={handleScroll}
          refreshControl={
            <RefreshControl
              progressViewOffset={95} // Add this to make refresh control visible above the banner
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
            <FullImageCard
              title={currentRoute.title}
              subtitle={currentRoute.subtitle}
              image={{uri: currentRoute.image}}
              variant="elevated"
              size="small"
              onPress={() => console.log('Card pressed')}
            />
          </View>

          <View>
            <View style={styles.sectionHeaderContainer}>
              <Subtitle weight="bold" style={styles.sectionTitle}>
                Upcoming Group Events
              </Subtitle>
              <Button
                variant="text"
                onPress={() => console.log('View all')}
                title="View all"
              />
            </View>
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
          <View>
            <Subtitle weight="bold" style={styles.sectionTitle}>
              Shared Posts
            </Subtitle>
            <FlatList
              data={feedPosts}
              renderItem={renderFeedPost}
              keyExtractor={feedKeyExtractor}
              scrollEnabled={false} // Disable scrolling to prevent nested scroll issues
              showsVerticalScrollIndicator={false}
              ItemSeparatorComponent={PostSeparator}
            />
          </View>
        </Animated.ScrollView>
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
  scrollContentContainer: {
    paddingTop: 95, // Reserve space for the banner
  },
  bannerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  animatedBannerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  weatherWidget: {
    height: 85,
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
  sectionHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  eventBanner: {
    backgroundColor: colors.neutral.white,
    marginRight: spacing.sm,
    marginLeft: spacing.sm,
    width: Dimensions.get('window').width - spacing.xxl,
  },
  pageIndicator: {
    marginTop: spacing.sm,
  },
  feedCard: {
    marginVertical: spacing.xs,
  },
  postSeparator: {
    height: spacing.md,
  },
});
