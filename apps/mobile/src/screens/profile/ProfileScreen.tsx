import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {useAuth} from '@contexts';
import {colors, commonStyles, getShadow, radius, spacing} from '@theme';
import {useTranslation} from 'react-i18next';
import {openSocialMediaUrl, getSocialMediaIcon} from '@utils/socialMediaUtils';
import {
  Icon,
  Chip,
  TopHeaderBar,
  BodySmall,
  Title,
  Tabs,
  Body,
  ProfileSkeleton,
  ImagePreviewModal,
  ProfileCompletionWidget,
  Button,
  IconName,
  FeedCard,
  GroupCard,
} from '@components';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useGetUserProfile, useGetUserStats} from '@services/user.service';
import {useGetPosts} from '@services/post.service';
import {useGetJoinedGroups} from '@services/group.service';
import {useFollowUser, useUnfollowUser} from '@services/user-following.service';
import {IGroup, SocialMediaPlatform, ApprovalStatus} from '@motorove/shared';
import {navigateToScreen} from '@navigation/utils/navigationHelpers';
import {
  MainScreenNavigationProp,
  MainScreenRouteProp,
} from '@navigation/types/navigationTypes';
import {FlashList} from '@shopify/flash-list';
import {EnumUtils} from '@utils/enumUtils';

// Define the tabs for the profile content
type ProfileTab = 'posts' | 'groups';

/**
 * Profile Screen - Shows user profile and account management
 */
export const ProfileScreen = () => {
  const {user} = useAuth();
  const {t} = useTranslation();
  const navigation = useNavigation<MainScreenNavigationProp<'Profile'>>();
  const route = useRoute<MainScreenRouteProp<'Profile'>>();

  // Get userId from route params, fallback to current user
  const profileUserId = route.params?.userId || '';
  const isOwnProfile = profileUserId === user?.id;
  const [activeTab, setActiveTab] = useState<ProfileTab>('posts');
  const [imagePreviewVisible, setImagePreviewVisible] = useState(false);
  const [showCompletionWidgetState, setShowCompletionWidgetState] =
    useState(true);
  const [bioExpanded, setBioExpanded] = useState(false);

  // Fetch real user data
  const {
    profile,
    loading: profileLoading,
    refetch: refetchProfile,
  } = useGetUserProfile(profileUserId);

  const {stats, loading: statsLoading} = useGetUserStats(profileUserId);

  // Only fetch posts and groups when viewing other users' profiles
  // or when the respective tab is active for own profile
  const shouldFetchPosts = !isOwnProfile && activeTab === 'posts';
  const shouldFetchGroups = !isOwnProfile && activeTab === 'groups';

  // Fetch user's posts (only when needed)
  const {
    posts,
    loading: postsLoading,
    loadMore: loadMorePosts,
    hasMore: hasMorePosts,
  } = useGetPosts(
    undefined,
    profileUserId,
    undefined,
    20,
    0,
    !shouldFetchPosts, // Skip query if not needed
  );

  // Fetch user's joined groups (only when needed)
  const {
    groups,
    loading: groupsLoading,
    loadMore: loadMoreGroups,
    hasMore: hasMoreGroups,
  } = useGetJoinedGroups(20, 0, profileUserId, !shouldFetchGroups);

  // Follow/unfollow hooks
  const {followUser, loading: followLoading} = useFollowUser(() =>
    refetchProfile(),
  );
  const {unfollowUser, loading: unfollowLoading} = useUnfollowUser(() =>
    refetchProfile(),
  );

  const loading = profileLoading || statsLoading;
  const followActionLoading = followLoading || unfollowLoading;

  // Calculate profile completion
  const calculateProfileCompletion = () => {
    if (!profile) {
      return {
        completionPercentage: 0,
        missingFields: [],
        hasBio: false,
        hasRidingStyles: false,
        hasInterests: false,
        hasSocialMedia: false,
      };
    }

    const missingFields: string[] = [];
    let completedFields = 0;
    const totalFields = 4; // bio, city, riding styles, interests, social media

    const hasBio = !!profile.bio;
    const hasRidingStyles =
      !!profile.ridingStyles && profile.ridingStyles.length > 0;
    const hasInterests = !!profile?.interests && profile.interests.length > 0;
    const hasSocialMedia =
      !!profile.socialMediaProfiles && profile.socialMediaProfiles.length > 0;

    if (hasBio) {
      completedFields++;
    } else {
      missingFields.push(t('screens.editProfile.bio'));
    }

    if (hasRidingStyles) {
      completedFields++;
    } else {
      missingFields.push(t('screens.editProfile.riding_styles'));
    }

    if (hasInterests) {
      completedFields++;
    } else {
      missingFields.push(t('screens.editProfile.interests'));
    }

    if (hasSocialMedia) {
      completedFields++;
    } else {
      missingFields.push(t('screens.editProfile.social_media'));
    }

    const completionPercentage = Math.round(
      (completedFields / totalFields) * 100,
    );

    return {
      completionPercentage,
      missingFields,
      hasBio,
      hasRidingStyles,
      hasInterests,
      hasSocialMedia,
    };
  };

  const profileCompletion = calculateProfileCompletion();
  const showCompletionWidget =
    isOwnProfile &&
    profileCompletion.completionPercentage < 75 &&
    showCompletionWidgetState;

  const handleSocialMediaPress = async (
    platform: SocialMediaPlatform,
    username: string,
  ) => {
    await openSocialMediaUrl(platform, username);
  };

  // Get all social media platforms with their status
  const getAllSocialMediaPlatforms = () => {
    const allPlatforms = Object.values(SocialMediaPlatform);
    return allPlatforms.map(platform => {
      const existingAccount = profile?.socialMediaProfiles?.find(
        s => s.platform === platform,
      );
      return {
        platform,
        username: existingAccount?.username,
        exists: !!existingAccount,
      };
    });
  };

  const handleAvatarPress = () => {
    if (profile?.avatar) {
      if (showCompletionWidget) {
        setShowCompletionWidgetState(false);
      }

      setImagePreviewVisible(true);
    }
  };

  const handleCloseImagePreview = () => {
    setImagePreviewVisible(false);
    const completionWidgetVisible =
      isOwnProfile &&
      profileCompletion.completionPercentage < 75 &&
      !showCompletionWidgetState;
    setShowCompletionWidgetState(completionWidgetVisible);
  };

  const handleCloseCompletionWidget = () => {
    setShowCompletionWidgetState(false);
  };

  const toggleBioExpanded = () => {
    setBioExpanded(!bioExpanded);
  };

  const getBioText = () => {
    if (!profile?.bio) {
      return '';
    }
    const maxLength = 100;
    if (profile.bio.length <= maxLength || bioExpanded) {
      return profile.bio;
    }
    return profile.bio.substring(0, maxLength) + '...';
  };

  const shouldShowReadMore = () => {
    return profile?.bio && profile.bio.length > 100;
  };

  const handleGroupPress = (group: IGroup) => {
    navigateToScreen(navigation, 'GroupDetail', {groupId: group.id});
  };

  const handleFollowToggle = async () => {
    if (!profile || followActionLoading) {
      return;
    }

    // If already following (ACCEPTED status), unfollow
    if (profile.followingStatus === ApprovalStatus.ACCEPTED) {
      await unfollowUser(profileUserId);
    } else {
      // If not following or pending, follow
      await followUser(profileUserId);
    }
  };

  const getFollowButtonText = () => {
    if (!profile?.followingStatus) {
      return t('common.follow');
    }

    switch (profile.followingStatus) {
      case ApprovalStatus.ACCEPTED:
        return t('common.following');
      case ApprovalStatus.PENDING:
        return t('common.pending_approval');
      default:
        return t('common.follow');
    }
  };

  const renderPostsTab = () => (
    <View style={styles.tabContent}>
      {postsLoading && posts.length === 0 ? (
        <ActivityIndicator
          size="small"
          color={colors.neutral.black}
          style={{marginTop: spacing.xl}}
        />
      ) : posts.length === 0 ? (
        <Body
          color={colors.neutral.grey}
          align="center"
          style={{marginTop: spacing.xl}}>
          {t('screens.profile.no_posts')}
        </Body>
      ) : (
        <FlashList
          data={posts}
          keyExtractor={item => item.id}
          renderItem={({item}) => (
            <FeedCard
              avatarSource={
                profile?.avatar
                  ? {uri: profile.avatar}
                  : require('@assets/images/default_avatar.png')
              }
              fullName={`${profile?.firstName} ${profile?.lastName}`}
              createdAt={item.createdAt}
              content={item.content}
              images={item.images}
              likeCount={item.likesCount}
              commentCount={item.commentsCount}
              isLiked={item.isLiked}
              isSaved={item.isSaved}
              actionBarDisabled
            />
          )}
          onEndReached={() => {
            if (hasMorePosts && !postsLoading) {
              loadMorePosts();
            }
          }}
          onEndReachedThreshold={0.5}
        />
      )}
    </View>
  );

  const renderGroupsTab = () => (
    <View style={styles.tabContent}>
      {groupsLoading && groups.length === 0 ? (
        <ActivityIndicator
          size="small"
          color={colors.neutral.black}
          style={{marginTop: spacing.xl}}
        />
      ) : groups.length === 0 ? (
        <Body
          color={colors.neutral.grey}
          align="center"
          style={{marginTop: spacing.xl}}>
          {t('screens.profile.groups_empty_message')}
        </Body>
      ) : (
        <FlashList
          data={groups}
          keyExtractor={item => item.id}
          renderItem={({item}) => (
            <GroupCard
              logoSource={item.logo ? {uri: item.logo} : null}
              name={item.name}
              location={item.city?.value || ''}
              tags={item.tags}
              currentMembers={item.membersCount}
              membersCapacity={item.membersCapacity}
              privacy={item.privacy}
              isMember={true}
              onPress={() => handleGroupPress(item)}
              style={styles.groupCard}
            />
          )}
          onEndReached={() => {
            if (hasMoreGroups && !groupsLoading) {
              loadMoreGroups();
            }
          }}
          onEndReachedThreshold={0.5}
        />
      )}
    </View>
  );

  const tabItems = isOwnProfile
    ? []
    : [
        {
          key: 'posts',
          label: t('screens.profile.posts'),
          content: renderPostsTab(),
        },
        {
          key: 'groups',
          label: t('screens.profile.groups'),
          content: renderGroupsTab(),
        },
      ];

  if (loading) {
    return (
      <View style={styles.container}>
        <TopHeaderBar
          title={isOwnProfile ? t('screens.menu.my_profile') : ''}
          showBackButton
          containerStyle={styles.topHeaderBar}
          onBackPress={() => navigation.goBack()}
          showShadow={false}
        />
        <ProfileSkeleton />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TopHeaderBar
        title={isOwnProfile ? t('screens.menu.my_profile') : ''}
        showBackButton
        onBackPress={() => navigation.goBack()}
        showShadow={false}
        containerStyle={styles.topHeaderBar}
        rightIconName={isOwnProfile ? 'gear' : undefined}
        onRightButtonPress={
          isOwnProfile
            ? () => navigateToScreen(navigation, 'EditProfile')
            : undefined
        }
      />
      <ScrollView
        style={[
          styles.scrollView,
          {
            backgroundColor: isOwnProfile
              ? colors.neutral.white
              : colors.secondary.light,
          },
        ]}
        showsVerticalScrollIndicator={false}>
        {isOwnProfile && showCompletionWidget && (
          <ProfileCompletionWidget
            data={profileCompletion}
            onPress={() => navigateToScreen(navigation, 'EditProfile')}
            onClose={handleCloseCompletionWidget}
          />
        )}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={handleAvatarPress}
              disabled={!profile?.avatar}>
              <Image
                source={
                  profile?.avatar
                    ? {uri: profile.avatar}
                    : require('@assets/images/default_avatar.png')
                }
                style={styles.avatar}
              />
            </TouchableOpacity>
            <View style={styles.profileHeader}>
              <Title weight="bold" style={{marginBottom: spacing.xs}}>
                {`${profile?.firstName} ${profile?.lastName}`}
              </Title>
              {profile?.city && (
                <View style={styles.locationContainer}>
                  <Icon name="map-pin-filled" size={16} />
                  <BodySmall color={colors.neutral.grey}>
                    {profile.city.value}, {t('common.country')}
                  </BodySmall>
                </View>
              )}

              {profile?.ridingStyles && (
                <FlashList
                  data={profile.ridingStyles}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={item => item}
                  style={{marginTop: spacing.sm}}
                  renderItem={({item, index}) => (
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                      }}>
                      <BodySmall
                        style={{
                          paddingRight: spacing.sm,
                        }}>
                        {EnumUtils.convertRidingStyle(item)}
                      </BodySmall>
                      {index < profile.ridingStyles!.length - 1 && (
                        <View style={styles.dot} />
                      )}
                    </View>
                  )}
                />
              )}
            </View>
          </View>

          {!isOwnProfile && (
            <Button
              title={getFollowButtonText()}
              onPress={handleFollowToggle}
              variant={
                profile?.followingStatus === ApprovalStatus.ACCEPTED
                  ? 'dark'
                  : profile?.followingStatus === ApprovalStatus.PENDING
                  ? 'secondary'
                  : 'primary'
              }
              size="small"
              shape="round"
              iconName={
                profile?.followingStatus === ApprovalStatus.ACCEPTED
                  ? 'user-check-filled'
                  : profile?.followingStatus === ApprovalStatus.PENDING
                  ? 'clock-filled'
                  : 'user-plus-filled'
              }
              loading={followActionLoading}
              disabled={
                followActionLoading ||
                profile?.followingStatus === ApprovalStatus.PENDING
              }
              style={styles.followButton}
            />
          )}

          {profile?.bio && (
            <View style={{marginBottom: spacing.md}}>
              <Body>{getBioText()}</Body>
              {shouldShowReadMore() && (
                <TouchableOpacity onPress={toggleBioExpanded}>
                  <BodySmall
                    color={colors.neutral.black}
                    weight="semiBold"
                    style={{marginTop: spacing.xs}}>
                    {bioExpanded
                      ? t('common.show_less')
                      : t('common.read_more')}
                  </BodySmall>
                </TouchableOpacity>
              )}
            </View>
          )}

          <View style={styles.statsContainer}>
            <View style={styles.statItemRow}>
              <View style={styles.statItem}>
                <Title weight="bold" style={{marginBottom: spacing.xs}}>
                  {stats?.postsCount > 999 ? '999+' : stats?.postsCount || 0}
                </Title>
                <BodySmall color={colors.neutral.grey}>
                  {t('screens.profile.posts')}
                </BodySmall>
              </View>
              <View style={styles.statItem}>
                <Title weight="bold" style={{marginBottom: spacing.xs}}>
                  {stats?.eventsCount > 999 ? '999+' : stats?.eventsCount || 0}
                </Title>
                <BodySmall color={colors.neutral.grey}>
                  {t('screens.profile.events')}
                </BodySmall>
              </View>
              <View style={styles.statItem}>
                <Title weight="bold" style={{marginBottom: spacing.xs}}>
                  {stats?.followingCount > 999
                    ? '999+'
                    : stats?.followingCount || 0}
                </Title>
                <BodySmall color={colors.neutral.grey}>
                  {t('screens.profile.following')}
                </BodySmall>
              </View>
              <View style={styles.statItem}>
                <Title weight="bold" style={{marginBottom: spacing.xs}}>
                  {stats?.followersCount > 999
                    ? '999+'
                    : stats?.followersCount || 0}
                </Title>
                <BodySmall color={colors.neutral.grey}>
                  {t('screens.profile.followers')}
                </BodySmall>
              </View>
            </View>
          </View>

          <View style={styles.socialMediaContainer}>
            {getAllSocialMediaPlatforms().map(
              ({platform, username, exists}) => (
                <Button
                  key={platform}
                  variant="outline"
                  size="small"
                  shape="circle"
                  iconSize={18}
                  iconColor={
                    exists ? colors.neutral.black : colors.neutral.grey
                  }
                  iconName={getSocialMediaIcon(platform) as IconName}
                  onPress={() =>
                    exists &&
                    username &&
                    handleSocialMediaPress(platform, username)
                  }
                  style={[!exists && styles.socialMediaIconDisabled]}
                  disabled={!exists}
                />
              ),
            )}
          </View>

          {profile?.interests && profile.interests.length > 0 && (
            <View style={{gap: spacing.sm}}>
              <Body weight="bold">{t('screens.profile.interests')}</Body>
              <FlashList
                data={profile.interests}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={item => item}
                renderItem={({item, index}) => (
                  <Chip
                    key={index}
                    label={EnumUtils.convertInterest(item)}
                    color="dark"
                    size="small"
                    variant="outlined"
                    style={{marginRight: spacing.sm}}
                  />
                )}
              />
            </View>
          )}
        </View>

        <Tabs
          items={tabItems}
          selectedKey={activeTab}
          onTabChange={tab => setActiveTab(tab as ProfileTab)}
          equalWidth
        />
      </ScrollView>
      <ImagePreviewModal
        visible={imagePreviewVisible}
        images={
          profile?.avatar ? [{url: profile.avatar, isCensored: false}] : []
        }
        initialIndex={0}
        onClose={handleCloseImagePreview}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...commonStyles.container,
  },
  topHeaderBar: {
    borderBottomWidth: 1,
    borderBottomColor: colors.secondary.main,
  },
  scrollView: {
    flex: 1,
    backgroundColor: colors.secondary.light,
  },
  header: {
    padding: spacing.md,
    backgroundColor: colors.neutral.white,
    marginBottom: spacing.md,
  },
  headerTop: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: radius.round,
    borderWidth: 1,
    borderColor: colors.neutral.black,
  },
  profileHeader: {
    flex: 1,
    marginBottom: spacing.sm,
    marginLeft: spacing.md,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  socialMediaContainer: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginVertical: spacing.md,
    alignSelf: 'center',
  },
  socialMediaIconDisabled: {
    borderColor: colors.neutral.lightGrey,
    opacity: 0.5,
  },
  statsContainer: {
    backgroundColor: colors.neutral.white,
    borderRadius: radius.lg,
    padding: spacing.sm,
    marginVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.neutral.black,
    borderBottomWidth: 5,
  },
  statItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  statItem: {
    alignItems: 'center',
    padding: spacing.sm,
  },
  tabContent: {
    backgroundColor: colors.secondary.light,
    padding: spacing.md,
  },
  dot: {
    width: spacing.xs,
    height: spacing.xs,
    borderRadius: radius.round,
    backgroundColor: colors.neutral.lightGrey,
    marginRight: spacing.sm,
  },
  groupCard: {
    marginBottom: spacing.md,
    borderRadius: radius.lg,
    ...getShadow('small'),
  },
  followButton: {
    marginBottom: spacing.md,
    width: '70%',
    alignSelf: 'center',
  },
});
