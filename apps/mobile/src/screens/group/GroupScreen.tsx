import {TopHeaderBar} from '@components/TopHeaderBar';
import {colors, spacing} from '@theme';
import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Text,
} from 'react-native';
import {Tabs} from '@components/Tab';
import {useNavigation} from '@react-navigation/native';
import {MainScreenNavigationProp} from '@navigation/types/navigationTypes';
import {GroupCard} from '@components/GroupCard';
import {useGetUserGroups} from '@services/group.service';
import {Icon} from '@components/Icon';

/**
 * Groups Screen - Displays user groups and allows discovery of new groups
 */
export const GroupScreen = () => {
  const [activeTab, setActiveTab] = useState('joined');
  const navigation = useNavigation<MainScreenNavigationProp<'Tabs'>>();

  // Fetch user groups
  const {groups, loading, error} = useGetUserGroups();

  // Render joined groups list
  const renderJoinedGroups = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.main} />
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.emptyState}>
          <Icon name="error" size={48} color={colors.status.error} />
          <Text style={styles.emptyStateTitle}>Oops! Something went wrong</Text>
          <Text style={styles.emptyStateSubtitle}>
            We couldn't load your groups. Please try again.
          </Text>
        </View>
      );
    }

    if (!groups || groups.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Icon name="users" size={48} color={colors.neutral.grey} />
          <Text style={styles.emptyStateTitle}>No Groups Yet</Text>
          <Text style={styles.emptyStateSubtitle}>
            Join or create groups to connect with other riders and participate
            in events.
          </Text>
        </View>
      );
    }

    return (
      <FlatList
        data={groups}
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
      content: <View style={styles.tabContent} />,
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
    padding: spacing.xl,
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
