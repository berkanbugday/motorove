import React, {useState, useCallback} from 'react';
import {View, Image, TouchableOpacity} from 'react-native';
import {colors} from '@theme';
import {Typography} from '@components/Typography';
import {Button} from '@components/Button';
import {Icon} from '@components/Icon';
import {User} from '../../types';
import {userService} from '@services/user.service';
import {styles} from './UserCard.styles';

interface UserCardProps {
  user: User;
  isFollowing: boolean;
  onPress?: () => void;
  onFollowStatusChange?: (isFollowing: boolean) => void;
  style?: any;
}

/**
 * UserCard component - displays user information with follow/unfollow button
 */
export const UserCard: React.FC<UserCardProps> = ({
  user,
  isFollowing,
  onPress,
  onFollowStatusChange,
  style,
}) => {
  const [following, setFollowing] = useState<boolean>(isFollowing);
  const [loading, setLoading] = useState<boolean>(false);

  const handleFollowPress = useCallback(async () => {
    try {
      setLoading(true);

      if (following) {
        await userService.unfollowUser(user.id);
        setFollowing(false);
      } else {
        await userService.followUser(user.id);
        setFollowing(true);
      }

      onFollowStatusChange?.(!following);
    } catch (error) {
      console.error('Error toggling follow status:', error);
    } finally {
      setLoading(false);
    }
  }, [following, user.id, onFollowStatusChange]);

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
          {!following ? (
            <Button
              title={following ? 'Unfollow' : 'Follow'}
              variant={following ? 'outline' : 'dark'}
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
