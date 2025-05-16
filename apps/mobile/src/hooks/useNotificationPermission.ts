import {useEffect, useState, useCallback, useRef} from 'react';
import {Alert, Linking, AppState} from 'react-native';
import notifee, {AuthorizationStatus} from '@notifee/react-native';
import {loggingService} from '@services/logging.service';

type NotificationPermissionStatus =
  | 'granted'
  | 'denied'
  | 'blocked'
  | 'unavailable'
  | 'requesting';

/**
 * Custom hook for managing notification permission in React Native using Notifee
 *
 * This hook provides methods to:
 * - Check current notification permission status
 * - Request notification permission
 * - Open app settings if permission is blocked
 */
export const useNotificationPermission = () => {
  const [status, setStatus] =
    useState<NotificationPermissionStatus>('requesting');
  const appState = useRef(AppState.currentState);
  const [permissionRequestCount, setPermissionRequestCount] = useState(0);

  /**
   * Maps Notifee AuthorizationStatus to our custom permission status
   */
  const mapAuthStatus = useCallback(
    (authStatus: AuthorizationStatus): NotificationPermissionStatus => {
      switch (authStatus) {
        case AuthorizationStatus.AUTHORIZED:
        case AuthorizationStatus.PROVISIONAL:
          return 'granted';
        case AuthorizationStatus.DENIED:
          // If permission requests have been made more than once,
          // it's likely blocked in settings
          return permissionRequestCount > 1 ? 'blocked' : 'denied';
        case AuthorizationStatus.NOT_DETERMINED:
          return 'denied';
        default:
          return 'unavailable';
      }
    },
    [permissionRequestCount],
  );

  /**
   * Check the current notification permission status
   */
  const checkPermission = useCallback(async () => {
    try {
      const settings = await notifee.getNotificationSettings();
      setStatus(mapAuthStatus(settings.authorizationStatus));
    } catch (error) {
      loggingService.error('Error checking notification permission:', error);
      setStatus('unavailable');
    }
  }, [mapAuthStatus]);

  /**
   * Request notification permission from the user
   */
  const requestPermission = useCallback(async () => {
    try {
      setStatus('requesting');
      // Increment request count to help identify potential blocks
      setPermissionRequestCount(prev => prev + 1);

      const settings = await notifee.requestPermission({
        sound: true,
        alert: true,
        badge: true,
        criticalAlert: false,
        provisional: false,
      });

      const newStatus = mapAuthStatus(settings.authorizationStatus);
      setStatus(newStatus);

      if (newStatus === 'blocked' && permissionRequestCount > 1) {
        setTimeout(() => {
          openSettings();
        }, 500);
      }

      return newStatus === 'granted';
    } catch (error) {
      loggingService.error('Error requesting notification permission:', error);
      setStatus('unavailable');
      return false;
    }
  }, [mapAuthStatus, permissionRequestCount]);

  /**
   * Open app settings if permission is blocked
   */
  const openSettings = useCallback(() => {
    Alert.alert(
      'Notification Permission Required',
      'Please enable notifications for this app in your device settings.',
      [
        {text: 'Cancel', style: 'cancel'},
        {text: 'Open Settings', onPress: () => Linking.openSettings()},
      ],
    );
  }, []);

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

  // Check permission on mount
  useEffect(() => {
    checkPermission();
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
