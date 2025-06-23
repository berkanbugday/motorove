import React, {useEffect, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {Button} from '@components';
import {
  useCheckIsFollowing,
  useFollowUser,
  useUnfollowUser,
} from '../../services/follow.service';
import {User} from '../../types';

interface UserFollowingProps {
  user: User;
  onFollowStatusChange?: (isFollowing: boolean) => void;
}

/**
 * A component for following/unfollowing a user
 */
const UserFollowing: React.FC<UserFollowingProps> = ({
  user,
  onFollowStatusChange,
}) => {
  const [isUserFollowing, setIsUserFollowing] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const {isFollowing, loading: checkLoading} = useCheckIsFollowing();
  const {followUser, loading: followLoading} = useFollowUser(() => {
    setIsUserFollowing(true);
    onFollowStatusChange?.(true);
  });
  const {unfollowUser, loading: unfollowLoading} = useUnfollowUser(() => {
    setIsUserFollowing(false);
    onFollowStatusChange?.(false);
  });

  // Check if the current user is following the target user
  useEffect(() => {
    const checkFollowingStatus = async () => {
      if (user?.id) {
        const result = await isFollowing(user.id);
        setIsUserFollowing(result);
        setIsLoading(false);
      }
    };

    checkFollowingStatus();
  }, [user?.id, isFollowing]);

  const handleFollowToggle = async () => {
    if (!user?.id) return;

    if (isUserFollowing) {
      await unfollowUser(user.id);
    } else {
      await followUser(user.id);
    }
  };

  const loading = isLoading || checkLoading || followLoading || unfollowLoading;

  return (
    <View style={styles.container}>
      <Button
        title={isUserFollowing ? 'Unfollow' : 'Follow'}
        onPress={handleFollowToggle}
        loading={loading}
        disabled={loading}
        variant={isUserFollowing ? 'outline' : 'primary'}
        style={styles.button}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  button: {
    minWidth: 100,
  },
});

export default UserFollowing;
