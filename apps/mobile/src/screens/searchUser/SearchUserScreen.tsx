import React, {useState, useCallback, useEffect, useRef, memo} from 'react';
import {View, StyleSheet, Keyboard, Animated} from 'react-native';
import {
  TopHeaderBar,
  Icon,
  UserCard,
  Body,
  AnimatedInput,
  Button,
} from '@components';
import {colors, commonStyles, spacing} from '@theme';
import {useSearchUsers} from '@services/user.service';
import {IUser} from '@motorove/shared';
import {useTranslation} from '@hooks/useTranslation';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {MainScreenNavigationProp} from '@navigation/index';
import {useFollowUser, useUnfollowUser} from '@services/user-following.service';
import {FlashList} from '@shopify/flash-list';
import {useAuth} from '@contexts';

/**
 * User Search Screen - Allows users to search for other users and follow/unfollow them
 */
const CancelButton = memo(({onPress}: {onPress: () => void}) => {
  const translateX = useRef(new Animated.Value(50)).current;
  const {t} = useTranslation();

  useEffect(() => {
    Animated.timing(translateX, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [translateX]);

  return (
    <Animated.View
      style={[
        {
          transform: [{translateX}],
        },
        styles.cancelButtonContainer,
      ]}>
      <Button
        title={t('common.cancel')}
        onPress={onPress}
        variant="text"
        style={styles.cancelButton}
      />
    </Animated.View>
  );
});

export const SearchUserScreen = () => {
  const navigation = useNavigation<MainScreenNavigationProp<'SearchUser'>>();
  const {t} = useTranslation();
  const {id: currentUserId} = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [loadingUserIds, setLoadingUserIds] = useState<Set<string>>(new Set());
  const {followUser} = useFollowUser();
  const {unfollowUser} = useUnfollowUser();
  // Fetch users based on search query
  const {
    users,
    loading: searchLoading,
    isFetchingMore,
    loadMore,
    search,
  } = useSearchUsers(debouncedQuery);

  // Reset search when screen is focused
  useFocusEffect(
    useCallback(() => {
      setSearchQuery('');
      setDebouncedQuery('');
      search('');
    }, [search]),
  );

  // Debounce search query to avoid too many API calls
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      search(searchQuery);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, search]);

  // Handle search query changes
  const handleSearchQueryChange = useCallback((text: string) => {
    setSearchQuery(text);
  }, []);

  // Clear search query
  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
    setDebouncedQuery('');
    search('');
    Keyboard.dismiss();
  }, [search]);

  // Handle follow user with loading state
  const handleFollowUser = useCallback(
    async (userId: string) => {
      setLoadingUserIds(prev => new Set(prev).add(userId));
      try {
        await followUser(userId);
      } finally {
        setLoadingUserIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(userId);
          return newSet;
        });
      }
    },
    [followUser],
  );

  // Handle unfollow user with loading state
  const handleUnfollowUser = useCallback(
    async (userId: string) => {
      setLoadingUserIds(prev => new Set(prev).add(userId));
      try {
        await unfollowUser(userId);
      } finally {
        setLoadingUserIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(userId);
          return newSet;
        });
      }
    },
    [unfollowUser],
  );

  // Render each user item
  const renderUserItem = useCallback(
    ({item}: {item: IUser}) => {
      const isLoading = loadingUserIds.has(item.id);

      return (
        <UserCard
          user={item}
          loading={isLoading}
          onPress={() => {
            if (item.id !== currentUserId) {
              navigation.navigate('Profile', {userId: item.id});
            }
          }}
          handleFollowPress={() => handleFollowUser(item.id)}
          handleUnfollowPress={() => handleUnfollowUser(item.id)}
        />
      );
    },
    [
      handleFollowUser,
      handleUnfollowUser,
      currentUserId,
      loadingUserIds,
      navigation,
    ],
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
            ? t('screens.searchUser.no_results')
            : t('screens.searchUser.search_user')}
        </Body>
      </View>
    );
  }, [searchLoading, debouncedQuery, t]);

  // Function to refetch search results
  const refetchSearch = useCallback(() => {
    search(debouncedQuery);
  }, [debouncedQuery, search]);

  return (
    <View style={styles.container}>
      <TopHeaderBar
        title={t('screens.searchUser.search_user')}
        showShadow={false}
      />

      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <View style={styles.searchInput}>
            <AnimatedInput
              shape="round"
              placeholder={t('screens.searchUser.search_placeholder')}
              value={searchQuery}
              onChangeText={handleSearchQueryChange}
              icon={
                <Icon
                  name="search"
                  size={18}
                  color={colors.neutral.lightGrey}
                />
              }
              iconPosition="left"
              onClearSearch={handleClearSearch}
              testID="user-search-input"
            />
          </View>
          {searchQuery.length > 0 && (
            <CancelButton onPress={handleClearSearch} />
          )}
        </View>
      </View>

      <FlashList
        data={users}
        renderItem={renderUserItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        style={{paddingBottom: 60}}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyList}
        onRefresh={refetchSearch}
        refreshing={searchLoading}
        onEndReached={!isFetchingMore ? loadMore : undefined}
        onEndReachedThreshold={0.5}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...commonStyles.container,
  },
  searchContainer: {
    paddingHorizontal: spacing.md,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
  },
  cancelButtonContainer: {
    marginLeft: spacing.sm,
  },
  cancelButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  listContainer: {
    paddingTop: spacing.md,
    paddingBottom: spacing.xxxl,
    marginBottom: spacing.xxxl,
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
  footerLoader: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
});
