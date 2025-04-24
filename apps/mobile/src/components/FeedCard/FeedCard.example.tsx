import React from 'react';
import {ScrollView, View, StyleSheet} from 'react-native';
import {FeedCard} from './index';
import {spacing} from '@theme';

const FeedCardExample = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <FeedCard
          avatarSource={require('@assets/images/default-avatar.png')}
          userName="Michael Thompson"
          timeAgo="2h ago"
          labels={[
            {icon: 'users', text: 'Mountain Bikers Club'},
            {icon: 'map-pin', text: 'Colorado Springs'},
          ]}
          content="Just completed an incredible 25-mile mountain trail ride through Garden of the Gods! The red rock formations were breathtaking."
          image={require('@assets/images/placeholder-image.jpg')}
          routeTitle="Garden of the Gods Loop"
          likeCount={128}
          commentCount={12}
          onPress={() => console.log('Feed card pressed')}
          onRoutePress={() => console.log('View route pressed')}
          onLikePress={() => console.log('Like pressed')}
          onCommentPress={() => console.log('Comment pressed')}
          onSavePress={() => console.log('Save pressed')}
        />

        {/* A simpler feed card example */}
        <FeedCard
          avatarSource={require('@assets/images/default-avatar.png')}
          userName="Sarah Johnson"
          timeAgo="5h ago"
          labels={[{icon: 'users', text: 'Road Cycling Group'}]}
          content="New personal best on my usual route today! Perfect weather for a long ride."
          likeCount={67}
          commentCount={8}
          onPress={() => console.log('Feed card pressed')}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
  },
});

export default FeedCardExample;
