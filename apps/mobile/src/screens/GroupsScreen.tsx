import React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ImageSourcePropType,
  ViewStyle,
} from 'react-native';
import {View, Text} from 'react-native-ui-lib';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {TabBar} from '../components/common/TabBar';
import {Header} from '../components/common/Header';
import {StackedList} from '../components/common/StackedList';
import {ButtonProps} from '../components/types/common';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

interface Tag {
  id: string;
  label: string;
}

interface BadgeProps {
  content: string | React.ReactNode;
  style?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  size?: 'small' | 'medium' | 'large';
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  customStyle?: ViewStyle;
}

interface StackedListItemProps {
  image: ImageSourcePropType;
  title: string;
  smallTexts?: string[];
  tags?: Tag[];
  badge?: BadgeProps;
  button?: {
    label: string;
    size?: 'small' | 'medium' | 'large';
    style?: 'square' | 'circle' | 'round';
    onPress?: () => void;
  };
}

type GroupInfo = {
  id: string;
  image: ImageSourcePropType;
  title: string;
  smallTexts: string[];
  tags: Array<{id: string; label: string}>;
  badge?: BadgeProps;
  button?: {
    label: string;
    size?: 'small' | 'medium' | 'large';
    style?: 'square' | 'circle' | 'round';
  };
};

const TAB_ITEMS = ['Explore', 'Joined'];

// Mock data for explore groups with enhanced info
const EXPLORE_GROUPS: GroupInfo[] = [
  {
    id: '1',
    image: {uri: 'https://picsum.photos/200'},
    title: 'Motorcycle Enthusiasts',
    smallTexts: ['1250 members'],
    tags: [
      {id: '1', label: 'Motorcycles'},
      {id: '2', label: 'Adventure'},
    ],
    badge: {
      content: <Icon name="lock" size={12} color="#FFFFFF" />,
      style: 'error',
      size: 'medium',
      position: 'top-left',
    },
    button: {
      label: 'Pending',
      size: 'medium',
      style: 'round',
    },
  },
  {
    id: '2',
    image: {uri: 'https://picsum.photos/201'},
    title: 'Weekend Riders',
    smallTexts: ['500 members'],
    tags: [
      {id: '3', label: 'Rides'},
      {id: '4', label: 'Social'},
    ],
    button: {
      label: 'Join',
      size: 'medium',
      style: 'round',
    },
  },
  {
    id: '3',
    image: {uri: 'https://picsum.photos/202'},
    title: 'Sport Bike Lovers',
    smallTexts: ['750 members'],
    tags: [
      {id: '5', label: 'Sport Bikes'},
      {id: '6', label: 'Racing'},
    ],
    badge: {
      content: <Icon name="lock" size={12} color="#FFFFFF" />,
      style: 'error',
      size: 'medium',
      position: 'top-left',
    },
    button: {
      label: 'Join',
      size: 'medium',
      style: 'round',
    },
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
    button: {
      label: 'Join',
      size: 'medium',
      style: 'round',
    },
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
    button: {
      label: 'Join',
      size: 'medium',
      style: 'round',
    },
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
    badge: {
      content: <Icon name="lock" size={12} color="#FFFFFF" />,
      style: 'error',
      size: 'small',
      position: 'top-left',
    },
    button: {
      label: 'Join',
      size: 'medium',
      style: 'round',
    },
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
    button: {
      label: 'Join',
      size: 'medium',
      style: 'round',
    },
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
    button: {
      label: 'Join',
      size: 'medium',
      style: 'round',
    },
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
    button: {
      label: 'Join',
      size: 'medium',
      style: 'round',
    },
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
    button: {
      label: 'Join',
      size: 'medium',
      style: 'round',
    },
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
    button: {
      label: 'Join',
      size: 'medium',
      style: 'round',
    },
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
    button: {
      label: 'Join',
      size: 'medium',
      style: 'round',
    },
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
    button: {
      label: 'Join',
      size: 'medium',
      style: 'round',
    },
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
    button: {
      label: 'Join',
      size: 'medium',
      style: 'round',
    },
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
    button: {
      label: 'Join',
      size: 'medium',
      style: 'round',
    },
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
    button: {
      label: 'Join',
      size: 'medium',
      style: 'round',
    },
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
    button: {
      label: 'Join',
      size: 'medium',
      style: 'round',
    },
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
    button: {
      label: 'Join',
      size: 'medium',
      style: 'round',
    },
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
    button: {
      label: 'Join',
      size: 'medium',
      style: 'round',
    },
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
    button: {
      label: 'Join',
      size: 'medium',
      style: 'round',
    },
  },
];

// Mock data for joined groups with enhanced info
const JOINED_GROUPS: GroupInfo[] = [
  {
    id: '21',
    image: {uri: 'https://picsum.photos/220'},
    title: 'Local Riders Club',
    smallTexts: ['85 members'],
    tags: [
      {id: '41', label: 'Local'},
      {id: '42', label: 'Community'},
    ],
    badge: {
      content: <Icon name="lock" size={12} color="#FFFFFF" />,
      style: 'error',
      size: 'medium',
      position: 'top-left',
    },
    button: {
      label: 'Joined',
      size: 'medium',
      style: 'round',
    },
  },
  {
    id: '22',
    image: {uri: 'https://picsum.photos/221'},
    title: 'Mountain Roads',
    smallTexts: ['1000 members'],
    tags: [
      {id: '43', label: 'Mountains'},
      {id: '44', label: 'Scenic'},
    ],
    button: {
      label: 'Joined',
      size: 'medium',
      style: 'round',
    },
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
    button: {
      label: 'Joined',
      size: 'medium',
      style: 'round',
    },
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
    button: {
      label: 'Joined',
      size: 'medium',
      style: 'round',
    },
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
    button: {
      label: 'Joined',
      size: 'medium',
      style: 'round',
    },
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
    button: {
      label: 'Joined',
      size: 'medium',
      style: 'round',
    },
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
    button: {
      label: 'Joined',
      size: 'medium',
      style: 'round',
    },
  },
];

// Add suggested groups data
const SUGGESTED_GROUPS = EXPLORE_GROUPS.slice(0, 3);

interface GroupsScreenProps {
  navigation: NativeStackNavigationProp<any>;
}

export function GroupsScreen({navigation}: GroupsScreenProps) {
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

  const handleGroupPress = (group: GroupInfo) => {
    navigation.navigate('GroupDetail', {
      groupId: group.id,
      groupName: group.title,
      groupImage: group.image,
    });
  };

  const renderGroupInfo = (group: GroupInfo): StackedListItemProps => ({
    image: group.image,
    title: group.title,
    smallTexts: group.smallTexts,
    tags: group.tags,
    badge: group.badge,
    button: group.button
      ? {
          ...group.button,
          onPress: () => console.log('Button pressed for group:', group.id),
        }
      : undefined,
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
                items={filteredSuggestedGroups.map(renderGroupInfo)}
                onItemPress={index =>
                  handleGroupPress(filteredSuggestedGroups[index])
                }
              />
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>All Groups</Text>
              </View>
              <StackedList
                layout="vertical"
                items={filteredExploreGroups.map(renderGroupInfo)}
                onItemPress={index =>
                  handleGroupPress(filteredExploreGroups[index])
                }
              />
            </>
          ) : (
            <StackedList
              layout="vertical"
              items={filteredJoinedGroups.map(renderGroupInfo)}
              onItemPress={index =>
                handleGroupPress(filteredJoinedGroups[index])
              }
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
