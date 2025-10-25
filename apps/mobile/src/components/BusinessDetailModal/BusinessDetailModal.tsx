import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
  forwardRef,
  useMemo,
} from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Linking,
  Dimensions,
  StatusBar,
  ScrollView,
  Platform,
  BackHandler,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import {BusinessCategory, IBusiness} from '@motorove/shared';
import {colors, spacing} from '@theme';
import {Body, Title, Caption, Icon, Button} from '@components';
import {BusinessDetailModalProps, BusinessDetailModalRef} from './types';

const {height: SCREEN_HEIGHT} = Dimensions.get('window');

const BusinessDetailModal = forwardRef<
  BusinessDetailModalRef,
  BusinessDetailModalProps
>(
  (
    {
      visible = false,
      business,
      onClose,
      userLocation,
      animationDuration = 400,
      containerStyle,
      closeOnBackdropPress = true,
      testID = 'business-detail-modal',
    },
    ref,
  ) => {
    const [isVisible, setIsVisible] = useState(visible);
    const [currentBusiness, setCurrentBusiness] = useState<IBusiness | null>(
      business,
    );

    // Animation values
    const backdropOpacity = useSharedValue(0);
    const translateY = useSharedValue(SCREEN_HEIGHT);

    // Get category display name
    const getCategoryName = useCallback(
      (category: BusinessCategory): string => {
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
          [BusinessCategory.TRAINING_RIDING_SCHOOLS]:
            'Training & Riding Schools',
          [BusinessCategory.MOTORCYCLE_CLUBS_COMMUNITIES]:
            'Clubs & Communities',
          [BusinessCategory.ELECTRIC_MOTORCYCLE_SERVICES]:
            'Electric Motorcycle Services',
          [BusinessCategory.PAINTING_BODYWORK]: 'Painting & Bodywork',
          [BusinessCategory.INSPECTION_LEGAL_SERVICES]:
            'Inspection & Legal Services',
          [BusinessCategory.TRANSPORTATION_STORAGE]: 'Transportation & Storage',
        };
        return categoryMap[category] || 'Business';
      },
      [],
    );

    // Calculate distance from user location
    const distance = useMemo(() => {
      if (!userLocation || !currentBusiness) {
        return null;
      }

      const R = 6371; // Earth's radius in km
      const dLat =
        ((currentBusiness.address.latitude - userLocation.latitude) * Math.PI) /
        180;
      const dLon =
        ((currentBusiness.address.longitude - userLocation.longitude) *
          Math.PI) /
        180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((userLocation.latitude * Math.PI) / 180) *
          Math.cos((currentBusiness.address.latitude * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const d = R * c;
      return d.toFixed(1);
    }, [userLocation, currentBusiness]);

    // Get working hours for today
    const getTodayWorkingHours = useCallback((businessData: IBusiness) => {
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

      const todayHours = businessData.workingHours?.find(
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
    }, []);

    // Animation functions
    const showModal = useCallback(() => {
      setIsVisible(true);

      // Parallel animations for smooth entrance
      backdropOpacity.value = withTiming(1, {
        duration: animationDuration,
        easing: Easing.out(Easing.quad),
      });

      translateY.value = withSpring(0, {
        damping: 25,
        stiffness: 400,
        mass: 0.8,
      });
    }, [backdropOpacity, translateY, animationDuration]);

    const hideModal = useCallback(() => {
      backdropOpacity.value = withTiming(0, {
        duration: animationDuration,
        easing: Easing.in(Easing.quad),
      });

      translateY.value = withTiming(
        SCREEN_HEIGHT,
        {
          duration: animationDuration,
          easing: Easing.in(Easing.quad),
        },
        finished => {
          if (finished) {
            runOnJS(handleCloseComplete)();
          }
        },
      );
    }, [backdropOpacity, translateY, animationDuration]);

    const handleCloseComplete = useCallback(() => {
      setIsVisible(false);
      setCurrentBusiness(null);
      onClose();
    }, [onClose]);

    // Handle back press on Android
    const handleBackPress = useCallback(() => {
      if (isVisible) {
        hideModal();
        return true;
      }
      return false;
    }, [isVisible, hideModal]);

    // Handle backdrop press
    const handleBackdropPress = useCallback(() => {
      if (closeOnBackdropPress) {
        hideModal();
      }
    }, [closeOnBackdropPress, hideModal]);

    // External actions
    const handleCall = useCallback(() => {
      if (!currentBusiness?.phoneNumber) {
        return;
      }
      const phoneNumber = `${currentBusiness.countryCode}${currentBusiness.phoneNumber}`;
      Linking.openURL(`tel:${phoneNumber}`);
    }, [currentBusiness]);

    const handleDirections = useCallback(() => {
      if (!currentBusiness?.address) {
        return;
      }
      const {latitude, longitude} = currentBusiness.address;
      const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
      Linking.openURL(url);
    }, [currentBusiness]);

    // Update visibility based on prop changes
    useEffect(() => {
      if (visible && business) {
        setCurrentBusiness(business);
        showModal();
      } else if (!visible) {
        hideModal();
      }
    }, [visible, business, showModal, hideModal]);

    // Android back button handler
    useEffect(() => {
      if (Platform.OS === 'android' && isVisible) {
        const backHandler = BackHandler.addEventListener(
          'hardwareBackPress',
          handleBackPress,
        );
        return () => backHandler.remove();
      }
    }, [isVisible, handleBackPress]);

    // Expose methods via ref
    useImperativeHandle(
      ref,
      () => ({
        open: (businessData: IBusiness) => {
          setCurrentBusiness(businessData);
          showModal();
        },
        close: hideModal,
      }),
      [showModal, hideModal],
    );

    // Animated styles
    const backdropAnimatedStyle = useAnimatedStyle(() => ({
      opacity: backdropOpacity.value,
    }));

    const containerAnimatedStyle = useAnimatedStyle(() => ({
      transform: [{translateY: translateY.value}],
    }));

    if (!isVisible || !currentBusiness) {
      return null;
    }

    const workingHours = getTodayWorkingHours(currentBusiness);

    return (
      <Modal
        visible={isVisible}
        transparent
        animationType="none"
        onRequestClose={handleBackPress}
        statusBarTranslucent
        testID={testID}>
        <StatusBar backgroundColor="rgba(0,0,0,0.5)" barStyle="light-content" />

        {/* Backdrop */}
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={handleBackdropPress}>
          <Animated.View
            style={[styles.backdropOverlay, backdropAnimatedStyle]}
          />
        </TouchableOpacity>

        {/* Modal Content */}
        <View style={styles.modalContainer}>
          <Animated.View
            style={[
              styles.contentContainer,
              containerAnimatedStyle,
              containerStyle,
            ]}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
              bounces={false}>
              {/* Header Section */}
              <View style={styles.header}>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={hideModal}
                  hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                  <Icon name="close" size={24} color={colors.neutral.white} />
                </TouchableOpacity>

                <View style={styles.headerContent}>
                  <Title weight="bold" style={styles.businessName}>
                    {currentBusiness.name}
                  </Title>

                  <View style={styles.categoryRatingRow}>
                    <Caption
                      color={colors.neutral.grey}
                      style={styles.category}>
                      {getCategoryName(currentBusiness.category)}
                    </Caption>
                    <View style={styles.ratingContainer}>
                      <Caption weight="semiBold" style={styles.ratingText}>
                        ⭐ 4.5
                      </Caption>
                      <Caption
                        color={colors.neutral.grey}
                        style={styles.reviewCount}>
                        (120 reviews)
                      </Caption>
                    </View>
                  </View>
                </View>
              </View>

              {/* Business Information */}
              <View style={styles.infoSection}>
                {/* Address */}
                <View style={styles.infoRow}>
                  <Icon
                    name="map-pin-filled"
                    size={20}
                    color={colors.primary.main}
                  />
                  <View style={styles.infoTextContainer}>
                    <Body style={styles.infoTitle}>Address</Body>
                    <Body style={styles.addressText}>
                      {currentBusiness.address.address}
                    </Body>
                    {distance && (
                      <Caption color={colors.neutral.grey}>
                        {distance} km away
                      </Caption>
                    )}
                  </View>
                </View>

                {/* Phone Number */}
                {currentBusiness.phoneNumber && (
                  <View style={styles.infoRow}>
                    <Icon name="phone" size={20} color={colors.primary.main} />
                    <View style={styles.infoTextContainer}>
                      <Body style={styles.infoTitle}>Phone</Body>
                      <Body style={styles.phoneText}>
                        {currentBusiness.countryCode}{' '}
                        {currentBusiness.phoneNumber}
                      </Body>
                    </View>
                  </View>
                )}

                {/* Operating Hours */}
                {workingHours && (
                  <View style={styles.infoRow}>
                    <Icon
                      name="clock-filled"
                      size={20}
                      color={colors.primary.main}
                    />
                    <View style={styles.infoTextContainer}>
                      <Body style={styles.infoTitle}>Hours Today</Body>
                      <Body style={styles.hoursText}>{workingHours}</Body>
                    </View>
                  </View>
                )}

                {/* Description */}
                {currentBusiness.descriptions &&
                  currentBusiness.descriptions.length > 0 && (
                    <View style={styles.infoRow}>
                      <Icon
                        name="question-filled"
                        size={20}
                        color={colors.primary.main}
                      />
                      <View style={styles.infoTextContainer}>
                        <Body style={styles.infoTitle}>About</Body>
                        <Body style={styles.descriptionText}>
                          {currentBusiness.descriptions[0].description}
                        </Body>
                      </View>
                    </View>
                  )}
              </View>
            </ScrollView>

            {/* Action Buttons */}
            <View style={styles.actionSection}>
              <Button
                title="Get Directions"
                variant="secondary"
                shape="round"
                iconName="map-location-filled"
                onPress={handleDirections}
                style={styles.actionButton}
              />
              {currentBusiness.phoneNumber && (
                <Button
                  title="Call Now"
                  variant="primary"
                  shape="round"
                  iconName="phone"
                  onPress={handleCall}
                  style={styles.actionButton}
                />
              )}
            </View>
          </Animated.View>
        </View>
      </Modal>
    );
  },
);

BusinessDetailModal.displayName = 'BusinessDetailModal';

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  backdropOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  contentContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.neutral.white,
    overflow: 'hidden',
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    backgroundColor: colors.primary.main,
    paddingTop:
      spacing.xl +
      (Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 44),
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top:
      spacing.md +
      (Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 44),
    right: spacing.md,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  headerContent: {
    paddingTop: spacing.md,
  },
  businessName: {
    fontSize: 24,
    color: colors.neutral.white,
    marginBottom: spacing.xs,
  },
  categoryRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  category: {
    fontSize: 14,
    color: colors.neutral.white,
    opacity: 0.9,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    color: colors.neutral.white,
  },
  reviewCount: {
    fontSize: 14,
    color: colors.neutral.white,
    opacity: 0.8,
  },
  infoSection: {
    padding: spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.lightGrey,
  },
  infoTextContainer: {
    flex: 1,
    marginLeft: spacing.md,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral.black,
    marginBottom: spacing.xs,
  },
  addressText: {
    fontSize: 15,
    color: colors.neutral.darkGrey,
    lineHeight: 22,
  },
  phoneText: {
    fontSize: 15,
    color: colors.neutral.darkGrey,
  },
  hoursText: {
    fontSize: 15,
    color: colors.neutral.darkGrey,
  },
  descriptionText: {
    fontSize: 15,
    color: colors.neutral.darkGrey,
    lineHeight: 22,
  },
  actionSection: {
    flexDirection: 'row',
    padding: spacing.lg,
    paddingTop: 0,
    gap: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.lightGrey,
  },
  actionButton: {
    flex: 1,
  },
});

export {BusinessDetailModal};
export type {BusinessDetailModalProps, BusinessDetailModalRef};
