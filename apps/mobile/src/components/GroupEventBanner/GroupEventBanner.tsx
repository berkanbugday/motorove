import React from 'react';
import {View, StyleProp, ViewStyle, TextStyle} from 'react-native';
import {styles} from './GroupEventBanner.styles';
import {Icon} from '../Icon';
import {Body, BodySmall, Caption, Title} from '../Typography';
import {colors} from '@theme';
import {Button} from '../Button';
export interface GroupEventBannerProps {
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
  participantCount: number;

  /**
   * The total number of members in the group/club
   */
  membersCapacity?: number;

  /**
   * Badge text to display on the banner (e.g., "UPCOMING", "CANCELLED")
   */
  badgeText?: string;

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
 * A reusable banner component for displaying group events with date, title, organizer,
 * participant information, and a chat button.
 */
const GroupEventBanner: React.FC<GroupEventBannerProps> = ({
  day,
  month,
  time,
  title,
  infoText,
  organizer,
  location,
  participantCount,
  membersCapacity,
  badgeText,
  onChatPress,
  style,
  contentStyle,
  dateContainerStyle,
  titleStyle,
  infoTextStyle,
  badgeStyle,
  badgeTextStyle,
}) => {
  return (
    <View style={[styles.container, style]}>
      {badgeText && (
        <View style={[styles.badgeContainer, badgeStyle]}>
          <Caption
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
          <Body weight="bold" style={[styles.title, titleStyle]}>
            {title}
          </Body>
        )}
        {infoText && (
          <Caption
            color={colors.neutral.grey}
            style={[styles.infoText, infoTextStyle]}>
            {infoText}
          </Caption>
        )}
        {organizer && (
          <Caption color={colors.neutral.grey} style={styles.organizer}>
            {organizer}
          </Caption>
        )}
        {location && (
          <View style={styles.locationContainer}>
            <Icon name="map-pin" size={14} />
            <Caption color={colors.neutral.grey} style={styles.locationText}>
              {location}
            </Caption>
          </View>
        )}
        <View style={styles.participantsContainer}>
          <Icon name="users-filled" size={14} />
          <Caption color={colors.neutral.grey} style={styles.participantsText}>
            {participantCount} / {membersCapacity} members
          </Caption>
        </View>
      </View>

      {/* Chat Button */}
      {onChatPress && (
        <View style={styles.chatButtonContainer}>
          <Button
            testID="group-event-banner-chat-button"
            variant="primary"
            size="medium"
            shape="round"
            style={styles.chatButton}
            disabled={!onChatPress}
            title="Chat"
            onPress={onChatPress}
          />
        </View>
      )}
    </View>
  );
};

export default GroupEventBanner;
