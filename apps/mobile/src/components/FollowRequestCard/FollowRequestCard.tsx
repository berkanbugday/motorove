import React from 'react';
import {View, StyleSheet, Image} from 'react-native';
import {colors, spacing, radius} from '@theme';
import {Typography, Button, Icon} from '@components';
import {useTranslation} from '@hooks/useTranslation';
import {formatDistanceToNow} from 'date-fns';
import {tr, enUS} from 'date-fns/locale';
import {useLanguage} from '@contexts/LanguageContext';
import {Language} from '@motorove/shared';

export interface FollowRequestCardProps {
  /**
   * User avatar image source
   */
  avatarSource?: string;

  /**
   * Name of the user
   */
  name: string;

  /**
   * City of the requester
   */
  city?: string;

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
  city,
  timeAgo,
  onAccept,
  onReject,
  style,
}) => {
  const {t} = useTranslation();
  const {language} = useLanguage();

  return (
    <View style={[styles.container, style]}>
      <View style={styles.content}>
        <Image
          source={
            avatarSource
              ? {uri: avatarSource}
              : require('../../assets/images/default_avatar.png')
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
              {formatDistanceToNow(new Date(timeAgo), {
                addSuffix: true,
                locale:
                  language.toLowerCase() === Language.TR.toLowerCase()
                    ? tr
                    : enUS,
              })}
            </Typography>
          </View>

          <View style={styles.cityRow}>
            <Icon name="map-pin" size={14} color={colors.neutral.darkGrey} />
            <Typography
              variant="body"
              weight="medium"
              color={colors.neutral.darkGrey}
              style={styles.cityText}
              numberOfLines={1}>
              {city}
            </Typography>
          </View>

          <Typography
            variant="caption"
            color={colors.neutral.darkGrey}
            numberOfLines={2}>
            {t('screens.followRequest.wants_to_follow')}
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
    borderWidth: 1,
    borderColor: colors.neutral.black,
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
  cityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs / 2,
  },
  cityText: {
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
