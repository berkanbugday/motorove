import React, {useState} from 'react';
import {View, StyleSheet} from 'react-native';
import {Tabs} from '@components/Tab';
import {
  UserFollowersExample,
  UserFollowingExample,
} from '@components/UserFollowing';
import {useRoute, RouteProp} from '@react-navigation/native';
import {followerService} from '@services';
import {showToast} from '@components';
import {User} from '../../types';

type FollowersScreenParams = {
  userId?: string;
  initialTab?: 'followers' | 'following';
};

type TabItem = {
  key: string;
  label: string;
};

const TABS: TabItem[] = [
  {key: 'followers', label: 'Followers'},
  {key: 'following', label: 'Following'},
];

const FollowersScreen: React.FC = () => {
  const route =
    useRoute<RouteProp<Record<string, FollowersScreenParams>, string>>();
  const {userId, initialTab = 'followers'} = route.params || {};
  const [activeTab, setActiveTab] = useState<'followers' | 'following'>(
    initialTab,
  );

  const handleFollowUser = async (user: User) => {
    try {
      const success = await followerService.followUser(user.id);
      if (success) {
        showToast({
          type: 'success',
          text1: 'Success',
          text2: `You are now following ${user.firstName || 'this user'}`,
        });
      }
    } catch (error) {
      console.error('Error following user:', error);
      showToast({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to follow user. Please try again.',
      });
    }
  };

  return (
    <View style={styles.container}>
      <Tabs
        items={TABS}
        selectedKey={activeTab}
        onTabChange={(key: string) =>
          setActiveTab(key as 'followers' | 'following')
        }
        variant="underlined"
      />

      {activeTab === 'followers' ? (
        <UserFollowersExample userId={userId} onFollowUser={handleFollowUser} />
      ) : (
        <UserFollowingExample userId={userId} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

export default FollowersScreen;
