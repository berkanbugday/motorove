import React from 'react';
import {StyleSheet} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {View, Text} from 'react-native-ui-lib';
import {TabBar} from '../components/TabBar';

const TAB_ITEMS = [
  'My Groups',
  'Discover',
  'Popular',
  'Trending',
  'New',
  'Sports',
  'Gaming',
  'Music',
  'Tech',
  'Art',
];

export function GroupsScreen() {
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  return (
    <SafeAreaView style={styles.container}>
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
    </SafeAreaView>
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
});
