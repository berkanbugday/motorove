import React, {useState, useCallback, useRef, useEffect} from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Animated,
  Platform,
  TouchableOpacity,
  Dimensions,
  LayoutChangeEvent,
} from 'react-native';
import {BlurView} from '@react-native-community/blur';
import Carousel, {Pagination} from 'react-native-snap-carousel';
import {colors, spacing, getShadow, commonStyles, radius} from '@theme';
import {RouteProp} from '@react-navigation/native';
import {
  MainScreenNavigationProp,
  MainStackParamList,
} from '@navigation/types/navigationTypes';
import {
  useGetEvent,
  useRemoveEvent,
  useJoinEvent,
  useLeaveEvent,
} from '@services/event.service';
import {
  Icon,
  TopHeaderBar,
  Button,
  Typography,
  Title,
  Chip,
  DropdownMenuItem,
  Subtitle,
  BottomSheet,
  BottomSheetRef,
  Body,
  CollapsibleCard,
  ParticipantAvatars,
  showToast,
  ImagePreviewModal,
} from '@components';
import {format} from 'date-fns';
import {tr, enUS} from 'date-fns/locale';
import {useTranslation} from '@hooks/useTranslation';
import {useLanguage} from '@contexts/LanguageContext';

import {
  IEvent,
  EventStatus,
  Language,
  AddressType,
  CURRENCY_SYMBOLS,
  Currency,
  CURRENCY_FORMATTING,
  IImage,
} from '@motorove/shared';
import {navigateToScreen} from '@navigation/utils/navigationHelpers';
import {loggingService} from '@services/logging.service';
import {EnumUtils} from '@utils/enumUtils';
import {formatCurrency} from '@utils/currencyUtils';
import {calculateRouteWithOSRM, formatRouteInfo} from '@utils/routeUtils';
type EventDetailScreenRouteProp = RouteProp<MainStackParamList, 'EventDetail'>;

type Props = {
  route: EventDetailScreenRouteProp;
  navigation: MainScreenNavigationProp<'EventDetail'>;
};

/**
 * EventDetail Screen - Displays detailed information about a specific event
 */
const {width: screenWidth} = Dimensions.get('window');

export const EventDetailScreen = ({route, navigation}: Props) => {
  const {eventId} = route.params;
  const {t} = useTranslation();
  const {language} = useLanguage();
  const deleteEventBottomSheetRef = useRef<BottomSheetRef>(null);

  // Image carousel states
  const [activeSlide, setActiveSlide] = useState(0);
  const [headerWidth, setHeaderWidth] = useState(0);
  const [revealedCensoredImages, setRevealedCensoredImages] = useState<{
    [key: number]: boolean;
  }>({});
  const [imagePreviewVisible, setImagePreviewVisible] = useState(false);
  const [imagePreviewIndex, setImagePreviewIndex] = useState(0);
  const carouselRef = useRef(null);

  // Animated value for scroll with better performance
  const scrollY = useRef(new Animated.Value(0)).current;

  // Use the useGetEvent hook to fetch the event data
  const {event, loading, refetch: refetchEvent} = useGetEvent(eventId);
  const {removeEvent, loading: removeEventLoading} = useRemoveEvent(() => {
    navigation.goBack();
  });

  // Join/Leave event hooks
  const {joinEvent, loading: joinEventLoading} = useJoinEvent(_updatedEvent => {
    refetchEvent();
  });
  const {leaveEvent, loading: leaveEventLoading} = useLeaveEvent(
    _updatedEvent => {
      refetchEvent();
    },
  );

  // Format date for display
  const formatEventDate = useCallback((dateInput: string | Date) => {
    const eventDate =
      typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    return format(eventDate, 'PPPP • HH:mm', {
      locale: language.toLowerCase() === Language.TR.toLowerCase() ? tr : enUS,
    });
  }, []);

  // Get meeting point address (if available)
  const getMeetingLocationAddress = useCallback(() => {
    return (
      event?.addresses?.find(
        address =>
          address.language.toLowerCase() === language.toLowerCase() &&
          address.type === AddressType.EVENT_MEETING_LOCATION,
      )?.address || null
    );
  }, [event?.addresses, language]);

  const getStartLocationAddress = useCallback(() => {
    return (
      event?.addresses?.find(
        address =>
          address.language.toLowerCase() === language.toLowerCase() &&
          address.type === AddressType.EVENT_START_LOCATION,
      )?.address || null
    );
  }, [event?.addresses, language]);

  const getFinishLocationAddress = useCallback(() => {
    return (
      event?.addresses?.find(
        address =>
          address.language.toLowerCase() === language.toLowerCase() &&
          address.type === AddressType.EVENT_FINISH_LOCATION,
      )?.address || null
    );
  }, [event?.addresses, language]);

  const eventDropdownMenuItems = useCallback(
    (status?: EventStatus): DropdownMenuItem[] => {
      const items: DropdownMenuItem[] = [];

      if (status === EventStatus.DRAFT) {
        items.push({
          id: 'edit_event',
          label: t('common.edit'),
          icon: 'pen-filled',
        });
        items.push({
          id: 'delete_event',
          label: t('common.delete'),
          icon: 'trash',
          isHighlighted: true,
        });
      } else if (status === EventStatus.UPCOMING) {
        if (event?.isParticipating) {
          items.push({
            id: 'leave_event',
            label: t('screens.event.leave'),
            icon: 'sign-out',
            isHighlighted: true,
          });
        } else {
          items.push({
            id: 'join_event',
            label: t('screens.event.join'),
            icon: 'check-filled',
          });
        }
      }

      return items;
    },
    [t, event?.isParticipating],
  );

  const handleDropdownMenuItemSelect = useCallback(
    (item: DropdownMenuItem, _event: IEvent) => {
      switch (item.id) {
        case 'edit_event':
          navigateToScreen(navigation, 'EditEvent', {eventId});
          break;
        case 'delete_event':
          deleteEventBottomSheetRef.current?.open('minimal');
          break;
        case 'join_event':
          joinEvent(eventId);
          break;
        case 'leave_event':
          leaveEvent(eventId);
          break;
        default:
          loggingService.info(
            `Unhandled action: ${item.id} for event: ${eventId}`,
          );
      }
    },
    [joinEvent, leaveEvent, eventId, navigation],
  );

  const confirmDeleteEvent = useCallback(async () => {
    try {
      if (event && event.id) {
        await removeEvent(event.id);
      }
    } catch (error) {
      loggingService.error(`Error deleting event: ${eventId}`, error);
      // Error handling is already done in the service hook
    }
  }, [eventId]);

  // State for route data
  const [routeInfo, setRouteInfo] = useState<string>('');
  const [isLoadingRoute, setIsLoadingRoute] = useState<boolean>(false);

  // Add scroll optimization
  const scrollViewRef = useRef<any>(null);

  // Convert images to array for backward compatibility
  const imageArray = event?.images
    ? Array.isArray(event.images)
      ? event.images
      : [event.images]
    : [];

  const handleHeaderLayout = (layoutEvent: LayoutChangeEvent) => {
    const {width} = layoutEvent.nativeEvent.layout;
    setHeaderWidth(width);
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
            <Animated.Image
              source={{uri: item.url}}
              style={[
                styles.headerImage,
                {
                  opacity: headerOpacity,
                },
              ]}
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
            <Animated.Image
              source={{uri: image.url}}
              style={[
                styles.headerImage,
                {
                  opacity: headerOpacity,
                },
              ]}
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

  // Calculate route using OSRM API (OpenStreetMap Routing Machine)
  const calculateRoute = useCallback(
    async (
      startLat: number,
      startLng: number,
      endLat: number,
      endLng: number,
    ) => {
      try {
        setIsLoadingRoute(true);

        const result = await calculateRouteWithOSRM(
          startLat,
          startLng,
          endLat,
          endLng,
          language as Language,
        );

        setRouteInfo(formatRouteInfo(result.distanceKm, result.durationText));
      } catch (error) {
        loggingService.error('Error calculating route:', error);
        setRouteInfo('');
      } finally {
        setIsLoadingRoute(false);
      }
    },
    [language],
  );

  // Load route data when event data is available
  useEffect(() => {
    if (event?.addresses) {
      const startAddress = event.addresses.find(
        address =>
          address.language.toLowerCase() === language.toLowerCase() &&
          address.type === AddressType.EVENT_START_LOCATION,
      );

      const finishAddress = event.addresses.find(
        address =>
          address.language.toLowerCase() === language.toLowerCase() &&
          address.type === AddressType.EVENT_FINISH_LOCATION,
      );

      if (
        startAddress &&
        finishAddress &&
        startAddress.latitude &&
        startAddress.longitude &&
        finishAddress.latitude &&
        finishAddress.longitude
      ) {
        calculateRoute(
          startAddress.latitude,
          startAddress.longitude,
          finishAddress.latitude,
          finishAddress.longitude,
        );
      } else {
        setRouteInfo('');
      }
    }
  }, [event?.addresses, language, calculateRoute]);

  useEffect(() => {
    if (joinEventLoading || leaveEventLoading) {
      showToast({
        text2: t('common.completing'),
        type: 'info',
      });
    }
  }, [joinEventLoading, leaveEventLoading]);

  // Show loading while fetching initial data
  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!event) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Subtitle weight="bold">{t('errors.api.not_found')}</Subtitle>
        <Button
          title={t('common.back')}
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        />
      </View>
    );
  }

  // Animated values with smoother interpolation
  const headerHeight = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [280, 120], // More gradual shrinking
    extrapolate: 'clamp',
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 150, 200],
    outputRange: [1, 0.8, 0.6],
    extrapolate: 'clamp',
  });

  const backButtonOpacity = scrollY.interpolate({
    inputRange: [0, 120],
    outputRange: [1, 0], // Fade out when scrolling
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      {/* Floating Header Bar */}
      <Animated.View
        style={[styles.floatingHeaderBar, {opacity: backButtonOpacity}]}>
        <TopHeaderBar
          showBackButton
          dropdownMenuItems={eventDropdownMenuItems(event?.status)}
          onDropdownItemSelect={item =>
            handleDropdownMenuItemSelect(item, event as IEvent)
          }
          backgroundColor="transparent"
          onBackPress={() => navigation.goBack()}
        />
      </Animated.View>

      {/* Single ScrollView with header as first element */}
      <Animated.ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{nativeEvent: {contentOffset: {y: scrollY}}}],
          {useNativeDriver: false},
        )}
        scrollEventThrottle={Platform.OS === 'android' ? 16 : 8}
        bounces={Platform.OS === 'ios'}
        overScrollMode={Platform.OS === 'android' ? 'never' : 'auto'}
        nestedScrollEnabled={Platform.OS === 'android'}
        removeClippedSubviews={false}
        decelerationRate={Platform.OS === 'android' ? 'fast' : 'normal'}>
        {/* Header Image as first scroll element */}
        <Animated.View
          style={[styles.headerContainer, {height: headerHeight}]}
          onLayout={handleHeaderLayout}>
          {imageArray.length > 0 &&
            (imageArray.length > 1 ? (
              <>
                <Carousel
                  ref={carouselRef}
                  data={imageArray}
                  renderItem={renderCarouselItem}
                  sliderWidth={headerWidth > 0 ? headerWidth : screenWidth}
                  itemWidth={headerWidth > 0 ? headerWidth : screenWidth}
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
            ))}
        </Animated.View>
        {/* Main Event Details Card - Overlapping background */}
        <View style={styles.eventCard}>
          <View style={styles.eventCardHeader}>
            {/* Ride Badge */}
            <Chip
              label={EnumUtils.convertEventType(event.eventType)}
              variant="filled"
              color="primary"
              style={styles.rideBadge}
              size="small"
            />

            {event?.isPrivate && (
              <Chip
                label={t('screens.event.private_event')}
                variant="outlined"
                color="dark"
                leadingIcon="lock-filled"
                size="small"
              />
            )}
          </View>

          {/* Event Title */}
          <Title weight="bold">{event.title}</Title>

          {/* Date/Time Row */}
          <View style={styles.infoRow}>
            <Icon
              name="calendar-clock-filled"
              size={16}
              color={colors.neutral.grey}
            />
            <View style={styles.infoTextContainer}>
              <Typography style={styles.infoText}>
                {formatEventDate(event.startDateTime)}
              </Typography>
              {event.endDateTime && (
                <Typography style={styles.infoText}>
                  {formatEventDate(event.endDateTime)}
                </Typography>
              )}
            </View>
          </View>

          {/* Meeting Location Row */}
          {getMeetingLocationAddress() && (
            <View style={styles.infoRow}>
              <Icon
                name="user-location"
                size={16}
                color={colors.neutral.grey}
              />
              <Typography style={styles.infoText}>
                {getMeetingLocationAddress()}
              </Typography>
            </View>
          )}

          {/* Distance/Duration/Difficulty Row */}
          {!isLoadingRoute && routeInfo && (
            <View style={styles.infoRow}>
              <Icon name="route-filled" size={16} color={colors.neutral.grey} />
              <Typography style={styles.infoText}>{routeInfo}</Typography>
            </View>
          )}

          {/* Maximum Participants Row */}
          {event.maxParticipants && (
            <View style={styles.infoRow}>
              <Icon name="users-filled" size={16} color={colors.neutral.grey} />
              <Typography style={styles.infoText}>
                <Typography variant="bodySmall" weight="bold">
                  {t('screens.event.max_participants')}:{' '}
                </Typography>
                {event.maxParticipants}
              </Typography>
            </View>
          )}

          {/* Organizer Row */}
          {(event.organizedByGroup || event.createdBy) && (
            <View style={styles.infoRow}>
              <Icon name="user-filled" size={16} color={colors.neutral.grey} />
              <Typography style={styles.infoText}>
                <Typography variant="bodySmall" weight="bold">
                  {t('screens.event.organized_by')}:{' '}
                </Typography>
                {event.organizedByGroup
                  ? event.organizedByGroup.name
                  : event.createdBy.firstName + ' ' + event.createdBy.lastName}
              </Typography>
            </View>
          )}

          {/* Participants Row */}
          {event.participants && event.participants.length > 0 && (
            <View style={styles.infoRow}>
              <View style={styles.participantsContent}>
                <ParticipantAvatars
                  participants={event.participants}
                  maxAvatars={4}
                  style={styles.participantAvatarsContainer}
                />
              </View>
            </View>
          )}
        </View>

        {/* Description Card */}
        {event.description && (
          <CollapsibleCard
            title={t('screens.event.description')}
            initiallyExpanded={false}>
            <Typography style={styles.description}>
              {event.description}
            </Typography>
          </CollapsibleCard>
        )}

        {/* Event Details Card */}

        {(getStartLocationAddress() ||
          getFinishLocationAddress() ||
          event.roadType ||
          event.difficultyLevel ||
          event.experienceLevel ||
          event.price) && (
          <CollapsibleCard
            title={t('screens.event.event_details_title')}
            initiallyExpanded={false}>
            {/* Start Location Row */}
            {getStartLocationAddress() && (
              <View style={[styles.infoRow, {paddingVertical: spacing.xs}]}>
                <Icon
                  name="map-pin-filled"
                  size={16}
                  color={colors.neutral.grey}
                />
                <Typography style={styles.infoText}>
                  <Typography variant="bodySmall" weight="bold">
                    {t('screens.event.start_location')}:{' '}
                  </Typography>
                  {getStartLocationAddress()}
                </Typography>
              </View>
            )}

            {/* Finish Location Row */}
            {getFinishLocationAddress() && (
              <View style={[styles.infoRow, {paddingVertical: spacing.xs}]}>
                <Icon
                  name="map-pin-slash-filled"
                  size={20}
                  color={colors.neutral.grey}
                />
                <Typography style={styles.infoText}>
                  <Typography variant="bodySmall" weight="bold">
                    {t('screens.event.finish_location')}:{' '}
                  </Typography>
                  {getFinishLocationAddress()}
                </Typography>
              </View>
            )}

            {/* Road Type Row */}
            {event.roadType && (
              <View style={[styles.infoRow, {paddingVertical: spacing.xs}]}>
                <Icon
                  name="route-filled"
                  size={20}
                  color={colors.neutral.grey}
                />
                <Typography style={styles.infoText}>
                  <Typography variant="bodySmall" weight="bold">
                    {t('screens.event.road_type')}:{' '}
                  </Typography>
                  {EnumUtils.convertRoadType(event.roadType)}
                </Typography>
              </View>
            )}

            {/* Difficulty Level Row */}
            {event.difficultyLevel && (
              <View style={[styles.infoRow, {paddingVertical: spacing.xs}]}>
                <Icon
                  name="mountains-filled"
                  size={20}
                  color={colors.neutral.grey}
                />
                <Typography style={styles.infoText}>
                  <Typography variant="bodySmall" weight="bold">
                    {t('screens.event.difficulty_level')}:{' '}
                  </Typography>
                  {EnumUtils.convertDifficultyLevel(event.difficultyLevel)}
                </Typography>
              </View>
            )}

            {/* Experience Level Row */}
            {event.experienceLevel && (
              <View style={[styles.infoRow, {paddingVertical: spacing.xs}]}>
                <Icon
                  name="motorcycle-filled"
                  size={20}
                  color={colors.neutral.grey}
                />
                <Typography style={styles.infoText}>
                  <Typography variant="bodySmall" weight="bold">
                    {t('screens.event.experience_level')}:{' '}
                  </Typography>
                  {EnumUtils.convertExperienceLevel(event.experienceLevel)}
                </Typography>
              </View>
            )}

            {/* Experience Level Row */}
            {event.price && (
              <View style={[styles.infoRow, {paddingVertical: spacing.xs}]}>
                <Icon
                  name="money-bill-filled"
                  size={20}
                  color={colors.neutral.grey}
                />
                <Typography style={styles.infoText}>
                  <Typography variant="bodySmall" weight="bold">
                    {t('screens.event.price')}:{' '}
                  </Typography>
                  {formatCurrency(event.price, {
                    thousandSeparator:
                      CURRENCY_FORMATTING[event.currency as Currency]
                        .thousandSeparator,
                    decimalSeparator:
                      CURRENCY_FORMATTING[event.currency as Currency]
                        .decimalSeparator,
                    currencySymbol:
                      CURRENCY_SYMBOLS[event.currency as Currency],
                    showCurrencySymbol: true,
                    currencyPosition:
                      event.currency === Currency.USD ? 'before' : 'after',
                  })}
                </Typography>
              </View>
            )}
          </CollapsibleCard>
        )}

        {/* Instructor Information Card */}
        {event.instructorInfo && (
          <CollapsibleCard
            title={t('screens.event.instructor_info')}
            initiallyExpanded={false}>
            <Typography style={styles.description}>
              {event.instructorInfo}
            </Typography>
          </CollapsibleCard>
        )}

        {/* Topics Covered Card */}
        {event.topicsCovered && (
          <CollapsibleCard
            title={t('screens.event.topics_covered')}
            initiallyExpanded={false}>
            <Typography style={styles.description}>
              {event.topicsCovered}
            </Typography>
          </CollapsibleCard>
        )}

        {/* Camping Information Card */}
        {event.campingInfo && (
          <CollapsibleCard
            title={t('screens.event.camping_info')}
            initiallyExpanded={false}>
            <Typography style={styles.description}>
              {event.campingInfo}
            </Typography>
          </CollapsibleCard>
        )}

        {/* Route Description Card */}
        {event.routeDescription && (
          <CollapsibleCard
            title={t('screens.event.route_description')}
            initiallyExpanded={false}>
            <Typography style={styles.description}>
              {event.routeDescription}
            </Typography>
          </CollapsibleCard>
        )}

        {/* Rest Stops Card */}
        {event.restStops && (
          <CollapsibleCard
            title={t('screens.event.rest_stops')}
            initiallyExpanded={false}>
            <Typography style={styles.description}>
              {event.restStops}
            </Typography>
          </CollapsibleCard>
        )}

        {/* Equipment Checklist Card */}
        {event.equipmentChecklist && (
          <CollapsibleCard
            title={t('screens.event.equipment_checklist')}
            initiallyExpanded={false}>
            <Typography style={styles.description}>
              {event.equipmentChecklist}
            </Typography>
          </CollapsibleCard>
        )}
      </Animated.ScrollView>

      <BottomSheet
        ref={deleteEventBottomSheetRef}
        closeOnBackdropPress={false}
        initialSnap="closed"
        showCloseButton={true}
        enableGestureControl={false}
        closeButtonPosition="top-left"
        header={
          <Subtitle align="center">{t('screens.event.delete_event')}</Subtitle>
        }>
        <View style={{flex: 1}}>
          <View style={{flex: 1}}>
            <Body align="center">
              {t('screens.event.delete_event_confirmation')}
            </Body>
          </View>
          <View style={styles.deleteEventButtonsContainer}>
            <Button
              title={t('common.no')}
              variant="outline"
              shape="round"
              onPress={() => deleteEventBottomSheetRef.current?.close()}
              style={styles.cancelButton}
            />
            <Button
              title={t('common.yes')}
              variant="primary"
              shape="round"
              onPress={confirmDeleteEvent}
              style={styles.deleteEventButton}
              disabled={removeEventLoading}
              loading={removeEventLoading}
            />
          </View>
        </View>
      </BottomSheet>

      <ImagePreviewModal
        visible={imagePreviewVisible}
        images={imageArray}
        initialIndex={imagePreviewIndex}
        onClose={handleCloseImagePreview}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...commonStyles.container,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingHeaderBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    backgroundColor: 'transparent',
  },
  headerContainer: {
    height: 280,
    position: 'relative',
    marginBottom: Platform.OS === 'android' ? -spacing.xl : -spacing.lg,
  },
  headerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  eventCard: {
    backgroundColor: colors.neutral.white,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
    ...getShadow('medium'),
  },
  eventCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rideBadge: {
    backgroundColor: colors.primary.light,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoTextContainer: {
    alignItems: 'flex-start',
  },
  infoText: {
    marginLeft: spacing.sm,
    fontSize: 15,
    color: colors.neutral.darkGrey,
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral.black,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.neutral.darkGrey,
  },
  backButton: {
    marginTop: spacing.md,
  },
  deleteEventButtonsContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.secondary.main,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  cancelButton: {
    flex: 1,
    marginRight: spacing.sm,
  },
  deleteEventButton: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  participantsContent: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  participantAvatarsContainer: {
    marginTop: spacing.xs,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  blurContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blurView: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  censoredOverlay: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
  },
  censoredText: {
    textAlign: 'center',
  },
  hideButton: {
    position: 'absolute',
    bottom: spacing.xxl,
    right: spacing.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
  },
  paginationContainer: {
    position: 'absolute',
    bottom: spacing.sm,
    left: 0,
    right: 0,
    paddingVertical: 0,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.neutral.white,
  },
  paginationInactiveDot: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
});

export default EventDetailScreen;
