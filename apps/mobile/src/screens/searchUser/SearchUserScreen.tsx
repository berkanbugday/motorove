import React, {useState, useCallback, useEffect, useRef} from 'react';
import {View, StyleSheet, Keyboard, FlatList, Animated} from 'react-native';
import {
  TopHeaderBar,
  Icon,
  UserCard,
  Body,
  AnimatedInput,
  Button,
} from '@components';
import {colors, spacing} from '@theme';
import {useSearchUsers} from '@services/user.service';
import {IUser} from '@motorove/shared';
import {useTranslation} from '@/hooks/useTranslation';
import {useNavigation} from '@react-navigation/native';
import {MainScreenNavigationProp} from '@navigation/index';
import {useFollowUser, useUnfollowUser} from '@services/user-following.service';

/**
 * User Search Screen - Allows users to search for other users and follow/unfollow them
 */
const CancelButton = ({onPress}: {onPress: () => void}) => {
  const translateX = useRef(new Animated.Value(50)).current;
  const {t} = useTranslation();

  useEffect(() => {
    Animated.timing(translateX, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, []);

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
};

export const SearchUserScreen = () => {
  const navigation = useNavigation<MainScreenNavigationProp<'SearchUser'>>();
  const {t} = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const {followUser, loading: followLoading} = useFollowUser();
  const {unfollowUser, loading: unfollowLoading} = useUnfollowUser();
  const [users, setUsers] = useState<IUser[]>([]);

  // Fetch users based on search query
  const {
    users: searchResults,
    loading: searchLoading,
    hasMore,
    loadMore,
    search,
    clearSearch,
  } = useSearchUsers(debouncedQuery);

  useEffect(() => {
    setUsers(searchResults);
  }, [searchResults]);
  // Debounce search query to avoid too many API calls
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim() !== '') {
        setDebouncedQuery(searchQuery);
        search(searchQuery);
      } else {
        setDebouncedQuery('');
        clearSearch();
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, search, clearSearch]);

  // Handle search query changes
  const handleSearchQueryChange = useCallback((text: string) => {
    setSearchQuery(text);
  }, []);

  // Clear search query
  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
    setDebouncedQuery('');
    clearSearch();
    Keyboard.dismiss();
  }, [clearSearch]);

  // Render each user item
  const renderUserItem = useCallback(
    ({item}: {item: IUser}) => {
      return (
        <UserCard
          user={item}
          loading={followLoading || unfollowLoading}
          onPress={() => {
            navigation.navigate('Profile', {userId: item.id});
          }}
          handleFollowPress={async () => {
            const status = await followUser(item.id);
            setUsers(prevUsers =>
              prevUsers.map(user =>
                user.id === item.id ? {...user, followingStatus: status} : user,
              ),
            );
          }}
          handleUnfollowPress={async () => {
            const status = await unfollowUser(item.id);
            setUsers(prevUsers =>
              prevUsers.map(user =>
                user.id === item.id ? {...user, followingStatus: status} : user,
              ),
            );
          }}
        />
      );
    },
    [followUser, unfollowUser, users],
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
            : t('screens.searchUser.search_placeholder')}
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

  // Function to refetch search results
  const refetchSearch = useCallback(() => {
    if (debouncedQuery) {
      search(debouncedQuery);
    }
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
            <CancelButton onPress={() => Keyboard.dismiss()} />
          )}
        </View>
      </View>

      <FlatList
        data={users}
        renderItem={renderUserItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyList}
        onRefresh={refetchSearch}
        refreshing={searchLoading}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
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
