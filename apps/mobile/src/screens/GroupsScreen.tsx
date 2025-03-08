import React from 'react';
import {StyleSheet} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {View, Text, TabController} from 'react-native-ui-lib';

export function GroupsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text text60 style={styles.headerTitle}>
          Groups
        </Text>
      </View>
      <TabController items={[{label: 'My Groups'}, {label: 'Discover'}]}>
        <TabController.TabBar enableShadow backgroundColor="#fff" />
        <View style={styles.content}>
          <TabController.TabPage index={0}>
            <Text text65>My Groups Content</Text>
          </TabController.TabPage>
          <TabController.TabPage index={1}>
            <Text text65>Discover Groups Content</Text>
          </TabController.TabPage>
        </View>
      </TabController>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    height: 56,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E1E1',
    justifyContent: 'center',
  },
  headerTitle: {
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
});
