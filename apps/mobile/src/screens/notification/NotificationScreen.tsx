import React, {useState, useCallback, useEffect} from 'react';
import {View, StyleSheet, RefreshControl} from 'react-native';
import {colors, spacing, radius, commonStyles} from '@theme';
import {useNavigation} from '@react-navigation/native';
import {MainScreenNavigationProp} from '@navigation/types/navigationTypes';
import {
  Icon,
  Subtitle,
  Body,
  Caption,
  showToast,
  SwipeableItem,
  SwipeAction,
  TopHeaderBar,
  BodySmall,
  SkeletonGroup,
  Button,
  openBottomSheet,
  closeBottomSheet,
} from '@components';
import {
  useGetNotifications,
  useMarkAllNotificationsAsRead,
  useDeleteNotification,
  useDeleteAllNotifications,
} from '@services/notification.service';
import {formatDistanceToNow} from 'date-fns';
import {tr, enUS} from 'date-fns/locale';
import {
  formatDatesInData,
  translateEnumsInData,
  selectLanguageSpecificFields,
  INotification,
  Language,
  NotificationType,
} from '@motorove/shared';
import {useTranslation} from '@hooks/useTranslation';
import {useLanguage} from '@contexts/LanguageContext';
import {FlashList} from '@shopify/flash-list';
import {TouchableOpacity} from 'react-native';

/**
 * NotificationSkeleton - Skeleton component for notification items
 */
const NotificationSkeleton = () => {
  return (
    <View style={styles.notificationSkeletonContainer}>
      <SkeletonGroup
        preset="messageRow"
        lines={2}
        showShadow={false}
        showAvatar={false}
        style={styles.notificationSkeleton}
      />
    </View>
  );
};

/**
 * NotificationScreen - Displays user notifications
 */
export const NotificationScreen = () => {
  const navigation = useNavigation<MainScreenNavigationProp<'Tabs'>>();
  const {t} = useTranslation();
  const {language} = useLanguage();
  const {notifications, loading, refetch, loadMore, isFetchingMore} =
    useGetNotifications();

  const {deleteNotification} = useDeleteNotification(() => {
    refetch();
  });

  const {deleteAllNotifications} = useDeleteAllNotifications(() => {
    refetch();
  });

  const {markAllNotificationsAsRead} = useMarkAllNotificationsAsRead(() => {
    refetch();
  });

  const [refreshing, setRefreshing] = useState(false);

  // Handle notification press - navigate to MapScreen with warning/emergency ID
  const handleNotificationPress = useCallback(
    (notification: INotification) => {
      const {type, data} = notification;

      if (type === NotificationType.WARNING && data?.warningId) {
        // Navigate to MapTab with focused warning ID
        navigation.navigate('Tabs', {
          screen: 'MapTab',
          params: {
            warningId: data.warningId,
          },
        });
      } else if (type === NotificationType.EMERGENCY && data?.emergencyId) {
        // Navigate to MapTab with focused emergency ID
        navigation.navigate('Tabs', {
          screen: 'MapTab',
          params: {
            emergencyId: data.emergencyId,
          },
        });
      }
    },
    [navigation, t],
  );

  useEffect(() => {
    const unreadNotificationExist =
      notifications.find(notification => !notification.read) !== undefined;
    if (unreadNotificationExist) {
      markAllNotificationsAsRead();
    }
  }, [notifications]);

  // Handle refreshing notifications
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    refetch().finally(() => {
      setRefreshing(false);
    });
  }, [refetch]);

  // Delete notification
  const handleDeleteNotification = useCallback(
    (id: string) => {
      openBottomSheet({
        title: t('screens.notification.delete_notification_title'),
        snapPoint: 'minimal',
        showCloseButton: false,
        closeOnBackdropPress: true,
        content: (
          <View style={styles.bottomSheetContent}>
            <Body style={styles.bottomSheetMessage}>
              {t('screens.notification.delete_notification_message')}
            </Body>

            <View style={styles.bottomSheetButtons}>
              <Button
                title={t('common.cancel')}
                variant="outline"
                shape="round"
                onPress={() => closeBottomSheet()}
                style={styles.bottomSheetButton}
              />
              <Button
                title={t('common.delete')}
                variant="primary"
                shape="round"
                onPress={() => {
                  deleteNotification(id);
                  closeBottomSheet();
                }}
                style={styles.bottomSheetButton}
              />
            </View>
          </View>
        ),
      });
    },
    [deleteNotification, t],
  );

  // Delete all notifications
  const handleDeleteAllNotifications = useCallback(() => {
    if (notifications.length === 0) {
      showToast({
        type: 'error',
        text1: t('common.error'),
        text2: t('screens.notification.no_notifications_to_delete'),
      });
      return;
    } else {
      openBottomSheet({
        title: t('screens.notification.delete_all_notifications_title'),
        snapPoint: 'minimal',
        showCloseButton: false,
        enableGestureControl: false,
        closeOnBackdropPress: true,
        content: (
          <View style={styles.bottomSheetContent}>
            <Body style={styles.bottomSheetMessage}>
              {t('screens.notification.delete_all_notifications_message')}
            </Body>

            <View style={styles.bottomSheetButtons}>
              <Button
                title={t('common.cancel')}
                variant="outline"
                shape="round"
                onPress={() => closeBottomSheet()}
                style={styles.bottomSheetButton}
              />
              <Button
                title={t('common.delete')}
                variant="primary"
                shape="round"
                onPress={() => {
                  deleteAllNotifications();
                  closeBottomSheet();
                }}
                style={styles.bottomSheetButton}
              />
            </View>
          </View>
        ),
      });
    }
  }, [notifications.length, deleteAllNotifications, t]);

  // Render notification item
  const renderNotificationItem = ({
    item,
  }: {
    item: INotification;
  }): React.ReactElement => {
    // Actions for swipe gestures
    const rightActions: SwipeAction[] = [
      {
        text: t('common.delete'),
        icon: <Icon name="trash" size={24} color={colors.neutral.white} />,
        backgroundColor: colors.status.error,
        onPress: () => handleDeleteNotification(item.id),
        testID: `delete-notification-${item.id}`,
      },
    ];

    // Format notification data: translate enums, select language-specific fields, and format dates
    const formattedData: Record<string, any> | {} = (() => {
      try {
        const userLanguage = language.toUpperCase() as Language;

        // First format dates in data
        const withFormattedDates =
          formatDatesInData(item.data as Record<string, any>, userLanguage) ||
          {};

        // Select language-specific address and description from arrays
        const withLanguageSpecificFields =
          selectLanguageSpecificFields(withFormattedDates, userLanguage) || {};

        // Convert enum values to translation keys
        const withEnumKeys = translateEnumsInData(withLanguageSpecificFields);

        // Translate enum translation keys to actual translated strings (like backend does)
        const enumFields = ['emergencyType', 'warningType'];
        const finalData = {...withEnumKeys};

        enumFields.forEach(field => {
          if (finalData[field] && typeof finalData[field] === 'string') {
            const value = finalData[field];
            // Check if it's a translation key (starts with "enums.")
            if (value.startsWith('enums.')) {
              // Translate the enum value
              const translated = t(value);
              // Only update if translation is different from the key (translation was successful)
              if (translated !== value) {
                finalData[field] = translated;
              }
            }
          }
        });

        return finalData;
      } catch (error) {
        console.warn('Failed to parse notification data:', error);
        return {};
      }
    })();

    return (
      <SwipeableItem rightActions={rightActions}>
        <TouchableOpacity
          onPress={() => handleNotificationPress(item)}
          activeOpacity={0.7}>
          <View
            style={[
              styles.notificationItem,
              !item.read && styles.unreadNotification,
            ]}>
            <View
              style={[
                styles.notificationIcon,
                item.read && {backgroundColor: colors.status.success},
              ]}>
              {item.read ? (
                <Icon
                  name="check-filled"
                  size={15}
                  color={colors.neutral.white}
                />
              ) : (
                <Icon
                  name="bell-filled"
                  size={15}
                  color={colors.neutral.white}
                />
              )}
            </View>
            <View style={styles.notificationContent}>
              <Subtitle
                weight={item.read ? 'medium' : 'bold'}
                style={styles.notificationTitle}>
                {t(`notifications.${item.title}`, formattedData).toString()}
              </Subtitle>
              <BodySmall style={styles.notificationBody}>
                {t(`notifications.${item.body}`, formattedData).toString()}
              </BodySmall>
              <View style={styles.bottomRow}>
                <View style={styles.timeContainer}>
                  <Icon name="clock" size={12} color={colors.neutral.grey} />
                  <Caption color={colors.neutral.grey} style={styles.infoText}>
                    {formatDistanceToNow(new Date(item.createdAt), {
                      addSuffix: true,
                      locale:
                        language.toLowerCase() === Language.TR.toLowerCase()
                          ? tr
                          : enUS,
                    })}
                  </Caption>
                </View>
              </View>
            </View>
            {!item.read && <View style={styles.unreadIndicator} />}
          </View>
        </TouchableOpacity>
      </SwipeableItem>
    );
  };

  // Render loading skeletons
  const renderLoadingSkeletons = () => {
    return (
      <View style={styles.skeletonsContainer}>
        {Array.from({length: 5}).map((_, index) => (
          <NotificationSkeleton key={`skeleton-${index}`} />
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <TopHeaderBar
        title={t('screens.notification.notifications')}
        showShadow={false}
        showBackButton
        onBackPress={() => navigation.goBack()}
        rightIconName={notifications.length === 0 ? undefined : 'trash'}
        onRightButtonPress={() => {
          if (notifications.length === 0) {
            return;
          }
          handleDeleteAllNotifications();
        }}
        containerStyle={styles.topHeaderBar}
      />

      <FlashList
        data={notifications}
        keyExtractor={item => item.id}
        renderItem={renderNotificationItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        onEndReached={!isFetchingMore ? loadMore : undefined}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          loading ? (
            renderLoadingSkeletons()
          ) : (
            <View style={styles.emptyContainer}>
              <Icon name="bell" size={48} color={colors.neutral.lightGrey} />
              <Subtitle style={styles.emptyText}>
                {t('screens.notification.no_notifications')}
              </Subtitle>
              <Body color={colors.neutral.grey}>
                {t('screens.notification.no_notifications_yet')}
              </Body>
            </View>
          )
        }
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
  listContainer: {
    paddingBottom: spacing.xl,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: spacing.md,
    alignItems: 'center',
    opacity: 0.7,
    borderBottomWidth: 1,
    borderBottomColor: colors.secondary.main,
  },
  unreadNotification: {
    backgroundColor: colors.secondary.light,
    opacity: 1,
  },
  notificationIcon: {
    width: 30,
    height: 30,
    borderRadius: radius.round,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
    backgroundColor: colors.status.info,
  },
  notificationContent: {
    flex: 1,
    justifyContent: 'center',
  },
  notificationTitle: {
    marginBottom: spacing.xs / 2,
  },
  notificationBody: {
    marginBottom: spacing.xs,
    color: colors.neutral.darkGrey,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  infoText: {
    marginLeft: spacing.xs / 2,
  },
  unreadIndicator: {
    width: 10,
    height: 10,
    borderRadius: radius.round,
    backgroundColor: colors.primary.main,
    marginLeft: spacing.sm,
  },
  emptyContainer: {
    flex: 1,
    paddingTop: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  footerLoader: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  skeletonsContainer: {
    paddingTop: spacing.md,
  },
  notificationSkeletonContainer: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  notificationSkeleton: {
    borderRadius: radius.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.secondary.main,
  },
  bottomSheetContent: {
    padding: spacing.md,
  },
  bottomSheetMessage: {
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  bottomSheetButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
  },
  bottomSheetButton: {
    flex: 1,
    width: '50%',
  },
});
