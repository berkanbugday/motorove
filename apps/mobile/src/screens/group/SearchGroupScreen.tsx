import React, {useState, useCallback, useEffect} from 'react';
import {View, StyleSheet, Keyboard, FlatList} from 'react-native';
import {TopHeaderBar} from '@components/TopHeaderBar';
import {colors, spacing} from '@theme';
import {Icon} from '@components/Icon';
import {useNavigation} from '@react-navigation/native';
import {MainScreenNavigationProp} from '@navigation/types/navigationTypes';
import {useGetGroups, useSearchGroups} from '@services/group.service';
import {GroupCard} from '@components/GroupCard';
import {Body} from '@components/Typography';
import {AnimatedInput} from '@components/AnimatedInput';
import {IGroup} from '@motorove/shared';

/**
 * Group Search Screen - Allows users to search for groups by name
 */
export const SearchGroupScreen = () => {
  const navigation = useNavigation<MainScreenNavigationProp<'SearchGroup'>>();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Fetch initial groups when no search is active
  const {
    groups: allGroups,
    loading: allLoading,
    refetch: refetchAll,
  } = useGetGroups();

  // Fetch groups based on search query
  const {
    groups: searchResults,
    loading: searchLoading,
    refetch: refetchSearch,
    loadMore,
    hasMore,
  } = useSearchGroups(debouncedQuery);

  // Combine results based on whether we're searching or not
  const groups = debouncedQuery ? searchResults : allGroups;
  const loading = debouncedQuery ? searchLoading : allLoading;
  const refetch = debouncedQuery ? refetchSearch : refetchAll;

  // Debounce search query to avoid too many API calls
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim() !== '') {
        setDebouncedQuery(searchQuery);
      } else {
        setDebouncedQuery('');
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

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

  // Navigate to group detail screen
  const handleGroupPress = useCallback(
    (groupId: string) => {
      navigation.navigate('GroupDetail', {groupId});
    },
    [navigation],
  );

  // Render each group item
  const renderGroupItem = useCallback(
    ({item}: {item: IGroup}) => {
      return (
        <GroupCard
          logoSource={item.logo ? {uri: item.logo} : null}
          name={item.name}
          location={item.city.value}
          tags={item.tags.map(tag => tag.value)}
          currentMembers={item.memberships.length}
          membersCapacity={item.membersCapacity || undefined}
          privacy={item.privacy}
          onPress={() => handleGroupPress(item.id)}
        />
      );
    },
    [handleGroupPress],
  );

  // Render empty state when no groups match search query
  const renderEmptyList = useCallback(() => {
    if (loading) {
      return null;
    }

    return (
      <View style={styles.emptyContainer}>
        <Icon name="search" size={40} color={colors.neutral.lightGrey} />
        <Body color={colors.neutral.grey} style={styles.emptyText}>
          {debouncedQuery
            ? 'No groups found matching your search'
            : 'Search for groups by name'}
        </Body>
      </View>
    );
  }, [loading, debouncedQuery]);

  // Handle end reached for pagination
  const handleEndReached = useCallback(() => {
    if (debouncedQuery && hasMore) {
      loadMore();
    }
  }, [debouncedQuery, hasMore, loadMore]);

  return (
    <View style={styles.container}>
      <TopHeaderBar
        title="Search Groups"
        showBackButton
        showShadow={false}
        onBackPress={() => navigation.goBack()}
      />

      <View style={styles.searchContainer}>
        <AnimatedInput
          shape="round"
          placeholder="Search groups by name"
          value={searchQuery}
          onChangeText={handleSearchQueryChange}
          icon={
            <Icon name="search" size={18} color={colors.neutral.lightGrey} />
          }
          iconPosition="left"
          onClearSearch={handleClearSearch}
          testID="group-search-input"
        />
      </View>

      <FlatList
        data={groups}
        renderItem={renderGroupItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyList}
        onRefresh={refetch}
        refreshing={loading}
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
