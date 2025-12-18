import React, {useState, useEffect, memo, useCallback} from 'react';
import {View, Image, TouchableOpacity} from 'react-native';
import {colors} from '@theme';
import {Caption, Typography} from '@components/Typography';
import {Button} from '@components/Button';
import {Icon} from '@components/Icon';
import {styles} from './UserCard.styles';
import {ApprovalStatus, IUser} from '@motorove/shared';
import {useTranslation} from '@hooks/useTranslation';
import {useAuth} from '@contexts';

interface UserCardProps {
  user: IUser;
  onPress?: () => void;
  handleFollowPress?: () => void;
  handleUnfollowPress?: () => void;
  style?: any;
  loading?: boolean;
  showFollowButton?: boolean;
  showUnfollowButton?: boolean;
}

/**
 * UserCard component - displays user information with follow/unfollow button
 */
const UserCardComponent: React.FC<UserCardProps> = ({
  user,
  onPress,
  handleFollowPress,
  handleUnfollowPress,
  style,
  loading,
  showFollowButton = true,
  showUnfollowButton = true,
}) => {
  const {t} = useTranslation();
  const {id: currentUserId} = useAuth();
  const [followingStatus, setFollowingStatus] = useState<ApprovalStatus>();

  // Update local state when user prop changes
  useEffect(() => {
    setFollowingStatus(user.followingStatus);
  }, [user.followingStatus]);

  // Check if this is the current user
  const isCurrentUser = user.id === currentUserId;

  // Memoize press handlers
  const onPressHandler = useCallback(() => {
    onPress?.();
  }, [onPress]);

  const onFollowPressHandler = useCallback(() => {
    handleFollowPress?.();
  }, [handleFollowPress]);

  const onUnfollowPressHandler = useCallback(() => {
    handleUnfollowPress?.();
  }, [handleUnfollowPress]);

  return (
    <TouchableOpacity
      onPress={onPressHandler}
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
              <Icon
                name="map-pin-filled"
                size={12}
                color={colors.neutral.grey}
              />
              <Typography
                variant="caption"
                color={colors.neutral.darkGrey}
                style={styles.infoText}
                numberOfLines={1}>
                {user.city?.value}, {t('common.country')}
              </Typography>
            </View>
          )}
        </View>
        {!isCurrentUser && (
          <View style={styles.buttonContainer}>
            {followingStatus === ApprovalStatus.ACCEPTED ? (
              showUnfollowButton ? (
                <Button
                  title={t('common.unfollow')}
                  variant="secondary"
                  size="small"
                  onPress={onUnfollowPressHandler}
                  disabled={loading}
                  loading={loading}
                />
              ) : (
                <Caption>{t('common.following')}</Caption>
              )
            ) : followingStatus === ApprovalStatus.PENDING ? (
              <Caption>{t('common.pending_approval')}</Caption>
            ) : (
              showFollowButton && (
                <Button
                  title={t('common.follow')}
                  variant="dark"
                  size="small"
                  onPress={onFollowPressHandler}
                  disabled={loading}
                  loading={loading}
                />
              )
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

// Memoize UserCard to prevent unnecessary re-renders
export const UserCard = memo(UserCardComponent, (prevProps, nextProps) => {
  return (
    prevProps.user.id === nextProps.user.id &&
    prevProps.user.followingStatus === nextProps.user.followingStatus &&
    prevProps.user.firstName === nextProps.user.firstName &&
    prevProps.user.lastName === nextProps.user.lastName &&
    prevProps.user.avatar === nextProps.user.avatar &&
    prevProps.user.city?.value === nextProps.user.city?.value &&
    prevProps.loading === nextProps.loading &&
    prevProps.showFollowButton === nextProps.showFollowButton &&
    prevProps.showUnfollowButton === nextProps.showUnfollowButton
  );
});
