import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
  forwardRef,
  useRef,
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
  Image,
} from 'react-native';
import MapView, {
  Marker,
  PROVIDER_DEFAULT,
  PROVIDER_GOOGLE,
} from 'react-native-maps';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import {IBusiness, DayOfWeek, BusinessStatus} from '@motorove/shared';
import {colors, radius, spacing} from '@theme';
import {
  Body,
  Title,
  Caption,
  Icon,
  Button,
  BottomSheet,
  BodySmall,
  Subtitle,
  AnimatedInput,
  showToast,
  Chip,
} from '@components';
import {BusinessDetailModalProps, BusinessDetailModalRef} from './types';
import {EnumUtils} from '@utils/enumUtils';
import {calculateDistance} from '@utils/locationUtils';
import type {BottomSheetRef} from '@components';
import {useTranslation} from '@hooks/useTranslation';
import {MapAppType} from './mapApps.constants';
import {MapAppsService, InstalledApps} from './mapApps.service';
import {useLanguage} from '@contexts/LanguageContext';

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
      testID = 'business-detail-modal',
    },
    ref,
  ) => {
    const [isVisible, setIsVisible] = useState(visible);
    const [currentBusiness, setCurrentBusiness] = useState<IBusiness | null>(
      business,
    );
    const [userRating, setUserRating] = useState(0);
    const [userComment, setUserComment] = useState('');
    const [showAddReview, setShowAddReview] = useState(false);
    const [showAllWorkingHours, setShowAllWorkingHours] = useState(false);
    const [distance, setDistance] = useState<string | null>(null);
    const [installedApps, setInstalledApps] = useState<InstalledApps>({
      [MapAppType.GOOGLE]: false,
      [MapAppType.APPLE]: Platform.OS === 'ios', // Apple Maps always available on iOS
      [MapAppType.WAZE]: false,
      [MapAppType.YANDEX]: false,
      [MapAppType.SYGIC]: false,
    });

    // Bottom sheet ref for map app selection
    const mapAppsBottomSheetRef = useRef<BottomSheetRef>(null);

    const {t} = useTranslation();
    const {language} = useLanguage();

    // Comprehensive working hours utility
    const useWorkingHours = useCallback(() => {
      if (
        !currentBusiness?.workingHours ||
        currentBusiness.workingHours.length === 0
      ) {
        return {
          today: null,
          isOpen: false,
          status: t('enums.businessStatus.closed'),
          orderedDays: [],
          formatDayName: () => '',
          formatHours: () => '',
        };
      }

      const formatDayName = (dayOfWeek: DayOfWeek): string => {
        return t(`enums.dayOfWeek.${dayOfWeek.toLowerCase()}`);
      };

      const formatHours = (
        startHour?: string,
        endHour?: string,
        isOpen24h?: boolean,
      ): string => {
        if (isOpen24h) {
          return t('enums.businessStatus.open_24_hours');
        }
        if (!startHour || !endHour) {
          return t('enums.businessStatus.closed');
        }
        return `${startHour} - ${endHour}`;
      };

      const today = new Date().getDay();
      const dayMap = [
        DayOfWeek.SUNDAY,
        DayOfWeek.MONDAY,
        DayOfWeek.TUESDAY,
        DayOfWeek.WEDNESDAY,
        DayOfWeek.THURSDAY,
        DayOfWeek.FRIDAY,
        DayOfWeek.SATURDAY,
      ];
      const todayHours = currentBusiness.workingHours.find(
        wh => wh.dayOfWeek === dayMap[today],
      );

      const isOpen =
        todayHours?.isOpen24h ||
        !!(todayHours?.startHour && todayHours?.endHour);
      const status = todayHours
        ? formatHours(
            todayHours.startHour,
            todayHours.endHour,
            todayHours.isOpen24h,
          )
        : t('enums.businessStatus.closed');

      const dayOrder = [
        DayOfWeek.MONDAY,
        DayOfWeek.TUESDAY,
        DayOfWeek.WEDNESDAY,
        DayOfWeek.THURSDAY,
        DayOfWeek.FRIDAY,
        DayOfWeek.SATURDAY,
        DayOfWeek.SUNDAY,
      ];

      const orderedDays = dayOrder.map(day => {
        const wh = currentBusiness.workingHours.find(w => w.dayOfWeek === day);
        return (
          wh || {
            dayOfWeek: day,
            isOpen24h: false,
            startHour: undefined,
            endHour: undefined,
          }
        );
      });

      return {
        today: todayHours,
        isOpen,
        status,
        orderedDays,
        formatDayName,
        formatHours,
      };
    }, [currentBusiness, t, language]);

    const workingHours = useWorkingHours();

    // Calculate business status based on current time and working hours
    const businessStatus = React.useMemo(() => {
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
      const todayWorkingHours = currentBusiness?.workingHours?.find(
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
          if (
            currentTime >= startTimeMinutes ||
            currentTime <= endTimeMinutes
          ) {
            return {
              status: BusinessStatus.OPEN,
              label: t('enums.businessStatus.open'),
            };
          }
        } else {
          // Normal hours within the same day
          if (
            currentTime >= startTimeMinutes &&
            currentTime <= endTimeMinutes
          ) {
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
    }, [currentBusiness?.workingHours, t]);

    // Animation values
    const translateY = useSharedValue(SCREEN_HEIGHT);

    // Calculate distance with delayed OSRM calculation
    useEffect(() => {
      if (!userLocation || !currentBusiness) {
        setDistance(null);
        return;
      }

      const straightLineDistance = calculateDistance(userLocation, {
        latitude: currentBusiness.address.latitude,
        longitude: currentBusiness.address.longitude,
      });
      setDistance(straightLineDistance.toFixed(1));
    }, [userLocation, currentBusiness]);

    // Animation functions
    const showModal = useCallback(() => {
      setIsVisible(true);

      translateY.value = withSpring(0, {
        damping: 25,
        stiffness: 400,
        mass: 0.8,
      });
    }, [translateY, animationDuration]);

    const hideModal = useCallback(() => {
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
    }, [translateY, animationDuration]);

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

    // Handle phone number call
    const handlePhoneNumberCall = useCallback(async () => {
      if (!currentBusiness?.phoneNumber) {
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
          `${currentBusiness?.countryCode}${currentBusiness?.phoneNumber}`.replace(
            /\s/g,
            '',
          );
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
    }, [currentBusiness?.countryCode, currentBusiness?.phoneNumber, t]);

    const checkInstalledApps = async () => {
      const apps = await MapAppsService.checkInstalledApps();
      setInstalledApps(apps);
    };

    const handleDirections = useCallback(() => {
      if (!currentBusiness?.address) {
        return;
      }
      mapAppsBottomSheetRef.current?.open('minimal');
    }, [currentBusiness]);

    const openMapApp = useCallback(
      (appType: MapAppType) => {
        if (!currentBusiness?.address) {
          return;
        }

        const {latitude, longitude} = currentBusiness.address;
        const isInstalled = installedApps[appType];

        MapAppsService.openMapApp(
          appType,
          latitude,
          longitude,
          isInstalled,
          () => mapAppsBottomSheetRef.current?.close(),
        );
      },
      [currentBusiness, installedApps],
    );

    // Check installed apps once on mount only
    useEffect(() => {
      checkInstalledApps();
    }, []);

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

    const containerAnimatedStyle = useAnimatedStyle(() => ({
      transform: [{translateY: translateY.value}],
    }));

    if (!isVisible || !currentBusiness) {
      return null;
    }

    return (
      <Modal
        visible={isVisible}
        transparent
        animationType="none"
        onRequestClose={handleBackPress}
        statusBarTranslucent
        testID={testID}>
        <StatusBar barStyle="dark-content" />

        {/* Modal Content */}
        <View style={styles.modalContainer}>
          <Animated.View
            style={[
              styles.contentContainer,
              containerAnimatedStyle,
              containerStyle,
            ]}>
            {/* Close Button */}
            <Button
              shape="circle"
              variant="dark"
              size="small"
              iconName="close"
              style={styles.closeButton}
              onPress={hideModal}
              testID="close-button"
            />
            <KeyboardAwareScrollView
              showsVerticalScrollIndicator={false}
              enableOnAndroid={true}
              enableAutomaticScroll={true}
              keyboardShouldPersistTaps="handled">
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                bounces={false}>
                {/* Header Map Section */}
                <View style={styles.header}>
                  <MapView
                    style={styles.headerImage}
                    provider={
                      Platform.OS === 'android'
                        ? PROVIDER_GOOGLE
                        : PROVIDER_DEFAULT
                    }
                    initialRegion={{
                      latitude: currentBusiness.address.latitude,
                      longitude: currentBusiness.address.longitude,
                      latitudeDelta: 0.01,
                      longitudeDelta: 0.01,
                    }}
                    scrollEnabled={false}
                    zoomEnabled={false}
                    pitchEnabled={false}
                    rotateEnabled={false}
                    pointerEvents="none">
                    <Marker
                      pinColor={colors.neutral.black}
                      coordinate={{
                        latitude: currentBusiness.address.latitude,
                        longitude: currentBusiness.address.longitude,
                      }}>
                      <View
                        style={[
                          styles.markerInner,
                          {backgroundColor: colors.neutral.black},
                        ]}>
                        <Icon
                          name="wrench-filled"
                          size={16}
                          color={colors.neutral.white}
                        />
                      </View>
                    </Marker>
                  </MapView>

                  {/* Business Title Overlay */}
                  <View style={styles.headerOverlay}>
                    <Title weight="bold" color={colors.neutral.white}>
                      {currentBusiness.name}
                    </Title>

                    <View style={styles.categoryRatingRow}>
                      <BodySmall weight="semiBold" color={colors.neutral.white}>
                        {EnumUtils.convertBusinessCategory(
                          currentBusiness.category,
                        )}
                      </BodySmall>
                      <View style={styles.ratingContainer}>
                        <Icon
                          name="star-filled"
                          size={14}
                          color={colors.status.warning}
                        />
                        <Caption weight="semiBold" color={colors.neutral.white}>
                          4.5
                        </Caption>
                        <Caption weight="semiBold" color={colors.neutral.white}>
                          (120 yorum)
                        </Caption>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Business Information Section */}
                <View style={styles.infoSection}>
                  {/* Address */}
                  <View style={styles.infoRow}>
                    <Icon name="map-pin-filled" size={20} />
                    <View style={styles.infoTextContainer}>
                      <Body weight="semiBold">{t('screens.map.address')}</Body>
                      <Body lineHeight={25}>
                        {currentBusiness.address.address}
                      </Body>
                      {distance && (
                        <Caption color={colors.neutral.grey}>
                          {distance} {t('screens.map.km_away')}
                        </Caption>
                      )}
                    </View>
                  </View>

                  {/* Phone Number */}
                  {currentBusiness.phoneNumber && (
                    <View style={styles.infoRow}>
                      <Icon name="phone" size={20} />
                      <View style={styles.infoTextContainer}>
                        <Body weight="semiBold">{t('screens.map.phone')}</Body>
                        <Body>
                          {currentBusiness.countryCode}{' '}
                          {currentBusiness.phoneNumber}
                        </Body>
                      </View>
                    </View>
                  )}

                  {/* Working Hours */}
                  {currentBusiness.workingHours &&
                    currentBusiness.workingHours.length > 0 && (
                      <View style={styles.infoRow}>
                        <Icon name="clock-filled" size={20} />
                        <View style={styles.infoTextContainer}>
                          <TouchableOpacity
                            onPress={() =>
                              setShowAllWorkingHours(!showAllWorkingHours)
                            }
                            activeOpacity={0.7}
                            style={styles.workingHoursHeader}>
                            <Body weight="semiBold">
                              {t('screens.map.working_hours')}
                            </Body>
                            <Icon
                              name={
                                showAllWorkingHours
                                  ? 'chevron-up'
                                  : 'chevron-down'
                              }
                              size={20}
                              color={colors.neutral.grey}
                            />
                          </TouchableOpacity>

                          {/* Today's Hours (Always Visible) */}
                          {workingHours.today && (
                            <View style={styles.todayHoursRow}>
                              <Body style={styles.todayLabel}>
                                {workingHours.formatDayName(
                                  workingHours.today.dayOfWeek,
                                )}
                              </Body>
                              <Chip
                                label={businessStatus.label}
                                variant="filled"
                                color={
                                  businessStatus.status === BusinessStatus.OPEN
                                    ? 'success'
                                    : businessStatus.status ===
                                      BusinessStatus.OPEN_24_HOURS
                                    ? 'info'
                                    : 'error'
                                }
                                size="small"
                              />
                            </View>
                          )}

                          {/* All Working Hours (Expandable) */}
                          {showAllWorkingHours && (
                            <View style={styles.allWorkingHours}>
                              {workingHours.orderedDays.map(wh => {
                                const isToday =
                                  workingHours.today?.dayOfWeek ===
                                  wh.dayOfWeek;
                                return (
                                  <View
                                    key={wh.dayOfWeek}
                                    style={[styles.workingHourRow]}>
                                    <Body style={[isToday && styles.todayDay]}>
                                      {workingHours.formatDayName(wh.dayOfWeek)}
                                    </Body>
                                    <Body
                                      style={[
                                        !wh.startHour &&
                                          !wh.isOpen24h &&
                                          styles.closedText,
                                        isToday && styles.todayDay,
                                      ]}>
                                      {workingHours.formatHours(
                                        wh.startHour,
                                        wh.endHour,
                                        wh.isOpen24h,
                                      )}
                                    </Body>
                                  </View>
                                );
                              })}
                            </View>
                          )}
                        </View>
                      </View>
                    )}

                  {/* Description */}
                  {currentBusiness.descriptions &&
                    currentBusiness.descriptions.length > 0 && (
                      <View style={styles.infoRow}>
                        <Icon name="file-filled" size={20} />
                        <View style={styles.infoTextContainer}>
                          <Body weight="semiBold">
                            {t('screens.map.about')}
                          </Body>
                          <Body lineHeight={25}>
                            {
                              currentBusiness.descriptions.find(
                                description =>
                                  description.language.toLowerCase() ===
                                  language.toLowerCase(),
                              )?.description
                            }
                          </Body>
                        </View>
                      </View>
                    )}
                </View>

                {/* Reviews Section */}
                <View style={styles.reviewsSection}>
                  <View style={styles.reviewsHeader}>
                    <Subtitle weight="bold">
                      {t('screens.map.reviews')}
                    </Subtitle>
                    <TouchableOpacity
                      onPress={() => setShowAddReview(!showAddReview)}
                      style={styles.addReviewButton}>
                      <Icon
                        name={showAddReview ? 'close' : 'pen-filled'}
                        size={12}
                      />
                      <BodySmall weight="semiBold">
                        {showAddReview
                          ? t('common.cancel')
                          : t('screens.map.write_review')}
                      </BodySmall>
                    </TouchableOpacity>
                  </View>

                  {/* Add Review Form */}
                  {showAddReview && (
                    <View style={styles.addReviewForm}>
                      <BodySmall weight="semiBold">
                        {t('screens.map.rate_this_business')}
                      </BodySmall>
                      <View style={styles.userRatingStars}>
                        {[1, 2, 3, 4, 5].map(star => (
                          <Button
                            key={star}
                            variant="text"
                            shape="circle"
                            size="small"
                            onPress={() => setUserRating(star)}
                            iconName="star-filled"
                            iconSize={30}
                            iconColor={
                              star <= userRating
                                ? colors.status.warning
                                : colors.neutral.lightGrey
                            }
                          />
                        ))}
                      </View>

                      <AnimatedInput
                        showClearButton={false}
                        label={t('screens.map.share_your_experience')}
                        value={userComment}
                        onChangeText={setUserComment}
                        multiline
                      />

                      <Button
                        title={t('screens.map.submit_review')}
                        variant="secondary"
                        shape="round"
                        onPress={() => {
                          // Handle submit review
                          setShowAddReview(false);
                          setUserRating(0);
                          setUserComment('');
                        }}
                        disabled={userRating === 0 || userComment.trim() === ''}
                      />
                    </View>
                  )}

                  {/* Sample Reviews List */}
                  <View style={styles.reviewsList}>
                    <View style={styles.reviewItem}>
                      <View style={styles.reviewHeader}>
                        <View style={styles.reviewerInfo}>
                          <View style={styles.reviewerAvatar}>
                            <Caption color={colors.neutral.white} weight="bold">
                              JD
                            </Caption>
                          </View>
                          <View>
                            <Body weight="semiBold">John Doe</Body>
                            <Caption color={colors.neutral.grey}>
                              2 days ago
                            </Caption>
                          </View>
                        </View>
                        <View style={styles.reviewRating}>
                          {[1, 2, 3, 4, 5].map(star => (
                            <Icon
                              key={star}
                              name="star-filled"
                              size={12}
                              color={
                                star <= 5
                                  ? colors.status.warning
                                  : colors.neutral.lightGrey
                              }
                            />
                          ))}
                        </View>
                      </View>
                      <Body style={styles.reviewText}>
                        Great service and professional staff. Highly recommend
                        for motorcycle maintenance!
                      </Body>
                    </View>

                    <View style={styles.reviewItem}>
                      <View style={styles.reviewHeader}>
                        <View style={styles.reviewerInfo}>
                          <View style={styles.reviewerAvatar}>
                            <Caption color={colors.neutral.white} weight="bold">
                              AS
                            </Caption>
                          </View>
                          <View>
                            <Body weight="semiBold">Alice Smith</Body>
                            <Caption color={colors.neutral.grey}>
                              1 week ago
                            </Caption>
                          </View>
                        </View>
                        <View style={styles.reviewRating}>
                          {[1, 2, 3, 4, 5].map(star => (
                            <Icon
                              key={star}
                              name="star-filled"
                              size={12}
                              color={
                                star <= 4
                                  ? colors.status.warning
                                  : colors.neutral.lightGrey
                              }
                            />
                          ))}
                        </View>
                      </View>
                      <Body style={styles.reviewText}>
                        Good experience overall. Quick service and fair pricing.
                      </Body>
                    </View>

                    <View style={styles.reviewItem}>
                      <View style={styles.reviewHeader}>
                        <View style={styles.reviewerInfo}>
                          <View style={styles.reviewerAvatar}>
                            <Caption color={colors.neutral.white} weight="bold">
                              MB
                            </Caption>
                          </View>
                          <View>
                            <Body weight="semiBold">Mike Brown</Body>
                            <Caption color={colors.neutral.grey}>
                              2 weeks ago
                            </Caption>
                          </View>
                        </View>
                        <View style={styles.reviewRating}>
                          {[1, 2, 3, 4, 5].map(star => (
                            <Icon
                              key={star}
                              name="star-filled"
                              size={12}
                              color={
                                star <= 5
                                  ? colors.status.warning
                                  : colors.neutral.lightGrey
                              }
                            />
                          ))}
                        </View>
                      </View>
                      <Body style={styles.reviewText}>
                        Excellent work! They fixed my bike perfectly and the
                        team was very friendly.
                      </Body>
                    </View>
                  </View>
                </View>
              </ScrollView>
            </KeyboardAwareScrollView>

            {/* Action Buttons */}
            <View style={styles.actionSection}>
              <Button
                title={t('screens.map.get_directions')}
                variant="dark"
                shape="round"
                iconName="location-arrow-filled"
                onPress={handleDirections}
                style={styles.getDirectionButton}
              />
              {currentBusiness.phoneNumber && (
                <Button
                  title={t('screens.map.call')}
                  variant="primary"
                  shape="round"
                  iconName="phone"
                  onPress={handlePhoneNumberCall}
                  style={styles.callButton}
                />
              )}
            </View>
          </Animated.View>
        </View>

        {/* Map Apps Selection Bottom Sheet */}
        <BottomSheet
          ref={mapAppsBottomSheetRef}
          showCloseButton={false}
          closeOnBackdropPress={true}
          closeButtonPosition="top-right"
          title={t('screens.map.choose_map_app')}
          subtitle={t('screens.map.select_preferred_navigation')}>
          <ScrollView
            horizontal
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.mapAppsScrollContent}
            style={styles.mapAppsScroll}>
            {/* Google Maps */}
            <TouchableOpacity
              style={[
                styles.mapAppCard,
                !installedApps[MapAppType.GOOGLE] && styles.mapAppCardDisabled,
              ]}
              onPress={() => openMapApp(MapAppType.GOOGLE)}
              activeOpacity={0.7}>
              <Image
                source={require('@assets/images/logos/google-maps.png')}
                resizeMode="center"
                style={styles.mapLogo}
              />

              <Body weight="semiBold" style={styles.mapAppName}>
                {t('screens.map.google_maps')}
              </Body>
            </TouchableOpacity>

            {/* Apple Maps */}
            {Platform.OS === 'ios' && (
              <TouchableOpacity
                style={styles.mapAppCard}
                onPress={() => openMapApp(MapAppType.APPLE)}
                activeOpacity={0.7}>
                <Image
                  source={require('@assets/images/logos/apple-maps.png')}
                  resizeMode="center"
                  style={styles.mapLogo}
                />
                <Body weight="semiBold" style={styles.mapAppName}>
                  {t('screens.map.apple_maps')}
                </Body>
              </TouchableOpacity>
            )}

            {/* Waze */}
            <TouchableOpacity
              style={[
                styles.mapAppCard,
                !installedApps[MapAppType.WAZE] && styles.mapAppCardDisabled,
              ]}
              onPress={() => openMapApp(MapAppType.WAZE)}
              activeOpacity={0.7}>
              <Image
                source={require('@assets/images/logos/waze.png')}
                resizeMode="center"
                style={styles.mapLogo}
              />
              <Body weight="semiBold" style={styles.mapAppName}>
                {t('screens.map.waze')}
              </Body>
            </TouchableOpacity>

            {/* Yandex Maps */}
            <TouchableOpacity
              style={[
                styles.mapAppCard,
                !installedApps[MapAppType.YANDEX] && styles.mapAppCardDisabled,
              ]}
              onPress={() => openMapApp(MapAppType.YANDEX)}
              activeOpacity={0.7}>
              <Image
                source={require('@assets/images/logos/yandex-maps.png')}
                resizeMode="center"
                style={styles.mapLogo}
              />
              <Body weight="semiBold" style={styles.mapAppName}>
                {t('screens.map.yandex_maps')}
              </Body>
            </TouchableOpacity>

            {/* Sygic */}
            <TouchableOpacity
              style={[
                styles.mapAppCard,
                !installedApps[MapAppType.SYGIC] && styles.mapAppCardDisabled,
              ]}
              onPress={() => openMapApp(MapAppType.SYGIC)}
              activeOpacity={0.7}>
              <Image
                source={require('@assets/images/logos/sygic.png')}
                resizeMode="center"
                style={styles.mapLogo}
              />
              <Body weight="semiBold" style={styles.mapAppName}>
                {t('screens.map.sygic')}
              </Body>
            </TouchableOpacity>
          </ScrollView>
        </BottomSheet>
      </Modal>
    );
  },
);

BusinessDetailModal.displayName = 'BusinessDetailModal';

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  contentContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.neutral.white,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    height: 280,
    backgroundColor: colors.primary.main,
    position: 'relative',
  },
  statusBadgeToast: {
    position: 'absolute',
    top:
      spacing.md +
      (Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 44),
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 11,
  },
  closeButton: {
    position: 'absolute',
    top:
      spacing.md +
      (Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 44),
    right: spacing.md,
    zIndex: 10,
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  headerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  categoryRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoSection: {
    backgroundColor: colors.neutral.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    padding: spacing.lg,
    paddingTop: spacing.xl,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  infoTextContainer: {
    flex: 1,
    gap: spacing.xs,
  },
  actionSection: {
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.secondary.main,
    paddingVertical: spacing.md,
    marginVertical: spacing.md,
  },
  getDirectionButton: {
    flex: 1,
  },
  callButton: {
    flex: 1,
    backgroundColor: colors.status.successDark,
  },
  reviewsSection: {
    paddingTop: spacing.md,
    paddingHorizontal: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.secondary.main,
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  addReviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderWidth: 1,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderRadius: radius.round,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  addReviewForm: {
    borderWidth: 1,
    borderColor: colors.neutral.lightGrey,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  userRatingStars: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  reviewsList: {
    gap: spacing.md,
  },
  reviewItem: {
    backgroundColor: colors.neutral.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.neutral.lightGrey,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  reviewerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  reviewerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewRating: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewText: {
    fontSize: 14,
    color: colors.neutral.darkGrey,
    lineHeight: 20,
  },
  mapAppsScroll: {
    paddingBottom: spacing.lg,
  },
  mapAppsScrollContent: {
    gap: spacing.md,
  },
  mapAppName: {
    fontSize: 13,
    textAlign: 'center',
    color: colors.neutral.black,
  },

  mapAppCard: {
    alignSelf: 'center',
    alignItems: 'center',
    gap: spacing.xs,
  },
  mapAppCardDisabled: {
    opacity: 0.3,
  },
  mapLogo: {
    width: 50,
    height: 50,
    borderRadius: radius.md,
  },
  workingHoursHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  todayHoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  todayLabel: {
    fontSize: 15,
    color: colors.neutral.darkGrey,
  },
  allWorkingHours: {
    marginTop: spacing.xs,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.lightGrey,
  },
  workingHourRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  closedText: {
    color: colors.primary.main,
  },
  todayDay: {
    fontWeight: 'bold',
    color: colors.neutral.black,
    textDecorationLine: 'underline',
  },
  markerInner: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.neutral.white,
    shadowColor: colors.neutral.black,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
});

export {BusinessDetailModal};
export type {BusinessDetailModalProps, BusinessDetailModalRef};
