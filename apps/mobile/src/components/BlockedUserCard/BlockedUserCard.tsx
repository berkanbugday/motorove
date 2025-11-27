import React from 'react';
import {View, StyleSheet, Image, TouchableOpacity} from 'react-native';
import {colors, spacing, radius} from '@theme';
import {Typography, Button, Icon} from '@components';
import {useTranslation} from '@hooks/useTranslation';
import {formatDistanceToNow} from 'date-fns';
import {tr, enUS} from 'date-fns/locale';
import {useLanguage} from '@contexts/LanguageContext';
import {Language} from '@motorove/shared';

export interface BlockedUserCardProps {
  /**
   * User avatar image source
   */
  avatarSource?: string;

  /**
   * Name of the user
   */
  name: string;

  /**
   * City of the blocked user
   */
  city?: string;

  /**
   * Time when the user was blocked
   */
  blockedAt: Date;

  /**
   * Handler for when user avatar/name is pressed
   */
  onUserPress: () => void;

  /**
   * Handler for unblocking the user
   */
  onUnblock: () => void;

  /**
   * Additional styles for the card container
   */
  style?: any;
}

/**
 * A card component for displaying blocked users
 */
export const BlockedUserCard: React.FC<BlockedUserCardProps> = ({
  avatarSource,
  name,
  city,
  blockedAt,
  onUserPress,
  onUnblock,
  style,
}) => {
  const {t} = useTranslation();
  const {language} = useLanguage();

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onUserPress}
        style={styles.content}>
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
              {formatDistanceToNow(new Date(blockedAt), {
                addSuffix: true,
                locale:
                  language.toLowerCase() === Language.TR.toLowerCase()
                    ? tr
                    : enUS,
              })}
            </Typography>
          </View>

          <View style={styles.cityRow}>
            <Icon
              name="map-pin-filled"
              size={14}
              color={colors.neutral.darkGrey}
            />
            <Typography
              variant="body"
              weight="medium"
              color={colors.neutral.darkGrey}
              style={styles.cityText}
              numberOfLines={1}>
              {city}, {t('common.country')}
            </Typography>
          </View>
        </View>
      </TouchableOpacity>

      <View style={styles.actionsContainer}>
        <Button
          title={t('common.unblock')}
          variant="primary"
          size="small"
          shape="round"
          onPress={onUnblock}
          style={styles.unblockButton}
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
  unblockButton: {
    minWidth: 100,
  },
});
