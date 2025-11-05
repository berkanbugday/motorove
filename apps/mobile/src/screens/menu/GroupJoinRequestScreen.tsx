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
  Title,
  BodySmall,
  SkeletonGroup,
} from '@components';
import {useTranslation} from '@hooks/useTranslation';
import {useGetGroupJoinRequests} from '@services/group-membership.service';
import {GroupJoinRequestCard, GroupJoinRequest} from '@components';
import {useAuth} from '@contexts';

/**
 * GroupJoinRequestScreen - Displays join requests for groups
 * Professional implementation with single responsibility principle
 */
export const GroupJoinRequestScreen = () => {
  const [refreshing, setRefreshing] = useState(false);
  const navigation =
    useNavigation<MainScreenNavigationProp<'GroupJoinRequest'>>();
  const {t} = useTranslation();
  const {user} = useAuth();

  // Fetch group join requests with comprehensive error handling
  const {
    joinRequests,
    loading,
    error,
    refetch,
    loadMore,
    handleAccept,
    handleReject,
  } = useGetGroupJoinRequests();

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
   * Navigate to user profile
   */
  const handleUserPress = useCallback(
    (userId: string) => {
      if (userId !== user?.id) {
        navigation.navigate('Profile', {userId});
      }
    },
    [navigation, user],
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
          {t('screens.groupJoinRequest.could_not_load_requests')}
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
   * Render empty state when no requests exist
   */
  const renderEmptyState = useCallback(
    () => (
      <View style={styles.emptyState}>
        <Icon name="users-filled" size={48} />
        <Title weight="bold" align="center">
          {t('screens.groupJoinRequest.no_requests')}
        </Title>
        <BodySmall align="center">
          {t('screens.groupJoinRequest.no_requests_description')}
        </BodySmall>
      </View>
    ),
    [t],
  );

  /**
   * Render individual join request item
   */
  const renderJoinRequest = useCallback(
    ({item}: {item: GroupJoinRequest}) => (
      <GroupJoinRequestCard
        request={item}
        onUserPress={() => handleUserPress(item.user.id)}
        onAccept={() => handleAccept(item.id)}
        onReject={() => handleReject(item.id)}
      />
    ),
    [handleUserPress, handleAccept, handleReject],
  );

  // Handle loading state
  if (loading && !refreshing && !joinRequests?.length) {
    return (
      <View style={styles.container}>
        <TopHeaderBar
          title={t('screens.groupJoinRequest.title')}
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
          title={t('screens.groupJoinRequest.title')}
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
        title={t('screens.groupJoinRequest.title')}
        showShadow={false}
        containerStyle={styles.topHeaderBar}
        showBackButton
        onBackPress={() => navigation.goBack()}
      />
      <FlatList
        data={joinRequests}
        keyExtractor={item => item.id}
        renderItem={renderJoinRequest}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={renderEmptyState}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        contentContainerStyle={styles.listContent}
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
});
