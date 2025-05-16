import {Platform} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import firebase from '@react-native-firebase/app';
import messaging from '@react-native-firebase/messaging';
import inAppMessaging from '@react-native-firebase/in-app-messaging';
import {useMutation, useQuery} from '@apollo/client';
import {showToast} from '@components';
import {loggingService} from './logging.service';
import {
  GET_USER_NOTIFICATIONS,
  SAVE_DEVICE_TOKEN,
  REMOVE_DEVICE_TOKEN,
  MARK_NOTIFICATION_AS_READ,
  MARK_ALL_NOTIFICATIONS_AS_READ,
} from './graphql/notification.graphql';

const DEVICE_TOKEN_KEY = 'fcm_token';

export interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  type: string;
  data?: Record<string, any>;
}

export interface DeviceTokenInput {
  userId: string;
  token: string;
  deviceType: string;
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
      if (!firebase.apps.length) {
        await firebase.initializeApp({
          apiKey: 'AIzaSyD0lRMahLPZGHc_iKQICgk7_dup2jdu-xg',
          authDomain: 'motorove-75887.firebaseapp.com',
          projectId: 'motorove-75887',
          storageBucket: 'motorove-75887.firebasestorage.app',
          messagingSenderId: '1016920291975',
          appId: '1:1016920291975:ios:6787f58d4f1055c2ff9622',
          databaseURL: '',
        });
      }

      // Request permissions
      const isAuthorized = await this.requestPermissions();

      // Get token
      if (isAuthorized) {
        await messaging().registerDeviceForRemoteMessages();
        const token = await this.getDeviceToken();
        if (token) {
          this.deviceToken = token;
        }
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
      const authStatus = await messaging().requestPermission();
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
      const token = await messaging().getToken();
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

  getDeviceTokenSync(): string | null {
    this.checkInitialization();
    return this.deviceToken;
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
    // Handle background messages
    messaging().setBackgroundMessageHandler(async remoteMessage => {
      loggingService.debug('Background message received:', remoteMessage);
      // Process the message here
      return Promise.resolve();
    });

    // Handle foreground messages
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      loggingService.debug('Foreground message received:', remoteMessage);
      // Process the message here, e.g., show a local notification
      this.setInAppMessagingEnabled(true);
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
        showToast({
          type: 'error',
          text1: 'Error',
          text2:
            errorObj.message || 'Failed to register device. Please try again.',
        });
      },
    },
  );

  const saveDeviceToken = async (input: DeviceTokenInput) => {
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
        showToast({
          type: 'error',
          text1: 'Error',
          text2:
            errorObj.message ||
            'Failed to unregister device. Please try again.',
        });
      },
    },
  );

  const removeDeviceToken = async (userId: string, token: string) => {
    try {
      const result = await removeDeviceTokenMutation({
        variables: {
          userId,
          token,
        },
      });

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

// Hook for getting user notifications
export const useGetUserNotifications = (userId: string | null) => {
  const {data, loading, error, refetch} = useQuery(GET_USER_NOTIFICATIONS, {
    variables: {userId},
    skip: !userId,
    fetchPolicy: 'network-only',
    onError: errorObj => {
      loggingService.error('Failed to get user notifications:', errorObj);
    },
  });

  return {
    notifications: (data?.getUserNotifications as Notification[]) || [],
    loading,
    error,
    refetch,
  };
};

// Hook for marking notification as read
export const useMarkNotificationAsRead = (onSuccess?: () => void) => {
  const [markAsReadMutation, {loading, error}] = useMutation(
    MARK_NOTIFICATION_AS_READ,
    {
      onCompleted: () => {
        if (onSuccess) {
          onSuccess();
        }
      },
      onError: errorObj => {
        loggingService.error('Failed to mark notification as read:', errorObj);
        showToast({
          type: 'error',
          text1: 'Error',
          text2:
            errorObj.message ||
            'Failed to update notification. Please try again.',
        });
      },
    },
  );

  const markAsRead = async (notificationId: string) => {
    try {
      const result = await markAsReadMutation({
        variables: {
          id: notificationId,
        },
      });
      return result.data?.markNotificationAsRead;
    } catch (err) {
      loggingService.error('Error in markNotificationAsRead:', err);
      // Error is already handled in onError callback
      return null;
    }
  };

  return {
    markAsRead,
    loading,
    error,
  };
};

// Hook for marking all notifications as read
export const useMarkAllNotificationsAsRead = (onSuccess?: () => void) => {
  const [markAllAsReadMutation, {loading, error}] = useMutation(
    MARK_ALL_NOTIFICATIONS_AS_READ,
    {
      onCompleted: () => {
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
          text1: 'Error',
          text2:
            errorObj.message ||
            'Failed to update notifications. Please try again.',
        });
      },
    },
  );

  const markAllAsRead = async (userId: string) => {
    try {
      const result = await markAllAsReadMutation({
        variables: {
          userId,
        },
      });
      return result.data?.markAllNotificationsAsRead;
    } catch (err) {
      loggingService.error('Error in markAllNotificationsAsRead:', err);
      // Error is already handled in onError callback
      return null;
    }
  };

  return {
    markAllAsRead,
    loading,
    error,
  };
};

// Export as NotificationService object
export const notificationService = {
  service: NotificationService.getInstance(),
  useSaveDeviceToken,
  useRemoveDeviceToken,
  useGetUserNotifications,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
  getDeviceType,
};
