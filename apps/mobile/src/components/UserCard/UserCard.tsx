import React, {useState, useCallback, useEffect} from 'react';
import {View, Image, TouchableOpacity} from 'react-native';
import {colors} from '@theme';
import {Typography} from '@components/Typography';
import {Button} from '@components/Button';
import {Icon} from '@components/Icon';
import {User} from '../../types';
import {useFollowUser, useUnfollowUser} from '@services/follow.service';
import {styles} from './UserCard.styles';

interface UserCardProps {
  user: User;
  onPress?: () => void;
  onFollowStatusChange?: (isFollowing: boolean) => void;
  style?: any;
}

/**
 * UserCard component - displays user information with follow/unfollow button
 */
export const UserCard: React.FC<UserCardProps> = ({
  user,
  onPress,
  onFollowStatusChange,
  style,
}) => {
  // Use local state for immediate UI feedback and follow status
  const [loading, setLoading] = useState<boolean>(false);
  const [isFollowing, setIsFollowing] = useState<boolean>(
    user.isFollowing || false,
  );

  // Update local state when user prop changes
  useEffect(() => {
    setIsFollowing(user.isFollowing || false);
  }, [user.isFollowing]);

  // Follow and unfollow mutations with callbacks to update local state
  const {followUser} = useFollowUser((newStatus: boolean) => {
    setIsFollowing(newStatus);
    if (onFollowStatusChange) {
      onFollowStatusChange(newStatus);
    }
    setLoading(false);
  });

  const {unfollowUser} = useUnfollowUser((newStatus: boolean) => {
    setIsFollowing(newStatus);
    if (onFollowStatusChange) {
      onFollowStatusChange(newStatus);
    }
    setLoading(false);
  });

  const handleFollowPress = useCallback(async () => {
    if (loading) {
      return;
    }

    try {
      setLoading(true);

      // Perform the follow/unfollow operation
      // The callbacks will handle updating the UI after the server responds
      if (isFollowing) {
        await unfollowUser(user.id);
      } else {
        await followUser(user.id);
      }
    } catch (error) {
      console.error('Error toggling follow status:', error);
      setLoading(false);
    }
  }, [loading, isFollowing, user.id, followUser, unfollowUser]);

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.container, style]}
      activeOpacity={0.8}
      disabled={!onPress}>
      <View style={styles.content}>
        <View style={styles.avatarContainer}>
          <Image
            source={
              user.avatar
                ? {uri: user.avatar}
                : require('@assets/images/default-avatar.png')
            }
            style={styles.avatar}
          />
        </View>
        <View style={styles.infoContainer}>
          <Typography variant="body" numberOfLines={1}>
            {user.firstName} {user.lastName}
          </Typography>

          {user.location && (
            <View style={styles.locationContainer}>
              <Icon name="map-pin" size={12} color={colors.neutral.grey} />
              <Typography
                variant="caption"
                color={colors.neutral.darkGrey}
                style={styles.infoText}
                numberOfLines={1}>
                {user.location}
              </Typography>
            </View>
          )}

          {user.interests && user.interests.length > 0 && (
            <View style={styles.tagsContainer}>
              {user.interests.map((interest: string, index: number) => (
                <React.Fragment key={interest}>
                  <Typography
                    variant="caption"
                    color={colors.neutral.darkGrey}
                    style={{
                      textDecorationLine: 'underline',
                    }}>
                    {interest}
                  </Typography>
                  {index < (user.interests?.length || 0) - 1 && (
                    <Typography
                      variant="caption"
                      color={colors.neutral.darkGrey}
                      style={styles.tagSeparator}>
                      •
                    </Typography>
                  )}
                </React.Fragment>
              ))}
            </View>
          )}
        </View>
        <View style={styles.buttonContainer}>
          {!isFollowing ? (
            <Button
              title="Follow"
              variant="dark"
              size="small"
              onPress={handleFollowPress}
              disabled={loading}
              loading={loading}
            />
          ) : (
            <Typography
              variant="caption"
              color={colors.neutral.darkGrey}
              style={styles.tagSeparator}>
              Following
            </Typography>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};
