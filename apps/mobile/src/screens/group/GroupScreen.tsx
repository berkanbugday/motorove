import {TopHeaderBar} from '@components/TopHeaderBar';
import {colors, spacing} from '@theme';
import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  Text,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import {Tabs} from '@components/Tab';
import {Icon, GroupCard, showToast} from '@components';
import {useNavigation} from '@react-navigation/native';
import {MainScreenNavigationProp} from '@navigation/types/navigationTypes';
import {GroupService, Group} from '@services/group.service';

// Define types for our data
interface JoinedGroup {
  id: string;
  name: string;
  members: number;
  image: string | null;
  description: string;
  location?: string;
  tags?: string[];
  lastActive: string;
  isAdmin: boolean;
  badge?: {
    text: string;
    backgroundColor: string;
    textColor: string;
  };
}

interface ExploreGroup {
  id: string;
  name: string;
  members: number;
  image: string;
  description: string;
  location: string;
  tags?: string[];
  privacy?: string;
  badge?: {
    text: string;
    backgroundColor: string;
    textColor: string;
  };
}

// Mock data for explore groups (to be replaced with API in future)
const exploreGroups: ExploreGroup[] = [
  {
    id: '4',
    name: 'Mountain Trail Enthusiasts',
    members: 56,
    image: 'https://picsum.photos/id/10/500/300',
    description:
      'Dedicated to discovering the best mountain trails for motorcycles.',
    location: 'National',
    tags: ['Touring', 'Off-Road'],
    privacy: 'private',
    badge: {
      text: 'Official',
      backgroundColor: colors.primary.light,
      textColor: colors.neutral.white,
    },
  },
  {
    id: '5',
    name: 'Vintage Motorcycle Club',
    members: 38,
    image: 'https://picsum.photos/id/21/500/300',
    description: 'For collectors and enthusiasts of vintage motorcycles.',
    location: 'Istanbul',
    tags: ['Vintage', 'Classic'],
  },
  {
    id: '6',
    name: 'Sport Bike Racers',
    members: 72,
    image: 'https://picsum.photos/id/24/500/300',
    description: 'Track day enthusiasts and sport bike lovers.',
    location: 'Ankara',
    tags: ['Sport', 'Racing'],
    privacy: 'public',
  },
  {
    id: '7',
    name: 'Weekend Touring Group',
    members: 45,
    image: 'https://picsum.photos/id/26/500/300',
    description: 'Organizing weekend tours and long-distance rides.',
    location: 'Izmir',
    tags: ['Touring', 'Weekend Rides'],
  },
];

/**
 * Groups Screen - Displays user groups and allows discovery of new groups
 */
export const GroupScreen = () => {
  const [activeTab, setActiveTab] = useState('joined');
  const navigation = useNavigation<MainScreenNavigationProp<'Tabs'>>();

  // Fetch user groups from API
  const {groups, loading, error, refetch} = GroupService.useGetUserGroups();

  // Adapter function to convert API group data to UI format
  const mapApiGroupToUiGroup = (group: Group): JoinedGroup => {
    console.log(group.logo);
    return {
      id: group.id,
      name: group.name,
      members: 0, // API doesn't provide members count yet
      image: group.logo, // Fallback image
      description: group.description,
      lastActive: 'Recently', // API doesn't provide this yet
      location: group.city,
      tags: group.tags,
      isAdmin: false, // API doesn't provide admin status yet
    };
  };

  const renderJoinedGroupItem = ({item}: {item: JoinedGroup}) => (
    <GroupCard
      logoSource={{uri: item.image || ''}}
      name={item.name}
      location={item.location || 'Unknown location'}
      tags={item.tags || []}
      currentMembers={item.members}
      onPress={() => {}}
      onJoinPress={() => {}}
      isMember={true}
    />
  );

  const renderExploreGroupItem = ({item}: {item: ExploreGroup}) => (
    <GroupCard
      logoSource={{uri: item.image}}
      name={item.name}
      location={item.location}
      tags={item.tags || []}
      currentMembers={item.members}
      privacy={item.privacy}
      badge={item.badge}
      onPress={() => {}}
      onJoinPress={() => {}}
      isMember={false}
    />
  );

  const handleRefresh = () => {
    refetch().catch(_error => {
      showToast({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to refresh groups',
      });
    });
  };

  const renderJoinedContent = () => {
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
          <Icon name="users" size={48} color={colors.neutral.lightGrey} />
          <Text style={styles.emptyStateTitle}>Something went wrong</Text>
          <Text style={styles.emptyStateSubtitle}>
            We couldn't load your groups. Please try again later.
          </Text>
        </View>
      );
    }

    if (!groups || groups.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Icon name="users" size={48} color={colors.neutral.lightGrey} />
          <Text style={styles.emptyStateTitle}>No Groups Yet</Text>
          <Text style={styles.emptyStateSubtitle}>
            You haven't joined any groups yet. Explore and join motorcycle
            groups to connect with riders.
          </Text>
        </View>
      );
    }

    return (
      <FlatList
        data={groups.map(mapApiGroupToUiGroup)}
        renderItem={renderJoinedGroupItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        onRefresh={handleRefresh}
        refreshing={loading}
      />
    );
  };

  const tabItems = [
    {
      key: 'joined',
      label: 'Joined',
      content: <View style={styles.tabContent}>{renderJoinedContent()}</View>,
    },
    {
      key: 'explore',
      label: 'Explore',
      content: (
        <View style={styles.tabContent}>
          <FlatList
            data={exploreGroups}
            renderItem={renderExploreGroupItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        </View>
      ),
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
    // paddingVertical: spacing.sm,
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
