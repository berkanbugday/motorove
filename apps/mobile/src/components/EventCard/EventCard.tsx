import React, {useCallback, useState, useRef} from 'react';
import {
  View,
  Image,
  StyleProp,
  ViewStyle,
  TextStyle,
  ImageStyle,
  TouchableOpacity,
  Dimensions,
  LayoutChangeEvent,
} from 'react-native';
import {BlurView} from '@react-native-community/blur';
import Carousel, {Pagination} from 'react-native-snap-carousel';
import {Typography} from '../Typography';
import {Icon} from '../Icon';
import {colors, getShadow, radius} from '@theme';
import {Chip} from '../Chip';
import {ParticipantAvatars} from '../ParticipantAvatars';
import {ImagePreviewModal} from '../ImagePreviewModal';
import {styles} from './EventCard.styles';
import {useLanguage} from '@contexts/LanguageContext';
import {useTranslation} from '@hooks/useTranslation';
import {format} from 'date-fns';
import {Language, IImage} from '@motorove/shared';
import {tr, enUS} from 'date-fns/locale';

export interface ParticipantInfo {
  id: string;
  name: string;
  avatar?: string;
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
  _distance?: string;

  /**
   * Images for the event card (can be multiple)
   */
  images?: IImage[] | null;

  /**
   * Event category (e.g., 'Ride', 'Meet', 'Race')
   */
  category?: string;

  /**
   * List of participants (optional)
   */
  participants?: ParticipantInfo[] | null;

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
const {width: screenWidth} = Dimensions.get('window');

const EventCard: React.FC<EventCardProps> = ({
  title,
  dateTime,
  location,
  _distance,
  images,
  category,
  participants = [],
  featured = false,
  onPress,
  style,
  contentStyle,
  imageStyle,
  titleStyle,
}) => {
  const {language} = useLanguage();
  const {t} = useTranslation();
  const [activeSlide, setActiveSlide] = useState(0);
  const [cardWidth, setCardWidth] = useState(0);
  const [revealedCensoredImages, setRevealedCensoredImages] = useState<{
    [key: number]: boolean;
  }>({});
  const [imagePreviewVisible, setImagePreviewVisible] = useState(false);
  const [imagePreviewIndex, setImagePreviewIndex] = useState(0);
  const carouselRef = useRef(null);

  // Convert images to array for backward compatibility
  const imageArray = images ? (Array.isArray(images) ? images : [images]) : [];
  // Format date for display
  const formatEventDate = useCallback(() => {
    const eventDate =
      typeof dateTime === 'string' ? new Date(dateTime) : dateTime;
    return format(eventDate, 'PPPP • HH:mm', {
      locale: language.toLowerCase() === Language.TR.toLowerCase() ? tr : enUS,
    });
  }, []);

  const handleLayout = (event: LayoutChangeEvent) => {
    const {width} = event.nativeEvent.layout;
    setCardWidth(width);
  };

  const handleToggleCensoredImage = (index: number) => {
    setRevealedCensoredImages(prev => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleImagePress = (index: number) => {
    setImagePreviewIndex(index);
    setImagePreviewVisible(true);
  };

  const handleCloseImagePreview = () => {
    setImagePreviewVisible(false);
  };

  const renderCarouselItem = ({item, index}: {item: IImage; index: number}) => {
    const isCensored = item.isCensored;
    const isRevealed = revealedCensoredImages[index];

    return (
      <View style={styles.imageContainer}>
        <View style={{position: 'relative'}}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => handleImagePress(index)}>
            <Image
              source={{uri: item.url}}
              style={[styles.image, imageStyle]}
              resizeMode="cover"
            />
          </TouchableOpacity>
          {isCensored && !isRevealed ? (
            <TouchableOpacity
              style={styles.blurContainer}
              activeOpacity={0.9}
              onPress={() => handleToggleCensoredImage(index)}>
              <BlurView
                style={styles.blurView}
                blurType="light"
                blurAmount={15}
              />
              <View style={styles.censoredOverlay}>
                <Icon
                  name="eye-filled"
                  size={32}
                  color={colors.neutral.white}
                />
                <Typography
                  variant="subtitle"
                  weight="medium"
                  color={colors.neutral.white}
                  style={styles.censoredText}>
                  {t('components.feedCard.tap_to_view')}
                </Typography>
              </View>
            </TouchableOpacity>
          ) : null}
          {isCensored && isRevealed && (
            <TouchableOpacity
              style={styles.hideButton}
              onPress={() => handleToggleCensoredImage(index)}>
              <Icon
                name="eye-slash-filled"
                size={20}
                color={colors.neutral.white}
              />
              <Typography
                variant="caption"
                color={colors.neutral.white}
                style={{marginLeft: 4}}>
                {t('components.feedCard.hide')}
              </Typography>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const renderSingleImage = (image: IImage, index: number = 0) => {
    const isCensored = image.isCensored;
    const isRevealed = revealedCensoredImages[index];

    return (
      <View style={styles.imageContainer}>
        <View style={{position: 'relative'}}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => handleImagePress(index)}>
            <Image
              source={{uri: image.url}}
              style={[styles.image, imageStyle]}
              resizeMode="cover"
            />
          </TouchableOpacity>
          {isCensored && !isRevealed ? (
            <TouchableOpacity
              style={styles.blurContainer}
              activeOpacity={0.9}
              onPress={() => handleToggleCensoredImage(index)}>
              <BlurView
                style={styles.blurView}
                blurType="light"
                blurAmount={15}
              />
              <View style={styles.censoredOverlay}>
                <Icon
                  name="eye-filled"
                  size={32}
                  color={colors.neutral.white}
                />
                <Typography
                  variant="subtitle"
                  weight="medium"
                  color={colors.neutral.white}
                  style={styles.censoredText}>
                  {t('components.feedCard.tap_to_view')}
                </Typography>
              </View>
            </TouchableOpacity>
          ) : null}
          {isCensored && isRevealed && (
            <TouchableOpacity
              style={styles.hideButton}
              onPress={() => handleToggleCensoredImage(index)}>
              <Icon
                name="eye-slash-filled"
                size={20}
                color={colors.neutral.white}
              />
              <Typography
                variant="caption"
                color={colors.neutral.white}
                style={{marginLeft: 4}}>
                {t('components.feedCard.hide')}
              </Typography>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  // Card header with category chip and featured badge
  const headerComponent = (
    <View onLayout={handleLayout}>
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
                onSnapToItem={(index: number) => setActiveSlide(index)}
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
            renderSingleImage(imageArray[0], 0)
          )}
        </View>
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
        {dateTime && (
          <Icon
            name="calendar-clock-filled"
            size={14}
            color={colors.neutral.grey}
          />
        )}
        <Typography
          variant="caption"
          color={colors.neutral.grey}
          style={styles.dateTime}>
          {formatEventDate()}
        </Typography>
      </View>

      {/* Location */}
      <View style={styles.locationContainer}>
        {location && (
          <Icon name="map-pin-filled" size={14} color={colors.neutral.grey} />
        )}
        <Typography
          variant="caption"
          color={colors.neutral.grey}
          style={styles.location}>
          {location}
        </Typography>
      </View>

      {/* Participants */}
      {participants && participants?.length > 0 && (
        <View style={styles.participantsContainer}>
          <ParticipantAvatars participants={participants} maxAvatars={4} />
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
      <>
        <TouchableOpacity
          style={cardStyle}
          onPress={onPress}
          activeOpacity={0.7}>
          {headerComponent}
          {cardContent}
        </TouchableOpacity>
        <ImagePreviewModal
          visible={imagePreviewVisible}
          images={imageArray}
          initialIndex={imagePreviewIndex}
          onClose={handleCloseImagePreview}
        />
      </>
    );
  }

  // Otherwise render as a regular View
  return (
    <>
      <View style={cardStyle}>
        {headerComponent}
        {cardContent}
      </View>
      <ImagePreviewModal
        visible={imagePreviewVisible}
        images={imageArray}
        initialIndex={imagePreviewIndex}
        onClose={handleCloseImagePreview}
      />
    </>
  );
};

export default EventCard;
