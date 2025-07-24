import React, {useState, useCallback, useEffect} from 'react';
import {View, StyleSheet, Keyboard, FlatList} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {TopHeaderBar, Icon, UserCard, Body, AnimatedInput} from '@components';
import {colors, spacing} from '@theme';
import {useSearchUsers} from '@services/user.service';
import {IUser} from '@motorove/shared';
import {useTranslation} from '@/hooks/useTranslation';

/**
 * User Search Screen - Allows users to search for other users and follow/unfollow them
 */
export const SearchUserScreen = () => {
  const {t} = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Fetch users based on search query
  const {
    users: searchResults,
    loading: searchLoading,
    hasMore,
    loadMore,
    search,
    clearSearch,
  } = useSearchUsers(debouncedQuery);

  // Clear search when screen loses focus
  useFocusEffect(
    useCallback(() => {
      return () => {
        // This runs when the screen is unfocused (exited)
        setSearchQuery('');
        setDebouncedQuery('');
        clearSearch();
      };
    }, [clearSearch]),
  );

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
  const renderUserItem = useCallback(({item}: {item: IUser}) => {
    return (
      <UserCard
        user={item}
        onPress={() => {
          // Navigate to user profile when implemented
          // navigation.navigate('UserProfile', {userId: item.id});
        }}
      />
    );
  }, []);

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
      <TopHeaderBar title={t('navigation.search_user')} showShadow={false} />

      <View style={styles.searchContainer}>
        <AnimatedInput
          shape="round"
          placeholder={t('screens.searchUser.search_placeholder')}
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

      <FlatList
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
