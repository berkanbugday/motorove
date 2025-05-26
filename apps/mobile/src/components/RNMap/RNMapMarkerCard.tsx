import React, {useRef} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Dimensions,
  ViewToken,
} from 'react-native';
import {colors, spacing, radius, typography, getShadow} from '../../theme';
import {Text as TextIcon} from 'react-native';

export interface RNMapMarkerCardItem {
  id: string;
  images: string[];
  title: string;
  location: string;
  rating: number;
  dates: string;
  price: number;
  currency: string;
  isFavorite?: boolean;
  isGuestFavorite?: boolean;
}

interface RNMapMarkerCardProps {
  /**
   * The list of properties to display in the carousel
   */
  items: RNMapMarkerCardItem[];

  /**
   * Callback when a card is pressed
   */
  onCardPress?: (item: RNMapMarkerCardItem) => void;

  /**
   * Callback when the favorite button is pressed
   */
  onFavoritePress?: (item: RNMapMarkerCardItem) => void;

  /**
   * Callback when the close button is pressed
   */
  onClosePress?: () => void;

  /**
   * Current selected card index
   */
  selectedIndex?: number;

  /**
   * Callback when a card is swiped/scrolled to
   */
  onCardChange?: (index: number) => void;

  /**
   * Tab bar height for proper positioning
   */
  tabBarHeight?: number;
}

// Map font weight strings to numeric values
const getFontWeight = (weight: string): '400' | '500' | '600' | '700' => {
  switch (weight) {
    case 'regular':
      return '400';
    case 'medium':
      return '500';
    case 'semiBold':
      return '600';
    case 'bold':
      return '700';
    default:
      return '400';
  }
};

export const RNMapMarkerCard: React.FC<RNMapMarkerCardProps> = ({
  items,
  onCardPress,
  onFavoritePress,
  onClosePress,
  selectedIndex = 0,
  onCardChange,
  tabBarHeight = 60,
}) => {
  const flatListRef = useRef<FlatList>(null);
  const {width: screenWidth} = Dimensions.get('window');
  const cardWidth = screenWidth - spacing.lg * 2;

  // Scroll to the selected index when it changes
  React.useEffect(() => {
    if (flatListRef.current && items.length > 0) {
      flatListRef.current.scrollToIndex({
        index: selectedIndex,
        animated: true,
        viewPosition: 0.5,
      });
    }
  }, [selectedIndex, items.length]);

  const handleViewableItemsChanged = React.useCallback(
    (info: {viewableItems: ViewToken[]; changed: ViewToken[]}) => {
      if (
        info.viewableItems.length > 0 &&
        onCardChange &&
        info.viewableItems[0].index !== null
      ) {
        onCardChange(info.viewableItems[0].index);
      }
    },
    [onCardChange],
  );

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50,
  };

  const renderCard = ({item}: {item: RNMapMarkerCardItem}) => {
    return (
      <TouchableOpacity
        style={[
          styles.card,
          {
            width: cardWidth,
          },
        ]}
        onPress={() => onCardPress && onCardPress(item)}
        activeOpacity={0.9}>
        {/* Card Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{uri: item.images[0]}}
            style={styles.image}
            resizeMode="cover"
          />

          {/* Guest Favorite Label */}
          {item.isGuestFavorite && (
            <View
              style={[
                styles.guestFavoriteContainer,
                {backgroundColor: colors.neutral.white},
              ]}>
              <Text
                style={[
                  styles.guestFavoriteText,
                  {color: colors.neutral.black},
                ]}>
                Guest favorite
              </Text>
            </View>
          )}

          {/* Controls Container */}
          <View style={styles.controlsContainer}>
            {/* Favorite Button */}
            <TouchableOpacity
              style={[
                styles.iconButton,
                {backgroundColor: colors.neutral.white},
              ]}
              onPress={() => onFavoritePress && onFavoritePress(item)}>
              <TextIcon
                style={{
                  color: item.isFavorite
                    ? colors.status.error
                    : colors.neutral.black,
                  fontSize: 18,
                }}>
                {item.isFavorite ? '♥' : '♡'}
              </TextIcon>
            </TouchableOpacity>

            {/* Close Button */}
            <TouchableOpacity
              style={[
                styles.iconButton,
                {backgroundColor: colors.neutral.white},
              ]}
              onPress={onClosePress}>
              <TextIcon style={{color: colors.neutral.black, fontSize: 18}}>
                ✕
              </TextIcon>
            </TouchableOpacity>
          </View>
        </View>

        {/* Card Content */}
        <View style={styles.content}>
          {/* Location and Rating Row */}
          <View style={styles.headerRow}>
            <Text
              numberOfLines={1}
              style={[
                styles.location,
                {
                  color: colors.neutral.black,
                  fontSize: typography.bodySmall.fontSize,
                  fontWeight: getFontWeight(typography.subtitle.fontWeight),
                },
              ]}>
              {item.location}
            </Text>
            <View style={styles.ratingContainer}>
              <TextIcon style={{color: colors.neutral.black, fontSize: 14}}>
                ★
              </TextIcon>
              <Text
                style={[
                  styles.rating,
                  {
                    color: colors.neutral.black,
                    fontSize: typography.bodySmall.fontSize,
                    fontWeight: getFontWeight(typography.bodySmall.fontWeight),
                  },
                ]}>
                {item.rating.toFixed(1)}
              </Text>
            </View>
          </View>

          {/* Price and Date Row */}
          <View style={styles.footerRow}>
            <Text
              numberOfLines={1}
              style={[
                styles.dates,
                {
                  color: colors.neutral.grey,
                  fontSize: typography.bodySmall.fontSize,
                  fontWeight: getFontWeight(typography.bodySmall.fontWeight),
                },
              ]}>
              {item.dates}
            </Text>
            <View style={styles.priceContainer}>
              <Text
                style={[
                  styles.price,
                  {
                    color: colors.neutral.black,
                    fontSize: typography.body.fontSize,
                    fontWeight: getFontWeight(typography.title.fontWeight),
                  },
                ]}>
                ${item.price}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <View style={[styles.container, {bottom: tabBarHeight}]}>
      <FlatList
        ref={flatListRef}
        data={items}
        renderItem={renderCard}
        keyExtractor={item => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        decelerationRate="fast"
        snapToInterval={cardWidth + spacing.sm}
        snapToAlignment="center"
        contentContainerStyle={{
          paddingHorizontal: spacing.lg,
          gap: spacing.sm,
        }}
        onViewableItemsChanged={handleViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 999,
    ...getShadow('small'),
  },
  card: {
    overflow: 'hidden',
    marginBottom: spacing.sm,
    backgroundColor: colors.neutral.white,
    borderRadius: radius.md,
    ...getShadow('small'),
  },
  imageContainer: {
    height: 120,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  guestFavoriteContainer: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 20,
  },
  guestFavoriteText: {
    fontWeight: '600',
    fontSize: 12,
  },
  controlsContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    padding: 6,
    width: 32,
    height: 32,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  location: {
    flex: 1,
    fontWeight: '600',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  rating: {
    fontWeight: '600',
  },
  dates: {
    flex: 1,
    marginRight: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  price: {
    fontWeight: '600',
  },
});
