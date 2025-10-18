import React, {useState, useCallback, useEffect} from 'react';
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

  // Get current tab's event status
  const getCurrentEventStatus = () => {
    switch (activeTab) {
      case 'upcoming':
        return EventStatus.UPCOMING;
      case 'past':
        return EventStatus.PAST;
      case 'draft':
        return EventStatus.DRAFT;
      default:
        return EventStatus.UPCOMING;
    }
  };

  // Only fetch events for the active tab
  const {events, loading, error, refetch, loadMore, hasMore} = useGetEvents(
    20,
    0,
    getCurrentEventStatus(),
  );

  // Refresh events when screen comes into focus or tab changes
  useFocusEffect(
    useCallback(() => {
      refetch();
      return () => {};
    }, [refetch]),
  );

  // Refetch when active tab changes
  useEffect(() => {
    refetch();
  }, [activeTab, refetch]);

  const handleRefresh = useCallback(async () => {
    setRefreshingUpcomingEvents(true);
    setRefreshingPastEvents(true);
    setRefreshingDraftEvents(true);

    await refetch();

    setRefreshingUpcomingEvents(false);
    setRefreshingPastEvents(false);
    setRefreshingDraftEvents(false);
  }, [refetch]);

  // Get current refreshing state based on active tab
  const getCurrentRefreshingState = () => {
    switch (activeTab) {
      case 'upcoming':
        return refreshingUpcomingEvents;
      case 'past':
        return refreshingPastEvents;
      case 'draft':
        return refreshingDraftEvents;
      default:
        return false;
    }
  };

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
            onPress={handleRefresh}
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
    loadMoreFn: () => void,
    hasMoreItems: boolean,
    tabType: string,
  ) => {
    if (isLoading && !isRefreshing && !eventsList?.length) {
      return (
        <View style={styles.loadingContainer}>
          {Array.from({length: 3}).map((_, index) => (
            <SkeletonGroup
              key={`skeleton-${tabType}-${index}-${Date.now()}`}
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
        keyExtractor={(item, index) => `${tabType}-${item.id}-${index}`}
        renderItem={({item}) => {
          // Get the first address (if available)
          const startLocation =
            item.addresses &&
            item.addresses.find(
              address =>
                address.type === AddressType.EVENT_START_LOCATION &&
                address.language.toLowerCase() === language.toLowerCase(),
            );

          const meetingLocation =
            item.addresses &&
            item.addresses.find(
              address =>
                address.type === AddressType.EVENT_MEETING_LOCATION &&
                address.language.toLowerCase() === language.toLowerCase(),
            );

          const location = startLocation?.address
            ? startLocation?.address
            : meetingLocation?.address;

          // Map real participant data from API
          const participants = item.participants
            ? item.participants.map(participant => ({
                id: participant.id,
                name: `${participant.createdBy.firstName} ${participant.createdBy.lastName}`,
                avatar: participant.createdBy.avatar,
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
        onEndReached={hasMoreItems ? loadMoreFn : undefined}
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
          {activeTab === 'upcoming' &&
            renderEventsList(
              events,
              getCurrentRefreshingState(),
              handleRefresh,
              loading,
              error,
              loadMore,
              hasMore,
              'upcoming',
            )}
        </View>
      ),
    },
    {
      key: 'past',
      label: t('screens.event.past'),
      content: (
        <View style={styles.tabContent}>
          {activeTab === 'past' &&
            renderEventsList(
              events,
              getCurrentRefreshingState(),
              handleRefresh,
              loading,
              error,
              loadMore,
              hasMore,
              'past',
            )}
        </View>
      ),
    },
    {
      key: 'draft',
      label: t('screens.event.draft'),
      content: (
        <View style={styles.tabContent}>
          {activeTab === 'draft' &&
            renderEventsList(
              events,
              getCurrentRefreshingState(),
              handleRefresh,
              loading,
              error,
              loadMore,
              hasMore,
              'draft',
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
