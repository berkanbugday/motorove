import React, {useState, useCallback} from 'react';
import {
  View,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import {LegendList} from '@legendapp/list';
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
} from '@components';
import {
  useGetNotifications,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
} from '@services/notification.service';
import {relativeTime} from '@utils/dateUtils';
// Define the Notification interface based on what's returned from the API
interface Notification {
  id: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
  type: string;
}

/**
 * NotificationScreen - Displays user notifications
 */
export const NotificationScreen = () => {
  const navigation = useNavigation<MainScreenNavigationProp<'Tabs'>>();
  const {
    notifications: apiNotifications,
    loading,
    refetch,
    loadMore,
    hasMore,
  } = useGetNotifications(10, 0);

  const {markAsRead} = useMarkNotificationAsRead(() => {
    refetch();
  });

  const {markAllAsRead} = useMarkAllNotificationsAsRead(() => {
    refetch();
  });

  // Safe cast to our Notification type
  const notifications = apiNotifications as unknown as readonly Notification[];

  const [refreshing, setRefreshing] = useState(false);

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
      showToast({
        type: 'success',
        text1: 'Success',
        text2: 'Notification marked as read',
      });
    },
    [markAsRead],
  );

  // Delete notification
  const deleteNotification = useCallback((_id: string) => {
    // Implementation would go here
    showToast({
      type: 'success',
      text1: 'Success',
      text2: 'Notification deleted',
    });
  }, []);

  // Mark all notifications as read
  const handleMarkAllAsRead = useCallback(() => {
    markAllAsRead('currentUser'); // Replace with actual user ID
  }, [markAllAsRead]);

  // Render timestamp in a user-friendly format

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
    item: Notification;
  }): React.ReactElement => {
    // Actions for swipe gestures
    const rightActions: SwipeAction[] = [
      {
        text: 'Delete',
        icon: <Icon name="trash" size={24} color={colors.neutral.white} />,
        backgroundColor: colors.status.error,
        onPress: () => deleteNotification(item.id),
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
        rightActions={rightActions}
        containerStyle={styles.swipeableContainer}>
        <View
          style={[
            styles.notificationItem,
            !item.read && styles.unreadNotification,
          ]}>
          <View
            style={[
              styles.notificationIcon,
              item.read && {backgroundColor: colors.neutral.lightGrey},
            ]}>
            <Icon name="bell-filled" size={15} color={colors.neutral.white} />
          </View>
          <View style={styles.notificationContent}>
            <Subtitle
              weight={item.read ? 'medium' : 'bold'}
              style={styles.notificationTitle}>
              {item.title}
            </Subtitle>
            <Body style={styles.notificationBody}>{item.body}</Body>
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

  return (
    <View style={styles.container}>
      <TopHeaderBar
        title="Notifications"
        showShadow={false}
        showBackButton
        onBackPress={() => navigation.goBack()}
        rightIconName="check"
        onRightButtonPress={handleMarkAllAsRead}
        containerStyle={styles.topHeaderBar}
      />

      <LegendList
        data={notifications}
        keyExtractor={item => item.id}
        renderItem={renderNotificationItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.3}
        ListEmptyComponent={
          loading ? (
            <View style={styles.emptyContainer}>
              <ActivityIndicator size="large" color={colors.primary.main} />
            </View>
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
        recycleItems={true} // Enable component recycling for better performance
        maintainVisibleContentPosition={true} // Maintain the visible position when data changes
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
    borderBottomRightRadius: 0,
    borderBottomLeftRadius: 0,
    borderBottomWidth: 1,
    borderBottomColor: colors.secondary.main,
  },
  swipeableContainer: {
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
  },
  unreadNotification: {
    backgroundColor: colors.neutral.background,
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
});
