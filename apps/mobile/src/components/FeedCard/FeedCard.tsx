import React from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  ImageSourcePropType,
  StyleProp,
  ViewStyle,
  ImageStyle,
} from 'react-native';
import {Typography} from '../Typography/Typography';
import {Icon, IconName} from '../Icon';
import {colors} from '@theme/colors';
import {styles} from './FeedCard.styles';

export interface FeedCardProps {
  /**
   * User avatar image source
   */
  avatarSource: ImageSourcePropType;

  /**
   * User's full name
   */
  userName: string;

  /**
   * Time when the post was created (e.g., "2h ago")
   */
  timeAgo: string;

  /**
   * Labels for the post (e.g., club name, location)
   */
  labels?: Array<{
    icon?: IconName;
    text: string;
  }>;

  /**
   * Main content text of the post
   */
  content?: string;

  /**
   * Main image for the post
   */
  image?: ImageSourcePropType;

  /**
   * Title for the route or location
   */
  routeTitle?: string;

  /**
   * Handler for when the card is pressed
   */
  onPress?: () => void;

  /**
   * Handler for when the route button is pressed
   */
  onRoutePress?: () => void;

  /**
   * Number of likes
   */
  likeCount?: number;

  /**
   * Number of comments
   */
  commentCount?: number;

  /**
   * Whether the post is saved
   */
  isSaved?: boolean;

  /**
   * Handler for when the like button is pressed
   */
  onLikePress?: () => void;

  /**
   * Handler for when the comment button is pressed
   */
  onCommentPress?: () => void;

  /**
   * Handler for when the save button is pressed
   */
  onSavePress?: () => void;

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
}

/**
 * A reusable card component for feed items.
 */
const FeedCard: React.FC<FeedCardProps> = ({
  avatarSource,
  userName,
  timeAgo,
  labels = [],
  content,
  image,
  routeTitle,
  onPress,
  onRoutePress,
  likeCount = 0,
  commentCount = 0,
  isSaved = false,
  onLikePress,
  onCommentPress,
  onSavePress,
  style,
  contentStyle,
  imageStyle,
}) => {
  const handlePress = () => {
    if (onPress) onPress();
  };

  const handleRoutePress = (e: any) => {
    e.stopPropagation();
    if (onRoutePress) onRoutePress();
  };

  const renderCard = () => (
    <View style={[styles.container, style]}>
      {/* Card Header */}
      <View style={styles.header}>
        <Image source={avatarSource} style={styles.avatar} />

        <View style={styles.headerInfo}>
          <Typography variant="subtitle" weight="medium">
            {userName}
          </Typography>
          <Typography variant="caption" color={colors.neutral.grey}>
            {timeAgo}
          </Typography>
        </View>
      </View>

      {/* Labels */}
      {labels.length > 0 && (
        <View style={styles.labelsContainer}>
          {labels.map((label, index) => (
            <View key={index} style={styles.label}>
              {label.icon && (
                <Icon
                  name={label.icon}
                  size={14}
                  color={colors.neutral.grey}
                  style={styles.labelIcon}
                />
              )}
              <Typography
                variant="caption"
                color={colors.neutral.grey}
                style={styles.labelText}>
                {label.text}
              </Typography>
            </View>
          ))}
        </View>
      )}

      {/* Content */}
      {content && (
        <Typography variant="body" style={[styles.content, contentStyle]}>
          {content}
        </Typography>
      )}

      {/* Main Image */}
      {image && (
        <Image
          source={image}
          style={[styles.mainImage, imageStyle]}
          resizeMode="cover"
        />
      )}

      {/* Route Information (if applicable) */}
      {routeTitle && (
        <View style={styles.routeContainer}>
          <Icon name="route" size={18} color={colors.neutral.black} />
          <Typography
            variant="bodySmall"
            weight="medium"
            style={styles.routeTitle}>
            {routeTitle}
          </Typography>
          <TouchableOpacity
            onPress={handleRoutePress}
            style={styles.routeButton}>
            <Typography variant="caption" color={colors.neutral.white}>
              View Route
            </Typography>
          </TouchableOpacity>
        </View>
      )}

      {/* Action Bar */}
      <View style={styles.actionBar}>
        {/* Like Button */}
        <TouchableOpacity onPress={onLikePress} style={styles.actionButton}>
          <Icon name="users" size={20} color={colors.neutral.grey} />
          <Typography
            variant="caption"
            color={colors.neutral.grey}
            style={styles.actionText}>
            {likeCount}
          </Typography>
        </TouchableOpacity>

        {/* Comment Button */}
        <TouchableOpacity onPress={onCommentPress} style={styles.actionButton}>
          <Icon name="users" size={20} color={colors.neutral.grey} />
          <Typography
            variant="caption"
            color={colors.neutral.grey}
            style={styles.actionText}>
            {commentCount}
          </Typography>
        </TouchableOpacity>

        {/* Save Button */}
        <TouchableOpacity
          onPress={onSavePress}
          style={[styles.actionButton, styles.saveButton]}>
          <Icon name="user" size={20} color={colors.neutral.grey} />
          <Typography
            variant="caption"
            color={colors.neutral.grey}
            style={styles.actionText}>
            Save
          </Typography>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.9} onPress={handlePress}>
        {renderCard()}
      </TouchableOpacity>
    );
  }

  return renderCard();
};

export default FeedCard;
