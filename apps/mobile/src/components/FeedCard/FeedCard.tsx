import React, {useState, useRef} from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  ImageSourcePropType,
  StyleProp,
  ViewStyle,
  ImageStyle,
  Dimensions,
  LayoutChangeEvent,
  Animated,
} from 'react-native';
import Carousel, {Pagination} from 'react-native-snap-carousel';
import {Typography} from '../Typography/Typography';
import {colors} from '@theme';
import {styles} from './FeedCard.styles';
import {Button, Chip, Icon, IconName} from '@components';

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
   * Main images for the post (can be a single image or multiple)
   */
  images?: ImageSourcePropType[];

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
   * Whether the post is liked by the current user
   */
  isLiked?: boolean;

  /**
   * Whether the post has been commented on by the current user
   */
  isCommented?: boolean;

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
   * Handler for when the more button is pressed
   */
  onMorePress?: () => void;

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
   * Props for the image overlay
   */
  overlayProps?: {
    /**
     * Color of the overlay
     */
    color?: string;

    /**
     * Opacity of the overlay (0-1)
     */
    opacity?: number;

    /**
     * Additional styles for the overlay
     */
    style?: StyleProp<ViewStyle>;
  };
}

const {width: screenWidth} = Dimensions.get('window');

/**
 * A reusable card component for feed items.
 */
const FeedCard: React.FC<FeedCardProps> = ({
  avatarSource,
  userName,
  timeAgo,
  labels = [],
  content,
  images,
  routeTitle,
  onPress,
  onRoutePress,
  likeCount = 0,
  commentCount = 0,
  isLiked = false,
  isCommented = false,
  isSaved = false,
  onLikePress,
  onCommentPress,
  onSavePress,
  onMorePress,
  style,
  contentStyle,
  imageStyle,
  overlayProps = {
    color: colors.neutral.black,
    opacity: 0.3,
  },
}) => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [cardWidth, setCardWidth] = useState(0);
  const carouselRef = useRef(null);
  const likeAnimatedValue = useRef(new Animated.Value(1)).current;
  const saveAnimatedValue = useRef(new Animated.Value(1)).current;

  // For backward compatibility, convert single image to array
  const imageArray = images ? (Array.isArray(images) ? images : [images]) : [];

  const handlePress = () => {
    if (onPress) {
      onPress();
    }
  };

  const handleRoutePress = () => {
    if (onRoutePress) {
      onRoutePress();
    }
  };

  const handleLayout = (event: LayoutChangeEvent) => {
    const {width} = event.nativeEvent.layout;
    setCardWidth(width);
  };

  const handleLikePress = () => {
    // Animate the like button
    Animated.sequence([
      Animated.timing(likeAnimatedValue, {
        toValue: 1.3,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(likeAnimatedValue, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    // Call the original onLikePress handler
    if (onLikePress) {
      onLikePress();
    }
  };

  const handleSavePress = () => {
    // Simple pop animation for save button
    Animated.sequence([
      Animated.timing(saveAnimatedValue, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(saveAnimatedValue, {
        toValue: 1.1,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(saveAnimatedValue, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Call the original onSavePress handler
    if (onSavePress) {
      onSavePress();
    }
  };

  const renderCarouselItem = ({item}: {item: ImageSourcePropType}) => {
    return (
      <View style={styles.imageContainer}>
        <View style={{position: 'relative'}}>
          <Image
            source={item}
            style={[styles.mainImage, imageStyle]}
            resizeMode="stretch"
          />
          <View
            style={[
              styles.imageOverlay,
              {
                backgroundColor: overlayProps.color || colors.neutral.black,
                opacity: overlayProps.opacity || 0.3,
              },
              overlayProps.style,
            ]}
          />
        </View>
      </View>
    );
  };

  const renderSingleImage = (image: ImageSourcePropType) => {
    return (
      <View style={styles.imageContainer}>
        <View style={{position: 'relative'}}>
          <Image
            source={image}
            style={[styles.mainImage, imageStyle]}
            resizeMode="stretch"
          />
          <View
            style={[
              styles.imageOverlay,
              {
                backgroundColor: overlayProps.color || colors.neutral.black,
                opacity: overlayProps.opacity || 0.3,
              },
              overlayProps.style,
            ]}
          />
        </View>
      </View>
    );
  };

  const renderCard = () => (
    <View style={[styles.container, style]} onLayout={handleLayout}>
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

        {/* More Button */}
        {onMorePress && (
          <TouchableOpacity
            onPress={onMorePress}
            hitSlop={{top: 10, right: 10, bottom: 10, left: 10}}>
            <Icon name="more-vertical" size={24} color={colors.neutral.grey} />
          </TouchableOpacity>
        )}
      </View>

      {/* Labels */}
      {labels.length > 0 && (
        <View style={styles.labelsContainer}>
          {labels.map((label, index) => (
            <Chip
              key={index}
              label={label.text}
              leadingIcon={label.icon}
              size="small"
              variant="filled"
              color="secondary"
              style={styles.labelChip}
            />
          ))}
        </View>
      )}

      {/* Content */}
      {content && (
        <Typography variant="body" style={[styles.content, contentStyle]}>
          {content}
        </Typography>
      )}

      {/* Images */}
      {imageArray.length > 0 && (
        <View style={styles.carouselContainer}>
          {imageArray.length > 1 ? (
            <>
              <Carousel
                ref={carouselRef}
                data={imageArray}
                renderItem={renderCarouselItem}
                sliderWidth={cardWidth > 0 ? cardWidth : screenWidth - 32}
                itemWidth={cardWidth > 0 ? cardWidth : screenWidth - 32}
                onSnapToItem={index => setActiveSlide(index)}
                inactiveSlideScale={1}
                inactiveSlideOpacity={1}
                activeSlideAlignment="center"
              />
              <Pagination
                dotsLength={imageArray.length}
                activeDotIndex={activeSlide}
                containerStyle={styles.paginationContainer}
                dotStyle={styles.paginationDot}
                inactiveDotStyle={styles.paginationInactiveDot}
                inactiveDotOpacity={0.4}
                inactiveDotScale={1}
              />
            </>
          ) : (
            renderSingleImage(imageArray[0])
          )}
        </View>
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
          <Button
            title="View Route"
            variant="primary"
            shape="round"
            size="small"
            onPress={handleRoutePress}
            testID="view-route-button"
          />
        </View>
      )}

      {/* Action Bar */}
      <View style={styles.actionBar}>
        {/* Like Button */}
        <TouchableOpacity onPress={handleLikePress} style={styles.actionButton}>
          <Animated.View style={{transform: [{scale: likeAnimatedValue}]}}>
            <Icon
              name={isLiked ? 'like-filled' : 'like'}
              size={20}
              color={isLiked ? colors.primary.main : colors.neutral.grey}
            />
          </Animated.View>
          <Typography
            variant="caption"
            color={isLiked ? colors.primary.main : colors.neutral.grey}
            style={styles.actionText}>
            {likeCount}
          </Typography>
        </TouchableOpacity>

        {/* Comment Button */}
        <TouchableOpacity onPress={onCommentPress} style={styles.actionButton}>
          <Icon
            name={isCommented ? 'comment-filled' : 'comment'}
            size={20}
            color={isCommented ? colors.primary.main : colors.neutral.grey}
          />
          <Typography
            variant="caption"
            color={isCommented ? colors.primary.main : colors.neutral.grey}
            style={styles.actionText}>
            {commentCount}
          </Typography>
        </TouchableOpacity>

        {/* Save Button */}
        <TouchableOpacity
          onPress={handleSavePress}
          style={[styles.actionButton, styles.saveButton]}>
          <Animated.View
            style={{
              transform: [{scale: saveAnimatedValue}],
            }}>
            <Icon
              name={isSaved ? 'save-filled' : 'save'}
              size={20}
              color={isSaved ? colors.primary.main : colors.neutral.grey}
            />
          </Animated.View>
          <Typography
            variant="caption"
            color={isSaved ? colors.primary.main : colors.neutral.grey}
            style={styles.actionText}>
            {isSaved ? 'Saved' : 'Save'}
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
