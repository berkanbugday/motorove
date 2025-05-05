import {TopHeaderBar} from '@components/TopHeaderBar';
import {colors, spacing} from '@theme';
import React, {useState} from 'react';
import {View, StyleSheet, Text, FlatList} from 'react-native';
import {Tabs} from '@components/Tab';
import {Icon, GroupCard} from '@components';
import {FAB} from '@components/FAB';
import {useNavigation} from '@react-navigation/native';
import {MainScreenNavigationProp} from '@navigation/types/navigationTypes';

// Define types for our data
interface JoinedGroup {
  id: string;
  name: string;
  members: number;
  image: string;
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

// Mock data for user's joined groups
const joinedGroups: JoinedGroup[] = [
  {
    id: '1',
    name: 'Coastal Riders Club',
    members: 34,
    image: 'https://picsum.photos/id/88/500/300',
    description: 'Group for motorcycle enthusiasts who love coastal rides.',
    lastActive: '2 hours ago',
    location: 'Los Angeles',
    tags: ['Touring', 'Off-Road'],
    badge: {
      text: 'Official',
      backgroundColor: colors.primary.light,
      textColor: colors.neutral.white,
    },
    isAdmin: true,
  },
  {
    id: '2',
    name: 'Adventure Motorcycles',
    members: 42,
    image: 'https://picsum.photos/id/29/500/300',
    description: 'For riders who love off-road and mountain adventures.',
    lastActive: 'Yesterday',
    isAdmin: false,
  },
  {
    id: '3',
    name: 'Urban Moto Group',
    members: 27,
    image: 'https://picsum.photos/id/43/500/300',
    description: 'City riders sharing urban routes and meetups.',
    lastActive: '3 days ago',
    isAdmin: false,
  },
];

// Mock data for groups to explore
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

  const renderJoinedGroupItem = ({item}: {item: JoinedGroup}) => (
    <GroupCard
      logoSource={{uri: item.image}}
      name={item.name}
      location="Location" // Placeholder since JoinedGroup doesn't have location
      tags={[item.isAdmin ? 'Admin' : '']} // Show admin status as a tag
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

  const tabItems = [
    {
      key: 'joined',
      label: 'Joined',
      content: (
        <View style={styles.tabContent}>
          {joinedGroups.length > 0 ? (
            <FlatList
              data={joinedGroups}
              renderItem={renderJoinedGroupItem}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.listContainer}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.emptyState}>
              <Icon name="users" size={48} color={colors.neutral.lightGrey} />
              <Text style={styles.emptyStateTitle}>No Groups Yet</Text>
              <Text style={styles.emptyStateSubtitle}>
                You haven't joined any groups yet. Explore and join motorcycle
                groups to connect with riders.
              </Text>
            </View>
          )}
        </View>
      ),
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
            // ListHeaderComponent={
            //   <View style={styles.exploreHeader}>
            //     <Text style={styles.exploreHeaderText}>
            //       Discover groups to connect with fellow riders
            //     </Text>
            //   </View>
            // }
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
        secondRightIconName="search"
        onSecondRightButtonPress={() => {}}
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

      {/* FAB Component */}
      {/* <FAB
        icon={<Icon name="plus" />}
        shape="extended"
        onPress={() => navigation.navigate('CreateGroup')}
        size="small"
        label="Create Group"
        variant="primary"
        position="bottomCenter"
      /> */}
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
});
