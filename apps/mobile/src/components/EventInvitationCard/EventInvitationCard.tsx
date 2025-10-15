import React from 'react';
import {View, StyleSheet, Image, TouchableOpacity} from 'react-native';
import {colors, spacing, radius} from '@theme';
import {Typography, Button, Icon} from '@components';
import {useTranslation} from '@hooks/useTranslation';
import {formatDistanceToNow} from 'date-fns';
import {tr, enUS} from 'date-fns/locale';
import {useLanguage} from '@contexts/LanguageContext';
import {Language} from '@motorove/shared';

export interface EventInvitation {
  id: string;
  event: {
    id: string;
    title: string;
    images?: string[];
    createdAt: Date;
    updatedAt: Date;
    createdBy: {
      id: string;
      firstName: string;
      lastName: string;
    };
    organizedByGroup?: {
      id: string;
      name: string;
    };
  };
}

export interface EventInvitationCardProps {
  /**
   * The event invitation data
   */
  invitation: EventInvitation;

  /**
   * Handler for when event card is pressed
   */
  onEventPress: () => void;

  /**
   * Handler for accepting the invitation
   */
  onAccept: () => void;

  /**
   * Handler for rejecting the invitation
   */
  onReject: () => void;

  /**
   * Additional styles for the card container
   */
  style?: any;
}

/**
 * EventInvitationCard - Professional component for displaying event invitations
 * Follows single responsibility principle and clean architecture
 */
export const EventInvitationCard: React.FC<EventInvitationCardProps> = ({
  invitation,
  onEventPress,
  onAccept,
  onReject,
  style,
}) => {
  const {t} = useTranslation();
  const {language} = useLanguage();

  const {event} = invitation;

  // Determine organizer name (group or individual user)
  const organizerName = event.organizedByGroup
    ? event.organizedByGroup.name
    : `${event.createdBy.firstName} ${event.createdBy.lastName}`;

  // Get event image or use default
  const eventImage =
    event.images && event.images.length > 0 ? event.images[0] : null;

  const timeAgo = formatDistanceToNow(
    new Date(event?.updatedAt || event.createdAt),
    {
      addSuffix: true,
      locale: language.toLowerCase() === Language.TR.toLowerCase() ? tr : enUS,
    },
  );

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onEventPress}
        style={styles.content}>
        <Image
          source={eventImage ? {uri: eventImage} : undefined}
          style={styles.eventImage}
        />

        <View style={styles.infoContainer}>
          <View style={styles.headerRow}>
            <Typography
              variant="body"
              weight="bold"
              numberOfLines={1}
              style={styles.organizerName}>
              {organizerName}
            </Typography>
            <Typography variant="caption" color={colors.neutral.darkGrey}>
              {timeAgo}
            </Typography>
          </View>

          <View style={styles.eventRow}>
            <Icon
              name="calendar-filled"
              size={14}
              color={colors.neutral.darkGrey}
            />
            <Typography
              variant="body"
              weight="medium"
              color={colors.neutral.darkGrey}
              style={styles.eventTitle}
              numberOfLines={1}>
              {event.title}
            </Typography>
          </View>

          <Typography
            variant="caption"
            color={colors.neutral.darkGrey}
            numberOfLines={2}>
            {t('screens.eventInvitation.invites_you_to_event')}
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
  eventImage: {
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
  organizerName: {
    flex: 1,
    marginRight: spacing.xs,
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs / 2,
  },
  eventTitle: {
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
