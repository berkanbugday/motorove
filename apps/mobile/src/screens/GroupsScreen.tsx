import React from 'react';
import {StyleSheet, TouchableOpacity, ScrollView} from 'react-native';
import {View, Text} from 'react-native-ui-lib';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {TabBar} from '../components/TabBar';
import {Header} from '../components/Header';
import {GroupCard} from '../components/GroupCard';

const TAB_ITEMS = ['Explore', 'Joined'];

// Example data
const EXAMPLE_GROUPS = [
  {
    id: '1',
    image: {uri: 'https://picsum.photos/200'},
    title: 'Motorcycle Enthusiasts',
    subtitle: 'Public Group • 1.2k members',
    description:
      'A community for motorcycle lovers to share their passion, experiences, and tips.',
    smallTexts: ['Created Jan 2024', 'Active 2h ago'],
    chips: [
      {id: '1', label: 'Motorcycles'},
      {id: '2', label: 'Adventure'},
    ],
  },
  {
    id: '2',
    image: {uri: 'https://picsum.photos/201'},
    title: 'Weekend Riders',
    subtitle: 'Private Group • 450 members',
    description: 'Group for organizing weekend motorcycle rides and meetups.',
    smallTexts: ['Created Mar 2024', 'Active 5m ago'],
    chips: [
      {id: '3', label: 'Rides'},
      {id: '4', label: 'Social'},
    ],
  },
];

export function GroupsScreen() {
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  const handleFilterPress = () => {
    // Handle filter press
  };

  const renderGroups = () => {
    return EXAMPLE_GROUPS.map(group => (
      <GroupCard
        key={group.id}
        image={group.image}
        imageStyle="square"
        title={group.title}
        subtitle={group.subtitle}
        description={group.description}
        smallTexts={group.smallTexts}
        chips={group.chips}
      />
    ));
  };

  return (
    <View style={styles.container}>
      <Header
        title="Groups"
        onSearch={text => {
          // Handle search text changes here
          console.log('Search text:', text);
        }}
        onSubmitSearch={text => console.log('Search submitted:', text)}
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
        <ScrollView style={styles.content}>
          {selectedIndex === 0 ? (
            renderGroups()
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No joined groups yet</Text>
            </View>
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
    padding: 16,
  },
  contentText: {
    fontSize: 16,
  },
  iconButton: {
    padding: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 32,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666666',
  },
});
