import React, {useState, useCallback, useRef, useEffect} from 'react';
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
import {colors, commonStyles, getShadow, radius, rh, spacing} from '@theme';
import {
  useNavigation,
  useRoute,
  RouteProp,
  useFocusEffect,
} from '@react-navigation/native';
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
  GroupEventBanner,
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
  Language,
  IAddress,
  GroupMemberRole,
  GroupPrivacy,
} from '@motorove/shared';
import {relativeTime} from '@utils/dateUtils';
import {useAuth} from '@contexts';
import {
  useAddGroupMember,
  useChangeMemberRole,
  useRemoveGroupMember,
  useLeaveGroup,
} from '@services/group-membership.service';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {AuthUser} from '@app-types/auth.types';
import {useTranslation} from '@hooks/useTranslation';
import {EnumUtils} from '@utils/enumUtils';
type GroupDetailScreenRouteProp = RouteProp<MainStackParamList, 'GroupDetail'>;

const formatAvatarSource = (imageUrl?: string) => {
  return imageUrl
    ? {uri: imageUrl}
    : require('@assets/images/default_avatar.png');
};

const transformPostToFeedCard = (post: IPost) => {
  const labels = [];

  if (post.addresses && post.addresses.length > 0) {
    const addressText = post.addresses?.find(
      (address: IAddress) => address.language === Language.EN,
    )?.address;
    if (addressText) {
      labels.push({
        icon: 'map-pin' as IconName,
        text: addressText,
      });
    }
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
    timeAgo: relativeTime(post.createdAt),
    content: post.content,
    images,
    likeCount: post.likesCount,
    commentCount: post.commentsCount,
    isSaved: post.isSaved,
    isLiked: post.isLiked,
    isCommented: false, // This might not be available in the API
    labels,
  };
};

interface EventItem {
  id: string;
  day: string;
  month: string;
  time: string;
  title: string;
  infoText?: string;
  location: string;
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
    infoText: "You're Going",
    location: 'Istanbul',
    participantCount: 10,
    membersCapacity: 34,
  },
  {
    id: '2',
    day: '22',
    month: 'JUN',
    time: '09:30',
    title: 'Mountain Pass Challenge',
    location: 'Mountainside Trail',
    participantCount: 16,
    membersCapacity: 40,
  },
  {
    id: '3',
    day: '28',
    month: 'JUN',
    time: '14:00',
    title: 'Evening City Tour',
    location: 'City Park',
    participantCount: 8,
    membersCapacity: 25,
  },
];

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
          <Image source={{uri: item.user.avatar}} style={styles.memberAvatar} />
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
              size="small"
              onPress={() => onChangeRole && onChangeRole(item)}
            />
            <Button
              iconName="user-slash-filled"
              iconSize={24}
              variant="primary"
              shape="circle"
              size="small"
              onPress={() => onRemoveMember && onRemoveMember(item)}
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
              title="View Profile"
              variant="outline"
              shape="round"
              size="small"
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
export const GroupDetailScreen = () => {
  const navigation = useNavigation<MainScreenNavigationProp<'GroupDetail'>>();
  const route = useRoute<GroupDetailScreenRouteProp>();
  const {groupId} = route.params;
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const membersBottomSheetRef = useRef<BottomSheetRef>(null);
  const leaveGroupBottomSheetRef = useRef<BottomSheetRef>(null);
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const eventsListRef = useRef<FlatList>(null);
  const changeRoleDialogRef = useRef<DialogRef>(null);
  const removeMemberDialogRef = useRef<DialogRef>(null);
  const insets = useSafeAreaInsets();
  const {t} = useTranslation();
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

  // Create interpolated values for animations
  const headerHeight = scrollY.interpolate({
    inputRange: [0, 100 + insets.top],
    outputRange: [150 + insets.top, 50 + insets.top],
    extrapolate: 'clamp',
  });

  const logoSize = scrollY.interpolate({
    inputRange: [0, 100 + insets.top],
    outputRange: [100, 60],
    extrapolate: 'clamp',
  });

  const logoMarginTop = scrollY.interpolate({
    inputRange: [0, 100 + insets.top],
    outputRange: [-50 + insets.top, -130 + insets.top],
    extrapolate: 'clamp',
  });

  // Use the useGetGroup hook to fetch the group data
  const {group, loading, refetch: refetchGroup} = useGetGroup(groupId);

  // Use the useGetPosts hook to fetch posts for this group
  const {
    posts,
    loading: postsLoading,
    refetch: refetchPosts,
  } = useGetPosts(groupId);

  // Handle pull-to-refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetchGroup?.();
      await refetchPosts?.();
    } finally {
      setRefreshing(false);
    }
  }, [refetchGroup, refetchPosts]);

  // Fetch group members
  const members = group?.memberships || [];

  const {user} = useAuth();
  const [addGroupMember] = useAddGroupMember();
  const [changeMemberRole] = useChangeMemberRole();
  const [removeGroupMember] = useRemoveGroupMember();
  const {leaveGroup} = useLeaveGroup();

  // Post interaction hooks
  const {likePost} = useLikePost();
  const {unlikePost} = useUnlikePost();
  const {savePost} = useSavePost();
  const {unsavePost} = useUnsavePost();
  const {removePost} = useRemovePost();

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
      await removeGroupMember({
        variables: {
          input: {
            groupId: groupId,
            userId: memberToRemove.user.id,
          },
        },
      });
      loggingService.info(
        `Removing member ${memberToRemove.user.firstName} ${memberToRemove.user.lastName} from group ${groupId}`,
      );

      // Mock success for now
      showToast({
        text1: t('common.success'),
        text2: t('screens.group.remove_member'),
        type: 'success',
      });

      // Close dialog and refresh data
      removeMemberDialogRef.current?.close();
      refetchGroup && refetchGroup();
    } catch (error) {
      loggingService.error('Error removing member', error);
      showToast({
        text1: t('common.error'),
        text2: t('errors.general.something_wrong'),
        type: 'error',
      });
    }
  }, [memberToRemove, groupId, refetchGroup, removeGroupMember, t]);

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
      if (
        selectedMember.role.toUpperCase() === selectedRole.value.toUpperCase()
      ) {
        changeRoleDialogRef.current?.close();
        return;
      } else {
        await changeMemberRole({
          variables: {
            input: {
              groupId: groupId,
              userId: selectedMember.user.id,
              role: selectedRole.value,
            },
          },
        });
      }
      loggingService.info(
        `Changing role for ${selectedMember.user.firstName} ${selectedMember.user.lastName} to ${selectedRole.value}`,
      );

      // Mock success for now
      showToast({
        text1: t('common.success'),
        text2: t('screens.group.member_role_updated'),
        type: 'success',
      });

      // Close dialog and refresh data
      changeRoleDialogRef.current?.close();
      refetchGroup && refetchGroup();
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

  const handleGoBack = () => {
    navigation.goBack();
  };

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
  useFocusEffect(
    useCallback(() => {
      // Always refetch group if refetch function is available
      if (refetchGroup) {
        loggingService.info('GroupDetailScreen: Refetching group on focus');
        refetchGroup();
      }
    }, [refetchGroup]),
  );

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
            {t('screens.group.show_less')}
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
            {t('screens.group.read_more')}
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
      navigateToScreen(navigation, 'Comment', {postId});
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
      } else {
        items.push({
          id: 'report',
          label: t('screens.post.report_post'),
          icon: 'error',
          isHighlighted: true,
        });
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
          // For now, just call the remove function directly
          removePost(postId);
          break;
        default:
          loggingService.info(
            `Unhandled action: ${item.id} for post: ${postId}`,
          );
      }
    },
    [navigation, removePost],
  );

  // Create dropdown menu items for the group detail screen
  const groupDropdownMenuItems = useCallback(
    (isAdmin?: boolean, isMember?: boolean): DropdownMenuItem[] => {
      const items: DropdownMenuItem[] = [];

      if (isAdmin) {
        items.push({
          id: 'edit_group',
          label: t('screens.group.edit_group'),
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
          label: t('screens.group.leave_group'),
          icon: 'users-slash-filled',
          isHighlighted: true,
        });
      } else {
        items.push({
          id: 'join_group',
          label: t('screens.group.join_group'),
          icon: 'user-plus-filled',
        });
      }

      return items;
    },
    [t],
  );

  const handleJoinGroup = useCallback(
    async (_group: IGroup) => {
      if (
        _group?.membersCapacity &&
        _group?.memberships?.length >= _group?.membersCapacity
      ) {
        loggingService.info(`Group: ${groupId} is full. Cannot join.`);
        showToast({
          text1: t('common.error'),
          text2: t('screens.group.group_full'),
          type: 'warning',
        });
        return;
      } else {
        try {
          if (user && user.id) {
            await addGroupMember({
              variables: {
                input: {
                  groupId: groupId,
                  userId: user.id,
                },
              },
              onCompleted: () => {
                if (_group?.privacy === 'PUBLIC') {
                  loggingService.info(`Successfully joined group: ${groupId}`);
                  showToast({
                    text1: t('common.success'),
                    text2: t('screens.group.join_success'),
                    type: 'success',
                  });
                } else {
                  loggingService.info(
                    `Successfully requested to join group: ${groupId}`,
                  );
                  showToast({
                    text1: t('common.success'),
                    text2: t('screens.group.join_request_sent'),
                    type: 'success',
                  });
                }
                // Refresh the group data
                refetchGroup && refetchGroup();
              },
              onError: error => {
                loggingService.error(`Error joining group: ${groupId}`, error);
              },
            });
          } else {
            loggingService.error('Cannot join group: User not authenticated');
            showToast({
              text1: t('common.error'),
              text2: t('errors.auth.unauthorized'),
              type: 'error',
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
      addGroupMember,
      groupId,
      group?.membersCapacity,
      group?.memberships,
      group?.privacy,
      refetchGroup,
      user?.id,
      t,
    ],
  );

  const confirmLeaveGroup = useCallback(async () => {
    try {
      loggingService.info(`Leaving group: ${groupId}`);

      await leaveGroup(groupId);

      // Close the bottom sheet
      leaveGroupBottomSheetRef.current?.close();

      // Navigate back since user is no longer a member
      navigation.goBack();
    } catch (error) {
      loggingService.error(`Error leaving group: ${groupId}`, error);
      // Error handling is already done in the service hook
    }
  }, [groupId, leaveGroup, navigation]);

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
          leaveGroupBottomSheetRef.current?.open('minimal');
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
      const enumItem: DropdownItem = {
        id:
          typeof item.id === 'string'
            ? parseInt(item.id, 10)
            : (item.id as number),
        label: item.label,
        value: item.value,
      };
      setSelectedRole(enumItem);
    } else {
      setSelectedRole(null);
    }
  }, []);

  // Render feed post with comment navigation and dropdown menu (matching HomeScreen)
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
          onDropdownSelect={menuItem =>
            handlePostDropdownSelect(menuItem, item.id)
          }
          onLikePress={() => handleLikePress(item.id, item.isLiked)}
          onCommentPress={() => handleCommentPress(item.id)}
          onSavePress={() => handleSavePress(item.id, item.isSaved)}
          style={styles.feedCard}
        />
      );
    },
    [
      user,
      transformPostToFeedCard,
      createPostDropdownItems,
      handlePostDropdownSelect,
      handleLikePress,
      handleCommentPress,
      handleSavePress,
    ],
  );

  // Feed keyExtractor
  const feedKeyExtractor = useCallback((item: IPost) => item.id, []);

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
        // infoText={item.infoText}
        badgeText={item.infoText}
        infoTextStyle={styles.eventBannerInfoText}
        location={item.location}
        participantCount={item.participantCount}
        membersCapacity={item.membersCapacity}
        onChatPress={() =>
          loggingService.info(`Chat pressed for event: ${item.title}`)
        }
        style={styles.eventBanner}
      />
    ),
    [],
  );

  // Event keyExtractor
  const eventKeyExtractor = useCallback((item: EventItem) => item.id, []);

  // Now just a simple render function that uses the MemberItem component
  const renderMemberItem = useCallback(
    ({item}: {item: any}) => {
      if (!user) {
        return null;
      }

      return (
        <MemberItem
          item={item}
          isAdmin={group?.isAdmin}
          isMember={group?.isMember}
          user={user}
          onChangeRole={handleOpenChangeRoleDialog}
          onRemoveMember={handleOpenRemoveMemberDialog}
        />
      );
    },
    [
      group?.isAdmin,
      group?.isMember,
      user,
      handleOpenChangeRoleDialog,
      handleOpenRemoveMemberDialog,
    ],
  );

  // Show loading while fetching initial data
  if (loading) {
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
        onBackPress={handleGoBack}
        dropdownMenuItems={groupDropdownMenuItems(
          group?.isAdmin,
          group?.isMember,
        )}
        onDropdownItemSelect={item =>
          handleDropdownMenuItemSelect(item, group as IGroup)
        }
      />
      <Animated.View
        style={[
          styles.imageContainer,
          {
            height: headerHeight,
          },
        ]}>
        <Image
          source={{uri: group?.cover || ''}}
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
        style={[styles.scrollView, {paddingTop: rh(110) + insets.top}]}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16} // Ensures smooth scrolling
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            progressViewOffset={rh(110) + insets.top} // Offset to account for the header
          />
        }
        onScroll={Animated.event(
          [{nativeEvent: {contentOffset: {y: scrollY}}}],
          {useNativeDriver: false},
        )}>
        <View style={styles.infoContainer}>
          <Title align="center">{group?.name}</Title>

          <View style={styles.infoRow}>
            <Icon name="users-filled" size={18} />
            <Typography style={styles.infoText}>
              {group?.memberships?.length || 0}
              {group?.membersCapacity
                ? ` / ${group?.membersCapacity}`
                : ''}{' '}
              {t('screens.group.member')}
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
            <Icon name="map-pin" size={18} />
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

        {group?.isMember && (
          <>
            {/* Upcoming Group Events Section */}
            <View style={styles.content}>
              <View style={styles.sectionHeaderContainer}>
                <Title weight="bold">
                  {t('screens.group.upcoming_events')}
                </Title>
              </View>
              <FlatList
                ref={eventsListRef}
                data={upcomingEvents}
                renderItem={renderEventBanner}
                keyExtractor={eventKeyExtractor}
                horizontal
                showsHorizontalScrollIndicator={false}
                snapToInterval={Dimensions.get('window').width - spacing.xl}
                decelerationRate="fast"
                onScroll={handleEventScroll}
                scrollEventThrottle={16}
                onScrollToIndexFailed={handleScrollToIndexFailed}
                contentContainerStyle={styles.eventsListContent}
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

            {/* Recent Posts Section */}
            <View style={styles.content}>
              <Title weight="bold">{t('screens.group.recent_posts')}</Title>
              {postsLoading ? (
                <View style={styles.postsLoadingContainer}>
                  <ActivityIndicator size="large" />
                </View>
              ) : posts.length > 0 ? (
                <FlatList
                  data={posts}
                  renderItem={renderFeedPost}
                  keyExtractor={feedKeyExtractor}
                  scrollEnabled={false}
                  contentContainerStyle={styles.feedList}
                />
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
        {loading ? (
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
        closeOnBackdropPress={false}
        initialSnap="closed"
        showCloseButton={true}
        enableGestureControl={false}
        closeButtonPosition="top-left"
        header={
          <Subtitle align="center">{t('screens.group.leave_group')}</Subtitle>
        }>
        <View style={styles.leaveGroupContainer}>
          <View style={styles.leaveGroupContent}>
            <BodySmall align="center">
              {t('screens.group.leave_group_confirmation').replace(
                '{0}',
                group?.name || '',
              )}
            </BodySmall>
          </View>
          <View style={styles.leaveGroupButtonsContainer}>
            <Button
              title={t('common.cancel')}
              variant="outline"
              shape="round"
              onPress={() => leaveGroupBottomSheetRef.current?.close()}
              style={styles.cancelButton}
            />
            <Button
              title={t('screens.group.leave_group')}
              variant="primary"
              shape="round"
              onPress={confirmLeaveGroup}
              style={styles.leaveGroupButton}
            />
          </View>
        </View>
      </BottomSheet>

      <Dialog
        ref={changeRoleDialogRef}
        title={t('screens.group.change_role')}
        variant="custom">
        {selectedMember && (
          <View style={styles.changeRoleContent}>
            <Subtitle weight="bold" align="center">
              {selectedMember.user.firstName} {selectedMember.user.lastName}
            </Subtitle>

            {loading ? (
              <ActivityIndicator size="small" />
            ) : (
              <Dropdown
                label={t('screens.group.select_role')}
                data={members as unknown as DropdownItem[]}
                selectedItem={selectedMember as DropdownItem}
                onSelect={handleRoleSelect}
              />
            )}

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
                name: `${memberToRemove.user.firstName} ${memberToRemove.user.lastName}`,
              })
            : t('screens.group.remove_member_generic')
        }
        variant="confirm"
        confirmButton={{
          text: t('screens.group.remove'),
          variant: 'primary',
          onPress: handleRemoveMember,
        }}
        cancelButton={{
          text: t('common.cancel'),
          variant: 'outline',
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...commonStyles.container,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 150,
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
    borderRadius: radius.round,
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
  changeRoleMemberName: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  dialogButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  leaveGroupContent: {
    flex: 1,
  },
  leaveGroupContainer: {
    flex: 1,
  },
  leaveGroupButtonsContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.secondary.main,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  cancelButton: {
    // flex: 1,
    marginRight: spacing.sm,
  },
  leaveGroupButton: {
    // flex: 1,
    marginLeft: spacing.sm,
    flexWrap: 'nowrap',
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
