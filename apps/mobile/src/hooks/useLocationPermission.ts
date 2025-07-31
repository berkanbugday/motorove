import {useEffect, useState, useCallback, useRef} from 'react';
import {Linking, Platform, PermissionsAndroid, AppState} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import {loggingService} from '@services/logging.service';

type LocationPermissionStatus =
  | 'granted'
  | 'denied'
  | 'blocked'
  | 'unavailable'
  | 'requesting';

/**
 * Custom hook for managing location permission in React Native
 *
 * This hook provides methods to:
 * - Check current location permission status
 * - Request location permission
 * - Open app settings if permission is blocked
 * - Determine if high accuracy location is available
 */
export const useLocationPermission = () => {
  const [status, setStatus] = useState<LocationPermissionStatus>('requesting');
  const [highAccuracy, setHighAccuracy] = useState<boolean>(false);
  const appState = useRef(AppState.currentState);
  const [permissionRequestCount, setPermissionRequestCount] = useState(0);
  const isMountedRef = useRef(false);

  /**
   * Open app settings if permission is blocked
   */
  const openSettings = useCallback(() => {
    Linking.openSettings();
  }, []);

  /**
   * Check if high accuracy location is available
   */
  const checkHighAccuracy = useCallback(() => {
    Geolocation.getCurrentPosition(
      () => setHighAccuracy(true),
      () => setHighAccuracy(false),
      {enableHighAccuracy: true, timeout: 5000, maximumAge: 10000},
    );
  }, []);

  /**
   * Check the current location permission status
   */
  const checkPermission = useCallback(async () => {
    try {
      if (Platform.OS === 'ios') {
        // Setup geolocation
        Geolocation.setRNConfiguration({
          skipPermissionRequests: false,
          authorizationLevel: 'whenInUse',
        });

        // Check if we can get location
        try {
          await new Promise<void>((resolve, reject) => {
            Geolocation.getCurrentPosition(
              () => {
                setStatus('granted');
                resolve();
              },
              error => {
                if (error.code === 1) {
                  // PERMISSION_DENIED
                  // Use permissionRequestCount value from state directly
                  if (permissionRequestCount > 1) {
                    setStatus('blocked');
                  } else {
                    setStatus('denied');
                  }
                } else {
                  setStatus('unavailable');
                }
                reject(error);
              },
              {enableHighAccuracy: false, timeout: 5000, maximumAge: 10000},
            );
          });

          // If we get here, permission is granted
          checkHighAccuracy();
        } catch (error) {
          // Error handled in the getCurrentPosition callback
        }
      } else {
        // For Android
        try {
          const hasPermission = await PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          );

          if (hasPermission) {
            setStatus('granted');
            checkHighAccuracy();
          } else {
            // When checking permission status, we don't want to request permission again
            // Just check the current status without making a request
            const permissionStatus = await PermissionsAndroid.check(
              PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            );

            if (permissionStatus) {
              setStatus('granted');
              checkHighAccuracy();
            } else {
              // Use permissionRequestCount value from state directly
              if (permissionRequestCount > 1) {
                setStatus('blocked');
              } else {
                setStatus('denied');
              }
            }
          }
        } catch (err) {
          loggingService.error(
            'Error checking Android permissions:',
            err as Error,
          );
          setStatus('unavailable');
        }
      }
    } catch (error) {
      loggingService.error('Error checking location permission:', error);
      setStatus('unavailable');
    }
  }, [checkHighAccuracy]); // Remove permissionRequestCount from dependencies

  /**
   * Request location permission from the user
   */
  const requestPermission = useCallback(async () => {
    try {
      setStatus('requesting');
      // Increment request count to help identify potential blocks
      setPermissionRequestCount(prev => prev + 1);

      if (Platform.OS === 'ios') {
        // Setup geolocation
        Geolocation.setRNConfiguration({
          skipPermissionRequests: false,
          authorizationLevel: 'whenInUse',
        });

        // For iOS, we attempt to get the position which will trigger the permission request
        try {
          await new Promise<void>((resolve, reject) => {
            Geolocation.getCurrentPosition(
              () => {
                setStatus('granted');
                resolve();
              },
              error => {
                if (error.code === 1) {
                  // PERMISSION_DENIED
                  // If this is not the first request, likely permission is blocked in settings
                  if (permissionRequestCount > 1) {
                    setStatus('blocked');
                    setTimeout(() => {
                      openSettings();
                    }, 500);
                  } else {
                    setStatus('denied');
                  }
                } else {
                  setStatus('unavailable');
                }
                reject(error);
              },
              {enableHighAccuracy: false, timeout: 5000, maximumAge: 10000},
            );
          });

          // If we get here, permission is granted
          checkHighAccuracy();
          return true;
        } catch (error) {
          // Error handled in the getCurrentPosition callback
          return status === 'granted';
        }
      } else {
        // Android
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'Motorove needs access to your location',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );

        const permissionGranted =
          granted === PermissionsAndroid.RESULTS.GRANTED;

        if (permissionGranted) {
          setStatus('granted');
          checkHighAccuracy();
        } else {
          // If not the first request, consider it blocked
          if (permissionRequestCount > 1) {
            setStatus('blocked');
            setTimeout(() => {
              openSettings();
            }, 500);
          } else {
            setStatus('denied');
          }
        }

        return permissionGranted;
      }
    } catch (error) {
      loggingService.error('Error requesting location permission:', error);
      setStatus('unavailable');
      return false;
    }
  }, [checkHighAccuracy, permissionRequestCount, status, openSettings]);

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
    isHighAccuracy: highAccuracy,
    requestPermission,
    checkPermission,
    openSettings,
  };
};
