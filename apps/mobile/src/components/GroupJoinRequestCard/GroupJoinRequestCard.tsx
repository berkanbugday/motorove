import React from 'react';
import {View, StyleSheet, Image, TouchableOpacity} from 'react-native';
import {colors, spacing, radius} from '@theme';
import {Typography, Button, Icon} from '@components';
import {useTranslation} from '@hooks/useTranslation';
import {formatDistanceToNow} from 'date-fns';
import {tr, enUS} from 'date-fns/locale';
import {useLanguage} from '@contexts/LanguageContext';
import {Language} from '@motorove/shared';

export interface GroupJoinRequest {
  id: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  group: {
    id: string;
    name: string;
  };
  updatedAt: Date;
}

export interface GroupJoinRequestCardProps {
  /**
   * The group join request data
   */
  request: GroupJoinRequest;

  /**
   * Handler for when user avatar/name is pressed
   */
  onUserPress: () => void;

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
 * GroupJoinRequestCard - Professional component for displaying group join requests
 * Follows single responsibility principle and clean architecture
 */
export const GroupJoinRequestCard: React.FC<GroupJoinRequestCardProps> = ({
  request,
  onUserPress,
  onAccept,
  onReject,
  style,
}) => {
  const {t} = useTranslation();
  const {language} = useLanguage();

  const fullName = `${request.user.firstName} ${request.user.lastName}`;
  const timeAgo = formatDistanceToNow(new Date(request.updatedAt), {
    addSuffix: true,
    locale: language.toLowerCase() === Language.TR.toLowerCase() ? tr : enUS,
  });

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onUserPress}
        style={styles.content}
      >
        <Image
          source={
            request.user.avatar
              ? {uri: request.user.avatar}
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
              style={styles.name}
            >
              {fullName}
            </Typography>
            <Typography variant="caption" color={colors.neutral.darkGrey}>
              {timeAgo}
            </Typography>
          </View>

          <View style={styles.groupRow}>
            <Icon
              name="users-filled"
              size={14}
              color={colors.neutral.darkGrey}
            />
            <Typography
              variant="body"
              weight="medium"
              color={colors.neutral.darkGrey}
              style={styles.groupText}
              numberOfLines={1}
            >
              {request.group.name}
            </Typography>
          </View>

          <Typography
            variant="caption"
            color={colors.neutral.darkGrey}
            numberOfLines={2}
          >
            {t('screens.groupJoinRequest.wants_to_join_group')}
          </Typography>
        </View>
      </TouchableOpacity>

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
    backgroundColor: colors.neutral.white,
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
  groupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs / 2,
  },
  groupText: {
    marginLeft: spacing.xs / 2,
    flex: 1,
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
