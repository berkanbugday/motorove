import React from 'react';
import {
  View,
  StyleProp,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
} from 'react-native';
import {styles} from './EventBanner.styles';
import {Icon} from '../Icon';
import {Body, BodySmall, Caption, Title} from '../Typography';
import {colors, spacing} from '@theme';
import {Button} from '../Button';
import {useTranslation} from '@hooks/useTranslation';
import {useLanguage} from '@contexts/LanguageContext';
import {IEvent, AddressType} from '@motorove/shared';

// Internal interface for transformed event data
interface EventItem {
  id: string;
  day: string;
  month: string;
  time: string;
  title: string;
  organizer: string;
  location: string;
  participantCount: number;
  isParticipanting?: boolean | null;
}

// Transform IEvent to EventItem format
const transformEventToEventItem = (
  event: IEvent,
  language: string,
): EventItem => {
  const startDate = new Date(event.startDateTime);
  const day = startDate.getDate().toString().padStart(2, '0');
  const month = startDate
    .toLocaleDateString(language, {month: 'short'})
    .toUpperCase();
  const time = startDate.toLocaleTimeString(language, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  // Get the first address (if available)
  const startLocation =
    event.addresses &&
    event.addresses.find(
      address =>
        address.type === AddressType.EVENT_START_LOCATION &&
        address.language.toLowerCase() === language.toLowerCase(),
    );

  const meetingLocation =
    event.addresses &&
    event.addresses.find(
      address =>
        address.type === AddressType.EVENT_MEETING_LOCATION &&
        address.language.toLowerCase() === language.toLowerCase(),
    );

  const location = startLocation?.address
    ? startLocation?.address
    : meetingLocation?.address;

  return {
    id: event.id,
    day,
    month,
    time,
    title: event.title,
    location: location || '',
    organizer: event.organizedByGroup
      ? event.organizedByGroup.name
      : `${event.createdBy.firstName} ${event.createdBy.lastName}`,
    participantCount: event.participantsCount || 0,
    isParticipanting: event.isParticipating,
  };
};

export interface EventBannerProps {
  /**
   * The event object to display
   */
  event?: IEvent;

  // Legacy props for backward compatibility
  /**
   * The date of the event (e.g., "15")
   */
  day?: string;

  /**
   * The month of the event (e.g., "JUN")
   */
  month?: string;

  /**
   * The time of the event (e.g., "10:00")
   */
  time?: string;

  /**
   * The title of the event
   */
  title?: string;

  /**
   * Additional information text displayed under the title
   */
  infoText?: string;

  /**
   * The organizer or club name
   */
  organizer?: string;

  /**
   * The location of the event
   */
  location?: string;

  /**
   * The number of participants who have joined
   */
  participantCount?: number | null;

  /**
   * The total number of participants allowed
   */
  maxParticipants?: number | null;

  /**
   * Badge text to display on the banner (e.g., "UPCOMING", "CANCELLED")
   */
  badgeText?: string | null;

  /**
   * Function called when the chat button is pressed
   */
  onChatPress?: () => void;

  /**
   * Function called when the banner is pressed
   */
  onPress?: () => void;

  /**
   * Additional styles for the banner container
   */
  style?: StyleProp<ViewStyle>;

  /**
   * Additional styles for the content container
   */
  contentStyle?: StyleProp<ViewStyle>;

  /**
   * Additional styles for the date container
   */
  dateContainerStyle?: StyleProp<ViewStyle>;

  /**
   * Additional styles for the title text
   */
  titleStyle?: StyleProp<TextStyle>;

  /**
   * Additional styles for the info text
   */
  infoTextStyle?: StyleProp<TextStyle>;

  /**
   * Additional styles for the badge container
   */
  badgeStyle?: StyleProp<ViewStyle>;

  /**
   * Additional styles for the badge text
   */
  badgeTextStyle?: StyleProp<TextStyle>;
}

/**
 * A reusable banner component for displaying events with date, title, organizer,
 * participant information, and a chat button.
 */
const EventBanner: React.FC<EventBannerProps> = ({
  event,
  day,
  month,
  time,
  title,
  infoText,
  organizer,
  location,
  participantCount,
  maxParticipants,
  badgeText,
  onChatPress,
  onPress,
  style,
  contentStyle,
  dateContainerStyle,
  titleStyle,
  infoTextStyle,
  badgeStyle,
  badgeTextStyle,
}) => {
  const {t} = useTranslation();
  const {language} = useLanguage();

  // Transform event data if event prop is provided
  const eventData = event ? transformEventToEventItem(event, language) : null;

  // Use transformed data or fallback to legacy props
  const displayData = {
    day: eventData?.day || day || '',
    month: eventData?.month || month || '',
    time: eventData?.time || time || '',
    title: eventData?.title || title || '',
    organizer: eventData?.organizer || organizer || '',
    location: eventData?.location || location || '',
    participantCount: eventData?.participantCount ?? participantCount ?? 0,
    badgeText: eventData?.isParticipanting
      ? t('screens.event.going')
      : badgeText,
  };

  const renderParticipantCount = () => {
    if (!displayData.participantCount) {
      return null;
    }
    const participantCountText = maxParticipants
      ? `${displayData.participantCount} ${t(
          'components.eventBanner.participant',
        )} / ${maxParticipants} ${t('components.eventBanner.maxParticipants')}`
      : `${displayData.participantCount} ${t(
          'components.eventBanner.participant',
        )}`;

    return (
      <View style={styles.participantsContainer}>
        <Icon name="users-filled" size={14} />
        <Caption
          numberOfLines={1}
          color={colors.neutral.grey}
          style={styles.participantsText}>
          {participantCountText}
        </Caption>
      </View>
    );
  };

  return (
    <TouchableOpacity activeOpacity={0.7} onPress={onPress}>
      <View style={[styles.container, style]}>
        {displayData.badgeText && (
          <View style={[styles.badgeContainer, badgeStyle]}>
            <Caption
              numberOfLines={1}
              weight="bold"
              align="center"
              color={colors.neutral.white}
              style={[styles.badgeText, badgeTextStyle]}>
              {displayData.badgeText}
            </Caption>
          </View>
        )}
        {/* Date and Time Container */}
        <View style={[styles.dateContainer, dateContainerStyle]}>
          <Title weight="bold">{displayData.day}</Title>
          <BodySmall weight="bold">{displayData.month}</BodySmall>
          <Caption>{displayData.time}</Caption>
        </View>

        {/* Event Details Container */}
        <View
          style={[
            styles.contentContainer,
            contentStyle,
            !displayData.participantCount ? {paddingVertical: spacing.md} : {},
          ]}>
          {displayData.title && (
            <Body
              numberOfLines={1}
              weight="bold"
              style={[onChatPress ? {paddingRight: 70} : {}, titleStyle]}>
              {displayData.title}
            </Body>
          )}
          {infoText && (
            <Caption
              numberOfLines={1}
              color={colors.neutral.grey}
              style={[styles.infoText, infoTextStyle]}>
              {infoText}
            </Caption>
          )}
          {displayData.organizer && (
            <Caption
              numberOfLines={1}
              color={colors.neutral.darkGrey}
              style={styles.organizer}>
              {displayData.organizer}
            </Caption>
          )}
          {displayData.location && (
            <View style={styles.locationContainer}>
              <Icon name="map-pin-filled" size={14} />
              <Caption
                numberOfLines={1}
                color={colors.neutral.grey}
                style={styles.locationText}>
                {displayData.location}
              </Caption>
            </View>
          )}
          {renderParticipantCount()}
        </View>

        {/* Chat Button */}
        {onChatPress && (
          <View style={styles.chatButtonContainer}>
            <Button
              testID="event-banner-chat-button"
              variant="primary"
              size="medium"
              shape="round"
              style={styles.chatButton}
              disabled={!onChatPress}
              title={t('components.eventBanner.chat')}
              onPress={onChatPress}
            />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default EventBanner;
