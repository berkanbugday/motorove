import React, {useMemo, useState, useCallback, useEffect} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Platform,
} from 'react-native';
import {RNMapMarkerCardProps} from './types';
import {colors, spacing, radius, getShadow, commonStyles} from '@theme';
import {
  Title,
  Caption,
  Icon,
  Button,
  BodySmall,
  Chip,
  showToast,
} from '@components';
import {useTranslation} from '@hooks/useTranslation';
import {EnumUtils} from '@utils/enumUtils';
import {calculateDistance} from '@utils/locationUtils';
import {BusinessStatus, DayOfWeek} from '@motorove/shared';
import {useLanguage} from '@contexts/LanguageContext';

/**
 * Business marker card component
 * Displays detailed business information in a card format
 */
export const RNMapMarkerCard: React.FC<RNMapMarkerCardProps> = ({
  business,
  onClose,
  style,
  userLocation,
  onDetailScreenOpen,
}) => {
  const {t} = useTranslation();
  const {language} = useLanguage();
  // Business comments hooks
  // Modal state
  // Address expansion state
  const [isAddressExpanded, setIsAddressExpanded] = useState(false);
  // About expansion state
  const [isAboutExpanded, setIsAboutExpanded] = useState(false);
  // Title expansion state
  const [isTitleExpanded, setIsTitleExpanded] = useState(false);
  // Distance state
  const [distance, setDistance] = useState<string | null>(null);

  // Handle phone number call
  const handlePhoneNumberCall = useCallback(async () => {
    if (!business.phoneNumber) {
      showToast({
        type: 'error',
        text1: t('common.error'),
        text2: t('screens.map.no_phone_number'),
      });
      return;
    }

    try {
      // Format phone number (remove spaces and combine country code with number)
      const phoneNumber =
        `${business.countryCode}${business.phoneNumber}`.replace(/\s/g, '');
      const phoneUrl = `tel:${phoneNumber}`;

      // On Android, canOpenURL often returns false for tel: URLs even when supported
      // So we skip the check and directly try to open the dialer
      if (Platform.OS === 'android') {
        await Linking.openURL(phoneUrl);
      } else {
        // On iOS, check if the device can make phone calls first
        const canOpenURL = await Linking.canOpenURL(phoneUrl);

        if (canOpenURL) {
          await Linking.openURL(phoneUrl);
        } else {
          showToast({
            type: 'error',
            text1: t('common.error'),
            text2: t('screens.map.phone_not_supported'),
          });
        }
      }
    } catch (error) {
      showToast({
        type: 'error',
        text1: t('common.error'),
        text2: t('screens.map.phone_call_error'),
      });
    }
  }, [business.countryCode, business.phoneNumber, t]);

  // Calculate straight-line distance
  useEffect(() => {
    if (!userLocation) {
      setDistance(null);
      return;
    }

    const straightLineDistance = calculateDistance(userLocation, {
      latitude: business.address.latitude,
      longitude: business.address.longitude,
    });
    setDistance(straightLineDistance.toFixed(1));
  }, [userLocation, business.address]);

  // Calculate business status based on current time and working hours
  const businessStatus = useMemo(() => {
    const now = new Date();
    const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.

    // Convert JavaScript day to DayOfWeek enum
    const dayMapping: {[key: number]: DayOfWeek} = {
      0: DayOfWeek.SUNDAY,
      1: DayOfWeek.MONDAY,
      2: DayOfWeek.TUESDAY,
      3: DayOfWeek.WEDNESDAY,
      4: DayOfWeek.THURSDAY,
      5: DayOfWeek.FRIDAY,
      6: DayOfWeek.SATURDAY,
    };

    const todayEnum = dayMapping[currentDay];
    const todayWorkingHours = business.workingHours?.find(
      wh => wh.dayOfWeek === todayEnum,
    );

    // If no working hours for today, business is closed
    if (!todayWorkingHours) {
      return {
        status: BusinessStatus.CLOSED,
        label: t('enums.businessStatus.closed'),
      };
    }

    // Check if business is open 24 hours
    if (todayWorkingHours.isOpen24h) {
      return {
        status: BusinessStatus.OPEN_24_HOURS,
        label: t('enums.businessStatus.open_24_hours'),
      };
    }

    // Check if current time is within working hours
    if (todayWorkingHours.startHour && todayWorkingHours.endHour) {
      const currentTime = now.getHours() * 60 + now.getMinutes(); // Current time in minutes

      // Parse start and end hours (format: "HH:MM")
      const [startHour, startMinute] = todayWorkingHours.startHour
        .split(':')
        .map(Number);
      const [endHour, endMinute] = todayWorkingHours.endHour
        .split(':')
        .map(Number);

      const startTimeMinutes = startHour * 60 + startMinute;
      const endTimeMinutes = endHour * 60 + endMinute;

      // Handle overnight hours (e.g., 22:00 to 06:00)
      if (startTimeMinutes > endTimeMinutes) {
        // Business closes the next day
        if (currentTime >= startTimeMinutes || currentTime <= endTimeMinutes) {
          return {
            status: BusinessStatus.OPEN,
            label: t('enums.businessStatus.open'),
          };
        }
      } else {
        // Normal hours within the same day
        if (currentTime >= startTimeMinutes && currentTime <= endTimeMinutes) {
          return {
            status: BusinessStatus.OPEN,
            label: t('enums.businessStatus.open'),
          };
        }
      }
    }

    // Default to closed
    return {
      status: BusinessStatus.CLOSED,
      label: t('enums.businessStatus.closed'),
    };
  }, [business.workingHours, t]);

  return (
    <View style={[styles.container, style]}>
      {/* Status Badge - Top Left */}
      <View style={styles.statusBadge}>
        <Chip
          label={businessStatus.label}
          variant="filled"
          color={
            businessStatus.status === BusinessStatus.OPEN
              ? 'success'
              : businessStatus.status === BusinessStatus.OPEN_24_HOURS
              ? 'info'
              : 'error'
          }
          size="small"
        />
      </View>

      <View style={styles.ratingContainer}>
        <View
          style={{flexDirection: 'row', alignItems: 'center', gap: spacing.xs}}>
          <Icon name="star-filled" color={colors.status.warning} size={14} />
          <Caption weight="semiBold" color={colors.neutral.grey}>
            {business.averageRating ? business.averageRating.toFixed(1) : '0.0'}
          </Caption>
          <Caption weight="semiBold" color={colors.neutral.grey}>
            ({business.commentsCount || 0}{' '}
            {t('screens.map.comment').toLowerCase()})
          </Caption>
        </View>
        {onClose && (
          <Button
            shape="circle"
            size="small"
            variant="dark"
            iconName="close"
            iconSize={18}
            onPress={onClose}
            style={styles.closeButton}
          />
        )}
      </View>

      {/* Business Name */}
      <TouchableOpacity
        onPress={() => {
          setIsTitleExpanded(prev => !prev);
        }}>
        <Title
          weight="bold"
          numberOfLines={isTitleExpanded ? undefined : 1}
          style={styles.businessName}>
          {business.name}
        </Title>
      </TouchableOpacity>

      {/* Category and Rating Row */}
      <View style={styles.categoryRatingRow}>
        <BodySmall>
          {EnumUtils.convertBusinessCategory(business.category)}
        </BodySmall>
      </View>

      {/* Address with Distance */}
      {business.address.address && (
        <TouchableOpacity
          style={styles.infoRow}
          onPress={() => {
            setIsAddressExpanded(prev => !prev);
          }}>
          <Icon name="map-pin-filled" size={16} />
          <View style={styles.infoTextContainer}>
            <BodySmall numberOfLines={isAddressExpanded ? undefined : 1}>
              {business.address.address}
            </BodySmall>
            {distance && (
              <Caption color={colors.neutral.grey}>
                {distance} {t('screens.map.km_away')}
              </Caption>
            )}
          </View>
        </TouchableOpacity>
      )}

      {/* Phone Number */}
      {business.phoneNumber && (
        <TouchableOpacity
          style={styles.infoRow}
          onPress={handlePhoneNumberCall}>
          <Icon name="phone" size={16} color={colors.neutral.grey} />
          <View style={styles.infoTextContainer}>
            <BodySmall>
              {business.countryCode} {business.phoneNumber}
            </BodySmall>
            <Caption color={colors.neutral.grey}>
              {t('screens.map.tap_for_call')}
            </Caption>
          </View>
        </TouchableOpacity>
      )}

      {/* About Section */}
      {business.descriptions && business.descriptions.length > 0 && (
        <TouchableOpacity
          style={styles.infoRow}
          onPress={() => {
            setIsAboutExpanded(prev => !prev);
          }}>
          <Icon name="file-filled" size={16} />
          <View style={styles.infoTextContainer}>
            {isAboutExpanded ? (
              <BodySmall>
                {
                  business.descriptions.find(
                    description =>
                      description.language.toLowerCase() ===
                      language.toLowerCase(),
                  )?.description
                }
              </BodySmall>
            ) : (
              <BodySmall numberOfLines={1}>
                {
                  business.descriptions.find(
                    description =>
                      description.language.toLowerCase() ===
                      language.toLowerCase(),
                  )?.description
                }
              </BodySmall>
            )}
          </View>
        </TouchableOpacity>
      )}

      <Button
        title={t('common.view_details')}
        variant="text"
        shape="round"
        size="small"
        iconName="chevron-down"
        iconPosition="bottom"
        style={styles.viewDetailsButton}
        onPress={onDetailScreenOpen}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.sm,
    marginHorizontal: spacing.sm,
    ...commonStyles.container,
    borderRadius: radius.lg,
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    ...getShadow('small'),
  },
  closeButton: {
    top: spacing.sm,
    ...getShadow('small'),
    zIndex: 10,
  },
  businessName: {
    marginVertical: spacing.xs,
    paddingRight: spacing.md,
  },
  categoryRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  statusBadge: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'absolute',
    left: spacing.md,
    top: -spacing.sm,
    zIndex: 10,
  },
  ratingContainer: {
    position: 'absolute',
    flexDirection: 'row',
    gap: spacing.md,
    right: spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  infoTextContainer: {
    flex: 1,
  },
  viewDetailsButton: {
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.secondary.main,
  },
});
