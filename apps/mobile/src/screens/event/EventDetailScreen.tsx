import React, {useState, useCallback, useRef} from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Animated,
} from 'react-native';
import {colors, spacing, getShadow, commonStyles} from '@theme';
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
} from '@components';
import {format} from 'date-fns';
// import {useAuth} from '@contexts'; // Commented out as not used
import {useTranslation} from '@hooks/useTranslation';
import {IEvent, EventStatus} from '@motorove/shared';
import {navigateToScreen} from '@navigation/utils/navigationHelpers';
import {loggingService} from '@services/logging.service';
// import {EventParticipantStatus} from '@motorove/shared'; // Commented out as not used

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
  // const {user} = useAuth(); // Commented out as not used in current implementation
  const [isJoining, setIsJoining] = useState(false);
  const deleteEventBottomSheetRef = useRef<BottomSheetRef>(null);

  // Animated value for scroll
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
    return format(eventDate, 'EEEE, MMM d • HH:mm');
  }, []);

  // Get meeting point address (if available)
  const getMeetingPointAddress = useCallback(() => {
    if (!event?.addresses || event.addresses.length === 0) {
      return t('screens.event.no_location');
    }

    return event.addresses[0]?.address || t('screens.event.no_location');
  }, [event?.addresses, t]);

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
  const isUserMaybe = false; // Replace with actual logic when backend is connected

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

  // Animated value for header height only
  const headerHeight = scrollY.interpolate({
    inputRange: [0, 150],
    outputRange: [280, 100], // Shrink to status bar size (around 100px)
    extrapolate: 'clamp',
  });

  // Animated value for back button opacity
  const backButtonOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0], // Fade out when scrolling
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      {/* Animated Header with Background Image */}
      <Animated.View style={[styles.headerContainer, {height: headerHeight}]}>
        <Animated.Image
          source={
            event.images && event.images.length > 0
              ? {uri: event.images[0]}
              : require('@assets/images/default_event_cover.png')
          }
          style={styles.headerImage}
        />
        <Animated.View
          style={[styles.topHeaderBar, {opacity: backButtonOpacity}]}>
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
      </Animated.View>

      {/* Animated Scrollable Content - Overlapping the background */}
      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{nativeEvent: {contentOffset: {y: scrollY}}}],
          {useNativeDriver: false},
        )}
        scrollEventThrottle={16}>
        {/* Main Event Details Card - Overlapping background */}
        <View style={styles.eventCard}>
          {/* Event Title */}
          <Title style={styles.eventTitle}>{event.title}</Title>

          {/* Ride Badge */}
          <Chip
            label="Grup Sürüşü"
            variant="filled"
            color="primary"
            style={styles.rideBadge}
            size="small"
          />

          {/* Date/Time Row */}
          <View style={styles.infoRow}>
            <Icon
              name="calendar-filled"
              size={16}
              color={colors.neutral.grey}
            />
            <Typography style={styles.infoText}>
              {formatEventDate(event.startDateTime)}
            </Typography>
          </View>

          {/* Location Row */}
          <View style={styles.infoRow}>
            <Icon name="map-pin" size={16} color={colors.neutral.grey} />
            <Typography style={styles.infoText}>
              {getMeetingPointAddress()}
            </Typography>
          </View>

          {/* Distance/Duration/Difficulty Row */}
          <View style={styles.infoRow}>
            <Icon name="route-filled" size={16} color={colors.neutral.grey} />
            <Typography style={styles.infoText}>
              130 km • 4.5 hrs • Intermediate
            </Typography>
          </View>

          {/* Organizer Row */}
          <View style={styles.infoRow}>
            <Icon name="users-filled" size={16} color={colors.neutral.grey} />
            <Typography style={styles.infoText}>
              {t('screens.event.organized_by')} {event.createdBy.firstName}{' '}
              {event.createdBy.lastName}
            </Typography>
          </View>
        </View>

        {/* Description Card */}
        <View style={styles.eventCard}>
          <Typography style={styles.sectionTitle}>
            {t('screens.event.description')}
          </Typography>
          <Typography style={styles.description}>
            {event.description}
          </Typography>
        </View>

        {/* Participation Card */}
        <View style={styles.eventCard}>
          <Typography style={styles.joinQuestion}>
            {t('screens.event.are_you_joining')}
          </Typography>

          <View style={styles.participationButtons}>
            <TouchableOpacity
              style={[
                styles.participationButton,
                isUserGoing && styles.goingButton,
              ]}
              onPress={handleJoinEvent}
              disabled={isJoining}>
              <Typography
                style={[
                  styles.participationButtonText,
                  isUserGoing && styles.goingButtonText,
                ]}>
                {t('screens.event.going')}
              </Typography>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.participationButton,
                isUserMaybe && styles.goingButton,
              ]}
              onPress={handleJoinEvent}
              disabled={isJoining}>
              <Typography
                style={[
                  styles.participationButtonText,
                  isUserMaybe && styles.goingButtonText,
                ]}>
                {t('screens.event.maybe')}
              </Typography>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.participationButton}
              disabled={isJoining}>
              <Typography style={styles.participationButtonText}>
                {t('screens.event.not_going')}
              </Typography>
            </TouchableOpacity>
          </View>

          {/* Participant Count */}
          <View style={styles.participantInfo}>
            <Icon name="users" size={14} color={colors.neutral.grey} />
            <Typography style={styles.participantCount}>
              8 {t('screens.event.going')} • 4 {t('screens.event.maybe')}
            </Typography>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton}>
              <Typography style={styles.actionButtonText}>🧭</Typography>
              <Typography style={styles.actionButtonText}>
                {t('screens.event.route')}
              </Typography>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <Icon name="map-pin" size={16} color={colors.neutral.black} />
              <Typography style={styles.actionButtonText}>
                {t('screens.event.maps')}
              </Typography>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <Typography style={styles.actionButtonText}>💬</Typography>
              <Typography style={styles.actionButtonText}>
                {t('screens.event.chat')}
              </Typography>
            </TouchableOpacity>
          </View>
        </View>

        {/* Route Description Card */}
        <View style={styles.eventCard}>
          <Typography style={styles.sectionTitle}>Route Description</Typography>
          <Typography style={styles.description}>
            Ride through hills & coastline. Includes a food stop and group
            photo!
          </Typography>
        </View>

        {/* Rest Stops Card */}
        <View style={styles.eventCard}>
          <Typography style={styles.sectionTitle}>Rest Stops</Typography>
          <View style={styles.infoRow}>
            <Typography style={styles.infoText}>📍</Typography>
            <Typography style={styles.infoText}>
              Coastal Café - 45km (Coffee & Snacks)
            </Typography>
          </View>
          <View style={styles.infoRow}>
            <Typography style={styles.infoText}>📍</Typography>
            <Typography style={styles.infoText}>
              Scenic Viewpoint - 85km (Photo Stop)
            </Typography>
          </View>
        </View>
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
  headerContainer: {
    height: 280,
    position: 'relative',
  },
  headerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  topHeaderBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    backgroundColor: 'transparent',
  },
  scrollView: {
    flex: 1,
    marginTop: -120, // Increased negative margin for better overlap with smaller final size
  },
  scrollContent: {
    padding: spacing.md,
    paddingTop: spacing.lg, // Extra padding at top for the overlapping card
  },
  eventCard: {
    backgroundColor: colors.neutral.white,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
    gap: spacing.md,
    ...getShadow('medium'),
  },
  rideBadge: {
    backgroundColor: colors.primary.light,
  },
  eventTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.neutral.black,
    lineHeight: 28,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
    justifyContent: 'space-between',
  },
  participationButton: {
    flex: 1,
    backgroundColor: colors.neutral.lightGrey,
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: spacing.sm,
    marginHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goingButton: {
    backgroundColor: colors.neutral.black,
  },
  participationButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.neutral.darkGrey,
  },
  goingButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.neutral.white,
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
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.neutral.lightGrey,
    paddingTop: spacing.md,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.neutral.black,
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
