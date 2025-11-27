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
import {useGetBlockedUsers} from '@services/user-block.service';
import {BlockedUserCard} from '@components/BlockedUserCard/BlockedUserCard';
import {useAuth} from '@contexts';
import {FlashList} from '@shopify/flash-list';

/**
 * BlockedUserScreen - Displays blocked users
 * Professional implementation with single responsibility principle
 */
export const BlockedUserScreen = () => {
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation<MainScreenNavigationProp<'BlockedUser'>>();
  const {t} = useTranslation();
  const {id: currentUserId} = useAuth();

  // Fetch blocked users with comprehensive error handling
  const {blockedUsers, loading, error, refetch, handleUnblock} =
    useGetBlockedUsers();

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
          {t('screens.blockedUser.could_not_load_users')}
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
   * Render empty state when no blocked users exist
   */
  const renderEmptyState = useCallback(
    () => (
      <View style={styles.emptyState}>
        <Icon name="user-filled" size={48} />
        <Title weight="bold" align="center">
          {t('screens.blockedUser.no_blocked_users')}
        </Title>
        <BodySmall align="center">
          {t('screens.blockedUser.no_blocked_users_yet')}
        </BodySmall>
      </View>
    ),
    [t],
  );

  /**
   * Render individual blocked user item
   */
  const renderBlockedUser = useCallback(
    ({item}: {item: any}) => (
      <BlockedUserCard
        avatarSource={item.blocked?.avatar}
        name={`${item.blocked?.firstName || ''} ${
          item.blocked?.lastName || ''
        }`.trim()}
        city={item.blocked?.city?.value}
        blockedAt={item.createdAt}
        onUserPress={() => handleUserPress(item.blocked?.id)}
        onUnblock={() => handleUnblock(item.blocked?.id)}
      />
    ),
    [handleUnblock, handleUserPress],
  );

  // Handle loading state
  if (loading && !refreshing && !blockedUsers?.length) {
    return (
      <View style={styles.container}>
        <TopHeaderBar
          title={t('screens.blockedUser.blocked_users')}
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
          title={t('screens.blockedUser.blocked_users')}
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
        title={t('screens.blockedUser.blocked_users')}
        showShadow={false}
        containerStyle={styles.topHeaderBar}
        showBackButton
        onBackPress={() => navigation.goBack()}
      />
      <FlashList
        data={blockedUsers}
        keyExtractor={item => item.id}
        renderItem={renderBlockedUser}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
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
