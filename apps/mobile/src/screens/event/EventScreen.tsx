import React, {useState, useCallback} from 'react';
import {View, StyleSheet, RefreshControl, FlatList} from 'react-native';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {MainScreenNavigationProp} from '@navigation/types/navigationTypes';
import {colors, spacing} from '@theme';
import {
  TopHeaderBar,
  Button,
  Icon,
  Tabs,
  EventCard,
  SkeletonGroup,
  Subtitle,
  Body,
} from '@components';
import {useTranslation} from '@hooks/useTranslation';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {IEvent, EventStatus, AddressType} from '@motorove/shared';
import {useGetEvents} from '@services/event.service';
import {EnumUtils} from '@utils/enumUtils';
import {useLanguage} from '@contexts/LanguageContext';

/**
 * Events Screen - Displays user events with tab navigation
 */
export const EventScreen = () => {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [refreshingUpcomingEvents, setRefreshingUpcomingEvents] =
    useState(false);
  const [refreshingPastEvents, setRefreshingPastEvents] = useState(false);
  const [refreshingDraftEvents, setRefreshingDraftEvents] = useState(false);
  const navigation = useNavigation<MainScreenNavigationProp<'Tabs'>>();
  const {t} = useTranslation();
  const insets = useSafeAreaInsets();
  const {language} = useLanguage();

  // Fetch upcoming events
  const {
    events: upcomingEvents,
    loading: upcomingEventsLoading,
    error: upcomingEventsError,
    refetch: refetchUpcomingEvents,
    loadMore: loadMoreUpcomingEvents,
    hasMore: hasMoreUpcomingEvents,
  } = useGetEvents(20, 0, EventStatus.UPCOMING);

  // Fetch past events
  const {
    events: pastEvents,
    loading: pastEventsLoading,
    error: pastEventsError,
    refetch: refetchPastEvents,
    loadMore: loadMorePastEvents,
    hasMore: hasMorePastEvents,
  } = useGetEvents(20, 0, EventStatus.PAST);

  // Fetch draft events
  const {
    events: draftEvents,
    loading: draftEventsLoading,
    error: draftEventsError,
    refetch: refetchDraftEvents,
    loadMore: loadMoreDraftEvents,
    hasMore: hasMoreDraftEvents,
  } = useGetEvents(20, 0, EventStatus.DRAFT);

  // Refresh draft events when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (activeTab === 'draft') {
        refetchDraftEvents();
      }
      return () => {};
    }, [activeTab, refetchDraftEvents]),
  );

  const handleRefreshUpcomingEvents = useCallback(async () => {
    setRefreshingUpcomingEvents(true);
    await refetchUpcomingEvents();
    setRefreshingUpcomingEvents(false);
  }, [refetchUpcomingEvents]);

  const handleRefreshPastEvents = useCallback(async () => {
    setRefreshingPastEvents(true);
    await refetchPastEvents();
    setRefreshingPastEvents(false);
  }, [refetchPastEvents]);

  const handleRefreshDraftEvents = useCallback(async () => {
    setRefreshingDraftEvents(true);
    await refetchDraftEvents();
    setRefreshingDraftEvents(false);
  }, [refetchDraftEvents]);

  const renderEmptyState = useCallback(
    (tabType: string, isLoading: boolean) => {
      if (isLoading) {
        return null;
      }

      return (
        <View style={styles.emptyState}>
          <Icon name="calendar" size={48} />
          <Subtitle weight="bold">
            {tabType === 'upcoming'
              ? t('screens.event.no_upcoming_events')
              : tabType === 'draft'
              ? t('screens.event.no_draft_events')
              : t('screens.event.no_past_events')}
          </Subtitle>
          <Body align="center">{t('screens.event.could_not_load_events')}</Body>
          <Button
            title={t('common.try_again')}
            variant="primary"
            shape="round"
            onPress={() => {
              switch (tabType) {
                case 'upcoming':
                  handleRefreshUpcomingEvents();
                  break;
                case 'past':
                  handleRefreshPastEvents();
                  break;
                case 'draft':
                  handleRefreshDraftEvents();
                  break;
              }
            }}
          />
        </View>
      );
    },
    [],
  );

  const renderEventsList = (
    eventsList: IEvent[],
    isRefreshing: boolean,
    onRefresh: () => void,
    isLoading: boolean,
    hasError: any,
    loadMore: () => void,
    hasMore: boolean,
  ) => {
    if (isLoading && !isRefreshing && !eventsList?.length) {
      return (
        <View style={styles.loadingContainer}>
          {Array.from({length: 3}).map((_, index) => (
            <SkeletonGroup
              key={`skeleton-${index}`}
              preset="groupCard"
              showShadow={false}
              style={styles.skeletonItem}
            />
          ))}
        </View>
      );
    }

    if (hasError) {
      return (
        <View style={styles.emptyState}>
          <Icon name="error" size={48} color={colors.status.error} />
          <Subtitle weight="bold">
            {t('errors.general.something_wrong')}
          </Subtitle>
          <Button
            title={t('common.try_again')}
            variant="primary"
            shape="round"
            onPress={onRefresh}
          />
        </View>
      );
    }

    return (
      <FlatList
        data={eventsList}
        keyExtractor={item => item.id}
        renderItem={({item}) => {
          // Get the first address (if available)
          const meetingLocation =
            item.addresses &&
            item.addresses.find(
              address =>
                address.type === AddressType.EVENT_MEETING_LOCATION &&
                address.language.toLowerCase() === language.toLowerCase(),
            );

          const startLocation =
            item.addresses &&
            item.addresses.find(
              address =>
                address.type === AddressType.EVENT_START_LOCATION &&
                address.language.toLowerCase() === language.toLowerCase(),
            );

          const location = meetingLocation?.address
            ? meetingLocation.address
            : startLocation?.address;

          // For the UI we'll create a basic participants array
          // The actual data structure might be different
          const participants = item.participantsCount
            ? Array(Math.min(3, item.participantsCount))
                .fill(0)
                .map((_, i) => ({
                  id: `${item.id}-participant-${i}`,
                  name: '',
                }))
            : [];

          return (
            <EventCard
              title={item.title}
              image={{uri: item.images?.[0]}}
              dateTime={item.startDateTime}
              location={location || ''}
              category={EnumUtils.convertEventType(item.eventType)}
              participants={participants}
              maxParticipants={item.maxParticipants || undefined}
              onPress={() =>
                navigation.navigate('EventDetail', {eventId: item.id})
              }
            />
          );
        }}
        contentContainerStyle={{
          paddingHorizontal: spacing.md,
          paddingBottom: insets.bottom + 70,
          ...(eventsList.length === 0 && !isLoading ? {flex: 1} : {}),
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={renderEmptyState(activeTab, isLoading)}
        onEndReached={hasMore ? loadMore : undefined}
        onEndReachedThreshold={0.5}
      />
    );
  };

  const tabItems = [
    {
      key: 'upcoming',
      label: t('screens.event.upcoming'),
      content: (
        <View style={styles.tabContent}>
          {renderEventsList(
            upcomingEvents,
            refreshingUpcomingEvents,
            handleRefreshUpcomingEvents,
            upcomingEventsLoading,
            upcomingEventsError,
            loadMoreUpcomingEvents,
            hasMoreUpcomingEvents,
          )}
        </View>
      ),
    },
    {
      key: 'past',
      label: t('screens.event.past'),
      content: (
        <View style={styles.tabContent}>
          {renderEventsList(
            pastEvents,
            refreshingPastEvents,
            handleRefreshPastEvents,
            pastEventsLoading,
            pastEventsError,
            loadMorePastEvents,
            hasMorePastEvents,
          )}
        </View>
      ),
    },
    {
      key: 'draft',
      label: t('screens.event.draft'),
      content: (
        <View style={styles.tabContent}>
          {renderEventsList(
            draftEvents,
            refreshingDraftEvents,
            handleRefreshDraftEvents,
            draftEventsLoading,
            draftEventsError,
            loadMoreDraftEvents,
            hasMoreDraftEvents,
          )}
        </View>
      ),
    },
  ];

  return (
    <View style={styles.container}>
      <TopHeaderBar
        title={t('screens.menu.events')}
        showShadow={false}
        containerStyle={styles.topHeaderBar}
        showBackButton
        onBackPress={() => navigation.goBack()}
        rightIconName="plus"
        onRightButtonPress={() => navigation.navigate('CreateEvent')}
      />
      <Tabs
        items={tabItems}
        selectedKey={activeTab}
        onTabChange={setActiveTab}
        variant="default"
        equalWidth
        contentContainerStyle={styles.tabContent}
        containerStyle={styles.tabContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.secondary.light,
  },
  topHeaderBar: {
    borderBottomWidth: 1,
    borderBottomColor: colors.secondary.main,
  },
  tabContainer: {
    flex: 1,
    paddingTop: spacing.sm,
  },
  tabContent: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  loadingContainer: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  skeletonItem: {
    marginBottom: spacing.md,
    borderBottomWidth: 1,
    borderColor: colors.neutral.veryLightGrey,
  },
  footerLoader: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
});
