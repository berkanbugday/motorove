import {TopHeaderBar} from '@components/TopHeaderBar';
import React from 'react';
import {View, StyleSheet} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

/**
 * Settings Screen - Placeholder for the settings tab
 */
export const GroupScreen = () => {
  return (
    <View style={styles.container}>
      <TopHeaderBar
        title="Groups"
        // showShadow={false}
        containerStyle={styles.topHeaderBar}
        rightIconName="search"
        onRightButtonPress={() => {}}
      />
      <SafeAreaView style={styles.container}></SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  topHeaderBar: {
    borderBottomEndRadius: 0,
    borderBottomStartRadius: 0,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
});
