import React from 'react';
import {
  View,
  Image,
  ImageSourcePropType,
  StyleProp,
  ViewStyle,
  TextStyle,
  ImageStyle,
  TouchableOpacity,
} from 'react-native';
import {Typography} from '../Typography';
import {Icon} from '../Icon';
import {colors, getShadow, radius} from '@theme';
import {Chip} from '../Chip';
import {styles} from './EventCard.styles';
import {useLanguage} from '@contexts/LanguageContext';

export interface ParticipantInfo {
  id: string;
  name: string;
  avatar?: ImageSourcePropType;
}

export interface EventCardProps {
  /**
   * Title of the event
   */
  title: string;

  /**
   * Date and time of the event (ISO string or Date object)
   */
  dateTime: string | Date;

  /**
   * Location of the event
   */
  location: string;

  /**
   * Distance to the event location (optional)
   */
  distance?: string;

  /**
   * Image for the event card
   */
  image?: ImageSourcePropType;

  /**
   * Event category (e.g., 'Ride', 'Meet', 'Race')
   */
  category?: string;

  /**
   * List of participants (optional)
   */
  participants?: ParticipantInfo[];

  /**
   * Maximum number of participants (optional)
   */
  maxParticipants?: number;

  /**
   * Whether the event is featured
   */
  featured?: boolean;

  /**
   * Handler for when the card is pressed
   */
  onPress?: () => void;

  /**
   * Additional styles for the card container
   */
  style?: StyleProp<ViewStyle>;

  /**
   * Additional styles for the content container
   */
  contentStyle?: StyleProp<ViewStyle>;

  /**
   * Additional styles for the image
   */
  imageStyle?: StyleProp<ImageStyle>;

  /**
   * Additional styles for the title text
   */
  titleStyle?: StyleProp<TextStyle>;
}

/**
 * A card component for displaying events.
 */
const EventCard: React.FC<EventCardProps> = ({
  title,
  dateTime,
  location,
  distance,
  image,
  category,
  participants = [],
  maxParticipants,
  featured = false,
  onPress,
  style,
  contentStyle,
  imageStyle,
  titleStyle,
}) => {
  const {language} = useLanguage();
  // Format date to show only the day and month
  const getFormattedDate = () => {
    const date = typeof dateTime === 'string' ? new Date(dateTime) : dateTime;
    return date.toLocaleDateString(language, {
      month: 'short',
      day: 'numeric',
    });
  };

  // Format time to show only hours and minutes
  const getFormattedTime = () => {
    const date = typeof dateTime === 'string' ? new Date(dateTime) : dateTime;
    return date.toLocaleTimeString(language, {
      hour: 'numeric',
      minute: '2-digit',
      hour12: false,
    });
  };

  // Calculate the number of participants to display
  const displayedParticipantsCount = Math.min(participants.length, 3);
  const remainingParticipants = Math.max(
    0,
    participants.length - displayedParticipantsCount,
  );

  // Card header with category chip and featured badge
  const headerComponent = (
    <View>
      {image && (
        <Image
          source={image}
          style={[styles.image, imageStyle]}
          resizeMode="cover"
        />
      )}

      {/* Featured Badge */}
      {featured && (
        <View style={styles.featuredBadge}>
          <Icon name="check" size={12} color={colors.neutral.white} />
          <Typography
            variant="caption"
            color={colors.neutral.white}
            style={styles.featuredText}>
            Featured
          </Typography>
        </View>
      )}

      {/* Category Chip */}
      {category && (
        <View style={styles.categoryContainer}>
          <Chip
            label={category}
            color="primary"
            size="small"
            variant="filled"
            style={styles.categoryChip}
          />
        </View>
      )}
    </View>
  );

  // Card content
  const cardContent = (
    <View style={[styles.content, contentStyle]}>
      {/* Title */}
      {title && (
        <Typography weight="semiBold" variant="subtitle" style={titleStyle}>
          {title}
        </Typography>
      )}

      {/* Date and Time */}
      <View style={styles.dateTimeContainer}>
        <Icon name="calendar-filled" size={14} color={colors.neutral.grey} />
        <Typography
          variant="caption"
          color={colors.neutral.grey}
          style={styles.dateTime}>
          {getFormattedDate()} • {getFormattedTime()}
        </Typography>
      </View>

      {/* Location */}
      <View style={styles.locationContainer}>
        <Icon name="map-pin" size={14} color={colors.neutral.grey} />
        <Typography
          variant="caption"
          color={colors.neutral.grey}
          style={styles.location}>
          {location}
        </Typography>
      </View>

      {/* Participants */}
      {participants.length > 0 && (
        <View style={styles.participantsContainer}>
          <View style={styles.participantsAvatars}>
            {participants
              .slice(0, displayedParticipantsCount)
              .map((participant, index) => (
                <View
                  key={participant.id}
                  style={[
                    styles.avatarContainer,
                    {zIndex: 10 - index, marginLeft: index > 0 ? -10 : 0},
                  ]}>
                  <Image
                    source={participant.avatar || undefined}
                    style={styles.participantAvatar}
                  />
                </View>
              ))}

            {remainingParticipants > 0 && (
              <View style={[styles.avatarContainer, styles.remainingAvatars]}>
                <Typography
                  variant="caption"
                  color={colors.neutral.white}
                  align="center">
                  +{remainingParticipants}
                </Typography>
              </View>
            )}
          </View>

          <Typography variant="caption" color={colors.neutral.grey}>
            {participants.length}{' '}
            {participants.length === 1 ? 'rider' : 'riders'}
            {maxParticipants ? ` / ${maxParticipants}` : ''}
          </Typography>
        </View>
      )}
    </View>
  );

  // Base card style
  const cardStyle: StyleProp<ViewStyle> = [
    {
      backgroundColor: colors.neutral.white,
      borderRadius: radius.lg,
      marginVertical: 8,
      ...getShadow('small'),
    },
    featured && styles.featuredContainer,
    style,
  ];

  // If card is clickable, wrap in TouchableOpacity
  if (onPress) {
    return (
      <TouchableOpacity style={cardStyle} onPress={onPress} activeOpacity={0.7}>
        {headerComponent}
        {cardContent}
      </TouchableOpacity>
    );
  }

  // Otherwise render as a regular View
  return (
    <View style={cardStyle}>
      {headerComponent}
      {cardContent}
    </View>
  );
};

export default EventCard;
