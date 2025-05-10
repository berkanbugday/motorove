import {TopHeaderBar} from '@components/TopHeaderBar';
import {colors, spacing} from '@theme';
import React, {useState, useCallback} from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {LegendList} from '@legendapp/list';
import {Tabs} from '@components/Tab';
import {useNavigation} from '@react-navigation/native';
import {MainScreenNavigationProp} from '@navigation/types/navigationTypes';
import {GroupCard} from '@components/GroupCard';
import {useGetJoinedGroups, useGetGroups} from '@services/group.service';
import {Icon} from '@components/Icon';
import {Body, Subtitle} from '@components/Typography';
import {Button} from '@components/Button';

/**
 * Groups Screen - Displays user groups and allows discovery of new groups
 */
export const GroupScreen = () => {
  const [activeTab, setActiveTab] = useState('joined');
  const [refreshingJoinedGroups, setRefreshingJoinedGroups] = useState(false);
  const [refreshingAllGroups, setRefreshingAllGroups] = useState(false);
  const navigation = useNavigation<MainScreenNavigationProp<'Tabs'>>();

  // Fetch joined groups
  const {
    groups: joinedGroups,
    loading: joinedGroupsLoading,
    error: joinedGroupsError,
    refetch: refetchJoinedGroups,
  } = useGetJoinedGroups();

  // Fetch all groups
  const {
    groups: allGroups,
    loading: allGroupsLoading,
    error: allGroupsError,
    refetch: refetchAllGroups,
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

  // Render joined groups list
  const renderJoinedGroups = () => {
    if (joinedGroupsLoading && !refreshingJoinedGroups) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.main} />
        </View>
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
      <LegendList
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
            onPress={() => {
              // For future implementation
              console.log('Navigate to group details:', item.id);
            }}
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
        recycleItems={true} // Enable component recycling for better performance
        maintainVisibleContentPosition={true} // Maintain the visible position when data changes
      />
    );
  };

  // Render all groups list
  const renderAllGroups = () => {
    if (allGroupsLoading && !refreshingAllGroups) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.main} />
        </View>
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
      <LegendList
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
            isMember={true}
            onPress={() => {
              // For future implementation
              console.log('Navigate to group details:', item.id);
            }}
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
        recycleItems={true} // Enable component recycling for better performance
        maintainVisibleContentPosition={true} // Maintain the visible position when data changes
      />
    );
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
        containerStyle={styles.topHeaderBar}
        showShadow={false}
        rightIconName="plus"
        onRightButtonPress={() => navigation.navigate('CreateGroup')}
        secondRightIconName="filter"
        onSecondRightButtonPress={() => {}}
        leftIconName="search"
        onLeftIconPress={() => {}}
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
  topHeaderBar: {
    borderBottomEndRadius: 0,
    borderBottomStartRadius: 0,
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
    justifyContent: 'center',
    alignItems: 'center',
  },
});
