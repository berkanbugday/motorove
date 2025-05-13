import React, {useState, useCallback, useRef, useEffect} from 'react';
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  ImageSourcePropType,
  Animated,
  ActivityIndicator,
  Dimensions,
  FlatList,
} from 'react-native';
import {LegendList} from '@legendapp/list';
import {colors, commonStyles, getShadow, radius, spacing} from '@theme';
import {TopHeaderBar} from '@components/TopHeaderBar';
import {
  BodySmall,
  Caption,
  Subtitle,
  Title,
  Typography,
} from '@components/Typography';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {
  MainScreenNavigationProp,
  MainStackParamList,
} from '@navigation/types/navigationTypes';
import {useGetGroup} from '@services/group.service';
import {Icon, IconName} from '@components/Icon';
import {Chip} from '@components/Chip';
import {Button} from '@components/Button';
import {FeedCard} from '@components/FeedCard';
import {navigateToScreen} from '@navigation/utils/navigationHelpers';
import {DropdownMenuItem} from '@components/DropdownMenu';
import {loggingService} from '@services/logging.service';
import BottomSheet, {BottomSheetRef} from '@components/BottomSheet/BottomSheet';
import {toPascalCase} from '@utils/stringUtils';
import GroupEventBanner from '@components/GroupEventBanner/GroupEventBanner';
import {PageIndicator, showToast} from '@components';
import {useAuth} from '@contexts';
import {
  useAddGroupMember,
  useChangeMemberRole,
} from '@services/group-membership.service';
import Dialog, {DialogRef} from '@components/Dialog';
import Dropdown from '@components/Dropdown';
import {
  DropdownItem as EnumDropdownItem,
  useEnumGroupMemberRoles,
} from '@services/enum.service';
import {DropdownItem as ComponentDropdownItem} from '@components/Dropdown/types';

type GroupDetailScreenRouteProp = RouteProp<MainStackParamList, 'GroupDetail'>;

// Feed post interface
interface FeedPost {
  id: string;
  userName: string;
  avatarSource: ImageSourcePropType;
  timeAgo: string;
  content: string;
  images?: ImageSourcePropType[];
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

// Sample feed posts data for this group
const groupFeedPosts: FeedPost[] = [
  {
    id: '1',
    userName: 'Alex Johnson',
    avatarSource: {uri: 'https://picsum.photos/id/1005/100/100'},
    timeAgo: '2h ago',
    content:
      'Just completed an amazing group ride with the team! The roads were perfect today.',
    routeTitle: 'Mountain Pass Loop',
    likeCount: 24,
    commentCount: 5,
    isSaved: false,
    isLiked: true,
    isCommented: false,
    labels: [
      {icon: 'users', text: 'Group Ride'},
      {icon: 'map-pin', text: 'Blue Ridge Mountains'},
    ],
  },
  {
    id: '2',
    userName: 'Sarah Miller',
    avatarSource: {uri: 'https://picsum.photos/id/1027/100/100'},
    timeAgo: '5h ago',
    content:
      'Great meetup yesterday! Thanks to everyone who showed up for the maintenance workshop.',
    images: [{uri: 'https://picsum.photos/id/16/500/300'}],
    likeCount: 18,
    commentCount: 3,
    isSaved: true,
    isLiked: false,
    isCommented: true,
    labels: [{icon: 'users', text: 'Workshop'}],
  },
  {
    id: '3',
    userName: 'David Wilson',
    avatarSource: {uri: 'https://picsum.photos/id/1012/100/100'},
    timeAgo: 'Yesterday',
    content:
      "Who's joining the weekend ride? We'll be taking the coastal route!",
    images: [
      {uri: 'https://picsum.photos/id/10/500/300'},
      {uri: 'https://picsum.photos/id/11/500/300'},
    ],
    routeTitle: 'Coastal Weekend Ride',
    likeCount: 32,
    commentCount: 7,
    isSaved: false,
    isLiked: true,
    isCommented: false,
    labels: [
      {icon: 'clock', text: 'Upcoming Event'},
      {icon: 'map-pin', text: 'Pacific Coast'},
    ],
  },
  {
    id: '4',
    userName: 'Emma Roberts',
    avatarSource: {uri: 'https://picsum.photos/id/1014/100/100'},
    timeAgo: '2 days ago',
    content: "New bike day! Can't wait to ride with the group next weekend.",
    images: [{uri: 'https://picsum.photos/id/21/500/300'}],
    likeCount: 45,
    commentCount: 12,
    isSaved: true,
    isLiked: true,
    isCommented: false,
    labels: [{icon: 'wrench', text: 'New Bike'}],
  },
  {
    id: '5',
    userName: 'Michael Chen',
    avatarSource: {uri: 'https://picsum.photos/id/1025/100/100'},
    timeAgo: '3 days ago',
    content: 'Photos from our last group adventure. What an amazing day!',
    images: [
      {uri: 'https://picsum.photos/id/27/500/300'},
      {uri: 'https://picsum.photos/id/28/500/300'},
      {uri: 'https://picsum.photos/id/29/500/300'},
    ],
    likeCount: 37,
    commentCount: 8,
    isSaved: false,
    isLiked: false,
    isCommented: true,
    labels: [
      {icon: 'users', text: 'Group Adventure'},
      {icon: 'map-pin', text: 'Mountain Trails'},
    ],
  },
];

// Define event interface
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

// Member item component with its own animation
const MemberItem = React.memo(
  ({
    item,
    isAdmin,
    isMember,
    onChangeRole,
    onRemoveMember,
  }: {
    item: any;
    isAdmin?: boolean;
    isMember?: boolean;
    onChangeRole?: (member: any) => void;
    onRemoveMember?: (member: any) => void;
  }) => {
    // Animation state and refs for this specific row
    const [isActive, setIsActive] = useState(false);
    const actionAnimValue = useRef(new Animated.Value(-100)).current;
    const profileAnimValue = useRef(new Animated.Value(0)).current;

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
            <Chip
              variant="filled"
              color="primary"
              size="small"
              label={toPascalCase(item.role) || ''}
              style={styles.memberRole}
            />
          </View>
        </View>
        {isAdmin && (
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
              },
            ]}>
            <Button
              iconName="user-gear"
              iconSize={20}
              variant="secondary"
              shape="circle"
              onPress={() => onChangeRole && onChangeRole(item)}
            />
            <Button
              iconName="user-slash-filled"
              iconSize={20}
              variant="primary"
              shape="circle"
              onPress={() => onRemoveMember && onRemoveMember(item)}
            />
          </Animated.View>
        )}
        {isMember && (
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
              },
            ]}>
            <Button title="View Profile" variant="outline" shape="round" />
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
  const [posts, setPosts] = useState<FeedPost[]>(groupFeedPosts);
  const membersBottomSheetRef = useRef<BottomSheetRef>(null);
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const eventsListRef = useRef<FlatList>(null);
  const leaveGroupDialogRef = useRef<DialogRef>(null);
  const changeRoleDialogRef = useRef<DialogRef>(null);
  const removeMemberDialogRef = useRef<DialogRef>(null);

  // State for selected member and role
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [memberToRemove, setMemberToRemove] = useState<any>(null);
  const [selectedRole, setSelectedRole] = useState<EnumDropdownItem | null>(
    null,
  );

  // Get member roles from enum service
  const {memberRoles, loading: loadingRoles} = useEnumGroupMemberRoles();

  // Track which member row has actions visible
  const [activeMemberId, setActiveMemberId] = useState<string | null>(null);

  // Animation values at component level
  const memberActionsAnim = useRef(new Animated.Value(-100)).current;
  const viewProfileAnim = useRef(new Animated.Value(0)).current;

  // Create animated scroll value to track scroll position
  const scrollY = useRef(new Animated.Value(0)).current;

  // Create interpolated values for animations
  const headerHeight = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [150, 80],
    extrapolate: 'clamp',
  });

  const logoSize = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [100, 60],
    extrapolate: 'clamp',
  });

  const logoMarginTop = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [-50, -100],
    extrapolate: 'clamp',
  });

  // Use the useGetGroup hook to fetch the group data
  const {group, loading, refetch} = useGetGroup(groupId);

  // Fetch group members
  const members = group?.memberships || [];

  const {user} = useAuth();
  const [addGroupMember] = useAddGroupMember();
  const [changeMemberRole] = useChangeMemberRole();

  // Handle opening the change role dialog
  const handleOpenChangeRoleDialog = useCallback(
    (member: any) => {
      setSelectedMember(member);
      // Find the current role in the dropdown items
      const currentRole = memberRoles.find(
        role => role.value.toUpperCase() === member.role.toUpperCase(),
      );
      setSelectedRole(currentRole || null);
      changeRoleDialogRef.current?.open();
    },
    [memberRoles],
  );

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
      // TODO: Replace with actual API call to remove member
      loggingService.info(
        `Removing member ${memberToRemove.user.firstName} ${memberToRemove.user.lastName} from group ${groupId}`,
      );

      // Mock success for now
      showToast({
        text1: 'Success',
        text2: 'Member removed successfully',
        type: 'success',
      });

      // Close dialog and refresh data
      removeMemberDialogRef.current?.close();
      refetch && refetch();
    } catch (error) {
      loggingService.error('Error removing member', error);
      showToast({
        text1: 'Error',
        text2: 'Failed to remove member',
        type: 'error',
      });
    }
  }, [memberToRemove, groupId, refetch]);

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
        text1: 'Success',
        text2: 'Member role updated successfully',
        type: 'success',
      });

      // Close dialog and refresh data
      changeRoleDialogRef.current?.close();
      refetch && refetch();
    } catch (error) {
      loggingService.error('Error changing member role', error);
      showToast({
        text1: 'Error',
        text2: 'Failed to update member role',
        type: 'error',
      });
    }
  }, [selectedMember, selectedRole, groupId, changeMemberRole, refetch]);

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

  const renderDescription = () => {
    const description = group?.description || 'No description available';

    if (!description || description === 'No description available') {
      return <BodySmall style={styles.description}>{description}</BodySmall>;
    }

    if (isDescriptionExpanded) {
      return (
        <TouchableOpacity onPress={toggleDescription}>
          <BodySmall style={styles.description}>{description}</BodySmall>
          <BodySmall align="center" weight="bold" color={colors.neutral.black}>
            Show less
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
            Read more
          </BodySmall>
        )}
      </TouchableOpacity>
    );
  };

  // Handle like press with state update
  const handleLikePress = useCallback((postId: string) => {
    setPosts(currentPosts =>
      currentPosts.map(post =>
        post.id === postId ? {...post, isLiked: !post.isLiked} : post,
      ),
    );
  }, []);

  // Handle comment press
  const handleCommentPress = useCallback((postId: string) => {
    console.log(`Comment pressed for post: ${postId}`);
  }, []);

  // Handle save press with state update
  const handleSavePress = useCallback((postId: string) => {
    setPosts(currentPosts =>
      currentPosts.map(post =>
        post.id === postId ? {...post, isSaved: !post.isSaved} : post,
      ),
    );
  }, []);

  // Create dropdown menu items for the group detail screen
  const groupDropdownMenuItems = useCallback(
    (isAdmin?: boolean, isMember?: boolean): DropdownMenuItem[] => {
      const items: DropdownMenuItem[] = [];

      if (isAdmin) {
        items.push({
          id: 'edit_group',
          label: 'Edit Group',
          icon: 'pen-filled',
        });
      }

      if (isMember) {
        items.push({id: 'members', label: 'Members', icon: 'users-filled'});
        items.push({
          id: 'leave_group',
          label: 'Leave Group',
          icon: 'users-slash-filled',
          isHighlighted: true,
        });
      } else {
        items.push({
          id: 'join_group',
          label: 'Join Group',
          icon: 'user-plus-filled',
        });
      }

      return items;
    },
    [],
  );

  const handleJoinGroup = useCallback(async () => {
    if (
      group?.membersCapacity &&
      group?.memberships?.length >= group?.membersCapacity
    ) {
      loggingService.info(`Group: ${groupId} is full. Cannot join.`);
      showToast({
        text1: 'Warning',
        text2: 'Group is full. Cannot join.',
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
              if (group?.privacy === 'PUBLIC') {
                loggingService.info(`Successfully joined group: ${groupId}`);
                showToast({
                  text1: 'Success',
                  text2: 'You have successfully joined the group!',
                  type: 'success',
                });
              } else {
                loggingService.info(
                  `Successfully requested to join group: ${groupId}`,
                );
                showToast({
                  text1: 'Success',
                  text2: 'Request sent. Please wait for approval.',
                  type: 'success',
                });
              }
              // Refresh the group data
              refetch && refetch();
            },
            onError: error => {
              loggingService.error(`Error joining group: ${groupId}`, error);
              showToast({
                text1: 'Error',
                text2: 'Failed to join the group. Please try again.',
                type: 'error',
              });
            },
          });
        } else {
          loggingService.error('Cannot join group: User not authenticated');
          showToast({
            text1: 'Error',
            text2: 'You must be logged in to join a group.',
            type: 'error',
          });
        }
      } catch (error) {
        loggingService.error(`Error joining group: ${groupId}`, error);
        showToast({
          text1: 'Error',
          text2: 'Failed to join the group. Please try again.',
          type: 'error',
        });
      }
    }
  }, [
    addGroupMember,
    groupId,
    group?.membersCapacity,
    group?.memberships,
    group?.privacy,
    refetch,
    user?.id,
  ]);

  const confirmLeaveGroup = useCallback(async () => {
    try {
      loggingService.info(`Leaving group: ${groupId}`);
      // TODO: Implement the actual API call to leave the group
      showToast({
        text1: 'Success',
        text2: 'You have left the group successfully',
        type: 'success',
      });
      // Refresh group data after leaving
      refetch && refetch();
      // Navigate back if needed
      navigation.goBack();
    } catch (error) {
      loggingService.error(`Error leaving group: ${groupId}`, error);
      showToast({
        text1: 'Error',
        text2: 'Failed to leave the group. Please try again.',
        type: 'error',
      });
    }
  }, [groupId, refetch, navigation]);

  // Handle dropdown item select
  const handleDropdownMenuItemSelect = useCallback((item: DropdownMenuItem) => {
    switch (item.id) {
      case 'edit_group':
        navigateToScreen(navigation, 'EditGroup', {groupId});
        break;
      case 'members':
        membersBottomSheetRef.current?.open('full');
        break;
      case 'leave_group':
        leaveGroupDialogRef.current?.open();
        break;
      case 'join_group':
        handleJoinGroup();
        break;
      default:
        loggingService.info(
          `Unhandled action: ${item.id} for group: ${groupId}`,
        );
    }
  }, []);

  // Handle role selection in dropdown
  const handleRoleSelect = useCallback((item: ComponentDropdownItem | null) => {
    // Convert the component dropdown item to our enum dropdown item type
    if (item) {
      const enumItem: EnumDropdownItem = {
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

  // Render feed post
  const renderFeedPost = useCallback(
    ({item}: {item: FeedPost}) => {
      return (
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
          onLikePress={() => handleLikePress(item.id)}
          onCommentPress={() => handleCommentPress(item.id)}
          onSavePress={() => handleSavePress(item.id)}
          style={styles.feedCard}
        />
      );
    },
    [handleLikePress, handleCommentPress, handleSavePress],
  );

  // Feed keyExtractor
  const feedKeyExtractor = useCallback((item: FeedPost) => item.id, []);

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
    ({item}: {item: any}) => (
      <MemberItem
        item={item}
        isAdmin={group?.isAdmin}
        isMember={group?.isMember}
        onChangeRole={handleOpenChangeRoleDialog}
        onRemoveMember={handleOpenRemoveMemberDialog}
      />
    ),
    [
      group?.isAdmin,
      group?.isMember,
      handleOpenChangeRoleDialog,
      handleOpenRemoveMemberDialog,
    ],
  );

  return (
    <View style={styles.container}>
      <TopHeaderBar
        showBackButton
        backgroundColor="transparent"
        onBackPress={handleGoBack}
        containerStyle={styles.topHeaderBar}
        dropdownMenuItems={groupDropdownMenuItems(
          group?.isAdmin,
          group?.isMember,
        )}
        onDropdownItemSelect={item => handleDropdownMenuItemSelect(item)}
      />

      {loading ? (
        <View style={[styles.container, styles.centerContent]}>
          <ActivityIndicator size="large" color={colors.primary.main} />
        </View>
      ) : (
        <>
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
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            scrollEventThrottle={16} // Ensures smooth scrolling
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
                  members
                </Typography>
                <View style={styles.dot} />
                <View style={styles.lockContainer}>
                  <Icon
                    name={
                      group?.privacy === 'PUBLIC'
                        ? 'lock-open-filled'
                        : 'lock-filled'
                    }
                    size={18}
                  />
                  <Typography style={styles.infoText}>
                    {toPascalCase(group?.privacy || '')} Group
                  </Typography>
                </View>
              </View>

              <View style={styles.infoRow}>
                <Icon name="map-pin" size={18} />
                <Typography style={styles.infoText}>
                  {group?.city.value || 'No location'}
                </Typography>
              </View>

              <View style={styles.tagsContainer}>
                {group?.tags?.map((tag, index) => (
                  <Chip
                    variant="outlined"
                    color="dark"
                    size="small"
                    key={index}
                    label={tag.value}
                  />
                ))}
              </View>

              <View style={styles.descriptionContainer}>
                {renderDescription()}
              </View>
            </View>
            <View style={styles.shortcutsContainer}>
              {group?.isMember && (
                <Button
                  iconPosition="top"
                  iconName="plus"
                  iconSize={24}
                  variant="outline"
                  title="Create Post"
                />
              )}
              {group?.isAdmin && (
                <Button
                  iconPosition="top"
                  iconName="route"
                  iconSize={24}
                  variant="dark"
                  title="Create Event"
                />
              )}
            </View>

            {group?.isMember && (
              <>
                {/* Upcoming Group Events Section */}
                <View style={styles.content}>
                  <View style={styles.sectionHeaderContainer}>
                    <Subtitle weight="bold">Upcoming Group Events</Subtitle>
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
                  <Subtitle weight="bold">Recent Posts</Subtitle>
                  <LegendList
                    data={posts}
                    renderItem={renderFeedPost}
                    keyExtractor={feedKeyExtractor}
                    scrollEnabled={false}
                    contentContainerStyle={styles.feedList}
                    recycleItems={true} // Enable component recycling for better performance
                    maintainVisibleContentPosition={true} // Maintain the visible position when data changes
                  />
                </View>
              </>
            )}
          </Animated.ScrollView>

          <BottomSheet
            ref={membersBottomSheetRef}
            containerStyle={styles.membersBottomSheet}
            closeOnBackdropPress={true}
            initialSnap="closed">
            <View style={styles.membersHeader}>
              <View>
                <Subtitle>Members</Subtitle>
                <Caption color={colors.neutral.grey}>
                  {members.length} people
                </Caption>
              </View>
              <Button
                iconName="user-plus-filled"
                iconSize={20}
                variant="dark"
                shape="circle"
              />
            </View>
            {loading ? (
              <ActivityIndicator size="large" color={colors.primary.main} />
            ) : (
              <LegendList
                data={members}
                renderItem={renderMemberItem}
                keyExtractor={(item: any) => item.id}
                contentContainerStyle={styles.membersList}
                showsVerticalScrollIndicator={false}
                recycleItems={true}
                maintainVisibleContentPosition={true}
              />
            )}
          </BottomSheet>

          <Dialog
            ref={leaveGroupDialogRef}
            title="Leave Group"
            message={`Are you sure you want to leave "${group?.name}"?`}
            variant="confirm"
            confirmButton={{
              text: 'Leave',
              variant: 'primary',
              onPress: confirmLeaveGroup,
            }}
            cancelButton={{
              text: 'Cancel',
              variant: 'outline',
            }}
          />

          <Dialog
            ref={changeRoleDialogRef}
            title="Change Member Role"
            variant="custom">
            {selectedMember && (
              <View style={styles.changeRoleContent}>
                <Subtitle weight="bold" align="center">
                  {selectedMember.user.firstName} {selectedMember.user.lastName}
                </Subtitle>

                {loadingRoles ? (
                  <ActivityIndicator size="small" color={colors.primary.main} />
                ) : (
                  <Dropdown
                    label="Select Role"
                    data={memberRoles as ComponentDropdownItem[]}
                    selectedItem={selectedRole as ComponentDropdownItem}
                    onSelect={handleRoleSelect}
                    searchable={false}
                  />
                )}

                <View style={styles.dialogButtonsContainer}>
                  <Button
                    title="Cancel"
                    variant="outline"
                    shape="round"
                    onPress={() => changeRoleDialogRef.current?.close()}
                  />
                  <Button
                    title="Change"
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
            title="Remove Member"
            message={
              memberToRemove
                ? `Are you sure you want to remove ${memberToRemove.user.firstName} ${memberToRemove.user.lastName} from the group?`
                : 'Are you sure you want to remove this member?'
            }
            variant="confirm"
            confirmButton={{
              text: 'Remove',
              variant: 'primary',
              onPress: handleRemoveMember,
            }}
            cancelButton={{
              text: 'Cancel',
              variant: 'outline',
            }}
          />
        </>
      )}
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
  topHeaderBar: {
    borderBottomRightRadius: 0,
    borderBottomLeftRadius: 0,
    zIndex: 5,
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
    backgroundColor: 'rgba(0, 0, 0, 0.3)', // Semi-transparent overlay
  },
  logoWrapper: {
    position: 'absolute',
    width: 100,
    height: 100,
    top: 150, // Position from top
    left: '50%', // Center horizontally
    marginLeft: -50, // Offset by half the width
    alignItems: 'center',
    zIndex: 10, // Higher zIndex to ensure it's above other elements
    ...getShadow('medium'),
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: radius.round,
    backgroundColor: colors.neutral.white, // Add background color to ensure opacity
  },
  scrollView: {
    flex: 1,
    paddingTop: 125,
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
    justifyContent: 'space-evenly',
    marginTop: spacing.md,
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
  membersBottomSheet: {
    paddingHorizontal: spacing.xs,
  },
  membersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.secondary.main,
    paddingBottom: spacing.md,
  },
  membersList: {
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
  memberRole: {
    backgroundColor: colors.primary.light,
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
});
