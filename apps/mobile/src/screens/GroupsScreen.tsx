import React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from 'react-native';
import {View, Text} from 'react-native-ui-lib';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {TabBar} from '../components/common/TabBar';
import {Header} from '../components/common/Header';
import {Card} from '../components/common/Card';
import {StackedList} from '../components/common/StackedList';

const TAB_ITEMS = ['Explore', 'Joined'];

// Enhanced group type with additional info
type GroupInfo = {
  id: string;
  image: {uri: string};
  title: string;
  smallTexts: string[];
  tags: Array<{id: string; label: string}>;
  isPrivate: boolean;
  memberCount: number;
};

// Mock data for explore groups with enhanced info
const EXPLORE_GROUPS: GroupInfo[] = [
  {
    id: '1',
    image: {uri: 'https://picsum.photos/200'},
    title: 'Motorcycle Enthusiasts',
    smallTexts: ['Created Jan 2024', 'Active 2h ago'],
    tags: [
      {id: '1', label: 'Motorcycles'},
      {id: '2', label: 'Adventure'},
    ],
    isPrivate: true,
    memberCount: 1250,
  },
  {
    id: '2',
    image: {uri: 'https://picsum.photos/201'},
    title: 'Weekend Riders',
    smallTexts: ['Created Mar 2024', 'Active 5m ago'],
    tags: [
      {id: '3', label: 'Rides'},
      {id: '4', label: 'Social'},
    ],
    isPrivate: false,
    memberCount: 500,
  },
  {
    id: '3',
    image: {uri: 'https://picsum.photos/202'},
    title: 'Sport Bike Lovers',
    smallTexts: ['Created Feb 2024', 'Active 1h ago'],
    tags: [
      {id: '5', label: 'Sport Bikes'},
      {id: '6', label: 'Racing'},
    ],
    isPrivate: false,
    memberCount: 750,
  },
  {
    id: '4',
    image: {uri: 'https://picsum.photos/203'},
    title: 'Cruiser Community',
    smallTexts: ['Created Dec 2023', 'Active 30m ago'],
    tags: [
      {id: '7', label: 'Cruisers'},
      {id: '8', label: 'Touring'},
    ],
    isPrivate: false,
    memberCount: 600,
  },
  {
    id: '5',
    image: {uri: 'https://picsum.photos/204'},
    title: 'Adventure Riders',
    smallTexts: ['Created Mar 2024', 'Active 15m ago'],
    tags: [
      {id: '9', label: 'ADV'},
      {id: '10', label: 'Off-road'},
    ],
    isPrivate: false,
    memberCount: 800,
  },
  {
    id: '6',
    image: {uri: 'https://picsum.photos/205'},
    title: 'Cafe Racer Club',
    smallTexts: ['Created Jan 2024', 'Active 4h ago'],
    tags: [
      {id: '11', label: 'Cafe Racers'},
      {id: '12', label: 'Custom'},
    ],
    isPrivate: false,
    memberCount: 450,
  },
  {
    id: '7',
    image: {uri: 'https://picsum.photos/206'},
    title: 'Track Day Heroes',
    smallTexts: ['Created Feb 2024', 'Active 1d ago'],
    tags: [
      {id: '13', label: 'Track'},
      {id: '14', label: 'Racing'},
    ],
    isPrivate: false,
    memberCount: 900,
  },
  {
    id: '8',
    image: {uri: 'https://picsum.photos/207'},
    title: 'Vintage Motorcycle Club',
    smallTexts: ['Created Nov 2023', 'Active 3h ago'],
    tags: [
      {id: '15', label: 'Vintage'},
      {id: '16', label: 'Classic'},
    ],
    isPrivate: false,
    memberCount: 700,
  },
  {
    id: '9',
    image: {uri: 'https://picsum.photos/208'},
    title: 'Urban Riders',
    smallTexts: ['Created Mar 2024', 'Active 45m ago'],
    tags: [
      {id: '17', label: 'City'},
      {id: '18', label: 'Commuting'},
    ],
    isPrivate: false,
    memberCount: 550,
  },
  {
    id: '10',
    image: {uri: 'https://picsum.photos/209'},
    title: 'Touring Enthusiasts',
    smallTexts: ['Created Jan 2024', 'Active 6h ago'],
    tags: [
      {id: '19', label: 'Touring'},
      {id: '20', label: 'Long Distance'},
    ],
    isPrivate: false,
    memberCount: 650,
  },
  {
    id: '11',
    image: {uri: 'https://picsum.photos/210'},
    title: 'Dual Sport Group',
    smallTexts: ['Created Mar 2024', 'Active 2d ago'],
    tags: [
      {id: '21', label: 'Dual Sport'},
      {id: '22', label: 'Adventure'},
    ],
    isPrivate: false,
    memberCount: 700,
  },
  {
    id: '12',
    image: {uri: 'https://picsum.photos/211'},
    title: 'Night Riders',
    smallTexts: ['Created Feb 2024', 'Active 8h ago'],
    tags: [
      {id: '23', label: 'Night Rides'},
      {id: '24', label: 'Urban'},
    ],
    isPrivate: false,
    memberCount: 400,
  },
  {
    id: '13',
    image: {uri: 'https://picsum.photos/212'},
    title: 'Moto Mechanics',
    smallTexts: ['Created Dec 2023', 'Active 1d ago'],
    tags: [
      {id: '25', label: 'DIY'},
      {id: '26', label: 'Maintenance'},
    ],
    isPrivate: false,
    memberCount: 300,
  },
  {
    id: '14',
    image: {uri: 'https://picsum.photos/213'},
    title: 'Women Riders',
    smallTexts: ['Created Jan 2024', 'Active 3h ago'],
    tags: [
      {id: '27', label: 'Women'},
      {id: '28', label: 'Community'},
    ],
    isPrivate: false,
    memberCount: 250,
  },
  {
    id: '15',
    image: {uri: 'https://picsum.photos/214'},
    title: 'Beginner Riders',
    smallTexts: ['Created Mar 2024', 'Active 4h ago'],
    tags: [
      {id: '29', label: 'Beginners'},
      {id: '30', label: 'Learning'},
    ],
    isPrivate: false,
    memberCount: 150,
  },
  {
    id: '16',
    image: {uri: 'https://picsum.photos/215'},
    title: 'Moto Photographers',
    smallTexts: ['Created Feb 2024', 'Active 12h ago'],
    tags: [
      {id: '31', label: 'Photography'},
      {id: '32', label: 'Art'},
    ],
    isPrivate: false,
    memberCount: 200,
  },
  {
    id: '17',
    image: {uri: 'https://picsum.photos/216'},
    title: 'Moto Campers',
    smallTexts: ['Created Jan 2024', 'Active 2d ago'],
    tags: [
      {id: '33', label: 'Camping'},
      {id: '34', label: 'Adventure'},
    ],
    isPrivate: false,
    memberCount: 350,
  },
  {
    id: '18',
    image: {uri: 'https://picsum.photos/217'},
    title: 'Stunt Riders',
    smallTexts: ['Created Mar 2024', 'Active 6h ago'],
    tags: [
      {id: '35', label: 'Stunts'},
      {id: '36', label: 'Skills'},
    ],
    isPrivate: false,
    memberCount: 400,
  },
  {
    id: '19',
    image: {uri: 'https://picsum.photos/218'},
    title: 'Moto Vloggers',
    smallTexts: ['Created Feb 2024', 'Active 1d ago'],
    tags: [
      {id: '37', label: 'Vlogging'},
      {id: '38', label: 'Content'},
    ],
    isPrivate: false,
    memberCount: 300,
  },
  {
    id: '20',
    image: {uri: 'https://picsum.photos/219'},
    title: 'Green Riders',
    smallTexts: ['Created Jan 2024', 'Active 5h ago'],
    tags: [
      {id: '39', label: 'Electric'},
      {id: '40', label: 'Eco-friendly'},
    ],
    isPrivate: false,
    memberCount: 200,
  },
];

// Mock data for joined groups with enhanced info
const JOINED_GROUPS: GroupInfo[] = [
  {
    id: '21',
    image: {uri: 'https://picsum.photos/220'},
    title: 'Local Riders Club',
    smallTexts: ['Joined Feb 2024', 'Active 1h ago'],
    tags: [
      {id: '41', label: 'Local'},
      {id: '42', label: 'Community'},
    ],
    isPrivate: true,
    memberCount: 85,
  },
  {
    id: '22',
    image: {uri: 'https://picsum.photos/221'},
    title: 'Mountain Roads',
    smallTexts: ['Joined Mar 2024', 'Active 30m ago'],
    tags: [
      {id: '43', label: 'Mountains'},
      {id: '44', label: 'Scenic'},
    ],
    isPrivate: false,
    memberCount: 1000,
  },
  {
    id: '23',
    image: {uri: 'https://picsum.photos/222'},
    title: 'City Commuters',
    smallTexts: ['Joined Jan 2024', 'Active 2h ago'],
    tags: [
      {id: '45', label: 'Commuting'},
      {id: '46', label: 'Urban'},
    ],
    isPrivate: false,
    memberCount: 700,
  },
  {
    id: '24',
    image: {uri: 'https://picsum.photos/223'},
    title: 'Weekend Warriors',
    smallTexts: ['Joined Mar 2024', 'Active 4h ago'],
    tags: [
      {id: '47', label: 'Weekend'},
      {id: '48', label: 'Group Rides'},
    ],
    isPrivate: false,
    memberCount: 1200,
  },
  {
    id: '25',
    image: {uri: 'https://picsum.photos/224'},
    title: 'Moto Gear Reviews',
    smallTexts: ['Joined Feb 2024', 'Active 1d ago'],
    tags: [
      {id: '49', label: 'Gear'},
      {id: '50', label: 'Reviews'},
    ],
    isPrivate: false,
    memberCount: 500,
  },
  {
    id: '26',
    image: {uri: 'https://picsum.photos/225'},
    title: 'Track Day Group',
    smallTexts: ['Joined Jan 2024', 'Active 3h ago'],
    tags: [
      {id: '51', label: 'Track'},
      {id: '52', label: 'Performance'},
    ],
    isPrivate: false,
    memberCount: 800,
  },
  {
    id: '27',
    image: {uri: 'https://picsum.photos/226'},
    title: 'Custom Builders',
    smallTexts: ['Joined Mar 2024', 'Active 5h ago'],
    tags: [
      {id: '53', label: 'Custom'},
      {id: '54', label: 'Building'},
    ],
    isPrivate: false,
    memberCount: 600,
  },
  {
    id: '28',
    image: {uri: 'https://picsum.photos/227'},
    title: 'Vintage Lovers',
    smallTexts: ['Joined Feb 2024', 'Active 2d ago'],
    tags: [
      {id: '55', label: 'Classic'},
      {id: '56', label: 'Restoration'},
    ],
    isPrivate: false,
    memberCount: 400,
  },
  {
    id: '29',
    image: {uri: 'https://picsum.photos/228'},
    title: 'Safety First',
    smallTexts: ['Joined Jan 2024', 'Active 6h ago'],
    tags: [
      {id: '57', label: 'Safety'},
      {id: '58', label: 'Training'},
    ],
    isPrivate: false,
    memberCount: 300,
  },
  {
    id: '30',
    image: {uri: 'https://picsum.photos/229'},
    title: 'Moto Events',
    smallTexts: ['Joined Mar 2024', 'Active 8h ago'],
    tags: [
      {id: '59', label: 'Events'},
      {id: '60', label: 'Meetups'},
    ],
    isPrivate: false,
    memberCount: 500,
  },
  {
    id: '31',
    image: {uri: 'https://picsum.photos/230'},
    title: 'Tech Talk',
    smallTexts: ['Joined Feb 2024', 'Active 1d ago'],
    tags: [
      {id: '61', label: 'Technical'},
      {id: '62', label: 'Maintenance'},
    ],
    isPrivate: false,
    memberCount: 250,
  },
  {
    id: '32',
    image: {uri: 'https://picsum.photos/231'},
    title: 'Road Trip Planning',
    smallTexts: ['Joined Jan 2024', 'Active 4h ago'],
    tags: [
      {id: '63', label: 'Travel'},
      {id: '64', label: 'Planning'},
    ],
    isPrivate: false,
    memberCount: 400,
  },
  {
    id: '33',
    image: {uri: 'https://picsum.photos/232'},
    title: 'New Riders Support',
    smallTexts: ['Joined Mar 2024', 'Active 2h ago'],
    tags: [
      {id: '65', label: 'New Riders'},
      {id: '66', label: 'Support'},
    ],
    isPrivate: false,
    memberCount: 200,
  },
  {
    id: '34',
    image: {uri: 'https://picsum.photos/233'},
    title: 'Moto Photography',
    smallTexts: ['Joined Feb 2024', 'Active 5h ago'],
    tags: [
      {id: '67', label: 'Photos'},
      {id: '68', label: 'Art'},
    ],
    isPrivate: false,
    memberCount: 300,
  },
  {
    id: '35',
    image: {uri: 'https://picsum.photos/234'},
    title: 'Adventure Planning',
    smallTexts: ['Joined Jan 2024', 'Active 7h ago'],
    tags: [
      {id: '69', label: 'Adventure'},
      {id: '70', label: 'Planning'},
    ],
    isPrivate: false,
    memberCount: 250,
  },
  {
    id: '36',
    image: {uri: 'https://picsum.photos/235'},
    title: 'Race Fans',
    smallTexts: ['Joined Mar 2024', 'Active 9h ago'],
    tags: [
      {id: '71', label: 'Racing'},
      {id: '72', label: 'MotoGP'},
    ],
    isPrivate: false,
    memberCount: 1000,
  },
  {
    id: '37',
    image: {uri: 'https://picsum.photos/236'},
    title: 'Bike Maintenance',
    smallTexts: ['Joined Feb 2024', 'Active 3d ago'],
    tags: [
      {id: '73', label: 'DIY'},
      {id: '74', label: 'Repairs'},
    ],
    isPrivate: false,
    memberCount: 200,
  },
  {
    id: '38',
    image: {uri: 'https://picsum.photos/237'},
    title: 'Group Rides',
    smallTexts: ['Joined Jan 2024', 'Active 10h ago'],
    tags: [
      {id: '75', label: 'Group'},
      {id: '76', label: 'Social'},
    ],
    isPrivate: false,
    memberCount: 700,
  },
  {
    id: '39',
    image: {uri: 'https://picsum.photos/238'},
    title: 'Moto Stories',
    smallTexts: ['Joined Mar 2024', 'Active 12h ago'],
    tags: [
      {id: '77', label: 'Stories'},
      {id: '78', label: 'Experiences'},
    ],
    isPrivate: false,
    memberCount: 300,
  },
  {
    id: '40',
    image: {uri: 'https://picsum.photos/239'},
    title: 'Eco Riders',
    smallTexts: ['Joined Feb 2024', 'Active 2d ago'],
    tags: [
      {id: '79', label: 'Electric'},
      {id: '80', label: 'Sustainable'},
    ],
    isPrivate: false,
    memberCount: 200,
  },
];

// Add suggested groups data
const SUGGESTED_GROUPS = EXPLORE_GROUPS.slice(0, 5);

export function GroupsScreen() {
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [refreshing, setRefreshing] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filteredExploreGroups, setFilteredExploreGroups] =
    React.useState(EXPLORE_GROUPS);
  const [filteredJoinedGroups, setFilteredJoinedGroups] =
    React.useState(JOINED_GROUPS);
  const [filteredSuggestedGroups, setFilteredSuggestedGroups] =
    React.useState(SUGGESTED_GROUPS);

  const handleFilterPress = () => {
    // Handle filter press
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setFilteredExploreGroups(EXPLORE_GROUPS);
      setFilteredJoinedGroups(JOINED_GROUPS);
      setFilteredSuggestedGroups(SUGGESTED_GROUPS);
      setRefreshing(false);
    }, 1000);
  }, []);

  const handleSearch = (text: string) => {
    const query = text.toLowerCase();

    // Filter explore groups
    const filteredExplore = EXPLORE_GROUPS.filter(
      group =>
        group.title.toLowerCase().includes(query) ||
        group.tags.some(tag => tag.label.toLowerCase().includes(query)),
    );
    setFilteredExploreGroups(filteredExplore);

    // Filter suggested groups
    const filteredSuggested = SUGGESTED_GROUPS.filter(
      group =>
        group.title.toLowerCase().includes(query) ||
        group.tags.some(tag => tag.label.toLowerCase().includes(query)),
    );
    setFilteredSuggestedGroups(filteredSuggested);

    // Filter joined groups
    const filteredJoined = JOINED_GROUPS.filter(
      group =>
        group.title.toLowerCase().includes(query) ||
        group.tags.some(tag => tag.label.toLowerCase().includes(query)),
    );
    setFilteredJoinedGroups(filteredJoined);
  };

  const renderGroupInfo = (group: GroupInfo) => ({
    ...group,
    rightContent: (
      <View style={styles.groupInfo}>
        <Icon
          name={group.isPrivate ? 'lock' : 'lock-open-variant'}
          size={16}
          color={group.isPrivate ? '#FF9500' : '#34C759'}
        />
        <Text style={styles.memberCount}>
          {group.memberCount.toLocaleString()} members
        </Text>
      </View>
    ),
  });

  return (
    <View style={styles.container}>
      <Header
        title="Groups"
        onSearch={text => {
          setSearchQuery(text);
          if (text.length === 0) {
            onRefresh();
          }
        }}
        onSubmitSearch={handleSearch}
        onClearSearch={() => {
          if (searchQuery.length !== 0) {
            setSearchQuery('');
            onRefresh();
          }
        }}
        onCloseSearch={() => {
          if (searchQuery.length !== 0) {
            setSearchQuery('');
            onRefresh();
          }
        }}
        rightComponent={
          <TouchableOpacity
            onPress={handleFilterPress}
            style={styles.iconButton}>
            <Icon name="filter-variant" size={24} color="#000000" />
          </TouchableOpacity>
        }
      />
      <View flex>
        <TabBar
          items={TAB_ITEMS}
          selectedIndex={selectedIndex}
          onTabPress={setSelectedIndex}
        />
        <ScrollView
          style={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }>
          {selectedIndex === 0 ? (
            <>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Suggested for You</Text>
              </View>
              <StackedList
                layout="vertical"
                button={{
                  label: 'Join',
                  onPress: () => console.log('Join group'),
                  size: 'medium',
                  style: 'round',
                }}
                items={filteredSuggestedGroups.map(renderGroupInfo)}
                onItemPress={index =>
                  console.log('Pressed suggested group:', index)
                }
              />
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>All Groups</Text>
              </View>
              <StackedList
                layout="vertical"
                button={{
                  label: 'Join',
                  onPress: () => console.log('Join group'),
                  size: 'medium',
                  style: 'round',
                }}
                items={filteredExploreGroups.map(renderGroupInfo)}
                onItemPress={index =>
                  console.log('Pressed explore group:', index)
                }
              />
            </>
          ) : (
            <StackedList
              layout="vertical"
              button={{
                label: 'View',
                onPress: () => console.log('View group'),
                size: 'medium',
                style: 'round',
              }}
              items={filteredJoinedGroups.map(renderGroupInfo)}
              onItemPress={index => console.log('Pressed joined group:', index)}
            />
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 8,
  },
  iconButton: {
    padding: 8,
  },
  sectionHeader: {
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  groupInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 8,
  },
  memberCount: {
    fontSize: 12,
    color: '#8E8E93',
  },
});
