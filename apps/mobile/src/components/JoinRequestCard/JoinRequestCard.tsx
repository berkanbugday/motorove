import React from 'react';
import {View, StyleSheet, Image, ImageSourcePropType} from 'react-native';
import {colors, spacing, radius} from '@theme';
import {Typography} from '@components/Typography';
import {Button} from '@components/Button';
import {Icon} from '@components/Icon';
import {useTranslation} from '@hooks/useTranslation';

export interface JoinRequestCardProps {
  /**
   * Type of request (group or event)
   */
  type: 'group' | 'event';

  /**
   * User avatar image source
   */
  avatarSource?: ImageSourcePropType;

  /**
   * Name of the user
   */
  name: string;

  /**
   * Name of the group or event
   */
  groupName: string;

  /**
   * Time when the request was created
   */
  timeAgo: Date | string;

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
 * A card component for displaying join requests
 */
export const JoinRequestCard: React.FC<JoinRequestCardProps> = ({
  type,
  avatarSource,
  name,
  groupName,
  timeAgo,
  onAccept,
  onReject,
  style,
}) => {
  const {t} = useTranslation();

  // Format the time ago string
  const formatTimeAgo = () => {
    if (!timeAgo) return '';

    // Simple date formatting
    const date = typeof timeAgo === 'string' ? new Date(timeAgo) : timeAgo;

    try {
      // Try to calculate a relative time string
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor(
        (diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
      );
      const diffMinutes = Math.floor(
        (diffTime % (1000 * 60 * 60)) / (1000 * 60),
      );

      if (diffDays > 0) {
        return `${diffDays}d ago`;
      } else if (diffHours > 0) {
        return `${diffHours}h ago`;
      } else if (diffMinutes > 0) {
        return `${diffMinutes}m ago`;
      } else {
        return 'Just now';
      }
    } catch (e) {
      // Fallback to basic date
      return date.toLocaleDateString();
    }
  };

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
              {formatTimeAgo()}
            </Typography>
          </View>

          <View style={styles.groupRow}>
            <Icon
              name={type === 'group' ? 'users-filled' : 'calendar'}
              size={14}
              color={colors.neutral.darkGrey}
            />
            <Typography
              variant="body"
              color={colors.neutral.darkGrey}
              style={styles.groupText}
              numberOfLines={1}>
              {groupName}
            </Typography>
          </View>

          <Typography
            variant="caption"
            color={colors.neutral.darkGrey}
            numberOfLines={2}>
            {type === 'group'
              ? t('screens.joinRequest.wants_to_join_group')
              : t('screens.joinRequest.wants_to_join_event')}
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
    borderBottomWidth: 0.5,
    borderTopWidth: 0.5,
    borderBottomColor: colors.secondary.main,
    borderTopColor: colors.secondary.main,
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
  groupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs / 2,
  },
  groupText: {
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
