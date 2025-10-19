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
import {colors} from '@theme';
import {Button} from '../Button';
import {useTranslation} from '@hooks/useTranslation';
export interface EventBannerProps {
  /**
   * The date of the event (e.g., "15")
   */
  day: string;

  /**
   * The month of the event (e.g., "JUN")
   */
  month: string;

  /**
   * The time of the event (e.g., "10:00")
   */
  time: string;

  /**
   * The title of the event
   */
  title: string;

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

  const renderParticipantCount = () => {
    if (!participantCount) {
      return null;
    }
    const participantCountText = maxParticipants
      ? `${participantCount} ${t(
          'components.eventBanner.participant',
        )} / ${maxParticipants} ${t('components.eventBanner.maxParticipants')}`
      : `${participantCount} ${t('components.eventBanner.participant')}`;

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
        {badgeText && (
          <View style={[styles.badgeContainer, badgeStyle]}>
            <Caption
              numberOfLines={1}
              weight="bold"
              align="center"
              color={colors.neutral.white}
              style={[styles.badgeText, badgeTextStyle]}>
              {badgeText}
            </Caption>
          </View>
        )}
        {/* Date and Time Container */}
        <View style={[styles.dateContainer, dateContainerStyle]}>
          <Title weight="bold">{day}</Title>
          <BodySmall weight="bold">{month}</BodySmall>
          <Caption>{time}</Caption>
        </View>

        {/* Event Details Container */}
        <View style={[styles.contentContainer, contentStyle]}>
          {title && (
            <Body
              numberOfLines={1}
              weight="bold"
              style={[onChatPress ? {paddingRight: 70} : {}, titleStyle]}>
              {title}
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
          {organizer && (
            <Caption
              numberOfLines={1}
              color={colors.neutral.darkGrey}
              style={styles.organizer}>
              {organizer}
            </Caption>
          )}
          {location && (
            <View style={styles.locationContainer}>
              <Icon name="map-pin-filled" size={14} />
              <Caption
                numberOfLines={1}
                color={colors.neutral.grey}
                style={styles.locationText}>
                {location}
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
