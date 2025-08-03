import React, {useEffect, useRef} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import {colors, spacing, radius, typography, getShadow} from '../../theme';
import {useBottomSheet} from '../BottomSheet/BottomSheetProvider';

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
   * The list of properties to display
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
   * Tab bar height for proper positioning (not used in bottom sheet)
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
  onCardChange: _onCardChange,
}) => {
  const {openBottomSheet, closeBottomSheet} = useBottomSheet();
  const hasOpenedRef = useRef(false);

  // Open bottom sheet when items are available
  useEffect(() => {
    if (items && items.length > 0 && !hasOpenedRef.current) {
      hasOpenedRef.current = true;
      const selectedItem = items[selectedIndex] || items[0];
      const nearbyItems = items.filter((_, index) => index !== selectedIndex);

      openBottomSheet({
        content: (
          <BottomSheetContent
            selectedItem={selectedItem}
            nearbyItems={nearbyItems}
            onCardPress={onCardPress}
            onFavoritePress={onFavoritePress}
          />
        ),
        snapPoint: 'partial',
        showCloseButton: true,
        closeButtonPosition: 'top-left',
        onClose: () => {
          hasOpenedRef.current = false;
          onClosePress?.();
        },
        closeOnBackdropPress: true,
        showBackdrop: true,
        backDropOpacity: 0.3,
      });
    }
  }, [
    items,
    selectedIndex,
    openBottomSheet,
    onCardPress,
    onFavoritePress,
    onClosePress,
  ]);

  // Update bottom sheet content when selected index changes
  useEffect(() => {
    if (items && items.length > 0 && hasOpenedRef.current) {
      const selectedItem = items[selectedIndex] || items[0];
      const nearbyItems = items.filter((_, index) => index !== selectedIndex);

      openBottomSheet({
        content: (
          <BottomSheetContent
            selectedItem={selectedItem}
            nearbyItems={nearbyItems}
            onCardPress={onCardPress}
            onFavoritePress={onFavoritePress}
          />
        ),
        snapPoint: 'partial',
        showCloseButton: true,
        closeButtonPosition: 'header-right',
        onClose: () => {
          hasOpenedRef.current = false;
          onClosePress?.();
        },
        closeOnBackdropPress: true,
        showBackdrop: true,
        backDropOpacity: 0.3,
      });
    }
  }, [
    selectedIndex,
    items,
    openBottomSheet,
    onCardPress,
    onFavoritePress,
    onClosePress,
  ]);

  // Close bottom sheet when component unmounts or items become empty
  useEffect(() => {
    return () => {
      if (hasOpenedRef.current) {
        closeBottomSheet();
        hasOpenedRef.current = false;
      }
    };
  }, [closeBottomSheet]);

  useEffect(() => {
    if (!items || items.length === 0) {
      if (hasOpenedRef.current) {
        closeBottomSheet();
        hasOpenedRef.current = false;
      }
    }
  }, [items, closeBottomSheet]);

  return null; // Component now uses BottomSheet instead of rendering directly
};

// Bottom sheet content component
interface BottomSheetContentProps {
  selectedItem: RNMapMarkerCardItem;
  nearbyItems: RNMapMarkerCardItem[];
  onCardPress?: (item: RNMapMarkerCardItem) => void;
  onFavoritePress?: (item: RNMapMarkerCardItem) => void;
}

const BottomSheetContent: React.FC<BottomSheetContentProps> = ({
  selectedItem,
  nearbyItems,
  onCardPress,
  onFavoritePress,
}) => {
  // Format business type and rating
  const businessType = selectedItem.title.includes('Repair')
    ? 'Repair Shop'
    : selectedItem.title.includes('Dealer')
    ? 'Dealer'
    : 'Washing Station';

  // Mock data for demonstration - in real app this would come from selectedItem
  const phoneNumber = '+1 (555) 123-4567';
  const address = '123 Motorcycle Avenue';
  const distance = '5.2 km away';
  const reviewCount = 120;
  const openHours = '8:00 AM - 6:00 PM';

  const handleCallPress = () => {
    console.log('Call pressed:', phoneNumber);
    // In real app: Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleDirectionsPress = () => {
    console.log('Get directions pressed');
    // In real app: Open maps app with coordinates
  };

  const handleSaveToFavorites = () => {
    console.log('Save to favorites pressed');
    onFavoritePress?.(selectedItem);
  };

  return (
    <ScrollView
      style={styles.bottomSheetContainer}
      showsVerticalScrollIndicator={false}>
      {/* Main repair shop card matching the image design */}
      <View style={styles.repairShopCard}>
        {/* Header with business name */}
        <View style={styles.cardHeader}>
          <Text style={styles.businessName} numberOfLines={2}>
            {selectedItem.title}
          </Text>
        </View>

        {/* Business type with rating */}
        <View style={styles.businessTypeRow}>
          <Text style={styles.businessType}>{businessType}</Text>
          <View style={styles.ratingContainer}>
            <Text style={styles.starIcon}>⭐</Text>
            <Text style={styles.ratingText}>
              {selectedItem.rating.toFixed(1)}
            </Text>
            <Text style={styles.reviewCount}>({reviewCount})</Text>
          </View>
        </View>

        {/* Address and distance */}
        <View style={styles.addressRow}>
          <Text style={styles.addressIcon}>📍</Text>
          <View style={styles.addressInfo}>
            <Text style={styles.addressText}>{address}</Text>
            <Text style={styles.distanceText}>{distance}</Text>
          </View>
        </View>

        {/* Phone number */}
        <TouchableOpacity style={styles.phoneRow} onPress={handleCallPress}>
          <Text style={styles.phoneIcon}>📞</Text>
          <Text style={styles.phoneNumber}>{phoneNumber}</Text>
          <Text style={styles.tapToCallText}>Tap to call</Text>
        </TouchableOpacity>

        {/* Open hours */}
        <View style={styles.hoursRow}>
          <Text style={styles.clockIcon}>🕐</Text>
          <View style={styles.hoursInfo}>
            <Text style={styles.openTodayText}>Open today</Text>
            <Text style={styles.hoursText}>{openHours}</Text>
          </View>
        </View>

        {/* Action buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.directionsButton}
            onPress={handleDirectionsPress}>
            <Text style={styles.directionsIcon}>🧭</Text>
            <Text style={styles.directionsText}>Get Directions</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.callButton} onPress={handleCallPress}>
            <Text style={styles.callIcon}>📞</Text>
            <Text style={styles.callText}>Call Now</Text>
          </TouchableOpacity>
        </View>

        {/* Save to favorites button */}
        <TouchableOpacity
          style={styles.saveToFavoritesButton}
          onPress={handleSaveToFavorites}>
          <Text style={styles.heartIcon}>🤍</Text>
          <Text style={styles.saveToFavoritesText}>Save to Favorites</Text>
        </TouchableOpacity>
      </View>

      {/* Nearby places section */}
      {nearbyItems.length > 0 && (
        <View style={styles.nearbySection}>
          <Text style={styles.nearbySectionTitle}>Nearby places</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.nearbyScrollContainer}>
            {nearbyItems.map(item => (
              <TouchableOpacity
                key={item.id}
                style={styles.nearbyCard}
                onPress={() => onCardPress?.(item)}
                activeOpacity={0.8}>
                <Image
                  source={{
                    uri:
                      item.images && item.images.length > 0
                        ? item.images[0]
                        : 'https://via.placeholder.com/160x100?text=No+Image',
                  }}
                  style={styles.nearbyImage}
                  resizeMode="cover"
                />
                <View style={styles.nearbyCardContent}>
                  <Text style={styles.nearbyTitle} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={styles.nearbyLocation} numberOfLines={1}>
                    {item.location}
                  </Text>
                  <View style={styles.nearbyFooter}>
                    <View style={styles.nearbyRating}>
                      <Text style={styles.nearbyStarIcon}>⭐</Text>
                      <Text style={styles.nearbyRatingText}>
                        {item.rating.toFixed(1)}
                      </Text>
                    </View>
                    <Text style={styles.nearbyPrice}>
                      {item.price} {item.currency}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  bottomSheetContainer: {
    flex: 1,
  },
  // New repair shop card styles matching the image design
  repairShopCard: {
    backgroundColor: colors.neutral.white,
    borderRadius: radius.md,
  },
  cardHeader: {
    marginBottom: spacing.sm,
  },
  businessName: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.neutral.black,
    lineHeight: 28,
  },
  businessTypeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  businessType: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.neutral.grey,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  starIcon: {
    fontSize: 16,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral.black,
  },
  reviewCount: {
    fontSize: 16,
    color: colors.neutral.grey,
    marginLeft: 2,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  addressIcon: {
    fontSize: 16,
    marginRight: spacing.sm,
    marginTop: 2,
  },
  addressInfo: {
    flex: 1,
  },
  addressText: {
    fontSize: 16,
    color: colors.neutral.black,
    fontWeight: '500',
    lineHeight: 20,
  },
  distanceText: {
    fontSize: 14,
    color: colors.neutral.grey,
    marginTop: 2,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  phoneIcon: {
    fontSize: 16,
    marginRight: spacing.sm,
  },
  phoneNumber: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
    flex: 1,
  },
  tapToCallText: {
    fontSize: 14,
    color: colors.neutral.grey,
  },
  hoursRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  clockIcon: {
    fontSize: 16,
    marginRight: spacing.sm,
    marginTop: 2,
  },
  hoursInfo: {
    flex: 1,
  },
  openTodayText: {
    fontSize: 16,
    color: colors.neutral.black,
    fontWeight: '500',
    lineHeight: 20,
  },
  hoursText: {
    fontSize: 14,
    color: colors.neutral.grey,
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  directionsButton: {
    flex: 1,
    backgroundColor: colors.neutral.black,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: radius.sm,
    gap: spacing.xs,
  },
  directionsIcon: {
    fontSize: 16,
  },
  directionsText: {
    color: colors.neutral.white,
    fontSize: 16,
    fontWeight: '600',
  },
  callButton: {
    flex: 1,
    backgroundColor: '#34C759',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: radius.sm,
    gap: spacing.xs,
  },
  callIcon: {
    fontSize: 16,
  },
  callText: {
    color: colors.neutral.white,
    fontSize: 16,
    fontWeight: '600',
  },
  saveToFavoritesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.neutral.lightGrey,
    backgroundColor: colors.neutral.white,
    marginBottom: spacing.md,
  },
  heartIcon: {
    fontSize: 18,
    marginRight: spacing.sm,
  },
  saveToFavoritesText: {
    fontSize: 16,
    color: colors.neutral.black,
    fontWeight: '500',
  },
  // Existing nearby section styles
  nearbySection: {
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  nearbySectionTitle: {
    fontSize: typography.subtitle.fontSize,
    fontWeight: getFontWeight(typography.subtitle.fontWeight),
    color: colors.neutral.black,
    marginBottom: spacing.sm,
    marginHorizontal: spacing.md,
  },
  nearbyScrollContainer: {
    paddingLeft: spacing.md,
    paddingRight: spacing.md,
  },
  nearbyCard: {
    width: 160,
    backgroundColor: colors.neutral.white,
    borderRadius: radius.sm,
    marginRight: spacing.sm,
    overflow: 'hidden',
    ...getShadow('small'),
  },
  nearbyImage: {
    width: '100%',
    height: 100,
  },
  nearbyCardContent: {
    padding: spacing.sm,
  },
  nearbyTitle: {
    fontSize: typography.bodySmall.fontSize,
    fontWeight: getFontWeight(typography.bodySmall.fontWeight),
    color: colors.neutral.black,
    marginBottom: 2,
  },
  nearbyLocation: {
    fontSize: typography.caption.fontSize,
    color: colors.neutral.grey,
    marginBottom: spacing.xs,
  },
  nearbyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nearbyRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  nearbyStarIcon: {
    color: '#FFD700',
    fontSize: 12,
  },
  nearbyRatingText: {
    fontSize: typography.caption.fontSize,
    color: colors.neutral.black,
  },
  nearbyPrice: {
    fontSize: typography.bodySmall.fontSize,
    fontWeight: getFontWeight(typography.bodySmall.fontWeight),
    color: colors.neutral.black,
  },
});
