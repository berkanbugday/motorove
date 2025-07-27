import React, {useState, useCallback} from 'react';
import {View, StyleSheet, RefreshControl, FlatList} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {MainScreenNavigationProp} from '@navigation/types/navigationTypes';
import {colors, spacing} from '@theme';
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
import {usePendingFollowRequests} from '@services/user-following.service';
import {FollowRequestCard} from '@components/FollowRequestCard/FollowRequestCard';

/**
 * FollowRequestScreen - Displays follow requests from other users
 */
export const FollowRequestScreen = () => {
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation<MainScreenNavigationProp<'FollowRequest'>>();
  const {t} = useTranslation();

  // Fetch follow requests
  const {
    pendingFollowRequests,
    loading,
    error,
    refetch,
    handleAccept,
    handleReject,
  } = usePendingFollowRequests();

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  // Render skeleton loaders
  const renderSkeletons = (count = 3) => {
    return Array.from({length: count}).map((_, index) => (
      <SkeletonGroup
        key={`skeleton-${index}`}
        preset="groupCard"
        showShadow={false}
        style={styles.skeletonItem}
      />
    ));
  };

  // Render follow requests list
  const renderFollowRequests = () => {
    if (loading && !refreshing && !pendingFollowRequests?.length) {
      return <View style={styles.loadingContainer}>{renderSkeletons()}</View>;
    }

    if (error) {
      return (
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
      );
    }

    if (!pendingFollowRequests || pendingFollowRequests.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Icon name="user-filled" size={48} />
          <Title weight="bold" align="center">
            {t('screens.followRequest.no_requests')}
          </Title>
          <BodySmall align="center">
            {t('screens.followRequest.no_follow_requests_yet')}
          </BodySmall>
        </View>
      );
    }

    return (
      <FlatList
        data={pendingFollowRequests}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <FollowRequestCard
            avatarSource={item.follower?.avatar}
            name={`${item.follower?.firstName} ${item.follower?.lastName}`}
            city={item.follower?.city?.value}
            timeAgo={item.updatedAt}
            onAccept={() => handleAccept(item.id)}
            onReject={() => handleReject(item.id)}
          />
        )}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        // onEndReached={loadMore}
        onEndReachedThreshold={0.5}
      />
    );
  };

  return (
    <View style={styles.container}>
      <TopHeaderBar
        title={t('screens.followRequest.follow_requests')}
        showShadow={false}
        showBackButton
        onBackPress={() => navigation.goBack()}
      />
      <View style={styles.content}>{renderFollowRequests()}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.white,
  },
  content: {
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
