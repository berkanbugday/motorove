import React, {useState, useEffect} from 'react';
import {View, Image, TouchableOpacity} from 'react-native';
import {colors} from '@theme';
import {Caption, Typography} from '@components/Typography';
import {Button} from '@components/Button';
import {Icon} from '@components/Icon';
import {styles} from './UserCard.styles';
import {InvitationStatus, IUser} from '@motorove/shared';
import {useTranslation} from '@/hooks/useTranslation';

interface UserCardProps {
  user: IUser;
  onPress?: () => void;
  handleFollowPress?: () => void;
  handleUnfollowPress?: () => void;
  style?: any;
  loading?: boolean;
}

/**
 * UserCard component - displays user information with follow/unfollow button
 */
export const UserCard: React.FC<UserCardProps> = ({
  user,
  onPress,
  handleFollowPress,
  handleUnfollowPress,
  style,
  loading,
}) => {
  const {t} = useTranslation();
  const [followingStatus, setFollowingStatus] = useState<InvitationStatus>();

  // Update local state when user prop changes
  useEffect(() => {
    setFollowingStatus(user.followingStatus);
  }, [user.followingStatus]);

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
          {followingStatus === InvitationStatus.ACCEPTED ? (
            <Button
              title={t('common.unfollow')}
              variant="secondary"
              size="small"
              onPress={handleUnfollowPress}
              disabled={loading}
              loading={loading}
            />
          ) : followingStatus === InvitationStatus.PENDING ? (
            <Caption>{t('common.pending_approval')}</Caption>
          ) : (
            <Button
              title={t('common.follow')}
              variant="dark"
              size="small"
              onPress={handleFollowPress}
              disabled={loading}
              loading={loading}
            />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};
