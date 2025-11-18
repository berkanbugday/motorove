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
  EventBanner,
  PageIndicator,
  Button,
  FeedCard,
  Body,
  SkeletonGroup,
  UserCard,
  FullImageCard,
  DropdownMenuItem,
  closeBottomSheet,
  useBottomSheet,
  LoadingIndicator,
} from '@components';
import WeatherWidget from '@components/WeatherWidget/WeatherWidget';
import {colors, fontSizes, spacing} from '@theme';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import type {IconName} from '@components/Icon';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {TabParamList} from '@navigation/types/navigationTypes';
import {navigateToScreen} from '@navigation/utils/navigationHelpers';
import {loggingService} from '@services/logging.service';
import {useAuth} from '@contexts/AuthContext';
import {useGetCount} from '@services/notification.service';
import {useGetWeather} from '@services/weather.service';
import {useGetEvents} from '@services/event.service';
import {useFocusEffect} from '@react-navigation/native';
import {useLanguage} from '@contexts/LanguageContext';
import {IPost, IUser, IImage, IEvent, EventStatus} from '@motorove/shared';
import {
  useGetPosts,
  useLikePost,
  useUnlikePost,
  useSavePost,
  useUnsavePost,
  useRemovePost,
} from '@services/post.service';
import {useTranslation} from '@hooks/useTranslation';
import {FlashList} from '@shopify/flash-list';

// EventItem interface and transformation logic moved to EventBanner component

// Change from MainStackParamList to accepting both TabParamList and MainStackParamList
type Props = NativeStackScreenProps<TabParamList, 'HomeTab'>;

export const HomeScreen = ({navigation}: Props) => {
  const {t} = useTranslation();
  const [showLocationPermission, setShowLocationPermission] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [currentRouteIndex, setCurrentRouteIndex] = useState(0);
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const {user} = useAuth();
  const {count: notificationsCount, refetch: refetchCount} = useGetCount();
  const {language} = useLanguage();
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
  const {likePost, loading: likePostLoading} = useLikePost();
  const {unlikePost, loading: unlikePostLoading} = useUnlikePost();
  const {savePost, loading: savePostLoading} = useSavePost();
  const {unsavePost, loading: unsavePostLoading} = useUnsavePost();

  // Add hook for post deletion
  const {removePost, loading: removePostLoading} = useRemovePost(() => {
    refetchPosts();
  });

  // Get weather data from the service
  const {weatherData, refetch: refetchWeather} = useGetWeather();

  // Route data
  const recommendedRoutes = [
    {
      id: '1',
      title: t('screens.home.plan_route_with_ai'),
      subtitle: t('screens.home.coming_soon'),
      image: 'https://picsum.photos/id/81/500/300',
    },
    {
      id: '2',
      title: t('screens.home.plan_route_with_ai'),
      subtitle: t('screens.home.coming_soon'),
      image: 'https://picsum.photos/id/29/500/300',
    },
    {
      id: '3',
      title: t('screens.home.plan_route_with_ai'),
      subtitle: t('screens.home.coming_soon'),
      image: 'https://picsum.photos/id/62/500/300',
    },
    {
      id: '4',
      title: t('screens.home.plan_route_with_ai'),
      subtitle: t('screens.home.coming_soon'),
      image: 'https://picsum.photos/id/11/500/300',
    },
  ];

  const [currentRoute, setCurrentRoute] = useState(recommendedRoutes[0]);

  // Get events data with limit of 3
  const {
    events,
    loading: eventsLoading,
    refetch: refetchEvents,
  } = useGetEvents(3, 0, EventStatus.UPCOMING);

  // Refetch notification count when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      refetchCount();
      refetchWeather();
    }, [refetchCount, refetchWeather]),
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
      await refetchWeather();
      await refetchEvents();
    } finally {
      setRefreshing(false);
    }
  }, [
    rotateRecommendedRoute,
    refetchCount,
    refetchPosts,
    refetchWeather,
    refetchEvents,
  ]);

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
    ({item}: {item: IEvent}) => (
      <EventBanner
        event={item}
        onPress={() =>
          navigateToScreen(navigation, 'EventDetail', {eventId: item.id})
        }
        style={styles.eventBanner}
      />
    ),
    [],
  );

  // Handle navigation to comment details
  const handleCommentPress = (postId: string) => {
    // Use our utility function that handles cross-stack navigation
    navigateToScreen(navigation, 'PostComment', {postId});
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
            label: t('common.edit'),
            icon: 'pen',
          },
          {
            id: 'delete',
            label: t('common.delete'),
            icon: 'trash',
            isHighlighted: true,
          },
        );
      }

      return items;
    },
    [],
  );

  // Render each user item
  const renderUserItem = useCallback(({item}: {item: IUser}) => {
    return (
      <UserCard
        user={item}
        onPress={() => {
          if (item.id !== user?.id) {
            closeBottomSheet();
            navigateToScreen(navigation, 'Profile', {userId: item.id});
          }
        }}
        showFollowButton={false}
        showUnfollowButton={false}
      />
    );
  }, []);

  // Show liked users in bottom sheet with current user first
  const handleLikesPress = useCallback(
    (likedUsers?: IUser[]) => {
      if (likedUsers) {
        // Sort the array to put current user first
        const sortedUsers = [...likedUsers].sort((a, b) => {
          if (a.id === user?.id) {
            return -1;
          }
          if (b.id === user?.id) {
            return 1;
          }
          return 0;
        });

        openBottomSheet({
          content: (
            <FlatList
              data={sortedUsers}
              renderItem={renderUserItem}
              keyExtractor={item => item.id}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={{padding: 20, alignItems: 'center'}}>
                  <Body>{t('screens.home.no_likes_yet')}</Body>
                </View>
              }
            />
          ),
        });
      }
    },
    [user?.id],
  );

  // Handle dropdown menu item selection
  const handleDropdownSelect = useCallback(
    (item: DropdownMenuItem, postId: string) => {
      switch (item.id) {
        case 'edit':
          navigateToScreen(navigation, 'EditPost', {postId});
          break;
        case 'delete':
          // Show confirmation dialog before deleting
          openBottomSheet({
            title: t('screens.post.delete_post'),
            snapPoint: 'minimal',
            showCloseButton: false,
            enableGestureControl: false,
            closeOnBackdropPress: true,
            content: (
              <View style={styles.bottomSheetContent}>
                <Body style={styles.bottomSheetMessage}>
                  {t('screens.post.delete_post_confirmation')}
                </Body>

                <View style={styles.bottomSheetButtons}>
                  <Button
                    title={t('common.cancel')}
                    variant="outline"
                    shape="round"
                    onPress={() => closeBottomSheet()}
                    style={styles.bottomSheetButton}
                  />
                  <Button
                    title={t('common.delete')}
                    variant="primary"
                    shape="round"
                    onPress={() => {
                      removePost(postId);
                      closeBottomSheet();
                    }}
                    style={styles.bottomSheetButton}
                  />
                </View>
              </View>
            ),
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
          icon: 'map-pin-filled' as IconName,
          text:
            post.addresses?.find(
              address =>
                address.language.toLowerCase() === language.toLowerCase(),
            )?.address || '',
        });
      }

      // Transform images from string URLs to objects with URI
      const images =
        post.images && post.images.length > 0
          ? post.images.map((img: IImage) => ({
              url: img.url,
              isCensored: img.isCensored,
              order: img.order,
            }))
          : undefined;

      return {
        id: post.id,
        fullName: `${post.createdBy.firstName} ${post.createdBy.lastName}`,
        avatarSource: formatAvatarSource(post.createdBy.avatar),
        createdAt: post.createdAt,
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
          fullName={feedCardProps.fullName}
          createdAt={feedCardProps.createdAt}
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
          onLikePress={() => {
            if (!likePostLoading && !unlikePostLoading) {
              handleLikePress(item.id, item.isLiked);
            }
          }}
          onCommentPress={() => handleCommentPress(item.id)}
          onSavePress={() => {
            if (!savePostLoading && !unsavePostLoading) {
              handleSavePress(item.id, item.isSaved);
            }
          }}
          onLikesPress={() => handleLikesPress(item.likedUsers)}
          onProfilePress={() => {
            if (item.createdBy.id !== user?.id) {
              navigateToScreen(navigation, 'Profile', {
                userId: item.createdBy.id,
              });
            }
          }}
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
      handleLikesPress,
    ],
  );

  // Handle showing create options bottom sheet
  const handleShowCreateOptions = useCallback(() => {
    openBottomSheet({
      title: t('common.create'),
      closeButtonPosition: 'top-right',
      enableGestureControl: false,
      content: (
        <View style={styles.createOptionsContainer}>
          <Button
            title={t('screens.post.create_post')}
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
            title={t('screens.event.create_event')}
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
        title={t('screens.home.hello')}
        subtitle={user?.firstName}
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

        {weatherData && (
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
                title={t('components.weatherWidget.title')}
                data={weatherData}
                style={styles.weatherWidget}
              />
            </Animated.View>
          </View>
        )}

        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={[
            styles.scrollContentContainer,
            weatherData ? {paddingTop: 95} : {paddingTop: 0},
          ]}
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
                {t('screens.home.recommended_routes')}
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
            {(events.length > 0 || eventsLoading) && (
              <View style={styles.sectionContainer}>
                <View style={styles.sectionHeaderContainer}>
                  <Subtitle weight="bold" style={styles.sectionTitle}>
                    {t('screens.home.upcoming_events')}
                  </Subtitle>
                  <Button
                    variant="text"
                    size="small"
                    onPress={() => navigateToScreen(navigation, 'Events')}
                    title={t('common.view_all')}
                  />
                </View>
                {eventsLoading ? (
                  <View style={styles.skeletonListContainer}>
                    <SkeletonGroup preset="post" showImage={false} lines={2} />
                  </View>
                ) : (
                  <>
                    <FlatList
                      ref={eventsListRef}
                      data={events}
                      renderItem={renderEventBanner}
                      keyExtractor={item => item.id}
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      snapToInterval={
                        Dimensions.get('window').width - spacing.xl
                      }
                      decelerationRate="fast"
                      onScroll={handleEventScroll}
                      onScrollToIndexFailed={handleScrollToIndexFailed}
                      nestedScrollEnabled={true}
                    />
                    {events.length > 1 && (
                      <PageIndicator
                        totalPages={events.length}
                        currentPage={currentEventIndex}
                        onPageChange={handleEventPageChange}
                        containerStyle={styles.pageIndicator}
                        type="pill"
                        indicatorSize={8}
                        activeIndicatorSize={10}
                        spacing={8}
                      />
                    )}
                  </>
                )}
              </View>
            )}

            {/* Posts Section with FlatList */}
            <View style={[styles.sectionContainer]}>
              <Subtitle weight="bold" style={styles.sectionTitle}>
                {t('screens.home.shared_posts')}
              </Subtitle>

              <View style={styles.postsContainer}>
                <FlashList
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
                        <Body>{t('screens.home.no_posts_found')}</Body>
                      </View>
                    )
                  }
                />
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
      <LoadingIndicator visible={removePostLoading} />
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
    marginTop: spacing.md,
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
  bottomSheetContent: {
    padding: spacing.md,
  },
  bottomSheetMessage: {
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  bottomSheetButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
    paddingTop: spacing.lg,
  },
  bottomSheetButton: {
    flex: 1,
    width: '50%',
  },
});
