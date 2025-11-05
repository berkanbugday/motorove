import React, {useState, useCallback, useRef, useEffect, useMemo} from 'react';
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
  Dimensions,
  FlatList,
  RefreshControl,
} from 'react-native';
import {colors, getShadow, radius, rh, spacing} from '@theme';
import {useNavigation, RouteProp} from '@react-navigation/native';
import {
  MainScreenNavigationProp,
  MainStackParamList,
} from '@navigation/types/navigationTypes';
import {useGetGroup} from '@services/group.service';
import {
  Icon,
  IconName,
  TopHeaderBar,
  Chip,
  Button,
  FeedCard,
  BottomSheet,
  BottomSheetRef,
  EventBanner,
  PageIndicator,
  showToast,
  Dropdown,
  Dialog,
  DialogRef,
  DropdownItem,
  BodySmall,
  Caption,
  Subtitle,
  Title,
  Typography,
  UserCard,
  Body,
} from '@components';
import {navigateToScreen} from '@navigation/utils/navigationHelpers';
import {DropdownMenuItem} from '@components/DropdownMenu';
import {loggingService} from '@services/logging.service';
import {
  useGetPosts,
  useLikePost,
  useUnlikePost,
  useSavePost,
  useUnsavePost,
  useRemovePost,
} from '@services/post.service';
import {
  IPost,
  IGroup,
  GroupMemberRole,
  GroupPrivacy,
  IUser,
  IImage,
  EventStatus,
  IEvent,
  ApprovalStatus,
} from '@motorove/shared';
import {useAuth, useLanguage} from '@contexts';
import {
  useAddMember,
  useChangeMemberRole,
  useRemoveMember,
} from '@services/group-membership.service';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {AuthUser} from '@app-types/auth.types';
import {useTranslation} from '@hooks/useTranslation';
import {EnumUtils} from '@utils/enumUtils';
import {
  closeBottomSheet,
  openBottomSheet,
} from '@components/BottomSheet/BottomSheetProvider';
import {useGetEvents} from '@services/event.service';
type GroupDetailScreenRouteProp = RouteProp<MainStackParamList, 'GroupDetail'>;

type Props = {
  route: GroupDetailScreenRouteProp;
  navigation: MainScreenNavigationProp<'GroupDetail'>;
};

const formatAvatarSource = (imageUrl?: string) => {
  return imageUrl
    ? {uri: imageUrl}
    : require('@assets/images/default_avatar.png');
};

// EventItem interface and transformation logic moved to EventBanner component

const MemberItem = React.memo(
  ({
    item,
    isAdmin,
    isMember,
    user,
    onChangeRole,
    onRemoveMember,
  }: {
    item: any;
    isAdmin?: boolean;
    isMember?: boolean;
    user: AuthUser;
    onChangeRole?: (member: any) => void;
    onRemoveMember?: (member: any) => void;
  }) => {
    // Animation state and refs for this specific row
    const [isActive, setIsActive] = useState(false);
    const actionAnimValue = useRef(new Animated.Value(-100)).current;
    const profileAnimValue = useRef(new Animated.Value(0)).current;
    const {t} = useTranslation();
    const navigation = useNavigation<MainScreenNavigationProp<'GroupDetail'>>();

    // Animation function
    const animateActions = useCallback(
      (show: boolean) => {
        Animated.spring(actionAnimValue, {
          toValue: show ? 0 : -100,
          useNativeDriver: true,
          friction: 8,
          tension: 40,
        }).start();

        Animated.spring(profileAnimValue, {
          toValue: show ? 100 : 0,
          useNativeDriver: true,
          friction: 8,
          tension: 40,
        }).start();
      },
      [actionAnimValue, profileAnimValue],
    );

    // Toggle animation state
    const handlePress = useCallback(() => {
      if (isAdmin) {
        const newState = !isActive;
        setIsActive(newState);
        animateActions(newState);

        // Auto-hide after 3 seconds if showing
        if (newState) {
          const timer = setTimeout(() => {
            setIsActive(false);
            animateActions(false);
          }, 3000);
          return () => clearTimeout(timer);
        }
      }
    }, [isActive, isAdmin, animateActions]);

    return (
      <TouchableOpacity
        style={styles.memberItem}
        onPress={handlePress}
        activeOpacity={0.8}>
        <View style={styles.memberLeftContent}>
          <Image
            source={
              item.user.avatar
                ? {uri: item.user.avatar}
                : require('@assets/images/default_avatar.png')
            }
            style={styles.memberAvatar}
          />
          <View style={styles.memberInfo}>
            <Typography weight="medium">
              {item.user.firstName} {item.user.lastName}
            </Typography>
            <View style={styles.memberRoleContainer}>
              {item.role === GroupMemberRole.ADMIN && (
                <Chip
                  variant="filled"
                  color="primary"
                  size="small"
                  label={t('enums.groupMemberRole.admin')}
                  style={styles.adminRole}
                />
              )}

              {item.role === GroupMemberRole.MEMBER && (
                <Chip
                  variant="filled"
                  color="secondary"
                  size="small"
                  label={t('enums.groupMemberRole.member')}
                  style={styles.memberRole}
                />
              )}
              <Caption color={colors.neutral.grey}>
                {item.user.city?.value}
              </Caption>
            </View>
          </View>
        </View>
        {isAdmin && item.user.id !== user.id && (
          <Animated.View
            style={[
              styles.memberRightContent,
              {
                position: 'absolute',
                right: 0,
                transform: [{translateX: actionAnimValue}],
                opacity: actionAnimValue.interpolate({
                  inputRange: [-100, 0],
                  outputRange: [0, 1],
                }),
                display: isActive ? 'flex' : 'none',
              },
            ]}>
            <Button
              iconName="user-gear-filled"
              iconSize={24}
              variant="secondary"
              shape="circle"
              onPress={() => onChangeRole && onChangeRole(item)}
              style={styles.memberAction}
            />
            <Button
              iconName="user-slash-filled"
              iconSize={24}
              variant="primary"
              shape="circle"
              onPress={() => onRemoveMember && onRemoveMember(item)}
              style={styles.memberAction}
            />
          </Animated.View>
        )}
        {isMember && item.user.id !== user.id && (
          <Animated.View
            style={[
              {
                position: 'absolute',
                right: 0,
                transform: [{translateX: profileAnimValue}],
                opacity: profileAnimValue.interpolate({
                  inputRange: [0, 100],
                  outputRange: [1, 0],
                }),
                display: isActive ? 'none' : 'flex',
              },
            ]}>
            <Button
              title={t('screens.group.view_profile')}
              variant="outline"
              shape="round"
              size="small"
              onPress={() => {
                if (item.user.id !== user.id) {
                  navigateToScreen(navigation, 'Profile', {
                    userId: item.user.id,
                  });
                }
              }}
            />
          </Animated.View>
        )}
      </TouchableOpacity>
    );
  },
);

/**
 * GroupDetail Screen - Displays detailed information about a specific group
 */
export const GroupDetailScreen = ({route, navigation}: Props) => {
  const {groupId} = route.params;
  const {t} = useTranslation();
  const {user} = useAuth();
  const {language} = useLanguage();
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const membersBottomSheetRef = useRef<BottomSheetRef>(null);
  const leaveGroupBottomSheetRef = useRef<BottomSheetRef>(null);
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const eventsListRef = useRef<FlatList>(null);
  const changeRoleDialogRef = useRef<DialogRef>(null);
  const removeMemberDialogRef = useRef<DialogRef>(null);
  const insets = useSafeAreaInsets();
  // State for selected member and role
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [memberToRemove, setMemberToRemove] = useState<any>(null);
  const [selectedRole, setSelectedRole] = useState<DropdownItem | null>(null);

  // Track which member row has actions visible
  const [activeMemberId, setActiveMemberId] = useState<string | null>(null);

  // Animation values at component level
  const memberActionsAnim = useRef(new Animated.Value(-100)).current;
  const viewProfileAnim = useRef(new Animated.Value(0)).current;

  // Create animated scroll value to track scroll position
  const scrollY = useRef(new Animated.Value(0)).current;

  // Create interpolated values for animations with smoother transitions
  const headerHeight = scrollY.interpolate({
    inputRange: [0, 80 + insets.top, 120 + insets.top],
    outputRange: [150 + insets.top, 80 + insets.top, 50 + insets.top],
    extrapolate: 'clamp',
  });

  const logoSize = scrollY.interpolate({
    inputRange: [0, 80 + insets.top, 120 + insets.top],
    outputRange: [100, 75, 60],
    extrapolate: 'clamp',
  });

  const logoMarginTop = scrollY.interpolate({
    inputRange: [0, 80 + insets.top, 120 + insets.top],
    outputRange: [-50 + insets.top, -100 + insets.top, -130 + insets.top],
    extrapolate: 'clamp',
  });

  // Use the useGetGroup hook to fetch the group data
  const {
    group,
    loading: groupLoading,
    refetch: refetchGroup,
  } = useGetGroup(groupId);

  // Use the useGetPosts hook to fetch posts for this group
  const {
    posts,
    loading: postsLoading,
    refetch: refetchPosts,
  } = useGetPosts(groupId);

  // Use the useGetEvents hook to fetch events for this group
  const {events, refetch: refetchEvents} = useGetEvents(
    3,
    0,
    EventStatus.UPCOMING,
    groupId,
  );

  // Handle pull-to-refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetchGroup();
      await refetchPosts();
      await refetchEvents();
    } finally {
      setRefreshing(false);
    }
  }, [refetchGroup, refetchPosts, refetchEvents]);

  // Fetch group members
  const members = group?.memberships || [];

  // Fix: Verify isMember status from memberships array if backend value is incorrect
  const verifiedIsMember = useMemo(() => {
    // If backend says user is a member, trust it
    if (group?.isMember === true) {
      return true;
    }
    // Otherwise, check memberships array as fallback
    if (group?.memberships && user?.id) {
      const userMembership = group.memberships.find(
        m => m.user.id === user.id && m.status === ApprovalStatus.ACCEPTED,
      );
      return !!userMembership;
    }
    return group?.isMember ?? false;
  }, [group?.isMember, group?.memberships, user?.id]);

  const verifiedIsAdmin = useMemo(() => {
    // If backend says user is admin, trust it
    if (group?.isAdmin === true) {
      return true;
    }
    // Otherwise, check memberships array as fallback
    if (verifiedIsMember && group?.memberships && user?.id) {
      const userMembership = group.memberships.find(
        m => m.user.id === user.id && m.status === ApprovalStatus.ACCEPTED,
      );
      return !!userMembership && userMembership.role === GroupMemberRole.ADMIN;
    }
    return group?.isAdmin ?? false;
  }, [group?.isAdmin, group?.memberships, user?.id, verifiedIsMember]);

  const verifiedIsPendingMember = useMemo(() => {
    // If backend says user is pending, trust it
    if (group?.isPendingMember === true) {
      return true;
    }
    // Otherwise, check memberships array as fallback
    if (group?.memberships && user?.id) {
      const userMembership = group.memberships.find(
        m => m.user.id === user.id && m.status === ApprovalStatus.PENDING,
      );
      return !!userMembership;
    }
    return group?.isPendingMember ?? false;
  }, [group?.isPendingMember, group?.memberships, user?.id]);

  const {addMember} = useAddMember(() => {
    if (group?.privacy === GroupPrivacy.PUBLIC) {
      showToast({
        text1: t('common.success'),
        text2: t('screens.group.join_success'),
        type: 'success',
      });
    } else {
      showToast({
        text1: t('common.success'),
        text2: t('screens.group.join_request_sent'),
        type: 'success',
      });
    }
    // Refresh the group data
    refetchGroup() || refetchPosts();
  });
  const {changeMemberRole, loading: changeMemberRoleLoading} =
    useChangeMemberRole(() => {
      // Close dialog and refresh data
      changeRoleDialogRef.current?.close();
      refetchGroup() || refetchPosts();
    });
  const {removeMember, loading: removeMemberLoading} = useRemoveMember(() => {
    removeMemberDialogRef.current?.close();
    leaveGroupBottomSheetRef.current?.close();
    refetchGroup() || refetchPosts();
  });

  // Post interaction hooks
  const {likePost} = useLikePost();
  const {unlikePost} = useUnlikePost();
  const {savePost} = useSavePost();
  const {unsavePost} = useUnsavePost();
  const {removePost} = useRemovePost(() => {
    refetchPosts();
  });

  // Handle opening the remove member dialog
  const handleOpenRemoveMemberDialog = useCallback((member: any) => {
    setMemberToRemove(member);
    removeMemberDialogRef.current?.open();
  }, []);

  // Handle member removal
  const handleRemoveMember = useCallback(async () => {
    if (!memberToRemove) {
      return;
    }

    try {
      const result = await removeMember({
        groupId,
        userId: memberToRemove.user.id,
      });
      if (result) {
        showToast({
          type: 'success',
          text1: t('common.success'),
          text2: t('screens.group.success_removed_member'),
        });
      }
    } catch (error) {
      loggingService.error('Error removing member', error);
      showToast({
        text1: t('common.error'),
        text2: t('errors.general.something_wrong'),
        type: 'error',
      });
    }
  }, [memberToRemove, groupId, removeMember, t]);

  // Handle opening the change role dialog
  const handleOpenChangeRoleDialog = useCallback(
    (member: any) => {
      setSelectedMember(member);
      // Find the current role in the dropdown items
      const currentRole = EnumUtils.getGroupMemberRoles().find(
        role => role.value === member.role,
      );
      setSelectedRole(currentRole || null);
      changeRoleDialogRef.current?.open();
    },
    [members, t],
  );

  // Handle role change
  const handleChangeRole = useCallback(async () => {
    if (!selectedMember || !selectedRole) {
      return;
    }

    try {
      if (selectedMember.role !== selectedRole.value) {
        await changeMemberRole({
          groupId,
          userId: selectedMember.user.id,
          role: selectedRole.value as GroupMemberRole,
        });
      }
    } catch (error) {
      loggingService.error('Error changing member role', error);
      showToast({
        text1: t('common.error'),
        text2: t('errors.general.something_wrong'),
        type: 'error',
      });
    }
  }, [
    selectedMember,
    selectedRole,
    groupId,
    changeMemberRole,
    refetchGroup,
    t,
  ]);

  const toggleDescription = () => {
    setIsDescriptionExpanded(prev => !prev);
  };

  // Animation function for member actions but using activeMemberId
  const toggleMemberActions = useCallback(
    (memberId: string | null) => {
      // Set the active member ID
      setActiveMemberId(memberId);

      // Animate based on whether we're showing or hiding
      const show = memberId !== null;

      Animated.spring(memberActionsAnim, {
        toValue: show ? 0 : -100,
        useNativeDriver: true,
        friction: 8,
        tension: 40,
      }).start();

      Animated.spring(viewProfileAnim, {
        toValue: show ? 100 : 0,
        useNativeDriver: true,
        friction: 8,
        tension: 40,
      }).start();
    },
    [memberActionsAnim, viewProfileAnim],
  );

  // Set up auto-hide timer when active member changes
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (activeMemberId) {
      timer = setTimeout(() => {
        toggleMemberActions(null);
      }, 3000);
    }
    return () => timer && clearTimeout(timer);
  }, [activeMemberId, toggleMemberActions]);

  // Refetch posts when screen gains focus (when coming back from other screens)
  // useFocusEffect(
  //   useCallback(() => {
  //     // Always refetch group if refetch function is available
  //     if (refetchGroup) {
  //       loggingService.info('GroupDetailScreen: Refetching group on focus');
  //       refetchGroup();
  //     }
  //   }, [refetchGroup]),
  // );

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

    // Truncate description to ~3 lines
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

  // Handle like press with API call - using optimistic updates (matching HomeScreen)
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

  // Handle comment press - navigate to comment screen
  const handleCommentPress = useCallback(
    (postId: string) => {
      navigateToScreen(navigation, 'PostComment', {postId});
    },
    [navigation],
  );

  // Handle save press with API call - using optimistic updates (matching HomeScreen)
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

  // Transform post data to FeedCard props (matching HomeScreen)
  const transformPostToFeedCard = useCallback(
    (post: IPost) => {
      // Create labels from post data
      const labels = [];

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
    [language, t],
  );

  // Create dropdown menu items for the feed posts (matching HomeScreen)
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
    [t],
  );

  // Handle dropdown menu item selection for posts
  const handlePostDropdownSelect = useCallback(
    (item: DropdownMenuItem, postId: string) => {
      switch (item.id) {
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
            title: t('screens.post.delete_post'),
            closeButtonPosition: 'top-right',
            enableGestureControl: false,
            content: (
              <View>
                <BodySmall>
                  {t('screens.post.delete_post_confirmation')}
                </BodySmall>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    gap: spacing.md,
                    paddingTop: spacing.lg,
                    paddingBottom: spacing.lg,
                  }}>
                  <Button
                    title={t('common.cancel')}
                    variant="outline"
                    onPress={() => closeBottomSheet()}
                    style={{width: '50%'}}
                  />
                  <Button
                    title={t('common.delete')}
                    variant="primary"
                    onPress={() => {
                      removePost(postId);
                      closeBottomSheet();
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
    [navigation, removePost, t, refetchPosts],
  );

  // Render feed post with FeedCard component
  const renderFeedPost = useCallback(
    ({item}: {item: IPost}) => {
      const isOwnPost = item.createdBy.id === user?.id;
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
      user,
      handleLikePress,
      handleSavePress,
      createPostDropdownItems,
      handlePostDropdownSelect,
      transformPostToFeedCard,
      handleLikesPress,
      handleCommentPress,
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

  const handleLeaveGroup = useCallback(
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
    [user],
  );

  const handleJoinGroup = useCallback(
    async (_group: IGroup) => {
      if (verifiedIsPendingMember) {
        loggingService.info(`Group: ${groupId} is pending. Cannot join.`);
        showToast({
          text1: t('common.warning'),
          text2: t('screens.group.group_pending'),
          type: 'warning',
        });
        return;
      }

      if (
        _group?.membersCapacity &&
        _group?.membersCount &&
        _group?.membersCount >= _group?.membersCapacity
      ) {
        loggingService.info(`Group: ${groupId} is full. Cannot join.`);
        showToast({
          text1: t('common.warning'),
          text2: t('screens.group.group_full'),
          type: 'warning',
        });
        return;
      } else {
        try {
          if (user && user.id) {
            await addMember({
              groupId,
              userId: user.id,
            });
          }
        } catch (error) {
          loggingService.error(`Error joining group: ${groupId}`, error);
          showToast({
            text1: t('common.error'),
            text2: t('errors.general.something_wrong'),
            type: 'error',
          });
        }
      }
    },
    [
      addMember,
      groupId,
      group?.membersCapacity,
      group?.membersCount,
      group?.privacy,
      refetchGroup,
      user?.id,
      t,
      verifiedIsPendingMember,
    ],
  );

  const confirmLeaveGroup = useCallback(async () => {
    try {
      if (user && user.id) {
        const result = await removeMember({groupId, userId: user.id});
        if (result) {
          showToast({
            type: 'success',
            text1: t('common.success'),
            text2: t('screens.group.success_left_group'),
          });
        }
      }
    } catch (error) {
      loggingService.error(`Error leaving group: ${groupId}`, error);
      // Error handling is already done in the service hook
    }
  }, [groupId, removeMember, user]);

  // Handle dropdown item select
  const handleDropdownMenuItemSelect = useCallback(
    (item: DropdownMenuItem, _group: IGroup) => {
      switch (item.id) {
        case 'edit_group':
          navigateToScreen(navigation, 'EditGroup', {groupId});
          break;
        case 'members':
          membersBottomSheetRef.current?.open('full');
          break;
        case 'leave_group':
          handleLeaveGroup(_group);
          break;
        case 'join_group':
          handleJoinGroup(_group);
          break;
        default:
          loggingService.info(
            `Unhandled action: ${item.id} for group: ${groupId}`,
          );
      }
    },
    [],
  );

  // Handle role selection in dropdown
  const handleRoleSelect = useCallback((item: DropdownItem | null) => {
    // Convert the component dropdown item to our enum dropdown item type
    if (item) {
      setSelectedRole(item);
    } else {
      setSelectedRole(null);
    }
  }, []);

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

  // Now just a simple render function that uses the MemberItem component
  const renderMemberItem = useCallback(
    ({item}: {item: any}) => {
      if (!user) {
        return null;
      }

      return (
        <MemberItem
          item={item}
          isAdmin={verifiedIsAdmin}
          isMember={verifiedIsMember}
          user={user}
          onChangeRole={handleOpenChangeRoleDialog}
          onRemoveMember={handleOpenRemoveMemberDialog}
        />
      );
    },
    [
      verifiedIsAdmin,
      verifiedIsMember,
      user,
      handleOpenChangeRoleDialog,
      handleOpenRemoveMemberDialog,
    ],
  );

  // Show loading while fetching initial data
  if (groupLoading || postsLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TopHeaderBar
        showBackButton
        backgroundColor="transparent"
        containerStyle={styles.topHeaderBar}
        onBackPress={() => navigation.goBack()}
        dropdownMenuItems={groupDropdownMenuItems(
          verifiedIsAdmin,
          verifiedIsMember,
        )}
        onDropdownItemSelect={item =>
          handleDropdownMenuItemSelect(item, group as IGroup)
        }
      />
      <Animated.View style={{height: headerHeight}}>
        <Image
          source={{uri: group?.cover ? group?.cover : undefined}}
          style={styles.cover}
          resizeMode="cover"
        />
        <View style={styles.overlay} />
      </Animated.View>

      {/* Logo rendered outside the cover container for proper layering */}
      <Animated.View
        style={[
          styles.logoWrapper,
          {
            transform: [{translateY: logoMarginTop}],
          },
        ]}>
        <Animated.Image
          source={{uri: group?.logo || ''}}
          style={[
            styles.logo,
            {
              width: logoSize,
              height: logoSize,
            },
          ]}
        />
      </Animated.View>

      <Animated.ScrollView
        style={[styles.scrollView, {marginTop: rh(10) + insets.top}]}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={8} // Reduced for smoother animations
        bounces={true}
        bouncesZoom={false}
        alwaysBounceVertical={false}
        decelerationRate="normal"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onScroll={Animated.event(
          [{nativeEvent: {contentOffset: {y: scrollY}}}],
          {
            useNativeDriver: false,
            listener: _event => {
              // Optional: Add any additional scroll handling here if needed
            },
          },
        )}>
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

          <View style={styles.infoRow}>
            <Icon name="map-pin-filled" size={18} />
            <Typography style={styles.infoText}>
              {group?.city.value || t('screens.group.no_location')}
            </Typography>
          </View>

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
        {/* <View style={styles.shortcutsContainer}>
          {group?.isMember && (
            <View style={styles.shortcutButton}>
              <Button
                iconName="plus"
                iconSize={24}
                variant="secondary"
                shape="circle"
              />
              <Caption>Create Post</Caption>
            </View>
          )}
          {group?.isAdmin && (
            <View style={styles.shortcutButton}>
              <Button
                iconName="route"
                iconSize={24}
                variant="secondary"
                shape="circle"
                onPress={() => navigateToScreen(navigation, 'CreateEvent', {})}
              />
              <Caption>Create Event</Caption>
            </View>
          )}
        </View> */}

        {verifiedIsMember ? (
          <>
            {/* Upcoming Group Events Section */}
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

            {/* Recent Posts Section */}
            <View style={styles.content}>
              <Subtitle weight="bold">
                {t('screens.group.recent_posts')}
              </Subtitle>
              {postsLoading ? (
                <View style={styles.postsLoadingContainer}>
                  <ActivityIndicator size="large" />
                </View>
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
        ) : (
          <View style={styles.content}>
            <Subtitle weight="bold">
              {verifiedIsMember
                ? t('screens.group.joined')
                : t('screens.group.not_joined')}
            </Subtitle>
          </View>
        )}
      </Animated.ScrollView>

      <BottomSheet
        ref={membersBottomSheetRef}
        closeOnBackdropPress={true}
        initialSnap="closed"
        showCloseButton={false}
        header={
          <View style={styles.membersHeader}>
            <View>
              <Subtitle>{t('screens.group.members')}</Subtitle>
              <Caption color={colors.neutral.grey}>
                {members.length} {t('screens.group.people')}
              </Caption>
            </View>
          </View>
        }>
        {groupLoading ? (
          <ActivityIndicator size="large" />
        ) : (
          <FlatList
            data={members}
            renderItem={renderMemberItem}
            keyExtractor={(item: any) => item.id}
            contentContainerStyle={styles.membersList}
            showsVerticalScrollIndicator={false}
          />
        )}
      </BottomSheet>

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
          <View style={styles.leaveGroupContent}>
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
              style={styles.cancelButton}
            />
            <Button
              title={t('common.yes')}
              variant="primary"
              shape="round"
              onPress={confirmLeaveGroup}
              style={styles.leaveGroupButton}
              loading={removeMemberLoading}
            />
          </View>
        </View>
      </BottomSheet>

      <Dialog
        ref={changeRoleDialogRef}
        title={t('screens.group.change_role')}
        variant="custom"
        statusBarTranslucent={false}>
        {selectedMember && (
          <View style={styles.changeRoleContent}>
            <Subtitle weight="bold" align="center">
              {selectedMember.user.firstName} {selectedMember.user.lastName}
            </Subtitle>

            <Dropdown
              label={t('screens.group.role')}
              data={EnumUtils.getGroupMemberRoles()}
              selectedItem={selectedRole}
              onSelect={handleRoleSelect}
              showClearButton={false}
              loading={groupLoading}
            />

            <View style={styles.dialogButtonsContainer}>
              <Button
                title={t('common.cancel')}
                variant="outline"
                shape="round"
                onPress={() => changeRoleDialogRef.current?.close()}
              />
              <Button
                title={t('common.change')}
                variant="primary"
                shape="round"
                textStyle={{color: colors.neutral.white}}
                onPress={handleChangeRole}
                disabled={!selectedRole}
                loading={changeMemberRoleLoading}
              />
            </View>
          </View>
        )}
      </Dialog>

      <Dialog
        ref={removeMemberDialogRef}
        title={t('screens.group.remove_member')}
        message={
          memberToRemove
            ? t('screens.group.remove_member_confirmation', {
                memberName: `${memberToRemove.user.firstName} ${memberToRemove.user.lastName}`,
              })
            : t('screens.group.remove_member_confirmation_generic')
        }
        variant="confirm"
        confirmButton={{
          text: t('common.yes'),
          variant: 'primary',
          onPress: handleRemoveMember,
          loading: removeMemberLoading,
        }}
        cancelButton={{
          text: t('common.no'),
          variant: 'outline',
        }}
      />
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
  topHeaderBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
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
  logoWrapper: {
    position: 'absolute',
    width: 100,
    height: 100,
    top: 150,
    left: '50%',
    marginLeft: -50,
    alignItems: 'center',
    zIndex: 10,
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
    zIndex: 2,
  },
  infoContainer: {
    paddingTop: rh(30),
    alignItems: 'center',
    gap: spacing.sm,
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
  readMoreText: {
    textAlign: 'center',
  },
  shortcutsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  shortcutButton: {
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm,
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
  eventsListContent: {
    paddingVertical: spacing.sm,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  membersBottomSheet: {},
  membersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  membersList: {
    flex: 1,
    paddingBottom: spacing.lg,
  },
  memberItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.secondary.light,
  },
  memberLeftContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.neutral.black,
    marginRight: spacing.sm,
  },
  memberInfo: {
    justifyContent: 'center',
  },
  memberRoleContainer: {
    width: 180,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.sm,
  },
  adminRole: {
    backgroundColor: colors.primary.light,
  },
  memberRole: {
    backgroundColor: colors.secondary.light,
  },
  memberRightContent: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  eventBannerInfoText: {
    color: colors.status.successDark,
    fontWeight: 'bold',
    fontSize: 14,
  },
  changeRoleContent: {
    gap: spacing.xl,
  },
  dialogButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
  },
  leaveGroupContainer: {
    padding: spacing.md,
    gap: spacing.xxxl,
  },
  leaveGroupContent: {
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  leaveGroupButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
    // paddingTop: spacing.lg,
    // paddingBottom: spacing.lg,
  },
  cancelButton: {
    flex: 1,
    marginRight: spacing.sm,
  },
  leaveGroupButton: {
    flex: 1,
    marginLeft: spacing.sm,
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
  memberAction: {
    width: spacing.xxl,
    height: spacing.xxl,
  },
});
