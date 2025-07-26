import React from 'react';
import {View, StyleSheet, Image, ImageSourcePropType} from 'react-native';
import {colors, spacing, radius} from '@theme';
import {Typography, Button, Icon} from '@components';
import {useTranslation} from '@hooks/useTranslation';
import {relativeTime} from '@utils/dateUtils';

export interface FollowRequestCardProps {
  /**
   * User avatar image source
   */
  avatarSource?: ImageSourcePropType;

  /**
   * Name of the user
   */
  name: string;

  /**
   * Username of the requester
   */
  username: string;

  /**
   * Time when the request was created
   */
  timeAgo: Date;

  /**
   * Handler for accepting the request
   */
  onAccept: () => void;

  /**
   * Handler for rejecting the request
   */
  onReject: () => void;

  /**
   * Additional styles for the card container
   */
  style?: any;
}

/**
 * A card component for displaying follow requests
 */
export const FollowRequestCard: React.FC<FollowRequestCardProps> = ({
  avatarSource,
  name,
  username,
  timeAgo,
  onAccept,
  onReject,
  style,
}) => {
  const {t} = useTranslation();

  return (
    <View style={[styles.container, style]}>
      <View style={styles.content}>
        <Image
          source={
            avatarSource || require('../../assets/images/default_avatar.png')
          }
          style={styles.avatar}
        />

        <View style={styles.infoContainer}>
          <View style={styles.headerRow}>
            <Typography
              variant="body"
              weight="bold"
              numberOfLines={1}
              style={styles.name}>
              {name}
            </Typography>
            <Typography variant="caption" color={colors.neutral.darkGrey}>
              {relativeTime(timeAgo, t)}
            </Typography>
          </View>

          <View style={styles.usernameRow}>
            <Icon
              name="user-filled"
              size={14}
              color={colors.neutral.darkGrey}
            />
            <Typography
              variant="body"
              weight="medium"
              color={colors.neutral.darkGrey}
              style={styles.usernameText}
              numberOfLines={1}>
              @{username}
            </Typography>
          </View>

          <Typography
            variant="caption"
            color={colors.neutral.darkGrey}
            numberOfLines={2}>
            {t('screens.followRequest.wants_to_follow_you')}
          </Typography>
        </View>
      </View>

      <View style={styles.actionsContainer}>
        <Button
          title={t('common.reject')}
          variant="outline"
          size="small"
          shape="round"
          onPress={onReject}
          style={styles.rejectButton}
        />
        <Button
          title={t('common.accept')}
          variant="primary"
          size="small"
          shape="round"
          onPress={onAccept}
          style={styles.acceptButton}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.secondary.main,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: radius.round,
    backgroundColor: colors.neutral.lightGrey,
  },
  infoContainer: {
    flex: 1,
    marginLeft: spacing.sm,
    justifyContent: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs / 2,
  },
  name: {
    flex: 1,
    marginRight: spacing.xs,
  },
  usernameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs / 2,
  },
  usernameText: {
    marginLeft: spacing.xs / 2,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: spacing.sm,
  },
  acceptButton: {
    marginLeft: spacing.sm,
  },
  rejectButton: {
    marginRight: spacing.sm,
  },
});
