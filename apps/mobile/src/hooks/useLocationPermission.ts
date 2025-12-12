import {useEffect, useState, useCallback, useRef} from 'react';
import {Linking, Platform, PermissionsAndroid, AppState} from 'react-native';
import Geolocation, {
  GeolocationResponse,
} from '@react-native-community/geolocation';
import {loggingService} from '@services/logging.service';
import {useUpdateUserLocation} from '@services/user-location.service';

type LocationPermissionStatus =
  | 'granted'
  | 'denied'
  | 'blocked'
  | 'unavailable'
  | 'requesting';

/**
 * Custom hook for managing location permission and service integration
 *
 * This hook provides methods to:
 * - Check current location permission status
 * - Request location permission
 * - Open app settings if permission is blocked
 * - Determine if high accuracy location is available
 * - Manage permission overlay visibility
 * - Handle location service integration
 * - Update user location when permission is granted (only if authenticated)
 */
export const useLocationPermission = (isAuthenticated: boolean = false) => {
  const [status, setStatus] = useState<LocationPermissionStatus>('requesting');
  const [highAccuracy, setHighAccuracy] = useState<boolean>(false);
  const [showPermissionOverlay, setShowPermissionOverlay] = useState(false);
  const appState = useRef(AppState.currentState);
  const [permissionRequestCount, setPermissionRequestCount] = useState(0);
  const isMountedRef = useRef(false);
  const locationUpdateCountRef = useRef(0); // Track location updates per app session
  const lastBackgroundUpdateRef = useRef<number>(0); // Track last background update timestamp
  const isUpdatingLocationRef = useRef(false); // Prevent concurrent location updates
  const disclosureDismissedRef = useRef(false); // Track if user dismissed disclosure (tapped "Not Now")
  const {updateUserLocation: updateLocationMutation} = useUpdateUserLocation();

  /**
   * Update user location by getting current position and sending to backend
   * Only updates if user is authenticated and has location permission
   * Limits updates to maximum 1 time per app session
   */
  const updateUserLocation = useCallback(
    async (force: boolean = false) => {
      // Prevent concurrent location updates
      if (isUpdatingLocationRef.current) {
        loggingService.info('Location update already in progress, skipping');
        return;
      }

      if (!isAuthenticated) {
        loggingService.info('User not authenticated, skipping location update');
        return;
      }

      if (status !== 'granted') {
        loggingService.info(
          'Location permission not granted, skipping location update',
        );
        return;
      }

      if (!force) {
        // Limit to 1 update per app session
        if (locationUpdateCountRef.current >= 1) {
          loggingService.info(
            'Location update limit reached (1 per session), skipping',
          );
          return;
        }
      }

      // Set mutex to prevent concurrent updates
      isUpdatingLocationRef.current = true;

      try {
        loggingService.info('Getting current position for location update');

        const position = await new Promise<GeolocationResponse>(
          (resolve, reject) => {
            Geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: highAccuracy,
              timeout: 15000,
              maximumAge: 10000,
            });
          },
        );

        const {latitude, longitude, accuracy} = position.coords;

        loggingService.info(
          `Got position: lat=${latitude}, lng=${longitude}, accuracy=${accuracy}`,
        );

        await updateLocationMutation({
          latitude,
          longitude,
        });

        // Update tracking refs
        locationUpdateCountRef.current += 1;

        loggingService.info(
          `User location updated successfully (${locationUpdateCountRef.current}/1 for this session)`,
        );
      } catch (error) {
        loggingService.error('Error updating user location:', error);
      } finally {
        // Always release the mutex
        isUpdatingLocationRef.current = false;
      }
    },
    [isAuthenticated, status, highAccuracy, updateLocationMutation],
  );

  /**
   * Handle dismiss overlay (user tapped "Not Now")
   * This must NOT request permission - user explicitly declined
   */
  const handleDismissOverlay = useCallback(() => {
    disclosureDismissedRef.current = true;
    setShowPermissionOverlay(false);
    loggingService.info(
      'User dismissed location permission disclosure - will not request permission',
    );
  }, []);

  /**
   * Update location when app becomes active from background (30-minute interval)
   */
  const updateLocationFromBackground = useCallback(async () => {
    if (!isAuthenticated || status !== 'granted') {
      return;
    }

    const now = Date.now();
    const timeSinceLastBackgroundUpdate = now - lastBackgroundUpdateRef.current;
    const thirtyMinutesInMs = 30 * 60 * 1000; // 30 minutes

    // Only update if 30 minutes have passed since last background update
    if (timeSinceLastBackgroundUpdate < thirtyMinutesInMs) {
      loggingService.info(
        `Background location update skipped - only ${Math.round(
          timeSinceLastBackgroundUpdate / (60 * 1000),
        )} minutes since last update (need 30 min)`,
      );
      return;
    }

    // Prevent concurrent updates
    if (isUpdatingLocationRef.current) {
      loggingService.info(
        'Background location update skipped - update already in progress',
      );
      return;
    }

    isUpdatingLocationRef.current = true;

    try {
      loggingService.info(
        'Updating location from background (30-minute interval)',
      );

      const position = await new Promise<GeolocationResponse>(
        (resolve, reject) => {
          Geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: highAccuracy,
            timeout: 15000,
            maximumAge: 10000,
          });
        },
      );

      const {latitude, longitude, accuracy} = position.coords;

      loggingService.info(
        `Background position: lat=${latitude}, lng=${longitude}, accuracy=${accuracy}`,
      );

      await updateLocationMutation({
        latitude,
        longitude,
      });

      // Update background tracking ref
      lastBackgroundUpdateRef.current = now;

      loggingService.info('Background location updated successfully');
    } catch (error) {
      loggingService.error('Error updating background location:', error);
    } finally {
      isUpdatingLocationRef.current = false;
    }
  }, [isAuthenticated, status, highAccuracy, updateLocationMutation]);

  /**
   * Reset location update counter (useful for manual location updates)
   */
  const resetLocationUpdateCounter = useCallback(() => {
    locationUpdateCountRef.current = 0;
    lastBackgroundUpdateRef.current = 0;
    isUpdatingLocationRef.current = false; // Also reset mutex
    loggingService.info('Location update counter and mutex reset');
  }, []);

  /**
   * Open app settings if permission is blocked
   */
  const openSettings = useCallback(() => {
    Linking.openSettings();
    setShowPermissionOverlay(false);
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
                setShowPermissionOverlay(false); // Hide overlay if permission granted
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
                  // Show Prominent Disclosure overlay BEFORE requesting permission
                  // Only show if user is authenticated and hasn't dismissed the disclosure
                  if (
                    isAuthenticated &&
                    !disclosureDismissedRef.current &&
                    permissionRequestCount === 0
                  ) {
                    setShowPermissionOverlay(true);
                    loggingService.info(
                      'Showing Prominent Disclosure before requesting permission (iOS)',
                    );
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
            setShowPermissionOverlay(false); // Hide overlay if permission granted
            checkHighAccuracy();
          } else {
            // When checking permission status, we don't want to request permission again
            // Just check the current status without making a request
            const permissionStatus = await PermissionsAndroid.check(
              PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            );

            if (permissionStatus) {
              setStatus('granted');
              setShowPermissionOverlay(false); // Hide overlay if permission granted
              checkHighAccuracy();
            } else {
              // Use permissionRequestCount value from state directly
              if (permissionRequestCount > 1) {
                setStatus('blocked');
              } else {
                setStatus('denied');
              }
              // Show Prominent Disclosure overlay BEFORE requesting permission
              // Only show if user is authenticated and hasn't dismissed the disclosure
              if (
                isAuthenticated &&
                !disclosureDismissedRef.current &&
                permissionRequestCount === 0
              ) {
                setShowPermissionOverlay(true);
                loggingService.info(
                  'Showing Prominent Disclosure before requesting permission',
                );
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
  }, [checkHighAccuracy, permissionRequestCount, isAuthenticated]);

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
                    // Don't auto-open settings - let user decide
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
        // Android - Request both FINE and COARSE location permissions
        // After user taps "Allow & Continue" in Prominent Disclosure
        const permissions = [
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
        ];

        const results = await PermissionsAndroid.requestMultiple(permissions);

        const fineLocationGranted =
          results[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] ===
          PermissionsAndroid.RESULTS.GRANTED;
        const coarseLocationGranted =
          results[PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION] ===
          PermissionsAndroid.RESULTS.GRANTED;

        const permissionGranted = fineLocationGranted || coarseLocationGranted;

        if (permissionGranted) {
          setStatus('granted');
          setShowPermissionOverlay(false);
          checkHighAccuracy();
        } else {
          // If not the first request, consider it blocked
          if (permissionRequestCount > 1) {
            setStatus('blocked');
            // Don't auto-open settings - let user decide
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

  /**
   * Handle allow permission button press (user tapped "Allow & Continue")
   * This is called AFTER Prominent Disclosure is shown
   * Now we show the system permission dialog
   */
  const handleAllowPermission = useCallback(async () => {
    try {
      loggingService.info(
        'User accepted Prominent Disclosure - now requesting system permission',
      );
      const granted = await requestPermission();
      if (granted) {
        setShowPermissionOverlay(false);
        // Update location now that permission is granted
        await updateUserLocation();
      } else {
        // Permission denied - hide overlay but don't show it again
        // User can still access settings later if needed
        setShowPermissionOverlay(false);
      }
    } catch (error) {
      loggingService.error('Error requesting location permission:', error);
      setShowPermissionOverlay(false);
    }
  }, [requestPermission, updateUserLocation]);

  // Auto-update location when permission is granted (with limits)
  useEffect(() => {
    if (status === 'granted' && locationUpdateCountRef.current < 1) {
      updateUserLocation();
    } else if (status === 'granted') {
      loggingService.info(
        'Permission granted but location update limit reached for this session',
      );
    }
  }, [status, updateUserLocation]);

  // Listen for app state changes to refresh permission status and trigger location updates
  // This handles the case where the user grants permission in settings and returns to the app
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        // App has come to the foreground - check permission and update location from background
        checkPermission();
        // Use background update function with 30-minute interval
        updateLocationFromBackground();
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [checkPermission, updateLocationFromBackground]);

  // Check permission on mount only once
  useEffect(() => {
    if (!isMountedRef.current) {
      checkPermission();
      isMountedRef.current = true;
    }
  }, [checkPermission]);

  // Check permission again when user becomes authenticated
  useEffect(() => {
    if (isAuthenticated && isMountedRef.current) {
      loggingService.info(
        'User became authenticated, checking location permission',
      );
      checkPermission();
    }
  }, [isAuthenticated, checkPermission]);

  // Show Prominent Disclosure overlay when user becomes authenticated and permission is not granted
  // Only show if disclosure hasn't been dismissed and permission hasn't been requested yet
  useEffect(() => {
    if (isAuthenticated && status === 'granted') {
      setShowPermissionOverlay(false);
      disclosureDismissedRef.current = false; // Reset if permission granted
      loggingService.info(
        'Hiding location permission overlay - permission granted',
      );
    } else if (!isAuthenticated) {
      setShowPermissionOverlay(false);
      disclosureDismissedRef.current = false; // Reset when user logs out
      loggingService.info(
        'Hiding location permission overlay - user not authenticated',
      );
    }
    // Note: Overlay visibility is now controlled in checkPermission() to ensure
    // it shows BEFORE requesting permission, not after denial
  }, [isAuthenticated, status]);

  return {
    // Permission status
    status,
    isGranted: status === 'granted',
    isBlocked: status === 'blocked',
    isDenied: status === 'denied',
    isUnavailable: status === 'unavailable',
    isRequesting: status === 'requesting',
    isHighAccuracy: highAccuracy,

    // Permission overlay state
    showPermissionOverlay,

    // Permission actions
    requestPermission,
    checkPermission,
    openSettings,

    // Overlay handlers
    onAllowPermission: handleAllowPermission,
    onDismissOverlay: handleDismissOverlay,
    onOpenSettings: openSettings,

    // Manual location update
    updateUserLocation,
    resetLocationUpdateCounter,
  };
};
