import React, {useState, useCallback} from 'react';
import {View, StyleSheet, RefreshControl} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {MainScreenNavigationProp} from '@navigation/types/navigationTypes';
import {colors, commonStyles, spacing} from '@theme';
import {
  TopHeaderBar,
  Subtitle,
  Button,
  Icon,
  Title,
  BodySmall,
  SkeletonGroup,
} from '@components';
import {useTranslation} from '@hooks/useTranslation';
import {useGetEventInvitations} from '@services/event.service';
import {EventInvitationCard, EventInvitation} from '@components';
import {FlashList} from '@shopify/flash-list';

/**
 * EventInvitationScreen - Displays event invitations
 * Professional implementation with single responsibility principle
 */
export const EventInvitationScreen = () => {
  const [refreshing, setRefreshing] = useState(false);
  const navigation =
    useNavigation<MainScreenNavigationProp<'EventInvitation'>>();
  const {t} = useTranslation();

  // Fetch event invitations with comprehensive error handling
  const {
    invitations,
    loading,
    error,
    refetch,
    loadMore,
    handleAccept,
    handleReject,
    isFetchingMore,
  } = useGetEventInvitations();

  /**
   * Handle pull-to-refresh functionality
   */
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  /**
   * Navigate to event detail screen
   */
  const handleEventPress = useCallback(
    (eventId: string) => {
      navigation.navigate('EventDetail', {eventId});
    },
    [navigation],
  );

  /**
   * Render skeleton loaders for loading state
   */
  const renderSkeletons = useCallback((count = 3) => {
    return Array.from({length: count}).map((_, index) => (
      <SkeletonGroup
        key={`skeleton-${index}`}
        preset="groupCard"
        showShadow={false}
        style={styles.skeletonItem}
      />
    ));
  }, []);

  /**
   * Render error state with retry functionality
   */
  const renderErrorState = useCallback(
    () => (
      <View style={styles.emptyState}>
        <Icon name="error" size={48} color={colors.status.error} />
        <Subtitle weight="bold" align="center">
          {t('errors.general.something_wrong')}
        </Subtitle>
        <BodySmall align="center">
          {t('screens.eventInvitation.could_not_load_invitations')}
        </BodySmall>
        <Button
          title={t('common.try_again')}
          variant="primary"
          shape="round"
          onPress={handleRefresh}
        />
      </View>
    ),
    [t, handleRefresh],
  );

  /**
   * Render empty state when no invitations exist
   */
  const renderEmptyState = useCallback(
    () => (
      <View style={styles.emptyState}>
        <Icon name="calendar-filled" size={48} />
        <Title weight="bold" align="center">
          {t('screens.eventInvitation.no_invitations')}
        </Title>
        <BodySmall align="center">
          {t('screens.eventInvitation.no_invitations_description')}
        </BodySmall>
      </View>
    ),
    [t],
  );

  /**
   * Render individual event invitation item
   */
  const renderInvitation = useCallback(
    ({item}: {item: EventInvitation}) => (
      <EventInvitationCard
        invitation={item}
        onEventPress={() => handleEventPress(item.event.id)}
        onAccept={() => handleAccept(item.id)}
        onReject={() => handleReject(item.id)}
      />
    ),
    [handleEventPress, handleAccept, handleReject],
  );

  // Handle loading state
  if (loading && !refreshing && !invitations?.length) {
    return (
      <View style={styles.container}>
        <TopHeaderBar
          title={t('screens.eventInvitation.title')}
          showShadow={false}
          containerStyle={styles.topHeaderBar}
          showBackButton
          onBackPress={() => navigation.goBack()}
        />
        <View style={styles.loadingContainer}>{renderSkeletons()}</View>
      </View>
    );
  }

  // Handle error state
  if (error) {
    return (
      <View style={styles.container}>
        <TopHeaderBar
          title={t('screens.eventInvitation.title')}
          showShadow={false}
          containerStyle={styles.topHeaderBar}
          showBackButton
          onBackPress={() => navigation.goBack()}
        />
        {renderErrorState()}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TopHeaderBar
        title={t('screens.eventInvitation.title')}
        showShadow={false}
        containerStyle={styles.topHeaderBar}
        showBackButton
        onBackPress={() => navigation.goBack()}
      />
      <FlashList
        data={invitations}
        keyExtractor={item => item.id}
        renderItem={renderInvitation}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        onEndReached={!isFetchingMore ? loadMore : undefined}
        onEndReachedThreshold={0.5}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...commonStyles.container,
  },
  topHeaderBar: {
    borderBottomWidth: 1,
    borderBottomColor: colors.secondary.main,
  },
  listContent: {
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
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
