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
  const [refreshingPublishedEvents, setRefreshingPublishedEvents] =
    useState(false);
  const [refreshingDraftEvents, setRefreshingDraftEvents] = useState(false);
  const navigation = useNavigation<MainScreenNavigationProp<'Tabs'>>();
  const {t} = useTranslation();
  const insets = useSafeAreaInsets();
  const {language} = useLanguage();

  // Fetch published events
  const {
    events: publishedEvents,
    loading: publishedEventsLoading,
    error: publishedEventsError,
    refetch: refetchPublishedEvents,
    loadMore: loadMorePublishedEvents,
    hasMore: hasMorePublishedEvents,
  } = useGetEvents(20, 0, EventStatus.PUBLISHED);

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

  const handleRefreshPublishedEvents = useCallback(async () => {
    setRefreshingPublishedEvents(true);
    await refetchPublishedEvents();
    setRefreshingPublishedEvents(false);
  }, [refetchPublishedEvents]);

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
            onPress={() =>
              tabType === 'upcoming' || tabType === 'past'
                ? handleRefreshPublishedEvents()
                : handleRefreshDraftEvents()
            }
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
    // Filter events based on status and date for past events
    let filteredEvents;

    switch (activeTab) {
      case 'upcoming':
        filteredEvents = eventsList.filter(event => {
          const eventDate = new Date(event.startDateTime);
          const now = new Date();
          return event.status === EventStatus.PUBLISHED && eventDate >= now;
        });
        break;
      case 'past':
        filteredEvents = eventsList.filter(event => {
          const eventDate = new Date(event.startDateTime);
          const now = new Date();
          return event.status === EventStatus.PUBLISHED && eventDate < now;
        });
        break;
      case 'draft':
        filteredEvents = eventsList.filter(
          event => event.status === EventStatus.DRAFT,
        );
        break;
      default:
        filteredEvents = eventsList.filter(
          event => event.status === EventStatus.PUBLISHED,
        );
    }

    if (isLoading && !isRefreshing && !filteredEvents?.length) {
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
        data={filteredEvents}
        keyExtractor={item => item.id}
        renderItem={({item}) => {
          // Get the first address (if available)
          const meetingLocation =
            item.addresses &&
            item.addresses.find(
              address =>
                address.type === AddressType.EVENT_MEETING_POINT &&
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
          ...(filteredEvents.length === 0 && !isLoading ? {flex: 1} : {}),
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
            publishedEvents,
            refreshingPublishedEvents,
            handleRefreshPublishedEvents,
            publishedEventsLoading,
            publishedEventsError,
            loadMorePublishedEvents,
            hasMorePublishedEvents,
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
            publishedEvents,
            refreshingPublishedEvents,
            handleRefreshPublishedEvents,
            publishedEventsLoading,
            publishedEventsError,
            loadMorePublishedEvents,
            hasMorePublishedEvents,
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
