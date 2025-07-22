import React, {useState, useCallback} from 'react';
import {View, StyleSheet, RefreshControl, FlatList} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {MainScreenNavigationProp} from '@navigation/types/navigationTypes';
import {useGetJoinedGroups, useGetGroups} from '@services/group.service';
import {colors, spacing} from '@theme';
import {
  TopHeaderBar,
  Body,
  Subtitle,
  Button,
  Icon,
  useBottomSheet,
  Tabs,
  GroupFilter,
  GroupCard,
  SkeletonGroup,
} from '@components';

/**
 * Groups Screen - Displays user groups and allows discovery of new groups
 */
export const GroupScreen = () => {
  const [activeTab, setActiveTab] = useState('joined');
  const [refreshingJoinedGroups, setRefreshingJoinedGroups] = useState(false);
  const [refreshingAllGroups, setRefreshingAllGroups] = useState(false);
  const navigation = useNavigation<MainScreenNavigationProp<'Tabs'>>();
  const {openBottomSheet} = useBottomSheet();

  // Fetch joined groups with pagination
  const {
    groups: joinedGroups,
    loading: joinedGroupsLoading,
    error: joinedGroupsError,
    refetch: refetchJoinedGroups,
    loadMore: loadMoreJoinedGroups,
    hasMore: hasMoreJoinedGroups,
    filters: joinedGroupsFilters,
    applyFilters: applyJoinedGroupsFilters,
  } = useGetJoinedGroups();

  // Fetch all groups with pagination
  const {
    groups: allGroups,
    loading: allGroupsLoading,
    error: allGroupsError,
    refetch: refetchAllGroups,
    loadMore: loadMoreAllGroups,
    hasMore: hasMoreAllGroups,
    filters: allGroupsFilters,
    applyFilters: applyAllGroupsFilters,
  } = useGetGroups();

  // Handle refresh joined groups
  const handleRefreshJoinedGroups = useCallback(async () => {
    setRefreshingJoinedGroups(true);
    await refetchJoinedGroups();
    setRefreshingJoinedGroups(false);
  }, [refetchJoinedGroups]);

  // Handle refresh all groups
  const handleRefreshAllGroups = useCallback(async () => {
    setRefreshingAllGroups(true);
    await refetchAllGroups();
    setRefreshingAllGroups(false);
  }, [refetchAllGroups]);

  // Handle filter button press
  const handleFilterPress = useCallback(() => {
    const currentFilters =
      activeTab === 'joined' ? joinedGroupsFilters : allGroupsFilters;

    openBottomSheet({
      title: 'Filter Groups',
      closeButtonPosition: 'top-left',
      enableGestureControl: false,
      content: (
        <GroupFilter
          initialFilters={currentFilters}
          onApplyFilters={(filters: IFilterGroup) => {
            if (activeTab === 'joined') {
              applyJoinedGroupsFilters(filters);
            } else {
              applyAllGroupsFilters(filters);
            }
          }}
        />
      ),
      snapPoint: 'full',
    });
  }, [
    activeTab,
    joinedGroupsFilters,
    allGroupsFilters,
    openBottomSheet,
    applyJoinedGroupsFilters,
    applyAllGroupsFilters,
  ]);

  // Render skeleton loaders for groups
  const renderGroupSkeletons = (count = 3) => {
    return Array.from({length: count}).map((_, index) => (
      <SkeletonGroup
        key={`skeleton-${index}`}
        preset="groupCard"
        showShadow={false}
        style={styles.skeletonItem}
      />
    ));
  };

  // Render joined groups list
  const renderJoinedGroups = () => {
    if (joinedGroupsLoading && !refreshingJoinedGroups && hasMoreJoinedGroups) {
      return (
        <View style={styles.loadingContainer}>{renderGroupSkeletons()}</View>
      );
    }

    if (joinedGroupsError) {
      return (
        <View style={styles.emptyState}>
          <Icon name="error" size={48} color={colors.status.error} />
          <Subtitle style={styles.emptyStateTitle}>
            Oops! Something went wrong
          </Subtitle>
          <Body style={styles.emptyStateSubtitle}>
            We couldn't load your groups. Please try again.
          </Body>
          <Button
            title="Try Again"
            variant="primary"
            shape="round"
            onPress={handleRefreshJoinedGroups}
          />
        </View>
      );
    }

    if (!joinedGroups || joinedGroups.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Icon name="users" size={48} />
          <Subtitle style={styles.emptyStateTitle}>No Groups Yet</Subtitle>
          <Body style={styles.emptyStateSubtitle}>
            Join or create groups to connect with other riders and participate
            in events.
          </Body>
          <Button
            title="Try Again"
            variant="primary"
            shape="round"
            onPress={handleRefreshJoinedGroups}
          />
        </View>
      );
    }

    return (
      <FlatList
        data={joinedGroups}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <GroupCard
            logoSource={item.logo ? {uri: item.logo} : null}
            name={item.name}
            location={item.city.value}
            tags={item.tags.map(tag => tag.value)}
            currentMembers={item.memberships.length}
            membersCapacity={item.membersCapacity || undefined}
            privacy={item.privacy}
            isMember={true}
            onPress={() =>
              navigation.navigate('GroupDetail', {groupId: item.id})
            }
          />
        )}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshingJoinedGroups}
            onRefresh={handleRefreshJoinedGroups}
          />
        }
        onEndReached={loadMoreJoinedGroups}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          joinedGroupsLoading && hasMoreJoinedGroups ? (
            <View style={styles.footerLoader}>
              <SkeletonGroup preset="groupCard" style={styles.skeletonItem} />
            </View>
          ) : null
        }
      />
    );
  };

  // Render all groups list
  const renderAllGroups = () => {
    if (allGroupsLoading && !refreshingAllGroups && !allGroups?.length) {
      return (
        <View style={styles.loadingContainer}>{renderGroupSkeletons()}</View>
      );
    }

    if (allGroupsError) {
      return (
        <View style={styles.emptyState}>
          <Icon name="error" size={48} color={colors.status.error} />
          <Subtitle style={styles.emptyStateTitle}>
            Oops! Something went wrong
          </Subtitle>
          <Body style={styles.emptyStateSubtitle}>
            We couldn't load your groups. Please try again.
          </Body>
          <Button
            title="Try Again"
            variant="primary"
            shape="round"
            onPress={handleRefreshAllGroups}
          />
        </View>
      );
    }

    if (!allGroups || allGroups.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Icon name="users" size={48} />
          <Subtitle style={styles.emptyStateTitle}>No Groups Yet</Subtitle>
          <Body style={styles.emptyStateSubtitle}>
            Join or create groups to connect with other riders and participate
            in events.
          </Body>
          <Button
            title="Try Again"
            variant="primary"
            shape="round"
            onPress={handleRefreshAllGroups}
          />
        </View>
      );
    }

    return (
      <FlatList
        data={allGroups}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <GroupCard
            logoSource={item.logo ? {uri: item.logo} : null}
            name={item.name}
            location={item.city.value}
            tags={item.tags.map(tag => tag.value)}
            currentMembers={item.memberships.length}
            membersCapacity={item.membersCapacity || undefined}
            privacy={item.privacy}
            onPress={() =>
              navigation.navigate('GroupDetail', {groupId: item.id})
            }
          />
        )}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshingAllGroups}
            onRefresh={handleRefreshAllGroups}
          />
        }
        onEndReached={loadMoreAllGroups}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          allGroupsLoading && hasMoreAllGroups ? (
            <View style={styles.footerLoader}>
              <SkeletonGroup preset="groupCard" style={styles.skeletonItem} />
            </View>
          ) : null
        }
      />
    );
  };

  const getFilterBadgeCount = () => {
    let badgeCount = 0;
    if (activeTab === 'explore') {
      badgeCount = allGroupsFilters.city ? 1 : 0;
      badgeCount += allGroupsFilters.tags.length > 0 ? 1 : 0;
      badgeCount += allGroupsFilters.privacy !== 'ALL' ? 1 : 0;
    } else {
      badgeCount = joinedGroupsFilters.city ? 1 : 0;
      badgeCount += joinedGroupsFilters.tags.length > 0 ? 1 : 0;
      badgeCount += joinedGroupsFilters.privacy !== 'ALL' ? 1 : 0;
    }
    return badgeCount;
  };

  const tabItems = [
    {
      key: 'joined',
      label: 'Joined',
      content: <View style={styles.tabContent}>{renderJoinedGroups()}</View>,
    },
    {
      key: 'explore',
      label: 'Explore',
      content: <View style={styles.tabContent}>{renderAllGroups()}</View>,
    },
  ];

  return (
    <View style={styles.container}>
      <TopHeaderBar
        title="Groups"
        showShadow={false}
        rightIconName="plus"
        onRightButtonPress={() => navigation.navigate('CreateGroup')}
        secondRightIconName={
          getFilterBadgeCount() > 0 ? 'filter-filled' : 'filter'
        }
        secondRightIconBadgeCount={getFilterBadgeCount()}
        onSecondRightButtonPress={handleFilterPress}
        leftIconName="search"
        onLeftIconPress={() => navigation.navigate('GroupSearch')}
      />
      <Tabs
        items={tabItems}
        selectedKey={activeTab}
        onTabChange={setActiveTab}
        variant="pill"
        equalWidth
        contentContainerStyle={styles.tabContent}
        containerStyle={styles.tabContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.white,
  },
  tabContainer: {
    flex: 1,
  },
  tabContent: {
    flex: 1,
  },
  listContainer: {
    paddingBottom: spacing.xxxl,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.neutral.black,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: colors.neutral.grey,
    textAlign: 'center',
  },
  exploreHeader: {
    marginBottom: spacing.md,
  },
  exploreHeaderText: {
    fontSize: 16,
    color: colors.neutral.grey,
  },
  loadingContainer: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  skeletonItem: {
    marginBottom: spacing.md,
    borderBottomWidth: 1,
    borderColor: colors.neutral.veryLightGrey,
  },
  footerLoader: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
});
