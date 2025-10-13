import React, {useState, useCallback, useRef, useEffect} from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Animated,
  Platform,
} from 'react-native';
import {colors, spacing, getShadow, commonStyles, radius} from '@theme';
import {RouteProp} from '@react-navigation/native';
import {
  MainScreenNavigationProp,
  MainStackParamList,
} from '@navigation/types/navigationTypes';
import {useGetEvent, useRemoveEvent} from '@services/event.service';
import {
  Icon,
  TopHeaderBar,
  Button,
  Typography,
  Title,
  showToast,
  Chip,
  DropdownMenuItem,
  Subtitle,
  BottomSheet,
  BottomSheetRef,
  Body,
  CollapsibleCard,
} from '@components';
import {format, formatDuration, intervalToDuration} from 'date-fns';
import {useTranslation} from '@hooks/useTranslation';
import {useLanguage} from '@contexts/LanguageContext';
import {IEvent, EventStatus, Language, AddressType} from '@motorove/shared';
import {navigateToScreen} from '@navigation/utils/navigationHelpers';
import {loggingService} from '@services/logging.service';
import {tr, enUS} from 'date-fns/locale';
import {EnumUtils} from '@utils/enumUtils';
type EventDetailScreenRouteProp = RouteProp<MainStackParamList, 'EventDetail'>;

type Props = {
  route: EventDetailScreenRouteProp;
  navigation: MainScreenNavigationProp<'EventDetail'>;
};

/**
 * EventDetail Screen - Displays detailed information about a specific event
 */
export const EventDetailScreen = ({route, navigation}: Props) => {
  const {eventId} = route.params;
  const {t} = useTranslation();
  const {language} = useLanguage();
  const [isJoining, setIsJoining] = useState(false);
  const deleteEventBottomSheetRef = useRef<BottomSheetRef>(null);

  // Animated value for scroll with better performance
  const scrollY = useRef(new Animated.Value(0)).current;

  // Use the useGetEvent hook to fetch the event data
  const {event, loading, refetch: refetchEvent} = useGetEvent(eventId);
  const {removeEvent, loading: removeEventLoading} = useRemoveEvent(() => {
    navigation.goBack();
  });

  // Format date for display
  const formatEventDate = useCallback((dateInput: string | Date) => {
    const eventDate =
      typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    return format(eventDate, 'EEEE, MMM d • HH:mm', {
      locale: language.toLowerCase() === Language.TR.toLowerCase() ? tr : enUS,
    });
  }, []);

  // Get meeting point address (if available)
  const getMeetingPointAddress = useCallback(() => {
    return (
      event?.addresses?.find(
        address =>
          address.language.toLowerCase() === language.toLowerCase() &&
          address.type === AddressType.EVENT_MEETING_POINT,
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

  // Handle join event
  const handleJoinEvent = useCallback(async () => {
    // This would be replaced with actual join event logic
    setIsJoining(true);
    setTimeout(() => {
      setIsJoining(false);
      showToast({
        type: 'success',
        text1: t('common.success'),
        text2: t('screens.event.join_request_sent'),
      });
      refetchEvent();
    }, 1000);
  }, [refetchEvent, t]);

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
      }

      return items;
    },
    [t],
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
        default:
          loggingService.info(
            `Unhandled action: ${item.id} for event: ${eventId}`,
          );
      }
    },
    [],
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

  // Determine if the user is going to the event (using hardcoded values for demo)
  const isUserGoing = false; // Replace with actual logic when backend is connected

  // State for route data
  const [routeInfo, setRouteInfo] = useState<string>('');
  const [isLoadingRoute, setIsLoadingRoute] = useState<boolean>(false);

  // Add scroll optimization
  const scrollViewRef = useRef<any>(null);

  // Calculate route using OSRM API (OpenStreetMap Routing Machine)
  const calculateRouteWithOSRM = useCallback(
    async (
      startLat: number,
      startLng: number,
      endLat: number,
      endLng: number,
    ) => {
      try {
        setIsLoadingRoute(true);

        // Use the OSRM API to calculate route distance and duration
        const url = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=false`;

        const response = await fetch(url);
        const data = await response.json();
        if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
          const routeData = data.routes[0];
          const distanceKm = Math.round(routeData.distance / 1000); // Convert meters to km
          const durationHours = routeData.duration / 3600; // Convert seconds to hours

          // Format duration using date-fns
          const durationMs = routeData.duration * 1000; // Convert seconds to milliseconds
          const duration = intervalToDuration({start: 0, end: durationMs});

          // Get the correct locale based on current language setting
          const locale =
            language.toLowerCase() === Language.TR.toLowerCase() ? tr : enUS;

          let durationText;
          if (durationHours < 1) {
            // For durations less than 1 hour, display minutes only
            durationText = formatDuration(
              {minutes: duration.minutes || 0},
              {
                format: ['minutes'],
                locale: locale,
              },
            );
            if (!durationText && duration.seconds) {
              // If less than a minute, use localized version of '1 minute'
              durationText = formatDuration(
                {minutes: 1},
                {format: ['minutes'], locale: locale},
              );
            }
          } else {
            // For longer durations, display hours and minutes
            durationText = formatDuration(
              {hours: duration.hours || 0, minutes: duration.minutes || 0},
              {
                format: ['hours', 'minutes'],
                delimiter: ' ',
                locale: locale,
              },
            );
          }

          setRouteInfo(`${distanceKm} km • ${durationText}`);
        } else {
          throw new Error('Route calculation failed');
        }
      } catch (error) {
        loggingService.error('Error calculating route:', error);

        setRouteInfo('');
      } finally {
        setIsLoadingRoute(false);
      }
    },
    [],
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
        calculateRouteWithOSRM(
          startAddress.latitude,
          startAddress.longitude,
          finishAddress.latitude,
          finishAddress.longitude,
        );
      } else {
        setRouteInfo('');
      }
    }
  }, [event?.addresses, language, calculateRouteWithOSRM]);

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
        <Animated.View style={[styles.headerContainer, {height: headerHeight}]}>
          <Animated.Image
            source={{uri: event.images?.[0]}}
            style={[
              styles.headerImage,
              {
                opacity: headerOpacity,
              },
            ]}
          />
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
          {getMeetingPointAddress() && (
            <View style={styles.infoRow}>
              <Icon
                name="user-location"
                size={16}
                color={colors.neutral.grey}
              />
              <Typography style={styles.infoText}>
                {getMeetingPointAddress()}
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
                {t('screens.event.max_participants')}: {event.maxParticipants}
              </Typography>
            </View>
          )}

          {/* Organizer Row */}
          {event.createdBy && (
            <View style={styles.infoRow}>
              <Icon name="user-filled" size={16} color={colors.neutral.grey} />
              <Typography style={styles.infoText}>
                {t('screens.event.organized_by')}: {event.createdBy.firstName}{' '}
                {event.createdBy.lastName}
              </Typography>
            </View>
          )}
        </View>

        {/* Participation Card */}
        {event.status !== EventStatus.DRAFT && (
          <View style={styles.eventCard}>
            <Typography style={styles.joinQuestion}>
              {t('screens.event.are_you_joining')}
            </Typography>

            <View style={styles.participationButtons}>
              <Button
                title={t('screens.event.going')}
                onPress={handleJoinEvent}
                disabled={isJoining}
                loading={isJoining}
                variant={isUserGoing ? 'dark' : 'secondary'}
                shape="round"
                size="small"
                style={{flex: 1, paddingVertical: spacing.md}}
              />

              <Button
                title={t('screens.event.not_going')}
                // onPress={handleNotJoinEvent}
                disabled={isJoining}
                loading={isJoining}
                variant={isUserGoing ? 'secondary' : 'dark'}
                shape="round"
                size="small"
                style={{flex: 1, paddingVertical: spacing.md}}
              />
            </View>

            {/* Participant Count */}
            <View style={styles.participantInfo}>
              <Icon name="user-check-filled" size={14} />
              <Typography style={styles.participantCount}>
                8 {t('screens.event.going')}
              </Typography>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <Button
                title={t('screens.event.chat')}
                onPress={() => {}}
                variant="text"
                size="small"
                iconName="comments"
                iconSize={16}
              />
            </View>
          </View>
        )}

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
                  {event.price}
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
  joinQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral.black,
  },
  participationButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
  },
  participantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  participantCount: {
    fontSize: 13,
    color: colors.neutral.grey,
  },
  actionButtons: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.secondary.main,
    paddingTop: spacing.md,
    justifyContent: 'center',
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
});

export default EventDetailScreen;
