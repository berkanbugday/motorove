import React, {useState, useCallback} from 'react';
import {View, StyleSheet, RefreshControl} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {MainScreenNavigationProp} from '@navigation/types/navigationTypes';
import {useGetJoinedGroups, useGetGroups} from '@services/group.service';
import {colors, commonStyles, spacing} from '@theme';
import {
  TopHeaderBar,
  Subtitle,
  Button,
  Icon,
  useBottomSheet,
  Tabs,
  GroupFilter,
  GroupCard,
  SkeletonGroup,
  BodySmall,
} from '@components';
import {GroupPrivacy, IFilterGroup} from '@motorove/shared';
import {EnumUtils} from '@utils/enumUtils';
import {useTranslation} from '@hooks/useTranslation';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {FlashList} from '@shopify/flash-list';

/**
 * Groups Screen - Displays user groups and allows discovery of new groups
 */
export const GroupScreen = () => {
  const [activeTab, setActiveTab] = useState('joined');
  const [refreshingJoinedGroups, setRefreshingJoinedGroups] = useState(false);
  const [refreshingAllGroups, setRefreshingAllGroups] = useState(false);
  const navigation = useNavigation<MainScreenNavigationProp<'Tabs'>>();
  const {openBottomSheet} = useBottomSheet();
  const {t} = useTranslation();
  const insets = useSafeAreaInsets();

  // Fetch joined groups with pagination
  const {
    groups: joinedGroups,
    loading: joinedGroupsLoading,
    error: joinedGroupsError,
    refetch: refetchJoinedGroups,
    loadMore: loadMoreJoinedGroups,
    hasMore: hasMoreJoinedGroups,
    filters: joinedGroupsFilters,
    applyFilters: applyJoinedGroupsFilters,
  } = useGetJoinedGroups();

  // Fetch all groups with pagination
  const {
    groups: allGroups,
    loading: allGroupsLoading,
    error: allGroupsError,
    refetch: refetchAllGroups,
    loadMore: loadMoreAllGroups,
    hasMore: hasMoreAllGroups,
    filters: allGroupsFilters,
    applyFilters: applyAllGroupsFilters,
  } = useGetGroups();

  // Handle refresh joined groups
  const handleRefreshJoinedGroups = useCallback(async () => {
    setRefreshingJoinedGroups(true);
    await refetchJoinedGroups();
    setRefreshingJoinedGroups(false);
  }, [refetchJoinedGroups]);

  // Handle refresh all groups
  const handleRefreshAllGroups = useCallback(async () => {
    setRefreshingAllGroups(true);
    await refetchAllGroups();
    setRefreshingAllGroups(false);
  }, [refetchAllGroups]);

  // Handle filter button press
  const handleFilterPress = useCallback(() => {
    const currentFilters =
      activeTab === 'joined' ? joinedGroupsFilters : allGroupsFilters;

    openBottomSheet({
      title: t('screens.group.filter_groups'),
      closeButtonPosition: 'top-left',
      enableGestureControl: false,
      content: (
        <GroupFilter
          initialFilters={currentFilters}
          onApplyFilters={(filters: IFilterGroup) => {
            if (activeTab === 'joined') {
              applyJoinedGroupsFilters(filters);
            } else {
              applyAllGroupsFilters(filters);
            }
          }}
        />
      ),
      snapPoint: 'full',
    });
  }, [
    activeTab,
    joinedGroupsFilters,
    allGroupsFilters,
    openBottomSheet,
    applyJoinedGroupsFilters,
    applyAllGroupsFilters,
    t,
  ]);

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

  // Render joined groups list
  const renderJoinedGroups = () => {
    if (joinedGroupsLoading && !refreshingJoinedGroups && hasMoreJoinedGroups) {
      return (
        <View style={styles.loadingContainer}>{renderGroupSkeletons()}</View>
      );
    }

    if (joinedGroupsError) {
      return (
        <View style={styles.emptyState}>
          <Icon name="error" size={48} color={colors.status.error} />
          <Subtitle weight="bold">
            {t('errors.general.something_wrong')}
          </Subtitle>
          <BodySmall align="center">
            {t('screens.group.could_not_load_groups')}
          </BodySmall>
          <Button
            title={t('common.try_again')}
            variant="primary"
            shape="round"
            onPress={handleRefreshJoinedGroups}
          />
        </View>
      );
    }

    if (!joinedGroups || joinedGroups.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Icon name="users-filled" size={48} />
          <Subtitle weight="bold">{t('screens.group.no_groups_yet')}</Subtitle>
          <BodySmall align="center">
            {t('screens.group.join_or_create_groups')}
          </BodySmall>
          <Button
            title={t('common.try_again')}
            variant="primary"
            shape="round"
            onPress={handleRefreshJoinedGroups}
          />
        </View>
      );
    }

    return (
      <FlashList
        data={joinedGroups}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <GroupCard
            logoSource={item.logo ? {uri: item.logo} : null}
            name={item.name}
            location={item.city.value}
            tags={EnumUtils.convertGroupTags(item.tags)}
            currentMembers={item.membersCount}
            membersCapacity={item.membersCapacity}
            privacy={item.privacy}
            isMember={true}
            onPress={() =>
              navigation.navigate('GroupDetail', {groupId: item.id})
            }
          />
        )}
        contentContainerStyle={{paddingBottom: insets.bottom + 70}}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshingJoinedGroups}
            onRefresh={handleRefreshJoinedGroups}
          />
        }
        onEndReached={loadMoreJoinedGroups}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          joinedGroupsLoading && hasMoreJoinedGroups ? (
            <View style={styles.footerLoader}>
              <SkeletonGroup preset="groupCard" style={styles.skeletonItem} />
            </View>
          ) : null
        }
      />
    );
  };

  // Render all groups list
  const renderAllGroups = () => {
    if (allGroupsLoading && !refreshingAllGroups && !allGroups?.length) {
      return (
        <View style={styles.loadingContainer}>{renderGroupSkeletons()}</View>
      );
    }

    if (allGroupsError) {
      return (
        <View style={styles.emptyState}>
          <Icon name="error" size={48} color={colors.status.error} />
          <Subtitle weight="bold">
            {t('errors.general.something_wrong')}
          </Subtitle>
          <BodySmall align="center">
            {t('screens.group.could_not_load_groups')}
          </BodySmall>
          <Button
            title={t('common.try_again')}
            variant="primary"
            shape="round"
            onPress={handleRefreshAllGroups}
          />
        </View>
      );
    }

    if (!allGroups || allGroups.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Icon name="users-filled" size={48} />
          <Subtitle weight="bold">{t('screens.group.no_groups_yet')}</Subtitle>
          <BodySmall align="center">
            {t('screens.group.join_or_create_groups')}
          </BodySmall>
          <Button
            title={t('common.try_again')}
            variant="primary"
            shape="round"
            onPress={handleRefreshAllGroups}
          />
        </View>
      );
    }

    return (
      <FlashList
        data={allGroups}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <GroupCard
            logoSource={item.logo ? {uri: item.logo} : null}
            name={item.name}
            location={item.city.value}
            tags={EnumUtils.convertGroupTags(item.tags)}
            currentMembers={item.membersCount}
            membersCapacity={item.membersCapacity}
            privacy={item.privacy}
            onPress={() =>
              navigation.navigate('GroupDetail', {groupId: item.id})
            }
          />
        )}
        contentContainerStyle={{paddingBottom: insets.bottom + 70}}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshingAllGroups}
            onRefresh={handleRefreshAllGroups}
          />
        }
        onEndReached={loadMoreAllGroups}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          allGroupsLoading && hasMoreAllGroups ? (
            <View style={styles.footerLoader}>
              <SkeletonGroup preset="groupCard" style={styles.skeletonItem} />
            </View>
          ) : null
        }
      />
    );
  };

  const getFilterBadgeCount = () => {
    let badgeCount = 0;
    if (activeTab === 'explore') {
      badgeCount = allGroupsFilters.cityId ? 1 : 0;
      badgeCount +=
        allGroupsFilters.tags && allGroupsFilters.tags.length > 0 ? 1 : 0;
      badgeCount += allGroupsFilters.privacy !== GroupPrivacy.ALL ? 1 : 0;
    } else {
      badgeCount = joinedGroupsFilters.cityId ? 1 : 0;
      badgeCount +=
        joinedGroupsFilters.tags && joinedGroupsFilters.tags.length > 0 ? 1 : 0;
      badgeCount += joinedGroupsFilters.privacy !== GroupPrivacy.ALL ? 1 : 0;
    }
    return badgeCount;
  };

  const tabItems = [
    {
      key: 'joined',
      label: t('screens.group.joined'),
      content: <View style={styles.tabContent}>{renderJoinedGroups()}</View>,
    },
    {
      key: 'explore',
      label: t('screens.group.explore'),
      content: <View style={styles.tabContent}>{renderAllGroups()}</View>,
    },
  ];

  return (
    <View style={styles.container}>
      <TopHeaderBar
        title={t('bottomTabs.groups')}
        showShadow={false}
        rightIconName="plus"
        onRightButtonPress={() => navigation.navigate('CreateGroup')}
        secondRightIconName={
          getFilterBadgeCount() > 0 ? 'filter-filled' : 'filter'
        }
        secondRightIconBadgeCount={getFilterBadgeCount()}
        onSecondRightButtonPress={handleFilterPress}
        leftIconName="search"
        onLeftIconPress={() => navigation.navigate('SearchGroup')}
      />
      <Tabs
        items={tabItems}
        selectedKey={activeTab}
        onTabChange={setActiveTab}
        variant="pill"
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
  listContainer: {
    paddingBottom: spacing.xxxl,
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
