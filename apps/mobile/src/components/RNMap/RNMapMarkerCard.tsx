import React from 'react';
import {View, StyleSheet, TouchableOpacity, Linking} from 'react-native';
import {RNMapMarkerCardProps} from './types';
import {colors} from '@theme/colors';
import {spacing} from '@theme/spacing';
import {radius} from '@theme/radius';
import {Body, BodySmall, Title} from '@components/Typography';
import {Icon} from '@components/Icon';
import {useLanguage} from '@contexts/LanguageContext';

/**
 * Business marker card component
 * Displays detailed business information in a card format
 */
export const RNMapMarkerCard: React.FC<RNMapMarkerCardProps> = ({
  business,
  onPress,
  onClose,
  style,
}) => {
  const {language} = useLanguage();

  // Get description in current language
  const getDescription = () => {
    const desc = business.descriptions?.find(
      d => d.language.toLowerCase() === language.toLowerCase(),
    );
    return desc?.description || business.descriptions?.[0]?.description || '';
  };

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
      return 'Closed';
    }

    if (todayHours.isOpen24h) {
      return 'Open 24 hours';
    }

    if (todayHours.startHour && todayHours.endHour) {
      return `${todayHours.startHour} - ${todayHours.endHour}`;
    }

    return 'Closed';
  };

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
          <Icon name="close" size={20} color={colors.neutral.grey} />
        </TouchableOpacity>
      )}

      {/* Business Name */}
      <Title weight="bold" numberOfLines={2} style={styles.businessName}>
        {business.name}
      </Title>

      {/* Business Description/Type */}
      {getDescription() && (
        <BodySmall
          color={colors.neutral.grey}
          numberOfLines={2}
          style={styles.description}>
          {getDescription()}
        </BodySmall>
      )}

      {/* Address */}
      <View style={styles.infoRow}>
        <Body color={colors.neutral.grey} style={styles.infoText}>
          📍 {business.address.address}
        </Body>
      </View>

      {/* Phone Number */}
      {business.phoneNumber && (
        <TouchableOpacity style={styles.phoneRow} onPress={handleCall}>
          <Body color="#007AFF" weight="semiBold" style={styles.phoneText}>
            📞 {business.countryCode} {business.phoneNumber}
          </Body>
          <BodySmall color="#007AFF" style={styles.tapToCall}>
            Tap to call
          </BodySmall>
        </TouchableOpacity>
      )}

      {/* Operating Hours */}
      <View style={styles.infoRow}>
        <BodySmall color={colors.neutral.grey} style={styles.infoText}>
          🕐 Open today · {getTodayWorkingHours()}
        </BodySmall>
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.directionsButton}
          onPress={handleDirections}>
          <Body color={colors.neutral.white} weight="semiBold">
            🧭 Get Directions
          </Body>
        </TouchableOpacity>
        <TouchableOpacity style={styles.callButton} onPress={handleCall}>
          <Body color={colors.neutral.white} weight="semiBold">
            Call Now
          </Body>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.neutral.white,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginHorizontal: spacing.md,
    shadowColor: colors.neutral.black,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  closeButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    zIndex: 10,
    padding: spacing.xs,
  },
  businessName: {
    fontSize: 22,
    marginBottom: spacing.xs,
  },
  description: {
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  infoRow: {
    marginBottom: spacing.sm,
  },
  infoText: {
    lineHeight: 20,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  phoneText: {
    flex: 1,
  },
  tapToCall: {
    marginLeft: spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  directionsButton: {
    flex: 1,
    backgroundColor: colors.neutral.black,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.round,
    alignItems: 'center',
    justifyContent: 'center',
  },
  callButton: {
    flex: 1,
    backgroundColor: '#34C759',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.round,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
