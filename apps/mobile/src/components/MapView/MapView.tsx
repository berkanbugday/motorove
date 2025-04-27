import React, {useEffect, useRef, useState, useCallback} from 'react';
import {View, StyleSheet, ActivityIndicator, Text} from 'react-native';
import Mapbox from '@rnmapbox/maps';
import {useLocationPermission} from '@hooks/useLocationPermission';
import {Button, LocationPermissionOverlay} from '@components';
import {colors, rs, spacing, getShadow} from '@theme';

// Configure Mapbox access token
Mapbox.setAccessToken(
  'pk.eyJ1IjoiYmVya2FuYnVnZGF5IiwiYSI6ImNtOXhoMGprYjB4M2EycXM3OWc4OXA3YnUifQ.SxRjIA3GMzguYeD4Zpjsaw',
);

export interface MapViewProps {
  /**
   * Initial center coordinates of the map
   */
  initialCoordinates?: {
    latitude: number;
    longitude: number;
  };
  /**
   * Initial zoom level (1-20)
   */
  initialZoom?: number;
  /**
   * Whether to show user location on the map
   */
  showUserLocation?: boolean;
  /**
   * Whether to track user location and follow it
   */
  followUserLocation?: boolean;
  /**
   * Style variant of the map
   */
  styleURL?: string;
  /**
   * Whether the map should take up the full screen
   */
  fullscreen?: boolean;
  /**
   * Custom style for the map container
   */
  style?: any;
  /**
   * Whether to show zoom controls
   */
  showZoomControls?: boolean;
  /**
   * Children components to render on top of the map
   */
  children?: React.ReactNode;
  /**
   * Callback when the map is pressed
   */
  onMapPress?: (coordinates: [number, number]) => void;
  /**
   * Callback when the map finishes loading
   */
  onMapLoaded?: () => void;
}

export const MapView: React.FC<MapViewProps> = ({
  initialCoordinates = {latitude: 37.78825, longitude: -122.4324},
  initialZoom = 14,
  showUserLocation = true,
  followUserLocation = false,
  styleURL = Mapbox.StyleURL.Street,
  fullscreen = false,
  style,
  showZoomControls = true,
  children,
  onMapPress,
  onMapLoaded,
}) => {
  const camera = useRef<Mapbox.Camera>(null);
  const [currentZoom, setCurrentZoom] = useState(initialZoom);
  const {status, requestPermission, openSettings, checkPermission} =
    useLocationPermission();
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [showPermissionOverlay, setShowPermissionOverlay] = useState(false);
  const prevStatus = useRef(status);

  // Handle location permission
  useEffect(() => {
    if (showUserLocation) {
      if (status !== 'granted' && status !== 'requesting') {
        // Show permission overlay if we need location but don't have it
        if (status === 'denied' || status === 'blocked') {
          setShowPermissionOverlay(true);
        } else {
          requestPermission();
        }
      } else if (status === 'granted' && prevStatus.current !== 'granted') {
        // If we just received permission, hide overlay
        setShowPermissionOverlay(false);
      }
    }

    // Keep track of previous status to detect changes
    prevStatus.current = status;
  }, [showUserLocation, status, requestPermission]);

  // Update camera when user location changes (if following)
  useEffect(() => {
    if (followUserLocation && userLocation && camera.current) {
      camera.current.setCamera({
        centerCoordinate: [userLocation.longitude, userLocation.latitude],
        animationDuration: 1000,
      });
    }
  }, [followUserLocation, userLocation]);

  // Handle user location updates
  const handleUserLocationUpdate = (location: Mapbox.Location) => {
    if (location.coords) {
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    }
  };

  // Handle map press
  const handleMapPress = (feature: GeoJSON.Feature) => {
    if (onMapPress && feature.geometry.type === 'Point') {
      const coordinates = feature.geometry.coordinates as [number, number];
      onMapPress(coordinates);
    }
  };

  // Handle zoom in
  const handleZoomIn = () => {
    if (camera.current) {
      const newZoom = Math.min(currentZoom + 1, 20);
      setCurrentZoom(newZoom);
      camera.current.setCamera({
        zoomLevel: newZoom,
        animationDuration: 300,
      });
    }
  };

  // Handle zoom out
  const handleZoomOut = () => {
    if (camera.current) {
      const newZoom = Math.max(currentZoom - 1, 1);
      setCurrentZoom(newZoom);
      camera.current.setCamera({
        zoomLevel: newZoom,
        animationDuration: 300,
      });
    }
  };

  // Handle recenter to user location
  const handleRecenterToUser = () => {
    if (camera.current && userLocation) {
      camera.current.setCamera({
        centerCoordinate: [userLocation.longitude, userLocation.latitude],
        zoomLevel: 15,
        animationDuration: 1000,
      });
    }
  };

  // Handle permission overlay allow press
  const handleAllowLocationPress = useCallback(() => {
    requestPermission();
    setShowPermissionOverlay(false);
  }, [requestPermission]);

  // Handle permission overlay dismiss
  const handleDismissOverlay = useCallback(() => {
    setShowPermissionOverlay(false);
  }, []);

  // Handle reopening the overlay
  const handleReopenOverlay = useCallback(() => {
    checkPermission().then(() => {
      if (status !== 'granted') {
        setShowPermissionOverlay(true);
      }
    });
  }, [checkPermission, status]);

  // Render loading UI
  if (status === 'requesting') {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.main} />
          <Text style={styles.loadingText}>
            Requesting location permission...
          </Text>
        </View>
      </View>
    );
  }

  // Render user location component only if permission is granted
  const renderUserLocation = () => {
    if (showUserLocation && status === 'granted') {
      return (
        <Mapbox.UserLocation
          onUpdate={handleUserLocationUpdate}
          visible={true}
          showsUserHeadingIndicator={true}
        />
      );
    }
    return null;
  };

  // Render additional map elements
  const renderMapElements = () => {
    if (children) {
      // If children is a React element array, map through it
      if (Array.isArray(children)) {
        return children.map((child, index) =>
          React.isValidElement(child)
            ? React.cloneElement(child, {key: `map-element-${index}`})
            : child,
        );
      }
      // If children is a single element
      return children;
    }
    return null;
  };

  return (
    <>
      <View style={[fullscreen ? styles.fullscreen : styles.container, style]}>
        <Mapbox.MapView
          style={styles.map}
          styleURL={styleURL}
          onPress={handleMapPress}
          onDidFinishLoadingMap={onMapLoaded}>
          {/* Camera */}
          <Mapbox.Camera
            ref={camera}
            defaultSettings={{
              centerCoordinate: [
                initialCoordinates.longitude,
                initialCoordinates.latitude,
              ],
              zoomLevel: initialZoom,
            }}
            animationMode="flyTo"
            animationDuration={1000}
          />

          {/* User Location - Extract to separate method to avoid Fragment issues */}
          {renderUserLocation()}

          {/* Additional Map Elements */}
          {renderMapElements()}
        </Mapbox.MapView>

        {/* Map Controls */}
        {showZoomControls && (
          <View style={styles.zoomControlsContainer}>
            <Button
              onPress={handleZoomIn}
              variant="primary"
              shape="round"
              size="small"
              style={styles.zoomButton}
              title="+"
            />
            <Button
              onPress={handleZoomOut}
              variant="primary"
              shape="round"
              size="small"
              style={styles.zoomButton}
              title="-"
            />
          </View>
        )}

        {/* Recenter Button */}
        {showUserLocation && status === 'granted' && userLocation && (
          <Button
            onPress={handleRecenterToUser}
            variant="primary"
            shape="round"
            size="small"
            style={styles.recenterButton}
            title="↻"
          />
        )}

        {/* Request Location Button (when denied) */}
        {showUserLocation && status !== 'granted' && !showPermissionOverlay && (
          <Button
            onPress={handleReopenOverlay}
            variant="primary"
            shape="round"
            size="small"
            style={styles.locationRequestButton}
            title="📍"
          />
        )}
      </View>

      {/* Location Permission Overlay */}
      <LocationPermissionOverlay
        visible={showPermissionOverlay}
        onAllowPress={handleAllowLocationPress}
        onDismiss={handleDismissOverlay}
        onOpenSettings={openSettings}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 300,
    width: '100%',
    borderRadius: rs(12),
    overflow: 'hidden',
  },
  fullscreen: {
    ...StyleSheet.absoluteFillObject,
  },
  map: {
    flex: 1,
  },
  zoomControlsContainer: {
    position: 'absolute',
    right: spacing.md,
    top: spacing.md,
    borderRadius: rs(8),
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: spacing.xs,
    ...getShadow('small'),
  },
  zoomButton: {
    marginVertical: spacing.xs / 2,
    width: 40,
    height: 40,
  },
  recenterButton: {
    position: 'absolute',
    right: spacing.md,
    bottom: spacing.md,
    width: 44,
    height: 44,
    backgroundColor: colors.primary.main,
  },
  locationRequestButton: {
    position: 'absolute',
    right: spacing.md,
    bottom: spacing.md,
    width: 44,
    height: 44,
    backgroundColor: colors.primary.main,
  },
  permissionContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.neutral.white,
    padding: spacing.md,
  },
  permissionText: {
    textAlign: 'center',
    marginBottom: spacing.md,
    color: colors.neutral.darkGrey,
    fontSize: 16,
  },
  permissionButton: {
    marginVertical: spacing.sm,
    width: '80%',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.neutral.white,
  },
  loadingText: {
    marginTop: spacing.md,
    color: colors.neutral.darkGrey,
  },
});
