import React, {useEffect, useRef, useState, useCallback} from 'react';
import {
  View,
  ActivityIndicator,
  Text,
  Keyboard,
  TouchableWithoutFeedback,
  Animated,
} from 'react-native';
import Mapbox from '@rnmapbox/maps';
import {useLocationPermission} from '@hooks/useLocationPermission';
import {useMapState} from '@hooks/useMapState';
import {useMapMarkers} from '@hooks/useMapMarkers';
import {useMapSearch} from '@hooks/useMapSearch';
import {useMapMovement} from '@hooks/useMapMovement';
import {useComponentAnimation} from '@hooks/useComponentAnimation';
import {LocationPermissionOverlay} from '@components';
import {colors} from '@theme';
import {MAPBOX_ACCESS_TOKEN} from '@env';
import {styles} from './MapView.styles';
import {SearchBar} from './SearchBar';
import {TagsList} from './TagsList';
import {ZoomControls} from './ZoomControls';
import {MapMarkers} from './MapMarkers';
import {LoadMarkerButton} from './LoadMarkerButton';
import {DebugInfo} from './DebugInfo';
import {Tag, MapMarker} from './types';

// Configure Mapbox access token
Mapbox.setAccessToken(MAPBOX_ACCESS_TOKEN);

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
  /**
   * Whether to show search functionality
   */
  showSearch?: boolean;
  /**
   * Callback when a location is searched and selected
   */
  onSearchResult?: (result: {
    name: string;
    coordinates: [number, number];
    address?: string;
  }) => void;
  /**
   * Whether to show filter button
   */
  showFilterButton?: boolean;
  /**
   * Callback when the filter button is pressed
   */
  onFilterPress?: () => void;
  /**
   * Tags to display above the map
   */
  tags?: Tag[];
  /**
   * Markers to display on the map
   */
  markers?: MapMarker[];
  /**
   * Radius in kilometers to show markers around map center
   */
  markerRadiusKm?: number;
  /**
   * Max number of markers to render at once
   */
  maxVisibleMarkers?: number;
  /**
   * Whether to show the load marker button
   */
  showLoadMarkerButton?: boolean;
  /**
   * Callback when the load marker button is pressed
   */
  onLoadMarkerPress?: () => void;
}

export const MapView: React.FC<MapViewProps> = ({
  initialCoordinates = {latitude: 37.78825, longitude: -122.4324},
  initialZoom = 14,
  showUserLocation = true,
  followUserLocation = false,
  styleURL = Mapbox.StyleURL.Street,
  fullscreen = false,
  style,
  showZoomControls = false,
  children,
  onMapPress,
  onMapLoaded,
  showSearch = false,
  onSearchResult,
  showFilterButton = false,
  onFilterPress,
  tags = [],
  markers = [],
  markerRadiusKm: _markerRadius,
  maxVisibleMarkers = 1000,
  showLoadMarkerButton = true,
  onLoadMarkerPress,
}) => {
  // Use custom hooks
  const {status, requestPermission, openSettings, checkPermission} =
    useLocationPermission();

  // Map state hook
  const {
    mapRef,
    camera,
    mapCenter,
    dynamicRadiusKm,
    refreshMapState,
    handleZoomIn,
    handleZoomOut,
    setMapCenter,
  } = useMapState({initialCoordinates, initialZoom});

  // Map markers hook
  const {visibleMarkers} = useMapMarkers({
    markers,
    mapCenter,
    dynamicRadiusKm,
    maxVisibleMarkers,
  });

  // Map search hook
  const {
    searchQuery,
    searchResults,
    isSearching,
    showSearchResults,
    setShowSearchResults,
    handleSearchQueryChange,
    handleSelectSearchResult,
    handleClearSearch,
  } = useMapSearch({onSearchResult});

  // Map movement hook
  const {isMapMoving, handleMapMoveStart, handleMapMoveEnd} = useMapMovement();

  // Component animation hook
  const {
    searchBarTranslate,
    tagsTranslate,
    zoomControlsTranslate,
    loadButtonTranslate,
    debugInfoTranslate,
  } = useComponentAnimation(isMapMoving);

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
      const newCenter: [number, number] = [
        userLocation.longitude,
        userLocation.latitude,
      ];
      setMapCenter(newCenter);
      camera.current.setCamera({
        centerCoordinate: newCenter,
        animationDuration: 1000,
      });
    }
  }, [followUserLocation, userLocation, setMapCenter]);

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
    // Hide search results when map is pressed
    setShowSearchResults(false);
    // Dismiss keyboard when map is pressed
    Keyboard.dismiss();

    if (onMapPress && feature.geometry.type === 'Point') {
      const coordinates = feature.geometry.coordinates as [number, number];
      onMapPress(coordinates);
    }
  };

  // Handle recenter to user location
  const handleRecenterToUser = () => {
    if (camera.current && userLocation) {
      const newCenter: [number, number] = [
        userLocation.longitude,
        userLocation.latitude,
      ];
      setMapCenter(newCenter);
      camera.current.setCamera({
        centerCoordinate: newCenter,
        zoomLevel: 14,
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

  // Handle map loaded event
  const handleMapLoaded = () => {
    // Get initial map center
    if (mapRef.current) {
      mapRef.current.getCenter().then(center => {
        if (center) {
          setMapCenter(center as [number, number]);
        }
      });
    }

    // Call the onMapLoaded callback if provided
    if (onMapLoaded) {
      onMapLoaded();
    }
  };

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

  return (
    <>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View
          style={[fullscreen ? styles.fullscreen : styles.container, style]}>
          <Mapbox.MapView
            ref={mapRef}
            style={styles.map}
            logoEnabled={false}
            attributionEnabled={false}
            scaleBarEnabled={false}
            compassEnabled={false}
            styleURL={styleURL}
            onPress={handleMapPress}
            onDidFinishLoadingMap={handleMapLoaded}
            pitchEnabled={false}
            onTouchStart={handleMapMoveStart}
            onTouchEnd={handleMapMoveEnd}>
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

            {/* User Location */}
            {renderUserLocation()}

            {/* Map Markers */}
            {visibleMarkers && visibleMarkers.length > 0 && (
              <MapMarkers markers={visibleMarkers} />
            )}

            {/* Additional Map Elements */}
            {renderMapElements()}
          </Mapbox.MapView>

          {/* Search Bar */}
          {showSearch && (
            <Animated.View
              style={{
                position: 'absolute',
                width: '100%',
                transform: [{translateY: searchBarTranslate}],
              }}>
              <SearchBar
                searchQuery={searchQuery}
                searchResults={searchResults}
                isSearching={isSearching}
                showSearchResults={showSearchResults}
                showFilterButton={showFilterButton}
                onSearchQueryChange={handleSearchQueryChange}
                onClearSearch={handleClearSearch}
                onSelectSearchResult={handleSelectSearchResult}
                onFilterPress={onFilterPress}
                setShowSearchResults={setShowSearchResults}
                camera={camera}
                setMapCenter={setMapCenter}
              />
            </Animated.View>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <Animated.View
              style={{
                position: 'absolute',
                width: '100%',
                transform: [{translateY: tagsTranslate}],
              }}>
              <TagsList tags={tags} />
            </Animated.View>
          )}

          {/* Zoom Controls */}
          {showZoomControls && (
            <Animated.View
              style={{
                position: 'absolute',
                width: '100%',
                transform: [{translateX: zoomControlsTranslate}],
              }}>
              <ZoomControls
                onZoomIn={handleZoomIn}
                onZoomOut={handleZoomOut}
                onRecenter={handleRecenterToUser}
                showUserLocation={showUserLocation}
                locationStatus={status}
                userLocation={userLocation}
                onReopenOverlay={handleReopenOverlay}
              />
            </Animated.View>
          )}

          {/* Load Marker Button */}
          {showLoadMarkerButton && (
            <Animated.View
              style={{
                transform: [{translateY: loadButtonTranslate}],
              }}>
              <LoadMarkerButton
                onPress={onLoadMarkerPress || (() => {})}
                refreshMapState={refreshMapState}
              />
            </Animated.View>
          )}

          {/* Debug Info */}
          {markers.length > 0 && (
            <Animated.View
              style={{
                transform: [{translateY: debugInfoTranslate}],
              }}>
              <DebugInfo
                visibleMarkers={visibleMarkers.length}
                totalMarkers={markers.length}
                radiusKm={dynamicRadiusKm}
              />
            </Animated.View>
          )}
        </View>
      </TouchableWithoutFeedback>

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
