import React, {useState, useCallback, useEffect} from 'react';
import {View, StyleSheet, Keyboard} from 'react-native';
import {LegendList} from '@legendapp/list';
import {TopHeaderBar} from '@components/TopHeaderBar';
import {colors, spacing} from '@theme';
import {Icon} from '@components/Icon';
import {useSearchUsers, userService} from '@services/user.service';
import {UserCard} from '@components/UserCard';
import {Body} from '@components/Typography';
import {AnimatedInput} from '@components/AnimatedInput';
import {User} from '../../types';

/**
 * User Search Screen - Allows users to search for other users and follow/unfollow them
 */
export const UserSearchScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [followStatusMap, setFollowStatusMap] = useState<
    Record<string, boolean>
  >({});

  // Fetch users based on search query
  const {
    users: searchResults,
    loading: searchLoading,
    refetch: refetchSearch,
    loadMore,
    hasMore,
    setSearchQuery: setSearchUsersQuery,
  } = useSearchUsers(debouncedQuery);

  // Fetch follow status for users in search results
  useEffect(() => {
    const fetchFollowStatus = async () => {
      if (searchResults && searchResults.length > 0) {
        const statusMap: Record<string, boolean> = {};

        // Create an array of promises to check follow status for each user
        const promises = searchResults.map(async user => {
          try {
            const isFollowing = await userService.isFollowing(user.id);
            statusMap[user.id] = isFollowing;
          } catch (error) {
            console.error('Error checking follow status:', error);
            statusMap[user.id] = false;
          }
        });

        // Wait for all promises to resolve
        await Promise.all(promises);
        setFollowStatusMap(statusMap);
      }
    };

    fetchFollowStatus();
  }, [searchResults]);

  // Debounce search query to avoid too many API calls
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim() !== '') {
        setDebouncedQuery(searchQuery);
        setSearchUsersQuery(searchQuery);
      } else {
        setDebouncedQuery('');
        setSearchUsersQuery('');
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, setSearchUsersQuery]);

  // Handle search query changes
  const handleSearchQueryChange = useCallback((text: string) => {
    setSearchQuery(text);
  }, []);

  // Clear search query
  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
    setDebouncedQuery('');
    Keyboard.dismiss();
  }, []);

  // Handle follow status change
  const handleFollowStatusChange = useCallback(
    (userId: string, isFollowing: boolean) => {
      setFollowStatusMap(prev => ({
        ...prev,
        [userId]: !isFollowing, // Toggle the follow status since the action has already been performed
      }));
    },
    [],
  );

  // Render each user item
  const renderUserItem = useCallback(
    ({item}: {item: User}) => {
      const isFollowing = followStatusMap[item.id] ?? false;

      return (
        <UserCard
          user={item}
          isFollowing={isFollowing}
          onFollowStatusChange={status =>
            handleFollowStatusChange(item.id, status)
          }
          onPress={() => {
            // Navigate to user profile when implemented
            // navigation.navigate('UserProfile', {userId: item.id});
          }}
        />
      );
    },
    [followStatusMap, handleFollowStatusChange],
  );

  // Render empty state when no users match search query
  const renderEmptyList = useCallback(() => {
    if (searchLoading) {
      return null;
    }

    return (
      <View style={styles.emptyContainer}>
        <Icon name="search" size={40} color={colors.neutral.lightGrey} />
        <Body color={colors.neutral.grey} style={styles.emptyText}>
          {debouncedQuery
            ? 'No users found matching your search'
            : 'Search for users by name'}
        </Body>
      </View>
    );
  }, [searchLoading, debouncedQuery]);

  // Handle end reached for pagination
  const handleEndReached = useCallback(() => {
    if (debouncedQuery && hasMore) {
      loadMore();
    }
  }, [debouncedQuery, hasMore, loadMore]);

  return (
    <View style={styles.container}>
      <TopHeaderBar title="Search Users" showShadow={false} />

      <View style={styles.searchContainer}>
        <AnimatedInput
          shape="round"
          placeholder="Search users by name"
          value={searchQuery}
          onChangeText={handleSearchQueryChange}
          icon={
            <Icon name="search" size={18} color={colors.neutral.lightGrey} />
          }
          iconPosition="left"
          onClearSearch={handleClearSearch}
          testID="user-search-input"
        />
      </View>

      <LegendList
        data={searchResults}
        renderItem={renderUserItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyList}
        onRefresh={refetchSearch}
        refreshing={searchLoading}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        recycleItems={true}
        maintainVisibleContentPosition={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.white,
  },
  searchContainer: {
    paddingHorizontal: spacing.md,
  },
  listContainer: {
    paddingTop: spacing.md,
    paddingBottom: spacing.xxxl,
    paddingHorizontal: spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: spacing.xxxl * 2,
  },
  emptyText: {
    marginTop: spacing.md,
    textAlign: 'center',
  },
});
