import React, {useState, useCallback, useEffect, useRef} from 'react';
import {
  View,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import {colors, spacing, radius} from '@theme';
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
} from '@components';
import Dialog, {DialogRef} from '@components/Dialog';
import {
  useGetNotifications,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
  useDeleteNotification,
  useDeleteAllNotifications,
} from '@services/notification.service';
import {relativeTime} from '@utils/dateUtils';
import {useAuth} from '@contexts';
import {INotification} from '@motorove/shared';

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
  const {user} = useAuth();
  const {
    notifications: apiNotifications,
    loading,
    refetch,
    loadMore,
    hasMore,
  } = useGetNotifications(10, 0);

  const {markAsRead} = useMarkNotificationAsRead(() => {
    showToast({
      type: 'success',
      text1: 'Success',
      text2: 'Notification marked as read',
    });
    refetch();
  });

  const {deleteNotification} = useDeleteNotification(() => {
    showToast({
      type: 'success',
      text1: 'Success',
      text2: 'Notification deleted',
    });
    refetch();
  });

  const {deleteAllNotifications} = useDeleteAllNotifications(() => {
    showToast({
      type: 'success',
      text1: 'Success',
      text2: 'All notifications deleted',
    });
    refetch();
  });

  const {markAllAsRead} = useMarkAllNotificationsAsRead(() => {
    showToast({
      type: 'success',
      text1: 'Success',
      text2: 'All notifications marked as read',
    });
    refetch();
  });

  // Safe cast to our Notification type
  const notifications = apiNotifications as unknown as readonly INotification[];

  const [refreshing, setRefreshing] = useState(false);
  const [existingUnreadNotifications, setExistingUnreadNotifications] =
    useState(false);
  const deleteConfirmationDialogRef = useRef<DialogRef>(null);
  const deleteAllConfirmationDialogRef = useRef<DialogRef>(null);
  const [notificationToDelete, setNotificationToDelete] = useState<
    string | null
  >(null);

  useEffect(() => {
    setExistingUnreadNotifications(
      notifications.find(notification => !notification.read) !== undefined,
    );
  }, [notifications]);

  // Handle refreshing notifications
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    refetch().finally(() => {
      setRefreshing(false);
    });
  }, [refetch]);

  // Mark notification as read
  const handleMarkAsRead = useCallback(
    (id: string) => {
      markAsRead(id);
    },
    [markAsRead],
  );

  // Delete notification
  const handleDeleteNotification = useCallback((id: string) => {
    setNotificationToDelete(id);
    deleteConfirmationDialogRef.current?.open();
  }, []);

  const confirmDeleteNotification = useCallback(() => {
    if (notificationToDelete && notifications.length > 0) {
      deleteNotification(notificationToDelete);
      setNotificationToDelete(null);
    }
  }, [deleteNotification, notificationToDelete, notifications.length]);

  // Mark all notifications as read
  const handleMarkAllAsRead = useCallback(() => {
    if (user && existingUnreadNotifications) {
      markAllAsRead(user.id);
    }
  }, [markAllAsRead, user, existingUnreadNotifications]);

  // Delete all notifications
  const handleDeleteAllNotifications = useCallback(() => {
    if (notifications.length === 0) {
      showToast({
        type: 'error',
        text1: 'Error',
        text2: 'No notifications to delete',
      });
      return;
    } else {
      deleteAllConfirmationDialogRef.current?.open();
    }
  }, [notifications.length, existingUnreadNotifications]);

  const confirmDeleteAllNotifications = useCallback(() => {
    deleteAllNotifications();
  }, [deleteAllNotifications]);

  // Handle end reached - load more notifications
  const handleEndReached = useCallback(() => {
    if (hasMore && !loading) {
      loadMore();
    }
  }, [hasMore, loading, loadMore]);

  // Render notification item
  const renderNotificationItem = ({
    item,
  }: {
    item: INotification;
  }): React.ReactElement => {
    // Actions for swipe gestures
    const rightActions: SwipeAction[] = [
      {
        text: 'Delete',
        icon: <Icon name="trash" size={24} color={colors.neutral.white} />,
        backgroundColor: colors.status.error,
        onPress: () => handleDeleteNotification(item.id),
        testID: `delete-notification-${item.id}`,
      },
    ];

    const leftActions: SwipeAction[] = [
      {
        text: 'Mark Read',
        icon: <Icon name="check" size={24} color={colors.neutral.white} />,
        backgroundColor: colors.status.success,
        onPress: () => handleMarkAsRead(item.id),
        testID: `mark-read-notification-${item.id}`,
      },
    ];

    // Only show mark as read action if notification is unread
    const actualLeftActions = item.read ? [] : leftActions;

    return (
      <SwipeableItem
        leftActions={actualLeftActions}
        rightActions={rightActions}>
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
              <Icon name="bell-filled" size={15} color={colors.neutral.white} />
            )}
          </View>
          <View style={styles.notificationContent}>
            <Subtitle
              weight={item.read ? 'medium' : 'bold'}
              style={styles.notificationTitle}>
              {item.title}
            </Subtitle>
            <BodySmall style={styles.notificationBody}>{item.body}</BodySmall>
            <View style={styles.bottomRow}>
              <View style={styles.timeContainer}>
                <Icon name="clock" size={12} color={colors.neutral.grey} />
                <Caption color={colors.neutral.grey} style={styles.infoText}>
                  {relativeTime(item.createdAt)}
                </Caption>
              </View>
            </View>
          </View>
          {!item.read && <View style={styles.unreadIndicator} />}
        </View>
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
        title="Notifications"
        showShadow={false}
        showBackButton
        onBackPress={() => navigation.goBack()}
        rightIconName={
          notifications.length === 0
            ? undefined
            : existingUnreadNotifications
            ? 'check'
            : 'trash'
        }
        onRightButtonPress={() => {
          if (notifications.length === 0) {
            return;
          }
          if (existingUnreadNotifications) {
            handleMarkAllAsRead();
          } else {
            handleDeleteAllNotifications();
          }
        }}
        containerStyle={styles.topHeaderBar}
      />

      <FlatList
        data={notifications}
        keyExtractor={item => item.id}
        renderItem={renderNotificationItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          loading ? (
            renderLoadingSkeletons()
          ) : (
            <View style={styles.emptyContainer}>
              <Icon name="bell" size={48} color={colors.neutral.lightGrey} />
              <Subtitle style={styles.emptyText}>No notifications</Subtitle>
              <Body color={colors.neutral.grey}>
                You don't have any notifications yet
              </Body>
            </View>
          )
        }
        ListFooterComponent={
          hasMore && loading && !refreshing ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator size="small" color={colors.neutral.black} />
            </View>
          ) : null
        }
      />

      {/* Delete single notification confirmation dialog */}
      <Dialog
        ref={deleteConfirmationDialogRef}
        title="Delete Notification"
        message="Are you sure you want to delete this notification? This action cannot be undone."
        variant="confirm"
        confirmButton={{
          text: 'Delete',
          onPress: confirmDeleteNotification,
          variant: 'primary',
        }}
        cancelButton={{
          text: 'Cancel',
          variant: 'outline',
        }}
      />

      {/* Delete all notifications confirmation dialog */}
      <Dialog
        ref={deleteAllConfirmationDialogRef}
        title="Delete All Notifications"
        message="Are you sure you want to delete all notifications? This action cannot be undone."
        variant="confirm"
        confirmButton={{
          text: 'Delete All',
          onPress: confirmDeleteAllNotifications,
          variant: 'primary',
        }}
        cancelButton={{
          text: 'Cancel',
          variant: 'outline',
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.white,
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
    paddingVertical: spacing.md,
    alignItems: 'center',
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
});
