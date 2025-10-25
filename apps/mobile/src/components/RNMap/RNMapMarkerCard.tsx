import React, {useMemo} from 'react';
import {View, StyleSheet, TouchableOpacity, Linking} from 'react-native';
import {RNMapMarkerCardProps} from './types';
import {colors, spacing, radius, getShadow, commonStyles} from '@theme';
import {Body, Title, Caption, Icon, Button} from '@components';
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
      [BusinessCategory.ELECTRIC_MOTORCYCLE_SERVICES]:
        'Electric Motorcycle Services',
      [BusinessCategory.PAINTING_BODYWORK]: 'Painting & Bodywork',
      [BusinessCategory.INSPECTION_LEGAL_SERVICES]:
        'Inspection & Legal Services',
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
    const dLat =
      ((business.address.latitude - userLocation.latitude) * Math.PI) / 180;
    const dLon =
      ((business.address.longitude - userLocation.longitude) * Math.PI) / 180;
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
        <Button
          shape="circle"
          size="small"
          variant="secondary"
          iconName="close"
          iconSize={18}
          onPress={onClose}
          style={styles.closeButton}
        />
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
          <Body style={styles.addressText}>{business.address.address}</Body>
          {distance && (
            <Caption color={colors.neutral.grey}>{distance} km away</Caption>
          )}
        </View>
      </View>

      {/* Phone Number */}
      {business.phoneNumber && (
        <View style={styles.infoRow}>
          <Icon name="phone" size={16} color={colors.neutral.grey} />
          <View style={styles.infoTextContainer}>
            <Body style={styles.addressText}>
              {business.countryCode} {business.phoneNumber}
            </Body>
          </View>
        </View>
      )}

      {/* Operating Hours */}
      {workingHours && (
        <View style={styles.infoRow}>
          <Icon name="clock-filled" size={16} color={colors.neutral.grey} />
          <View style={styles.infoTextContainer}>
            <Body color={colors.neutral.grey}>Open today</Body>
            <Caption color={colors.neutral.grey}>{workingHours}</Caption>
          </View>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actions}>
        <Button
          title="Get Directions"
          variant="dark"
          shape="round"
          iconName="map-location-filled"
          onPress={handleDirections}
        />
        <Button
          title="Call Now"
          variant="primary"
          shape="round"
          iconName="phone"
          onPress={handleCall}
          style={styles.callButton}
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    ...commonStyles.container,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...getShadow('small'),
  },
  closeButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    ...getShadow('small'),
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
    alignItems: 'center',
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
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  callButton: {
    backgroundColor: colors.status.successDark,
  },
});
