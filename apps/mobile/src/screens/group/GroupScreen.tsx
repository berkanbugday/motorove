import {TopHeaderBar} from '@components/TopHeaderBar';
import {colors, spacing} from '@theme';
import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
} from 'react-native';
import {Tabs} from '@components/Tab';
import {Icon} from '@components/Icon';
import {FAB} from '@components/FAB';

// Define types for our data
interface JoinedGroup {
  id: string;
  name: string;
  members: number;
  image: string;
  description: string;
  lastActive: string;
  isAdmin: boolean;
}

interface ExploreGroup {
  id: string;
  name: string;
  members: number;
  image: string;
  description: string;
  location: string;
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
  },
  {
    id: '5',
    name: 'Vintage Motorcycle Club',
    members: 38,
    image: 'https://picsum.photos/id/21/500/300',
    description: 'For collectors and enthusiasts of vintage motorcycles.',
    location: 'Istanbul',
  },
  {
    id: '6',
    name: 'Sport Bike Racers',
    members: 72,
    image: 'https://picsum.photos/id/24/500/300',
    description: 'Track day enthusiasts and sport bike lovers.',
    location: 'Ankara',
  },
  {
    id: '7',
    name: 'Weekend Touring Group',
    members: 45,
    image: 'https://picsum.photos/id/26/500/300',
    description: 'Organizing weekend tours and long-distance rides.',
    location: 'Izmir',
  },
];

/**
 * Groups Screen - Displays user groups and allows discovery of new groups
 */
export const GroupScreen = () => {
  const [activeTab, setActiveTab] = useState('joined');

  const renderJoinedGroupItem = ({item}: {item: JoinedGroup}) => (
    <TouchableOpacity style={styles.groupCard}>
      <Image source={{uri: item.image}} style={styles.groupImage} />
      <View style={styles.groupInfo}>
        <View style={styles.groupHeader}>
          <Text style={styles.groupName}>{item.name}</Text>
          {item.isAdmin && (
            <View style={styles.adminBadge}>
              <Text style={styles.adminText}>Admin</Text>
            </View>
          )}
        </View>
        <Text style={styles.groupDescription}>{item.description}</Text>
        <View style={styles.groupFooter}>
          <View style={styles.memberInfo}>
            <Icon name="users" size={16} color={colors.neutral.grey} />
            <Text style={styles.memberCount}>{item.members} members</Text>
          </View>
          <Text style={styles.lastActive}>Active {item.lastActive}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderExploreGroupItem = ({item}: {item: ExploreGroup}) => (
    <TouchableOpacity style={styles.groupCard}>
      <Image source={{uri: item.image}} style={styles.groupImage} />
      <View style={styles.groupInfo}>
        <Text style={styles.groupName}>{item.name}</Text>
        <Text style={styles.groupDescription}>{item.description}</Text>
        <View style={styles.groupFooter}>
          <View style={styles.memberInfo}>
            <Icon name="users" size={16} color={colors.neutral.grey} />
            <Text style={styles.memberCount}>{item.members} members</Text>
          </View>
          <View style={styles.locationContainer}>
            <Icon name="map-pin" size={16} color={colors.neutral.grey} />
            <Text style={styles.locationText}>{item.location}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.joinButton}>
          <Text style={styles.joinButtonText}>Join Group</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
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
            ListHeaderComponent={
              <View style={styles.exploreHeader}>
                <Text style={styles.exploreHeaderText}>
                  Discover groups to connect with fellow riders
                </Text>
              </View>
            }
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
        rightIconName="search"
        onRightButtonPress={() => {}}
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
      <FAB
        icon={<Icon name="plus" />}
        onPress={() => {}}
        accessibilityLabel="Create new group"
        variant="custom"
        backgroundColor={colors.neutral.black}
        position="custom"
        customPosition={{
          bottom: 120,
          right: 30,
        }}
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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  tabContent: {
    flex: 1,
    paddingBottom: spacing.lg,
  },
  listContainer: {
    padding: spacing.md,
  },
  groupCard: {
    backgroundColor: colors.neutral.white,
    borderRadius: 12,
    marginBottom: spacing.lg,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  groupImage: {
    height: 130,
    width: '100%',
    resizeMode: 'cover',
  },
  groupInfo: {
    padding: spacing.md,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  groupName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.neutral.black,
    flex: 1,
  },
  adminBadge: {
    backgroundColor: colors.primary.light,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 4,
  },
  adminText: {
    fontSize: 12,
    color: colors.primary.main,
    fontWeight: '500',
  },
  groupDescription: {
    fontSize: 14,
    color: colors.neutral.grey,
    marginBottom: spacing.sm,
  },
  groupFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberCount: {
    fontSize: 13,
    color: colors.neutral.grey,
    marginLeft: spacing.xs,
  },
  lastActive: {
    fontSize: 13,
    color: colors.neutral.grey,
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
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 13,
    color: colors.neutral.grey,
    marginLeft: spacing.xs,
  },
  joinButton: {
    backgroundColor: colors.primary.main,
    borderRadius: 8,
    paddingVertical: spacing.xs,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  joinButtonText: {
    color: colors.neutral.white,
    fontWeight: '600',
    fontSize: 14,
  },
});
