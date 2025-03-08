import React from 'react';
import {StyleSheet, TouchableOpacity} from 'react-native';
import {View, Text} from 'react-native-ui-lib';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {TabBar} from '../components/TabBar';
import {Header} from '../components/Header';

const TAB_ITEMS = ['Explore', 'Joined'];

export function GroupsScreen() {
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  const handleFilterPress = () => {
    // Handle filter press
  };

  return (
    <View style={styles.container}>
      <Header
        title="Groups"
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
        <View style={styles.content}>
          {TAB_ITEMS.map(
            (item, index) =>
              selectedIndex === index && (
                <View key={item}>
                  <Text style={styles.contentText}>{item} Content</Text>
                </View>
              ),
          )}
        </View>
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
});
