import React, {useState, useCallback, useRef} from 'react';
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  FlatList,
  Animated,
  Platform,
} from 'react-native';
import {colors, getShadow, radius, spacing} from '@theme';
import {RouteProp} from '@react-navigation/native';
import {
  MainScreenNavigationProp,
  MainStackParamList,
} from '@navigation/types/navigationTypes';
import {useGetGroup} from '@services/group.service';
import {
  Icon,
  TopHeaderBar,
  Chip,
  Button,
  FeedCard,
  BottomSheet,
  BottomSheetRef,
  EventBanner,
  PageIndicator,
  BodySmall,
  Subtitle,
  Title,
  Typography,
  Body,
  showToast,
  DropdownMenuItem,
  MemberItem,
  LoadingIndicator,
} from '@components';
import {navigateToScreen} from '@navigation/utils/navigationHelpers';
import {
  IGroup,
  GroupPrivacy,
  EventStatus,
  IEvent,
  IPost,
} from '@motorove/shared';
import {useAuth} from '@contexts';
import {useTranslation} from '@hooks/useTranslation';
import {EnumUtils} from '@utils/enumUtils';
import {useGetEvents} from '@services/event.service';
import {
  useGroupMembership,
  useGroupMemberActions,
  useGroupPosts,
} from '@hooks/group';

type GroupDetailScreenRouteProp = RouteProp<MainStackParamList, 'GroupDetail'>;

type Props = {
  route: GroupDetailScreenRouteProp;
  navigation: MainScreenNavigationProp<'GroupDetail'>;
};

/**
 * GroupDetail Screen - Displays detailed information about a specific group
 */
export const GroupDetailScreen = ({route, navigation}: Props) => {
  const {groupId} = route.params;
  const {t} = useTranslation();
  const {
    id: currentUserId,
    email: currentUserEmail,
    firstName: currentUserFirstName,
    lastName: currentUserLastName,
    avatar: currentUserAvatar,
  } = useAuth();
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const leaveGroupBottomSheetRef = useRef<BottomSheetRef>(null);
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const eventsListRef = useRef<FlatList>(null);

  // Animated value for scroll with better performance
  const scrollY = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<any>(null);

  // Fetch group data
  const {
    group,
    loading: groupLoading,
    refetch: refetchGroup,
  } = useGetGroup(groupId);

  // Fetch events for this group
  const {events, refetch: refetchEvents} = useGetEvents(
    3,
    0,
    EventStatus.UPCOMING,
    groupId,
  );

  const {
    posts,
    postsLoading,
    refetchPosts,
    transformPostToFeedCard,
    handleLikePress,
    handleCommentPress,
    handleSavePress,
    handleLikesPress,
    createPostDropdownItems,
    handlePostDropdownSelect,
  } = useGroupPosts({groupId});

  const {
    handleJoinGroup,
    handleLeaveGroup,
    handleChangeRole,
    handleRemoveMember,
    changeMemberRoleLoading,
    removeMemberLoading,
  } = useGroupMemberActions({
    groupId,
    group,
    onMemberAdded: () => {
      refetchGroup();
      refetchEvents();
      refetchPosts();
    },
    onMemberRemoved: () => {
      leaveGroupBottomSheetRef.current?.close();
      refetchGroup();
      refetchEvents();
      refetchPosts();
    },
    onRoleChanged: () => {
      refetchGroup();
    },
  });

  // Use group membership hook with bottom sheet
  const {
    verifiedIsMember,
    verifiedIsAdmin,
    verifiedIsPendingMember,
    openMembersBottomSheet,
  } = useGroupMembership({
    group,
    user: {
      id: currentUserId,
      email: currentUserEmail,
      firstName: currentUserFirstName,
      lastName: currentUserLastName,
      avatar: currentUserAvatar,
    },
    groupLoading,
    navigation,
    MemberItemComponent: MemberItem,
    onChangeRoleConfirm: async (member: any, role: any) => {
      await handleChangeRole(member, role);
    },
    onRemoveMemberConfirm: async (member: any) => {
      await handleRemoveMember(member);
    },
    changeMemberRoleLoading,
    removeMemberLoading,
  });

  const toggleDescription = () => {
    setIsDescriptionExpanded(prev => !prev);
  };

  const renderDescription = () => {
    const description = group?.description || t('screens.group.no_description');

    if (!description || description === t('screens.group.no_description')) {
      return <BodySmall style={styles.description}>{description}</BodySmall>;
    }

    if (isDescriptionExpanded) {
      return (
        <TouchableOpacity onPress={toggleDescription}>
          <BodySmall style={styles.description}>{description}</BodySmall>
          <BodySmall align="center" weight="bold" color={colors.neutral.black}>
            {t('common.show_less')}
          </BodySmall>
        </TouchableOpacity>
      );
    }

    const truncatedDescription =
      description.length > 100
        ? `${description.substring(0, 100)}...`
        : description;

    return (
      <TouchableOpacity onPress={toggleDescription}>
        <BodySmall style={styles.description}>{truncatedDescription}</BodySmall>
        {description.length > 100 && (
          <BodySmall align="center" weight="bold" color={colors.neutral.black}>
            {t('common.read_more')}
          </BodySmall>
        )}
      </TouchableOpacity>
    );
  };

  // Render feed post with FeedCard component
  const renderFeedPost = useCallback(
    ({item}: {item: IPost}) => {
      const isOwnPost = item.createdBy.id === currentUserId;
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
          onDropdownSelect={menuItem =>
            handlePostDropdownSelect(menuItem, item.id)
          }
          onLikePress={() => handleLikePress(item.id, item.isLiked)}
          onCommentPress={() => handleCommentPress(item.id)}
          onSavePress={() => handleSavePress(item.id, feedCardProps.isSaved)}
          onLikesPress={() => handleLikesPress(item.likedUsers)}
          style={styles.feedCard}
        />
      );
    },
    [
      currentUserId,
      transformPostToFeedCard,
      createPostDropdownItems,
      handlePostDropdownSelect,
      handleLikePress,
      handleCommentPress,
      handleSavePress,
      handleLikesPress,
    ],
  );

  // Create dropdown menu items for the group detail screen
  const groupDropdownMenuItems = useCallback(
    (isAdmin?: boolean, isMember?: boolean): DropdownMenuItem[] => {
      const items: DropdownMenuItem[] = [];

      if (isAdmin) {
        items.push({
          id: 'edit_group',
          label: t('common.edit'),
          icon: 'pen-filled',
        });
      }

      if (isMember) {
        items.push({
          id: 'members',
          label: t('screens.group.members'),
          icon: 'users-filled',
        });
        items.push({
          id: 'leave_group',
          label: t('screens.group.leave'),
          icon: 'users-slash-filled',
          isHighlighted: true,
        });
      } else {
        items.push({
          id: 'join_group',
          label: t('screens.group.join'),
          icon: 'user-plus-filled',
        });
      }

      return items;
    },
    [t],
  );

  const handleLeaveGroupPress = useCallback(
    async (_group: IGroup) => {
      if (_group?.isOwner) {
        showToast({
          text1: t('common.warning'),
          text2: t('screens.group.cannot_leave_group'),
          type: 'warning',
        });
        return;
      }
      leaveGroupBottomSheetRef.current?.open('minimal');
    },
    [t],
  );

  const confirmLeaveGroup = useCallback(async () => {
    await handleLeaveGroup(currentUserId);
  }, [handleLeaveGroup, currentUserId]);

  // Handle dropdown item select
  const handleDropdownMenuItemSelect = useCallback(
    (item: DropdownMenuItem, _group: IGroup) => {
      switch (item.id) {
        case 'edit_group':
          navigateToScreen(navigation, 'EditGroup', {groupId});
          break;
        case 'members':
          openMembersBottomSheet();
          break;
        case 'leave_group':
          handleLeaveGroupPress(_group);
          break;
        case 'join_group':
          handleJoinGroup(currentUserId, verifiedIsPendingMember);
          break;
        default:
          break;
      }
    },
    [
      groupId,
      navigation,
      handleLeaveGroupPress,
      handleJoinGroup,
      currentUserId,
      verifiedIsPendingMember,
    ],
  );

  // Handle event scroll
  const handleEventScroll = useCallback((event: any) => {
    const contentOffset = event.nativeEvent.contentOffset;
    const viewSize = event.nativeEvent.layoutMeasurement;
    const pageNum = Math.floor(contentOffset.x / (viewSize.width - spacing.xl));
    setCurrentEventIndex(pageNum);
  }, []);

  const handleEventPageChange = useCallback((pageIndex: number) => {
    eventsListRef.current?.scrollToIndex({
      index: pageIndex,
      animated: true,
      viewPosition: 0.5,
    });
  }, []);

  const handleScrollToIndexFailed = useCallback(
    (info: {
      index: number;
      highestMeasuredFrameIndex: number;
      averageItemLength: number;
    }) => {
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
    [navigation],
  );

  // Show loading while fetching initial data
  if (groupLoading || postsLoading) {
    return <LoadingIndicator visible={true} />;
  }

  // Animated values with smoother interpolation
  const headerHeight = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [280, 120],
    extrapolate: 'clamp',
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 150, 200],
    outputRange: [1, 0.8, 0.6],
    extrapolate: 'clamp',
  });

  const backButtonOpacity = scrollY.interpolate({
    inputRange: [0, 120],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      {/* Floating Header Bar */}
      <Animated.View
        style={[styles.floatingHeaderBar, {opacity: backButtonOpacity}]}>
        <TopHeaderBar
          showBackButton
          backgroundColor="transparent"
          onBackPress={() => navigation.goBack()}
          dropdownMenuItems={groupDropdownMenuItems(
            verifiedIsAdmin,
            verifiedIsMember,
          )}
          onDropdownItemSelect={item =>
            handleDropdownMenuItemSelect(item, group as IGroup)
          }
        />
      </Animated.View>

      {/* Single ScrollView with header as first element */}
      <Animated.ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{nativeEvent: {contentOffset: {y: scrollY}}}],
          {useNativeDriver: false},
        )}
        scrollEventThrottle={Platform.OS === 'android' ? 16 : 8}
        bounces={false}
        overScrollMode={Platform.OS === 'android' ? 'never' : 'auto'}
        nestedScrollEnabled={Platform.OS === 'android'}
        removeClippedSubviews={false}
        decelerationRate={Platform.OS === 'android' ? 'fast' : 'normal'}>
        {/* Header Cover as first scroll element - Animated */}
        <Animated.View style={[styles.headerContainer, {height: headerHeight}]}>
          <Animated.Image
            source={{uri: group?.cover ? group?.cover : undefined}}
            style={[
              styles.cover,
              {
                opacity: headerOpacity,
              },
            ]}
            resizeMode="cover"
          />
          <View style={styles.overlay} />
        </Animated.View>

        <View style={styles.logoContainer}>
          <Image source={{uri: group?.logo || ''}} style={styles.logo} />
        </View>

        <View style={styles.infoContainer}>
          <Title align="center">{group?.name}</Title>

          <View style={styles.infoRow}>
            <Icon name="users-filled" size={18} />
            <Typography style={styles.infoText}>
              {group?.membersCount || 0} {t('screens.group.member')}
              {group?.membersCapacity
                ? ` / ${group?.membersCapacity} ${t(
                    'screens.group.members_capacity',
                  )}`
                : ''}{' '}
            </Typography>
            <View style={styles.dot} />
            <View style={styles.lockContainer}>
              <Icon
                name={
                  group?.privacy === GroupPrivacy.PUBLIC
                    ? 'lock-open-filled'
                    : 'lock-filled'
                }
                size={18}
              />
              <Typography style={styles.infoText}>
                {
                  EnumUtils.getGroupPrivacyOptions().find(
                    option => option.value === group?.privacy,
                  )?.label
                }
              </Typography>
            </View>
          </View>

          {group?.city && (
            <View style={styles.infoRow}>
              <Icon name="map-pin-filled" size={18} />
              <Typography style={styles.infoText}>
                {group?.city.value}, {t('common.country')}
              </Typography>
            </View>
          )}

          <View style={styles.tagsContainer}>
            {EnumUtils.convertGroupTags(group?.tags || []).map((tag, index) => (
              <Chip
                variant="outlined"
                color="dark"
                size="small"
                key={index}
                label={tag}
              />
            ))}
          </View>

          <View style={styles.descriptionContainer}>{renderDescription()}</View>
        </View>

        {verifiedIsMember && (
          <>
            {events.length > 0 && (
              <View style={styles.content}>
                <View style={styles.sectionHeaderContainer}>
                  <Subtitle weight="bold">
                    {t('screens.group.upcoming_events')}
                  </Subtitle>
                </View>
                <FlatList
                  ref={eventsListRef}
                  data={events}
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
              </View>
            )}

            <View style={styles.content}>
              <Subtitle weight="bold">
                {t('screens.group.recent_posts')}
              </Subtitle>
              {postsLoading ? (
                <LoadingIndicator visible={true} />
              ) : posts.length > 0 ? (
                <View style={styles.feedList}>
                  {posts.map(post => (
                    <View key={post.id}>{renderFeedPost({item: post})}</View>
                  ))}
                </View>
              ) : (
                <View style={styles.noPostsContainer}>
                  <Typography color={colors.neutral.grey}>
                    {t('screens.group.no_posts_yet')}
                  </Typography>
                </View>
              )}
            </View>
          </>
        )}
      </Animated.ScrollView>

      <BottomSheet
        ref={leaveGroupBottomSheetRef}
        closeOnBackdropPress={true}
        initialSnap="closed"
        showCloseButton={false}
        enableGestureControl={false}
        closeButtonPosition="top-right"
        header={
          <Subtitle align="center">{t('screens.group.leave_group')}</Subtitle>
        }>
        <View style={styles.leaveGroupContainer}>
          <Body align="center">
            {t('screens.group.leave_group_confirmation', {
              groupName: group?.name || '',
            })}
          </Body>
        </View>
        <View style={styles.leaveGroupButtonsContainer}>
          <Button
            title={t('common.no')}
            variant="outline"
            shape="round"
            onPress={() => leaveGroupBottomSheetRef.current?.close()}
            style={{flex: 1}}
          />
          <Button
            title={t('common.yes')}
            variant="primary"
            shape="round"
            onPress={confirmLeaveGroup}
            style={{flex: 1}}
            disabled={removeMemberLoading}
          />
        </View>
      </BottomSheet>
      <LoadingIndicator visible={removeMemberLoading} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.secondary.light,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingHeaderBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    backgroundColor: 'transparent',
  },
  headerContainer: {
    height: 280,
    position: 'relative',
    marginBottom: Platform.OS === 'android' ? -spacing.xl : -spacing.lg,
  },
  cover: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: -30,
    marginBottom: spacing.md,
    ...getShadow('medium'),
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: radius.round,
    backgroundColor: colors.neutral.white,
    ...getShadow('medium'),
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  infoContainer: {
    backgroundColor: colors.neutral.white,
    borderColor: colors.secondary.main,
    borderLeftWidth: 3,
    borderRightWidth: 3,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: radius.lg,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    marginLeft: spacing.xs,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.neutral.lightGrey,
    marginHorizontal: spacing.sm,
  },
  lockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  descriptionContainer: {
    width: '100%',
    paddingHorizontal: spacing.md,
  },
  description: {
    textAlign: 'center',
    lineHeight: 24,
  },
  content: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    paddingTop: spacing.md,
  },
  sectionHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
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
    marginBottom: spacing.md,
  },
  feedList: {
    paddingTop: spacing.md,
  },
  feedCard: {
    marginBottom: spacing.md,
  },
  leaveGroupContainer: {
    padding: spacing.md,
  },
  leaveGroupButtonsContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.secondary.main,
    paddingVertical: spacing.md,
    marginVertical: spacing.md,
  },
  postsLoadingContainer: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noPostsContainer: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
