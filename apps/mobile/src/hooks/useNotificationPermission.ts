import {useEffect, useState, useCallback, useRef} from 'react';
import {Linking, Platform, PermissionsAndroid, AppState} from 'react-native';
import {getApp} from '@react-native-firebase/app';
import messaging, {getMessaging} from '@react-native-firebase/messaging';
import {loggingService} from '@services/logging.service';
import {NotificationPermission} from '@motorove/shared';
import {
  notificationService,
  useSaveDeviceToken,
  useRemoveDeviceToken,
} from '@services/notification.service';
import {useAuth} from '@contexts/AuthContext';
import {useTranslation} from './useTranslation';

type NotificationPermissionStatus =
  | 'granted'
  | 'denied'
  | 'blocked'
  | 'unavailable'
  | 'requesting';

/**
 * Custom hook for managing notification permission in React Native
 *
 * This hook provides methods to:
 * - Check current notification permission status
 * - Request notification permission
 * - Open app settings if permission is blocked
 * - Monitor permission status changes
 */
export const useNotificationPermission = () => {
  const [status, setStatus] =
    useState<NotificationPermissionStatus>('requesting');
  const appState = useRef(AppState.currentState);
  const [permissionRequestCount, setPermissionRequestCount] = useState(0);
  const isMountedRef = useRef(false);
  const {updateNotificationPermission} = useAuth();
  const {saveDeviceToken} = useSaveDeviceToken();
  const {removeDeviceToken} = useRemoveDeviceToken();
  const {t} = useTranslation();

  /**
   * Open app settings if permission is blocked
   */
  const openSettings = useCallback(() => {
    Linking.openSettings();
  }, []);

  /**
   * Check the current notification permission status
   */
  const checkPermission = useCallback(async () => {
    try {
      if (Platform.OS === 'ios') {
        const messagingInstance = getMessaging(getApp());
        const authStatus = await messagingInstance.hasPermission();

        switch (authStatus) {
          case messaging.AuthorizationStatus.AUTHORIZED:
          case messaging.AuthorizationStatus.PROVISIONAL:
          case messaging.AuthorizationStatus.EPHEMERAL:
            setStatus('granted');
            break;
          case messaging.AuthorizationStatus.DENIED:
            // Check if this is likely a permanent block based on request count
            if (permissionRequestCount > 1) {
              setStatus('blocked');
            } else {
              setStatus('denied');
            }
            break;
          case messaging.AuthorizationStatus.NOT_DETERMINED:
            setStatus('unavailable');
            break;
          default:
            loggingService.warning('Unknown iOS authorization status:', {
              authStatus,
            });
            setStatus('unavailable');
            break;
        }
      } else {
        // For Android
        try {
          // Check if Android version supports notification permission (API 33+)
          const androidVersion = parseInt(Platform.Version as string, 10);

          // Handle invalid version parsing
          if (isNaN(androidVersion)) {
            loggingService.warning('Unable to parse Android version:', {
              version: Platform.Version,
            });
            setStatus('unavailable');
            return;
          }

          // Android 13 (API 33) and above requires POST_NOTIFICATIONS permission
          if (androidVersion >= 33) {
            const hasPermission = await PermissionsAndroid.check(
              PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
            );

            // Check for valid boolean response
            if (typeof hasPermission !== 'boolean') {
              loggingService.warning('Invalid permission check response:', {
                hasPermission,
              });
              setStatus('unavailable');
              return;
            }

            if (hasPermission) {
              setStatus('granted');
            } else {
              // Check if this is likely a permanent block based on request count
              if (permissionRequestCount > 1) {
                setStatus('blocked');
              } else {
                setStatus('denied');
              }
            }
          } else {
            // For Android 12 and below, notification permissions are granted by default
            // Firebase messaging can still be used without explicit permission
            setStatus('granted');
          }
        } catch (err) {
          loggingService.error(
            'Error checking Android notification permissions:',
            err as Error,
          );
          setStatus('unavailable');
        }
      }
    } catch (error) {
      loggingService.error(
        'Error checking notification permission:',
        error as Error,
      );
      setStatus('unavailable');
    }
  }, [permissionRequestCount]); // Include permissionRequestCount in dependencies

  /**
   * Request notification permission from the user
   */
  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      setStatus('requesting');
      // Increment request count to help identify potential blocks
      setPermissionRequestCount(prev => prev + 1);
      let isGranted = false;

      if (Platform.OS === 'ios') {
        try {
          const messagingInstance = getMessaging(getApp());
          const authStatus = await messagingInstance.requestPermission();

          if (
            authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
            authStatus === messaging.AuthorizationStatus.PROVISIONAL
          ) {
            isGranted = true;
          } else {
            // If this is not the first request, likely permission is blocked in settings
            if (permissionRequestCount > 1) {
              setTimeout(() => {
                openSettings();
              }, 500);
            }
            isGranted = false;
          }
        } catch (error) {
          loggingService.error(
            'Error requesting iOS notification permission:',
            error,
          );
          return status === 'granted';
        }
      } else {
        // Android
        // Check Android version - only Android 13+ (API 33+) needs explicit permission
        const androidVersion = parseInt(Platform.Version as string, 10);

        if (androidVersion >= 33) {
          // For Android 13+, request POST_NOTIFICATIONS permission
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
            {
              title: t('permissions.notification.title'),
              message: t('permissions.notification.message'),
              buttonNeutral: t('common.ask_me_later'),
              buttonNegative: t('common.cancel'),
              buttonPositive: t('common.ok'),
            },
          );

          const permissionGranted =
            granted === PermissionsAndroid.RESULTS.GRANTED;

          if (permissionGranted) {
            isGranted = true;
          } else {
            // If not the first request, consider it blocked
            if (permissionRequestCount > 1) {
              isGranted = false;
            } else {
              isGranted = false;
            }
          }
        } else {
          // For Android 12 and below, notification permissions are granted by default
          isGranted = true;
        }
      }

      if (isGranted) {
        await updateNotificationPermission(NotificationPermission.ALLOWED);
        const token = await notificationService.service.getDeviceToken();
        if (token) {
          await saveDeviceToken({
            token,
            deviceType: notificationService.getDeviceType(),
          });
        }
      } else {
        await updateNotificationPermission(NotificationPermission.NOT_ALLOWED);
        await removeDeviceToken();
      }

      return isGranted;
    } catch (error) {
      loggingService.error('Error requesting notification permission:', error);
      setStatus('unavailable');
      return false;
    }
  }, [permissionRequestCount, status, openSettings]);

  // Listen for app state changes to refresh permission status
  // This handles the case where the user grants permission in settings and returns to the app
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        // App has come to the foreground
        checkPermission();
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [checkPermission]);

  // Check permission on mount only once
  useEffect(() => {
    if (!isMountedRef.current) {
      checkPermission();
      isMountedRef.current = true;
    }
  }, [checkPermission]);

  return {
    status,
    isGranted: status === 'granted',
    isBlocked: status === 'blocked',
    isDenied: status === 'denied',
    isUnavailable: status === 'unavailable',
    isRequesting: status === 'requesting',
    requestPermission,
    checkPermission,
    openSettings,
  };
};
