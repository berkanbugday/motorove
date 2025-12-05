import React, {useState, useCallback} from 'react';
import {View, StyleSheet, RefreshControl} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useAuth} from '@contexts';
import {colors, commonStyles, spacing} from '@theme';
import {useTranslation} from 'react-i18next';
import {TopHeaderBar, Body, LoadingIndicator, UserCard} from '@components';
import {
  MainScreenNavigationProp,
  MainScreenRouteProp,
} from '@navigation/types/navigationTypes';
import {
  useFollowingUsers,
  useFollowUser,
  useUnfollowUser,
} from '@services/user-following.service';
import {FlashList} from '@shopify/flash-list';
import {IUserFollowing, IUser} from '@motorove/shared';

/**
 * FollowingScreen - Displays users that the profile owner is following
 */
export const FollowingScreen = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [loadingUserIds, setLoadingUserIds] = useState<Set<string>>(new Set());
  const navigation = useNavigation<MainScreenNavigationProp<'Following'>>();
  const route = useRoute<MainScreenRouteProp<'Following'>>();
  const {t} = useTranslation();
  const {id: currentUserId} = useAuth();

  // Get userId from route params (profile owner), fallback to currentUserId
  const profileUserId = route.params?.userId || currentUserId;

  // Fetch following users
  const {followingUsers, loading, refetch, loadMore, hasMore} =
    useFollowingUsers(profileUserId, 20, 0);

  // Follow/unfollow hooks
  const {followUser} = useFollowUser();
  const {unfollowUser} = useUnfollowUser();

  /**
   * Handle pull-to-refresh functionality
   */
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  /**
   * Navigate to user profile
   */
  const handleUserPress = useCallback(
    (userId: string) => {
      if (userId !== currentUserId) {
        navigation.navigate('Profile', {userId});
      }
    },
    [navigation, currentUserId],
  );

  /**
   * Extract user from UserFollowing object
   */
  const getUserFromFollowing = (following: IUserFollowing): IUser | null => {
    return (following.following as IUser) || null;
  };

  /**
   * Handle follow user with loading state
   */
  const handleFollowUser = useCallback(
    async (userId: string) => {
      setLoadingUserIds(prev => new Set(prev).add(userId));
      try {
        await followUser(userId);
        await refetch();
      } finally {
        setLoadingUserIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(userId);
          return newSet;
        });
      }
    },
    [followUser, refetch],
  );

  /**
   * Handle unfollow user with loading state
   */
  const handleUnfollowUser = useCallback(
    async (userId: string) => {
      setLoadingUserIds(prev => new Set(prev).add(userId));
      try {
        await unfollowUser(userId);
        await refetch();
      } finally {
        setLoadingUserIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(userId);
          return newSet;
        });
      }
    },
    [unfollowUser, refetch],
  );

  /**
   * Render empty state when no following users exist
   */
  const renderEmptyState = useCallback(() => {
    if (loading) {
      return null;
    }

    return (
      <View style={styles.emptyState}>
        <Body color={colors.neutral.grey} align="center">
          {t('screens.following.no_following')}
        </Body>
      </View>
    );
  }, [loading, t]);

  /**
   * Render each user item
   */
  const renderUserItem = useCallback(
    ({item}: {item: IUserFollowing}) => {
      const user = getUserFromFollowing(item);
      if (!user) {
        return null;
      }

      const isLoading = loadingUserIds.has(user.id);
      const isCurrentUser = user.id === currentUserId;

      return (
        <UserCard
          user={user}
          onPress={() => handleUserPress(user.id)}
          handleFollowPress={
            !isCurrentUser ? () => handleFollowUser(user.id) : undefined
          }
          handleUnfollowPress={
            !isCurrentUser ? () => handleUnfollowUser(user.id) : undefined
          }
          loading={isLoading}
        />
      );
    },
    [
      handleUserPress,
      handleFollowUser,
      handleUnfollowUser,
      currentUserId,
      loadingUserIds,
    ],
  );

  if (loading && followingUsers.length === 0) {
    return (
      <View style={styles.container}>
        <TopHeaderBar
          title={t('screens.following.following')}
          showBackButton
          onBackPress={() => navigation.goBack()}
          showShadow={false}
          containerStyle={styles.topHeaderBar}
        />
        <LoadingIndicator visible={true} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TopHeaderBar
        title={t('screens.following.following')}
        showBackButton
        onBackPress={() => navigation.goBack()}
        showShadow={false}
        containerStyle={styles.topHeaderBar}
      />
      <FlashList
        data={followingUsers}
        keyExtractor={item => item.id}
        renderItem={renderUserItem}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        onEndReached={() => {
          if (hasMore && !loading) {
            loadMore();
          }
        }}
        onEndReachedThreshold={0.5}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
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
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: spacing.xl * 2,
  },
});
