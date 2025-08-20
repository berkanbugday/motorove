import React, {useState, useCallback, useEffect, useRef} from 'react';
import {
  StyleSheet,
  SafeAreaView,
  View,
  RefreshControl,
  FlatList,
  Dimensions,
  Animated,
  ScrollView,
} from 'react-native';
import {LocationPermissionOverlay} from '@components/LocationPermissionOverlay';
import {
  TopHeaderBar,
  Subtitle,
  GroupEventBanner,
  PageIndicator,
  Button,
  FeedCard,
  Body,
  SkeletonGroup,
} from '@components';
import {FullImageCard} from '@components/FullImageCard';
import WeatherWidget from '@components/WeatherWidget/WeatherWidget';
import {colors, fontSizes, spacing} from '@theme';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import type {WeatherData} from '@components/WeatherWidget/weather';
import type {IconName} from '@components/Icon';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {TabParamList} from '@navigation/types/navigationTypes';
import {navigateToScreen} from '@navigation/utils/navigationHelpers';
import {DropdownMenuItem} from '@components/DropdownMenu';
import {loggingService} from '@services/logging.service';
import {useAuth} from '@contexts/AuthContext';
import {useGetCount} from '@services/notification.service';
import {useFocusEffect} from '@react-navigation/native';
import {
  closeBottomSheet,
  useBottomSheet,
} from '@components/BottomSheet/BottomSheetProvider';
import {IPost, Language} from '@motorove/shared';
import {
  useGetPosts,
  useLikePost,
  useUnlikePost,
  useSavePost,
  useUnsavePost,
  useRemovePost,
} from '@services/post.service';
import {relativeTime} from '@utils/dateUtils';
import {useTranslation} from '@hooks/useTranslation';

// Route data
const recommendedRoutes = [
  {
    id: '1',
    title: 'Coastal Highway Ride',
    subtitle: '80km - 2h 15m',
    image: 'https://picsum.photos/id/88/500/300', // Coast/ocean image
  },
  {
    id: '2',
    title: 'Mountain Trail Adventure',
    subtitle: '65km - 3h 30m',
    image: 'https://picsum.photos/id/29/500/300', // Mountain image
  },
  {
    id: '3',
    title: 'City Loop Tour',
    subtitle: '35km - 1h 45m',
    image: 'https://picsum.photos/id/43/500/300', // Urban image
  },
  {
    id: '4',
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
  membersCapacity: number;
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
    membersCapacity: 34,
  },
  {
    id: '2',
    day: '22',
    month: 'JUN',
    time: '09:30',
    title: 'Mountain Pass Challenge',
    organizer: 'Adventure Motorcycles',
    participantCount: 16,
    membersCapacity: 40,
  },
  {
    id: '3',
    day: '28',
    month: 'JUN',
    time: '14:00',
    title: 'Evening City Tour',
    organizer: 'Urban Moto Group',
    participantCount: 8,
    membersCapacity: 25,
  },
];

// Change from MainStackParamList to accepting both TabParamList and MainStackParamList
type Props = NativeStackScreenProps<TabParamList, 'HomeTab'>;

export const HomeScreen = ({navigation}: Props) => {
  const {t} = useTranslation();
  const [showLocationPermission, setShowLocationPermission] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [currentRouteIndex, setCurrentRouteIndex] = useState(0);
  const [currentRoute, setCurrentRoute] = useState(recommendedRoutes[0]);
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const {user} = useAuth();
  const {count: notificationsCount, refetch: refetchCount} = useGetCount();
  // Create a stable animated value for scroll position
  const scrollY = useRef(new Animated.Value(0)).current;
  const {openBottomSheet} = useBottomSheet();

  // Use the real API hook for posts"
  const {
    posts,
    loading: postsLoading,
    refetch: refetchPosts,
    loadMore,
  } = useGetPosts();

  // Add hooks for post interactions
  const {likePost} = useLikePost();
  const {unlikePost} = useUnlikePost();
  const {savePost} = useSavePost();
  const {unsavePost} = useUnsavePost();

  // Add hook for post deletion
  const {removePost} = useRemovePost();

  // Refetch notification count when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      refetchCount();
      refetchPosts();
    }, [refetchCount, refetchPosts]),
  );

  // Track the scroll direction for animation
  const isScrollingUp = useRef(false);
  const previousScrollY = useRef(0);

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
  };

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

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Change route on refresh
      rotateRecommendedRoute();
      await refetchCount();
      await refetchPosts();
    } finally {
      setRefreshing(false);
    }
  }, [rotateRecommendedRoute, refetchCount, refetchPosts]);

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
        membersCapacity={item.membersCapacity}
        onPress={() =>
          loggingService.info(`Event banner pressed: ${item.title}`)
        }
        style={styles.eventBanner}
      />
    ),
    [],
  );

  // Handle navigation to comment details
  const handleCommentPress = (postId: string) => {
    // Use our utility function that handles cross-stack navigation
    navigateToScreen(navigation, 'Comment', {postId});
  };

  // Handle like press with API call - using optimistic updates
  const handleLikePress = useCallback(
    async (postId: string, isLiked: boolean) => {
      if (isLiked) {
        // Fire and forget - optimistic update will handle UI
        unlikePost(postId);
      } else {
        // Fire and forget - optimistic update will handle UI
        likePost(postId);
      }
      // No need to refetch as cache is updated optimistically
    },
    [likePost, unlikePost],
  );

  // Handle save press with API call - using optimistic updates
  const handleSavePress = useCallback(
    async (postId: string, isSaved: boolean) => {
      if (isSaved) {
        // Fire and forget - optimistic update will handle UI
        unsavePost(postId);
      } else {
        // Fire and forget - optimistic update will handle UI
        savePost(postId);
      }
      // No need to refetch as cache is updated optimistically
    },
    [savePost, unsavePost],
  );

  // Create dropdown menu items for the feed posts
  const createPostDropdownItems = useCallback(
    (postId: string, isOwnPost: boolean): DropdownMenuItem[] => {
      const items: DropdownMenuItem[] = [];

      // Add edit and delete options if it's the user's own post
      if (isOwnPost) {
        items.unshift(
          {
            id: 'edit',
            label: 'Edit',
            icon: 'pen',
          },
          {
            id: 'delete',
            label: 'Delete',
            icon: 'trash',
            isHighlighted: true,
          },
        );
      } else {
        items.push({
          id: 'report',
          label: 'Report',
          icon: 'error',
          isHighlighted: true,
        });
      }

      return items;
    },
    [],
  );

  // Handle dropdown menu item selection
  const handleDropdownSelect = useCallback(
    (item: DropdownMenuItem, postId: string) => {
      switch (item.id) {
        case 'share':
          loggingService.info(`Share post: ${postId}`);
          break;
        case 'report':
          loggingService.info(`Report post: ${postId}`);
          break;
        case 'edit':
          loggingService.info(`Edit post: ${postId}`);
          navigateToScreen(navigation, 'EditPost', {postId});
          break;
        case 'delete':
          loggingService.info(`Delete post: ${postId}`);
          // Show confirmation dialog before deleting
          openBottomSheet({
            title: 'Delete Post',
            closeButtonPosition: 'top-left',
            enableGestureControl: false,
            content: (
              <View>
                <Body>
                  Are you sure you want to delete this post? This action cannot
                  be undone.
                </Body>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    gap: spacing.md,
                    paddingTop: spacing.lg,
                    paddingBottom: spacing.lg,
                  }}>
                  <Button
                    title="Cancel"
                    variant="outline"
                    onPress={() => closeBottomSheet()}
                    style={{width: '50%'}}
                  />
                  <Button
                    title="Delete"
                    variant="primary"
                    onPress={() => {
                      removePost(postId);
                      closeBottomSheet();
                      refetchPosts();
                    }}
                    style={{width: '50%'}}
                  />
                </View>
              </View>
            ),
            snapPoint: 'minimal',
          });
          break;
        default:
          loggingService.info(
            `Unhandled action: ${item.id} for post: ${postId}`,
          );
      }
    },
    [navigation, removePost, refetchPosts],
  );

  // Helper function to format avatar URL from API data
  const formatAvatarSource = useCallback((imageUrl?: string) => {
    return imageUrl
      ? {uri: imageUrl}
      : require('../../assets/images/default_avatar.png');
  }, []);

  // Transform Post model to FeedCard props
  const transformPostToFeedCard = useCallback(
    (post: IPost) => {
      // Create labels from post data
      const labels = [];

      if (post.groupId) {
        labels.push({
          icon: 'users-filled' as IconName,
          text: post.groupName || '',
        });
      }

      if (post.addresses && post.addresses.length > 0) {
        labels.push({
          icon: 'map-pin' as IconName,
          text:
            post.addresses?.find(address => address.language === Language.EN)
              ?.address || 'Location',
        });
      }

      // Transform images from string URLs to objects with URI
      const images =
        post.images && post.images.length > 0
          ? post.images.map((img: string) => ({uri: img}))
          : undefined;

      return {
        id: post.id,
        userName: `${post.createdBy.firstName} ${post.createdBy.lastName}`,
        avatarSource: formatAvatarSource(post.createdBy.avatar),
        timeAgo: relativeTime(post.createdAt, t),
        content: post.content,
        images,
        likeCount: post.likesCount,
        commentCount: post.commentsCount,
        isSaved: post.isSaved,
        isLiked: post.isLiked,
        isCommented: false, // This might not be available in the API
        labels,
      };
    },
    [formatAvatarSource, navigation, t],
  );

  // Render feed post with comment navigation and dropdown menu
  const renderFeedPost = useCallback(
    ({item}: {item: IPost}) => {
      // Determine if this is the user's own post
      const isOwnPost = item.createdBy.id === user?.id;
      // Transform Post model to FeedCard props
      const feedCardProps = transformPostToFeedCard(item);

      return (
        <FeedCard
          avatarSource={feedCardProps.avatarSource}
          userName={feedCardProps.userName}
          timeAgo={feedCardProps.timeAgo}
          labels={feedCardProps.labels}
          content={feedCardProps.content}
          images={feedCardProps.images}
          likeCount={feedCardProps.likeCount}
          commentCount={feedCardProps.commentCount}
          isSaved={feedCardProps.isSaved}
          isLiked={feedCardProps.isLiked}
          isCommented={feedCardProps.isCommented}
          dropdownMenu={createPostDropdownItems(item.id, isOwnPost)}
          onDropdownSelect={menuItem => handleDropdownSelect(menuItem, item.id)}
          onLikePress={() => handleLikePress(item.id, item.isLiked)}
          onCommentPress={() => handleCommentPress(item.id)}
          onSavePress={() => handleSavePress(item.id, item.isSaved)}
          style={styles.feedCard}
        />
      );
    },
    [
      user,
      handleLikePress,
      handleSavePress,
      createPostDropdownItems,
      handleDropdownSelect,
      transformPostToFeedCard,
    ],
  );

  // Handle showing create options bottom sheet
  const handleShowCreateOptions = useCallback(() => {
    openBottomSheet({
      title: 'Create',
      closeButtonPosition: 'top-left',
      enableGestureControl: false,
      content: (
        <View style={styles.createOptionsContainer}>
          <Button
            title="Create Post"
            iconName="pen"
            iconPosition="left"
            variant="text"
            onPress={() => {
              navigateToScreen(navigation, 'CreatePost');
              closeBottomSheet();
            }}
          />
          <View style={styles.divider} />
          <Button
            title="Create Event"
            iconName="calendar"
            iconPosition="left"
            variant="text"
            onPress={() => {
              navigateToScreen(navigation, 'CreateEvent');
              closeBottomSheet();
            }}
          />
        </View>
      ),
      snapPoint: 'minimal',
    });
  }, [navigation, openBottomSheet]);

  return (
    <View style={styles.container}>
      <TopHeaderBar
        title="Hi there 👋🏻"
        subtitle={`${user?.firstName || ''} ${user?.lastName || ''}`}
        titleStyle={styles.title}
        subtitleStyle={styles.subtitle}
        rightIconName="plus"
        containerStyle={styles.topHeaderBar}
        onRightButtonPress={handleShowCreateOptions}
        secondRightIconName={notificationsCount > 0 ? 'bell-filled' : 'bell'}
        secondRightIconBadgeCount={notificationsCount || 0}
        onSecondRightButtonPress={() =>
          navigateToScreen(navigation, 'Notification')
        }
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
              title="Today's Weather"
              data={weatherData}
              showDetails={false}
              style={styles.weatherWidget}
            />
          </Animated.View>
        </View>

        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContentContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              progressViewOffset={95}
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.neutral.black]}
              tintColor={colors.neutral.black}
            />
          }
          onScroll={event => {
            const offsetY = event.nativeEvent.contentOffset.y;

            // Update animation value manually
            scrollY.setValue(offsetY);

            // Determine scroll direction
            isScrollingUp.current = offsetY < previousScrollY.current;
            previousScrollY.current = offsetY;
          }}
          scrollEventThrottle={16}
          nestedScrollEnabled={true}>
          <View style={styles.contentContainer}>
            {/* Recommended Routes Section */}
            <View style={styles.sectionContainer}>
              <Subtitle weight="bold" style={styles.sectionTitle}>
                Recommended Route of the Week
              </Subtitle>
              <FullImageCard
                title={currentRoute.title}
                subtitle={currentRoute.subtitle}
                image={{uri: currentRoute.image}}
                variant="elevated"
                size="small"
                onPress={() => loggingService.info('Card pressed')}
              />
            </View>

            {/* Upcoming Group Events Section */}
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeaderContainer}>
                <Subtitle weight="bold" style={styles.sectionTitle}>
                  Upcoming Group Events
                </Subtitle>
                <Button
                  variant="text"
                  onPress={() => loggingService.info('View all')}
                  title="View all"
                />
              </View>
              <FlatList
                ref={eventsListRef}
                data={upcomingEvents}
                renderItem={renderEventBanner}
                keyExtractor={item => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                snapToInterval={Dimensions.get('window').width - spacing.xl}
                decelerationRate="fast"
                onScroll={handleEventScroll}
                onScrollToIndexFailed={handleScrollToIndexFailed}
                nestedScrollEnabled={true}
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

            {/* Posts Section with FlatList */}
            <View style={[styles.sectionContainer]}>
              <Subtitle weight="bold" style={styles.sectionTitle}>
                Shared Posts
              </Subtitle>

              <View style={styles.postsContainer}>
                <FlatList
                  style={styles.postsList}
                  data={posts}
                  keyExtractor={item => item.id}
                  renderItem={renderFeedPost}
                  showsVerticalScrollIndicator={false}
                  scrollEnabled={false} // Important: disable scrolling since we're in a ScrollView
                  onEndReached={loadMore}
                  onEndReachedThreshold={0.5}
                  ListEmptyComponent={
                    postsLoading ? (
                      <View style={styles.skeletonListContainer}>
                        <SkeletonGroup preset="post" />
                        <SkeletonGroup
                          preset="post"
                          lines={1}
                          showImage={false}
                        />
                        <SkeletonGroup preset="post" lines={2} />
                      </View>
                    ) : (
                      <View style={styles.emptyContainer}>
                        <Body>No posts found</Body>
                      </View>
                    )
                  }
                />
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.secondary.light,
  },
  topHeaderBar: {
    borderBottomStartRadius: 20,
    borderBottomEndRadius: 20,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingTop: 95, // Reserve space for the banner
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
  },
  contentContainer: {
    flex: 1,
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
  sectionContainer: {
    marginBottom: spacing.md,
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
    marginVertical: spacing.sm,
  },
  createOptionsContainer: {
    flex: 1,
    flexDirection: 'column',
    gap: spacing.xs,
  },
  divider: {
    height: 1,
    backgroundColor: colors.secondary.main,
    width: '100%',
    alignSelf: 'center',
  },
  loadingContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadMoreButton: {
    alignSelf: 'center',
    marginTop: spacing.md,
  },
  postsContainer: {
    width: '100%',
  },
  postsList: {
    width: '100%',
  },
  skeletonListContainer: {
    paddingVertical: spacing.sm,
  },
});
