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
import {useFollowRequests} from '@services/user-following.service';
import {FollowRequestCard} from '@components/FollowRequestCard/FollowRequestCard';
import {useAuth} from '@contexts';

/**
 * FollowRequestScreen - Displays follow requests from other users
 * Professional implementation with single responsibility principle
 */
export const FollowRequestScreen = () => {
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation<MainScreenNavigationProp<'FollowRequest'>>();
  const {t} = useTranslation();
  const {id: currentUserId} = useAuth();

  // Fetch follow requests with comprehensive error handling
  const {
    followRequests,
    loading,
    error,
    refetch,
    loadMore,
    hasMore,
    handleAccept,
    handleReject,
  } = useFollowRequests();

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
      if (userId !== currentUserId) {
        navigation.navigate('Profile', {userId});
      }
    },
    [navigation, currentUserId],
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
          {t('screens.followRequest.could_not_load_requests')}
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
   * Render empty state when no follow requests exist
   */
  const renderEmptyState = useCallback(
    () => (
      <View style={styles.emptyState}>
        <Icon name="user-filled" size={48} />
        <Title weight="bold" align="center">
          {t('screens.followRequest.no_requests')}
        </Title>
        <BodySmall align="center">
          {t('screens.followRequest.no_follow_requests_yet')}
        </BodySmall>
      </View>
    ),
    [t],
  );

  /**
   * Render individual follow request item
   */
  const renderFollowRequest = useCallback(
    ({item}: {item: any}) => (
      <FollowRequestCard
        avatarSource={item.follower?.avatar}
        name={`${item.follower?.firstName} ${item.follower?.lastName}`}
        city={item.follower?.city?.value}
        timeAgo={item.updatedAt}
        onUserPress={() => handleUserPress(item.follower.id)}
        onAccept={() => handleAccept(item.id)}
        onReject={() => handleReject(item.id)}
      />
    ),
    [handleAccept, handleReject],
  );

  // Handle loading state
  if (loading && !refreshing && !followRequests?.length) {
    return (
      <View style={styles.container}>
        <TopHeaderBar
          title={t('screens.followRequest.follow_requests')}
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
          title={t('screens.followRequest.follow_requests')}
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
        title={t('screens.followRequest.follow_requests')}
        showShadow={false}
        containerStyle={styles.topHeaderBar}
        showBackButton
        onBackPress={() => navigation.goBack()}
      />
      <FlatList
        data={followRequests}
        keyExtractor={item => item.id}
        renderItem={renderFollowRequest}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        onEndReached={hasMore ? loadMore : undefined}
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
});
