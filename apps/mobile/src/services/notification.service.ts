import {PermissionsAndroid, Platform} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import {getApps, initializeApp, getApp} from '@react-native-firebase/app';
import messaging, {getMessaging} from '@react-native-firebase/messaging';
import inAppMessaging from '@react-native-firebase/in-app-messaging';
import {useMutation, useQuery} from '@apollo/client';
import {showToast} from '@components';
import {loggingService} from './logging.service';
import {getFirebaseConfig} from '@configs';
import {
  SAVE_DEVICE_TOKEN,
  REMOVE_DEVICE_TOKEN,
  MARK_NOTIFICATION_AS_READ,
  MARK_ALL_NOTIFICATIONS_AS_READ,
  GET_NOTIFICATIONS,
  DELETE_NOTIFICATION,
  DELETE_ALL_NOTIFICATIONS,
  GET_COUNT,
} from './graphql/notification.graphql';
import {INotification, ICreateDeviceToken} from '@motorove/shared/interfaces';
import {useCallback, useState} from 'react';
import {useTranslation} from '@hooks/useTranslation';

const DEVICE_TOKEN_KEY = 'fcm_token';

export interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
}

// Helper function to get device type
export const getDeviceType = (): string => {
  return Platform.OS;
};

// Device notification service (non-hook functions)
class NotificationService {
  private static instance: NotificationService | null = null;
  private deviceToken: string | null = null;
  private isInitialized = false;
  private messageUnsubscribe: (() => void) | null = null;

  // Private constructor to enforce singleton pattern
  private constructor() {}

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Check if Firebase is already initialized
      if (!getApps().length) {
        // Use environment-based Firebase configuration
        await initializeApp(getFirebaseConfig());
      }

      // Set up message handlers
      this.setupMessageHandlers();

      this.isInitialized = true;
    } catch (error) {
      loggingService.error('Failed to initialize notification service:', error);
    }
  }

  async requestPermissions(): Promise<boolean> {
    try {
      if (Platform.OS === 'android') {
        await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        );
      }
      const messagingInstance = getMessaging(getApp());
      const authStatus = await messagingInstance.requestPermission();
      return (
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL
      );
    } catch (error) {
      loggingService.error(
        'Failed to request notification permissions:',
        error,
      );
      return false;
    }
  }

  async getDeviceToken(): Promise<string | null> {
    try {
      // Check if we have a saved token
      const savedToken = await AsyncStorage.getItem(DEVICE_TOKEN_KEY);

      if (savedToken) {
        this.deviceToken = savedToken;
        return savedToken;
      }

      // Get new token
      const messagingInstance = getMessaging(getApp());

      // For iOS, ensure device is registered for remote messages
      if (!messagingInstance.isDeviceRegisteredForRemoteMessages) {
        await messagingInstance.registerDeviceForRemoteMessages();
      }

      // Wait a bit for APNS token to be available on iOS
      if (Platform.OS === 'ios') {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      const token = await messagingInstance.getToken();
      if (token) {
        this.deviceToken = token;
        // Save token to storage
        await AsyncStorage.setItem(DEVICE_TOKEN_KEY, token);
      }

      return token;
    } catch (error) {
      loggingService.error('Failed to get device token:', error);
      return null;
    }
  }

  async clearDeviceToken(): Promise<void> {
    this.checkInitialization();
    try {
      await AsyncStorage.removeItem(DEVICE_TOKEN_KEY);
      this.deviceToken = null;
    } catch (error) {
      loggingService.error('Failed to clear device token:', error);
    }
  }

  setupMessageHandlers(): void {
    const messagingInstance = getMessaging(getApp());

    // Handle background messages
    messagingInstance.setBackgroundMessageHandler(async _remoteMessage => {
      return Promise.resolve();
    });

    // Handle foreground messages
    const unsubscribe = messagingInstance.onMessage(async remoteMessage => {
      showToast({
        type: 'info',
        text1: remoteMessage.notification?.title,
        text2: remoteMessage.notification?.body,
      });
      return Promise.resolve();
    });

    // Store unsubscribe function
    this.messageUnsubscribe = unsubscribe;
  }

  // Cleanup message handlers
  cleanup(): void {
    this.checkInitialization();
    if (this.messageUnsubscribe) {
      this.messageUnsubscribe();
      this.messageUnsubscribe = null;
    }
  }

  // Enable or disable in-app messaging
  async setInAppMessagingEnabled(enabled: boolean): Promise<void> {
    this.checkInitialization();
    try {
      await inAppMessaging().setMessagesDisplaySuppressed(!enabled);
    } catch (error) {
      loggingService.error(
        'Failed to update in-app messaging settings:',
        error,
      );
    }
  }

  // Helper method to check initialization status
  private checkInitialization(): void {
    if (!this.isInitialized) {
      loggingService.warning('NotificationService used before initialization');
    }
  }
}

// Hook for deleting notification
export const useDeleteNotification = (onSuccess?: () => void) => {
  const {t} = useTranslation();
  const [deleteNotificationMutation, {loading, error}] = useMutation(
    DELETE_NOTIFICATION,
    {
      onCompleted: () => {
        showToast({
          type: 'success',
          text1: t('common.success'),
          text2: t('screens.notification.notification_deleted'),
        });
        if (onSuccess) {
          onSuccess();
        }
      },
      onError: errorObj => {
        loggingService.error('Failed to delete notification:', errorObj);
        showToast({
          type: 'error',
          text1: t('common.error'),
          text2: errorObj.message || t('screens.notification.delete_failed'),
        });
      },
    },
  );

  const deleteNotification = async (notificationId: string) => {
    try {
      const result = await deleteNotificationMutation({
        variables: {
          id: notificationId,
        },
      });
      return result.data?.deleteNotification;
    } catch (err) {
      loggingService.error('Error in deleteNotification:', err);
      showToast({
        type: 'error',
        text1: t('common.error'),
        text2: t('screens.notification.delete_failed'),
      });
      // Error is already handled in onError callback
      return null;
    }
  };

  return {
    deleteNotification,
    loading,
    error,
  };
};

// Hook for deleting all notifications
export const useDeleteAllNotifications = (onSuccess?: () => void) => {
  const {t} = useTranslation();
  const [deleteAllNotificationsMutation, {loading, error}] = useMutation(
    DELETE_ALL_NOTIFICATIONS,
    {
      onCompleted: () => {
        showToast({
          type: 'success',
          text1: t('common.success'),
          text2: t('screens.notification.all_deleted'),
        });
        if (onSuccess) {
          onSuccess();
        }
      },
      onError: errorObj => {
        loggingService.error('Failed to delete all notifications:', errorObj);
        showToast({
          type: 'error',
          text1: t('common.error'),
          text2: t('screens.notification.delete_all_failed'),
        });
      },
    },
  );

  const deleteAllNotifications = async () => {
    try {
      const result = await deleteAllNotificationsMutation();
      return result.data?.deleteAllNotifications;
    } catch (err) {
      loggingService.error('Error in deleteAllNotifications:', err);
      showToast({
        type: 'error',
        text1: t('common.error'),
        text2: t('screens.notification.delete_all_failed'),
      });
      return null;
    }
  };

  return {
    deleteAllNotifications,
    loading,
    error,
  };
};

// Hook for saving device token
export const useSaveDeviceToken = (onSuccess?: () => void) => {
  const [saveDeviceTokenMutation, {loading, error}] = useMutation(
    SAVE_DEVICE_TOKEN,
    {
      onCompleted: () => {
        loggingService.debug('Device token registered with server');

        if (onSuccess) {
          onSuccess();
        }
      },
      onError: errorObj => {
        loggingService.error(
          'Failed to register device token with server:',
          errorObj,
        );
      },
    },
  );

  const saveDeviceToken = async (input: ICreateDeviceToken) => {
    try {
      const result = await saveDeviceTokenMutation({
        variables: {
          input,
        },
      });
      return result.data?.saveDeviceToken;
    } catch (err) {
      loggingService.error('Error in saveDeviceToken:', err);
      // Error is already handled in onError callback
      return null;
    }
  };

  return {
    saveDeviceToken,
    loading,
    error,
  };
};

// Hook for removing device token
export const useRemoveDeviceToken = (onSuccess?: () => void) => {
  const [removeDeviceTokenMutation, {loading, error}] = useMutation(
    REMOVE_DEVICE_TOKEN,
    {
      onCompleted: () => {
        loggingService.debug('Device token unregistered from server');

        if (onSuccess) {
          onSuccess();
        }
      },
      onError: errorObj => {
        loggingService.error(
          'Failed to unregister device token from server:',
          errorObj,
        );
      },
    },
  );

  const removeDeviceToken = async () => {
    try {
      const result = await removeDeviceTokenMutation();
      if (result.data?.removeDeviceToken) {
        await NotificationService.getInstance().clearDeviceToken();
      }

      return result.data?.removeDeviceToken;
    } catch (err) {
      loggingService.error('Error in removeDeviceToken:', err);
      // Error is already handled in onError callback
      return null;
    }
  };

  return {
    removeDeviceToken,
    loading,
    error,
  };
};

// Hook for getting notifications
export const useGetNotifications = (limit = 20, skip = 0) => {
  const [hasMore, setHasMore] = useState(true);

  const {
    data,
    loading,
    error,
    refetch: originalRefetch,
    fetchMore,
  } = useQuery(GET_NOTIFICATIONS, {
    variables: {limit, skip},
    onError: errorObj => {
      loggingService.error('Error fetching notifications:', errorObj);
    },
  });

  // Wrap the original refetch to reset hasMore state
  const refetch = useCallback(async () => {
    setHasMore(true);
    return originalRefetch();
  }, [originalRefetch]);

  // Function to load more notifications (pagination)
  const loadMore = useCallback(() => {
    if (!loading && hasMore && data?.notifications) {
      fetchMore({
        variables: {
          skip: data.notifications.length,
          limit,
        },
      })
        .then(({data: newData}) => {
          // Check if there are more items to load
          if (newData?.notifications?.length < limit) {
            setHasMore(false);
          }
        })
        .catch(err => {
          loggingService.error('Error loading more notifications:', err);
        });
    }
  }, [loading, hasMore, data, fetchMore, limit]);

  return {
    notifications: (data?.notifications as INotification[]) || [],
    loading,
    error,
    refetch,
    loadMore,
    hasMore,
  };
};

// Hook for marking notification as read
export const useMarkNotificationAsRead = (onSuccess?: () => void) => {
  const {t} = useTranslation();
  const [markAsReadMutation, {loading, error}] = useMutation(
    MARK_NOTIFICATION_AS_READ,
    {
      onCompleted: () => {
        showToast({
          type: 'success',
          text1: t('common.success'),
          text2: t('screens.notification.marked_as_read'),
        });
        if (onSuccess) {
          onSuccess();
        }
      },
      onError: errorObj => {
        loggingService.error('Failed to mark notification as read:', errorObj);
        showToast({
          type: 'error',
          text1: t('common.error'),
          text2: errorObj.message || t('screens.notification.mark_read_failed'),
        });
      },
    },
  );

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      const result = await markAsReadMutation({
        variables: {
          id: notificationId,
        },
      });
      return result.data?.markNotificationAsRead;
    } catch (err) {
      loggingService.error('Error in markNotificationAsRead:', err);
      showToast({
        type: 'error',
        text1: t('common.error'),
        text2: t('screens.notification.mark_read_failed'),
      });
      return null;
    }
  };

  return {
    markNotificationAsRead,
    loading,
    error,
  };
};

// Hook for marking all notifications as read
export const useMarkAllNotificationsAsRead = (onSuccess?: () => void) => {
  const {t} = useTranslation();
  const [markAllAsReadMutation, {loading, error}] = useMutation(
    MARK_ALL_NOTIFICATIONS_AS_READ,
    {
      onCompleted: () => {
        showToast({
          type: 'success',
          text1: t('common.success'),
          text2: t('screens.notification.all_marked_as_read'),
        });
        if (onSuccess) {
          onSuccess();
        }
      },
      onError: errorObj => {
        loggingService.error(
          'Failed to mark all notifications as read:',
          errorObj,
        );
        showToast({
          type: 'error',
          text1: t('common.error'),
          text2: t('screens.notification.mark_all_read_failed'),
        });
      },
    },
  );

  const markAllNotificationsAsRead = async () => {
    try {
      const result = await markAllAsReadMutation();
      return result.data?.markAllNotificationsAsRead;
    } catch (err) {
      loggingService.error('Error in markAllNotificationsAsRead:', err);
      showToast({
        type: 'error',
        text1: t('common.error'),
        text2: t('screens.notification.mark_all_read_failed'),
      });
      return null;
    }
  };

  return {
    markAllNotificationsAsRead,
    loading,
    error,
  };
};

// Hook for getting notifications count
export const useGetCount = () => {
  const {data, refetch, loading, error} = useQuery(GET_COUNT, {
    onError: errorObj => {
      loggingService.error('Error fetching count:', errorObj);
    },
  });
  return {
    count: data?.count,
    refetch,
    loading,
    error,
  };
};

// Export as NotificationService object
export const notificationService = {
  service: NotificationService.getInstance(),
  useSaveDeviceToken,
  useRemoveDeviceToken,
  useGetNotifications,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
  getDeviceType,
};
