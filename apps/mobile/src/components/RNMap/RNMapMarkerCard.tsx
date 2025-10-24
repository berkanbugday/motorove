import React, {useMemo} from 'react';
import {View, StyleSheet, TouchableOpacity, Linking} from 'react-native';
import {RNMapMarkerCardProps} from './types';
import {colors} from '@theme/colors';
import {spacing} from '@theme/spacing';
import {radius} from '@theme/radius';
import {Body, Title, Caption} from '@components/Typography';
import {Icon} from '@components/Icon';
import {BusinessCategory} from '@motorove/shared';

/**
 * Business marker card component
 * Displays detailed business information in a card format
 */
export const RNMapMarkerCard: React.FC<RNMapMarkerCardProps> = ({
  business,
  onPress,
  onClose,
  style,
  userLocation,
}) => {

  // Get category display name
  const getCategoryName = () => {
    const categoryMap: Record<BusinessCategory, string> = {
      [BusinessCategory.REPAIR_MAINTENANCE]: 'Repair & Maintenance',
      [BusinessCategory.DEALERSHIPS_SALES]: 'Dealership & Sales',
      [BusinessCategory.PARTS_ACCESSORIES]: 'Parts & Accessories',
      [BusinessCategory.CUSTOMIZATION_TUNING]: 'Customization & Tuning',
      [BusinessCategory.MOTORCYCLE_RENTAL]: 'Motorcycle Rental',
      [BusinessCategory.TIRES_WHEELS]: 'Tires & Wheels',
      [BusinessCategory.DETAILING_WRAPPING]: 'Detailing & Wrapping',
      [BusinessCategory.ROADSIDE_ASSISTANCE]: 'Roadside Assistance',
      [BusinessCategory.GEAR_APPAREL]: 'Gear & Apparel',
      [BusinessCategory.TRAINING_RIDING_SCHOOLS]: 'Training & Riding Schools',
      [BusinessCategory.MOTORCYCLE_CLUBS_COMMUNITIES]: 'Clubs & Communities',
      [BusinessCategory.ELECTRIC_MOTORCYCLE_SERVICES]: 'Electric Motorcycle Services',
      [BusinessCategory.PAINTING_BODYWORK]: 'Painting & Bodywork',
      [BusinessCategory.INSPECTION_LEGAL_SERVICES]: 'Inspection & Legal Services',
      [BusinessCategory.TRANSPORTATION_STORAGE]: 'Transportation & Storage',
    };
    return categoryMap[business.category] || 'Business';
  };

  // Calculate distance from user location
  const distance = useMemo(() => {
    if (!userLocation) {
      return null;
    }

    const R = 6371; // Earth's radius in km
    const dLat = ((business.address.latitude - userLocation.latitude) * Math.PI) / 180;
    const dLon = ((business.address.longitude - userLocation.longitude) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((userLocation.latitude * Math.PI) / 180) *
        Math.cos((business.address.latitude * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    return d.toFixed(1);
  }, [userLocation, business.address]);

  // Get working hours for today
  const getTodayWorkingHours = () => {
    const days = [
      'SUNDAY',
      'MONDAY',
      'TUESDAY',
      'WEDNESDAY',
      'THURSDAY',
      'FRIDAY',
      'SATURDAY',
    ];
    const today = days[new Date().getDay()];

    const todayHours = business.workingHours?.find(
      wh => wh.dayOfWeek === today,
    );

    if (!todayHours) {
      return null;
    }

    if (todayHours.isOpen24h) {
      return 'Open 24 hours';
    }

    if (todayHours.startHour && todayHours.endHour) {
      return `${todayHours.startHour} - ${todayHours.endHour}`;
    }

    return null;
  };

  const workingHours = getTodayWorkingHours();

  const handleCall = () => {
    const phoneNumber = `${business.countryCode}${business.phoneNumber}`;
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleDirections = () => {
    const {latitude, longitude} = business.address;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
    Linking.openURL(url);
  };

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={onPress}
      activeOpacity={0.95}>
      {onClose && (
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Icon name="close" size={20} color={colors.neutral.black} />
        </TouchableOpacity>
      )}

      {/* Business Name */}
      <Title weight="bold" numberOfLines={1} style={styles.businessName}>
        {business.name}
      </Title>

      {/* Category and Rating Row */}
      <View style={styles.categoryRatingRow}>
        <Caption color={colors.neutral.grey} style={styles.category}>
          {getCategoryName()}
        </Caption>
        <View style={styles.ratingContainer}>
          <Caption weight="semiBold" style={styles.ratingText}>
            ⭐ 4.5
          </Caption>
          <Caption color={colors.neutral.grey} style={styles.reviewCount}>
            (120)
          </Caption>
        </View>
      </View>

      {/* Address with Distance */}
      <View style={styles.infoRow}>
        <Icon name="map-pin-filled" size={16} color={colors.neutral.grey} />
        <View style={styles.infoTextContainer}>
          <Body numberOfLines={1} style={styles.addressText}>
            {business.address.address}
          </Body>
          {distance && (
            <Caption color={colors.neutral.grey}>
              {distance} km away
            </Caption>
          )}
        </View>
      </View>

      {/* Phone Number */}
      {business.phoneNumber && (
        <TouchableOpacity style={styles.infoRow} onPress={handleCall}>
          <Icon name="phone" size={16} color={colors.neutral.grey} />
          <View style={styles.infoTextContainer}>
            <Body color="#007AFF" style={styles.phoneText}>
              {business.countryCode} {business.phoneNumber}
            </Body>
            <Caption color="#007AFF">Tap to call</Caption>
          </View>
        </TouchableOpacity>
      )}

      {/* Operating Hours */}
      {workingHours && (
        <View style={styles.infoRow}>
          <Icon name="clock" size={16} color={colors.neutral.grey} />
          <View style={styles.infoTextContainer}>
            <Body color={colors.neutral.grey}>Open today</Body>
            <Caption color={colors.neutral.grey}>{workingHours}</Caption>
          </View>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.directionsButton}
          onPress={handleDirections}>
          <Icon name="location-arrow-filled" size={16} color={colors.neutral.white} />
          <Body color={colors.neutral.white} weight="semiBold" style={styles.buttonText}>
            Get Directions
          </Body>
        </TouchableOpacity>
        <TouchableOpacity style={styles.callButton} onPress={handleCall}>
          <Icon name="phone" size={16} color={colors.neutral.white} />
          <Body color={colors.neutral.white} weight="semiBold" style={styles.buttonText}>
            Call Now
          </Body>
        </TouchableOpacity>
      </View>

      {/* Save to Favorites */}
      <TouchableOpacity style={styles.favoriteButton}>
        <Icon name="save" size={16} color={colors.neutral.grey} />
        <Body color={colors.neutral.grey} style={styles.favoriteText}>
          Save to Favorites
        </Body>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.neutral.white,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginHorizontal: spacing.md,
    shadowColor: colors.neutral.black,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  closeButton: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    zIndex: 10,
    backgroundColor: colors.neutral.white,
    borderRadius: radius.round,
    padding: spacing.xs,
    shadowColor: colors.neutral.black,
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  businessName: {
    fontSize: 20,
    marginBottom: spacing.xs,
    color: colors.neutral.black,
  },
  categoryRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  category: {
    fontSize: 13,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 13,
    color: colors.neutral.black,
  },
  reviewCount: {
    fontSize: 13,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  infoTextContainer: {
    flex: 1,
  },
  addressText: {
    fontSize: 14,
    color: colors.neutral.black,
    marginBottom: 2,
  },
  phoneText: {
    fontSize: 14,
    marginBottom: 2,
  },
  actions: {
    flexDirection: 'row',
    marginTop: spacing.sm,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  directionsButton: {
    flex: 1,
    backgroundColor: colors.neutral.black,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  callButton: {
    flex: 1,
    backgroundColor: '#34C759',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  buttonText: {
    fontSize: 14,
  },
  favoriteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
  },
  favoriteText: {
    fontSize: 14,
  },
});
