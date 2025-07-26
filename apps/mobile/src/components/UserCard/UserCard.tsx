import React, {useState, useCallback, useEffect} from 'react';
import {View, Image, TouchableOpacity} from 'react-native';
import {colors} from '@theme';
import {Typography} from '@components/Typography';
import {Button} from '@components/Button';
import {Icon} from '@components/Icon';
import {useFollowUser, useUnfollowUser} from '@services/follow.service';
import {styles} from './UserCard.styles';
import {IUser} from '@motorove/shared';
import {useTranslation} from '@/hooks/useTranslation';

interface UserCardProps {
  user: IUser;
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
  const {t} = useTranslation();
  const [isFollowing, setIsFollowing] = useState<boolean>(
    user.isFollowing || false,
  );

  // Update local state when user prop changes
  useEffect(() => {
    setIsFollowing(user.isFollowing || false);
  }, [user.isFollowing]);

  // Follow and unfollow mutations with callbacks to update local state
  const {followUser, loading: followLoading} = useFollowUser(
    (newStatus: boolean) => {
      setIsFollowing(newStatus);
      if (onFollowStatusChange) {
        onFollowStatusChange(newStatus);
      }
    },
  );

  const {unfollowUser, loading: unfollowLoading} = useUnfollowUser(
    (newStatus: boolean) => {
      setIsFollowing(newStatus);
      if (onFollowStatusChange) {
        onFollowStatusChange(newStatus);
      }
    },
  );

  const handleFollowPress = useCallback(async () => {
    if (followLoading) {
      return;
    }

    try {
      await followUser(user.id);
    } catch (error) {
      console.error('Error following user:', error);
    }
  }, [user.id, followUser]);

  const handleUnfollowPress = useCallback(async () => {
    if (unfollowLoading) {
      return;
    }

    try {
      await unfollowUser(user.id);
    } catch (error) {
      console.error('Error unfollowing user:', error);
    }
  }, [user.id, unfollowUser]);

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.container, style]}
      activeOpacity={0.8}
      disabled={!onPress}>
      <View style={styles.content}>
        <Image
          source={
            user.avatar
              ? {uri: user.avatar}
              : require('@assets/images/default_avatar.png')
          }
          style={styles.avatar}
        />
        <View style={styles.infoContainer}>
          <Typography variant="body" numberOfLines={1}>
            {user.firstName} {user.lastName}
          </Typography>

          {user.city && (
            <View style={styles.locationContainer}>
              <Icon name="map-pin" size={12} color={colors.neutral.grey} />
              <Typography
                variant="caption"
                color={colors.neutral.darkGrey}
                style={styles.infoText}
                numberOfLines={1}>
                {user.city?.value}
              </Typography>
            </View>
          )}
        </View>
        <View style={styles.buttonContainer}>
          {isFollowing ? (
            <Button
              title={t('common.unfollow')}
              variant="secondary"
              size="small"
              onPress={handleUnfollowPress}
              disabled={unfollowLoading}
              loading={unfollowLoading}
            />
          ) : (
            <Button
              title={t('common.follow')}
              variant="dark"
              size="small"
              onPress={handleFollowPress}
              disabled={followLoading}
              loading={followLoading}
            />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};
