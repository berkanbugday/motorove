import React, {useState, useCallback} from 'react';
import {View, StyleSheet, RefreshControl, FlatList} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {MainScreenNavigationProp} from '@navigation/types/navigationTypes';
import {colors, commonStyles, spacing} from '@theme';
import {
  TopHeaderBar,
  Subtitle,
  Button,
  Icon,
  Tabs,
  Title,
  BodySmall,
  JoinRequestCard,
  SkeletonGroup,
} from '@components';
import {useTranslation} from '@hooks/useTranslation';
import {useGetGroupJoinRequests} from '@services/group-membership.service';
import {useGetEventInvitations} from '@services/event.service';

/**
 * JoinRequestScreen - Displays join requests for groups and events
 */
export const JoinRequestScreen = () => {
  const [activeTab, setActiveTab] = useState('group');
  const [refreshingGroupRequests, setRefreshingGroupRequests] = useState(false);
  const [refreshingEventRequests, setRefreshingEventRequests] = useState(false);
  const navigation = useNavigation<MainScreenNavigationProp<'JoinRequest'>>();
  const {t} = useTranslation();

  // Fetch group join requests
  const {
    joinRequests: groupJoinRequests,
    loading: groupRequestsLoading,
    error: groupRequestsError,
    refetch: refetchGroupRequests,
    loadMore: loadMoreGroupRequests,
    handleAccept: acceptGroupRequest,
    handleReject: rejectGroupRequest,
  } = useGetGroupJoinRequests();

  // Fetch event invitations
  const {
    invitations: eventInvitations,
    loading: eventInvitationsLoading,
    error: eventInvitationsError,
    refetch: refetchEventInvitations,
    loadMore: loadMoreEventInvitations,
    handleAccept: acceptEventInvitation,
    handleReject: rejectEventInvitation,
  } = useGetEventInvitations();

  // Handle refresh group requests
  const handleRefreshGroupRequests = useCallback(async () => {
    setRefreshingGroupRequests(true);
    await refetchGroupRequests();
    setRefreshingGroupRequests(false);
  }, [refetchGroupRequests]);

  // Handle refresh event invitations
  const handleRefreshEventInvitations = useCallback(async () => {
    setRefreshingEventRequests(true);
    await refetchEventInvitations();
    setRefreshingEventRequests(false);
  }, [refetchEventInvitations]);

  // Render skeleton loaders for groups
  const renderGroupSkeletons = (count = 3) => {
    return Array.from({length: count}).map((_, index) => (
      <SkeletonGroup
        key={`skeleton-${index}`}
        preset="groupCard"
        showShadow={false}
        style={styles.skeletonItem}
      />
    ));
  };

  // Render group requests list
  const renderGroupRequests = () => {
    if (
      groupRequestsLoading &&
      !refreshingGroupRequests &&
      !groupJoinRequests?.length
    ) {
      return (
        <View style={styles.loadingContainer}>{renderGroupSkeletons()}</View>
      );
    }

    if (groupRequestsError) {
      return (
        <View style={styles.emptyState}>
          <Icon name="error" size={48} color={colors.status.error} />
          <Subtitle weight="bold" align="center">
            {t('errors.general.something_wrong')}
          </Subtitle>
          <BodySmall align="center">
            {t('screens.joinRequest.could_not_load_requests')}
          </BodySmall>
          <Button
            title={t('common.try_again')}
            variant="primary"
            shape="round"
            onPress={handleRefreshGroupRequests}
          />
        </View>
      );
    }

    if (!groupJoinRequests || groupJoinRequests.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Icon name="users-filled" size={48} />
          <Title weight="bold" align="center">
            {t('screens.joinRequest.no_requests')}
          </Title>
          <BodySmall align="center">
            {t('screens.joinRequest.no_group_requests_yet')}
          </BodySmall>
        </View>
      );
    }

    return (
      <FlatList
        data={groupJoinRequests}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <JoinRequestCard
            type="group"
            avatarSource={item.user.avatar}
            name={`${item.user.firstName} ${item.user.lastName}`}
            groupName={item.group.name}
            timeAgo={item.updatedAt}
            onPress={() =>
              navigation.navigate('Profile', {userId: item.user.id})
            }
            onAccept={() => acceptGroupRequest(item.id)}
            onReject={() => rejectGroupRequest(item.id)}
          />
        )}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshingGroupRequests}
            onRefresh={handleRefreshGroupRequests}
          />
        }
        onEndReached={loadMoreGroupRequests}
        onEndReachedThreshold={0.5}
      />
    );
  };

  // Render event invitations list
  const renderEventInvitations = () => {
    if (
      eventInvitationsLoading &&
      !refreshingEventRequests &&
      !eventInvitations?.length
    ) {
      return (
        <View style={styles.loadingContainer}>{renderGroupSkeletons()}</View>
      );
    }

    if (eventInvitationsError) {
      return (
        <View style={styles.emptyState}>
          <Icon name="error" size={48} color={colors.status.error} />
          <Subtitle weight="bold" align="center">
            {t('errors.general.something_wrong')}
          </Subtitle>
          <BodySmall align="center">
            {t('screens.joinRequest.could_not_load_requests')}
          </BodySmall>
          <Button
            title={t('common.try_again')}
            variant="primary"
            shape="round"
            onPress={handleRefreshEventInvitations}
          />
        </View>
      );
    }

    if (!eventInvitations || eventInvitations.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Icon name="calendar-filled" size={48} />
          <Title weight="bold" align="center">
            {t('screens.joinRequest.no_requests')}
          </Title>
          <BodySmall align="center">
            {t('screens.joinRequest.no_event_invitations_yet')}
          </BodySmall>
        </View>
      );
    }

    return (
      <FlatList
        data={eventInvitations}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <JoinRequestCard
            type="event"
            avatarSource={
              item.event.images && item.event.images.length > 0
                ? item.event.images[0]
                : null
            }
            name={
              item.event.organizedByGroup
                ? item.event.organizedByGroup.name
                : `${item.event.createdBy.firstName} ${item.event.createdBy.lastName}`
            }
            groupName={item.event.title}
            timeAgo={item.event.createdAt}
            onPress={() =>
              navigation.navigate('EventDetail', {eventId: item.event.id})
            }
            onAccept={() => acceptEventInvitation(item.id)}
            onReject={() => rejectEventInvitation(item.id)}
          />
        )}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshingEventRequests}
            onRefresh={handleRefreshEventInvitations}
          />
        }
        onEndReached={loadMoreEventInvitations}
        onEndReachedThreshold={0.5}
      />
    );
  };

  const tabItems = [
    {
      key: 'group',
      label: t('screens.joinRequest.group_requests'),
      content: <View style={styles.tabContent}>{renderGroupRequests()}</View>,
    },
    {
      key: 'event',
      label: t('screens.joinRequest.event_invitations'),
      content: (
        <View style={styles.tabContent}>{renderEventInvitations()}</View>
      ),
    },
  ];

  return (
    <View style={styles.container}>
      <TopHeaderBar
        title={t('screens.menu.join_requests')}
        showShadow={false}
        showBackButton
        onBackPress={() => navigation.goBack()}
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
    ...commonStyles.container,
  },
  tabContainer: {
    flex: 1,
  },
  tabContent: {
    flex: 1,
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
  footerLoader: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  skeletonItem: {
    marginBottom: spacing.md,
    borderBottomWidth: 1,
    borderColor: colors.neutral.veryLightGrey,
  },
});
