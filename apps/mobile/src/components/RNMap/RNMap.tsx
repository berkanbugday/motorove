import React, {useRef, useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Keyboard,
  TouchableWithoutFeedback,
  Animated,
} from 'react-native';
import MapView, {
  PROVIDER_GOOGLE,
  Region,
  LatLng,
  Circle,
  Polyline,
  MapMarker,
} from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import {styles} from './RNMap.styles';
import {
  RNMapProps,
  RNMapPolyline,
  RNMapCircle,
  RNMapSearchResult,
} from './types';
import {useLocationPermission} from '@hooks/useLocationPermission';
import {useMapState} from '@hooks/useMapState';
import {useMapMarkers} from '@hooks/useMapMarkers';
import {RNMapSearch} from './RNMapSearch';
import {RNMapControls} from './RNMapControls';
import {RNMapCluster} from './RNMapCluster';
import {RNMapMarker} from './RNMapMarker';
import {colors} from '@theme/colors';
import {Platform} from 'react-native';
import {LocationPermissionOverlay} from '@components';
import {useComponentAnimation} from '@hooks/useComponentAnimation';
import {Button} from '@components/Button';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

// Default region (fallback if user location cannot be determined)
const DEFAULT_REGION: Region = {
  latitude: 37.78825,
  longitude: -122.4324,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

/**
 * A comprehensive map component built with React Native Maps
 */
export const RNMap: React.FC<RNMapProps> = ({
  initialRegion,
  showUserLocation = true,
  followUserLocation = false,
  mapType = 'standard',
  markers = [],
  polylines = [],
  circles = [],
  customMapStyle,
  onRegionChange,
  onRegionChangeComplete,
  onPress,
  onLongPress,
  onMarkerSelect,
  onMarkerDeselect,
  onTouchMove,
  onTouchEnd,
  maxZoomLevel = 20,
  minZoomLevel = 0,
  showCompass = false,
  showScale = false,
  showIndoors = true,
  zoomEnabled = true,
  zoomControlEnabled = true,
  rotateEnabled = true,
  scrollEnabled = true,
  pitchEnabled = false,
  toolbarEnabled = true,
  showsBuildings = true,
  style,
  clusteringEnabled = false,
  clusteringRadius = 50,
  loadingIndicator = true,
  loadingIndicatorColor = colors.primary.main,
  showSearchBar = false,
  onSearchResultSelect,
  tags = [],
  maxVisibleMarkers = 100,
  showLoadMarkerButton = false,
  onLoadMarkerPress,
  children,
}) => {
  // Refs
  const mapRef = useRef<MapView>(null);
  const markerRef = useRef<MapMarker[]>([]);
  const insets = useSafeAreaInsets();
  // Map state hook
  const {
    mapCenter,
    dynamicRadiusKm,
    refreshMapState,
    handleZoomIn,
    handleZoomOut,
    setMapCenter,
  } = useMapState({
    initialCoordinates: initialRegion
      ? {
          latitude: initialRegion.latitude,
          longitude: initialRegion.longitude,
        }
      : undefined,
    initialZoom: initialRegion
      ? Math.log2(360 / initialRegion.latitudeDelta)
      : undefined,
    mapRef: mapRef as React.RefObject<MapView>,
  });

  // Adapt markers for useMapMarkers (add coordinates property)
  const adaptedMarkers = markers.map(marker => ({
    ...marker,
    coordinates: [marker.coordinate.longitude, marker.coordinate.latitude],
  }));

  // Map markers hook
  const {visibleMarkers} = useMapMarkers({
    markers: adaptedMarkers,
    mapCenter,
    dynamicRadiusKm,
    maxVisibleMarkers,
  });

  // State
  const [region, setRegion] = useState<Region>(initialRegion || DEFAULT_REGION);
  const [userLocation, setUserLocation] = useState<LatLng | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [isMapMoving, setIsMapMoving] = useState(false);

  // Location permission hook
  const {status, requestPermission, openSettings, checkPermission} =
    useLocationPermission();
  const [showPermissionOverlay, setShowPermissionOverlay] = useState(false);
  const prevStatus = useRef(status);
  const [isShowLoadMarkerButton, setIsShowLoadMarkerButton] =
    useState(showLoadMarkerButton);

  // Add component animation hook
  const {
    searchBarTranslate,
    tagsTranslate,
    zoomControlsTranslate,
    loadButtonTranslate,
    debugInfoTranslate,
  } = useComponentAnimation(isMapMoving);

  // Handle location permission
  useEffect(() => {
    if (showUserLocation) {
      if (status !== 'granted' && status !== 'requesting') {
        // Clear user location when permissions are denied or revoked
        setUserLocation(null);
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

  // Get user location
  const getUserLocation = useCallback(() => {
    if (status === 'granted') {
      Geolocation.getCurrentPosition(
        position => {
          const {latitude, longitude} = position.coords;
          setUserLocation({latitude, longitude});

          // If initialRegion wasn't provided, set the region to the user's location
          if (!initialRegion && mapRef.current) {
            const newRegion = {
              latitude,
              longitude,
              latitudeDelta: DEFAULT_REGION.latitudeDelta,
              longitudeDelta: DEFAULT_REGION.longitudeDelta,
            };
            setRegion(newRegion);
            mapRef.current.animateToRegion(newRegion, 800);
          } else if (followUserLocation && mapRef.current) {
            const newRegion = {
              latitude,
              longitude,
              latitudeDelta: region.latitudeDelta,
              longitudeDelta: region.longitudeDelta,
            };
            mapRef.current.animateToRegion(newRegion, 800);
          }
        },
        error => console.log('Error getting location:', error),
        {
          enableHighAccuracy: true,
          timeout: 20000,
          maximumAge: 5000,
        },
      );
    }
  }, [
    status,
    followUserLocation,
    region.latitudeDelta,
    region.longitudeDelta,
    initialRegion,
  ]);

  // Get user location on mount and setup location tracking
  useEffect(() => {
    if (showUserLocation) {
      getUserLocation();
    }

    let watchId: number | null = null;

    if (followUserLocation && status === 'granted') {
      watchId = Geolocation.watchPosition(
        position => {
          const {latitude, longitude} = position.coords;
          setUserLocation({latitude, longitude});

          if (followUserLocation && mapRef.current) {
            const newRegion = {
              latitude,
              longitude,
              latitudeDelta: region.latitudeDelta,
              longitudeDelta: region.longitudeDelta,
            };
            mapRef.current.animateToRegion(newRegion, 800);
          }
        },
        error => console.log('Error watching location:', error),
        {
          enableHighAccuracy: true,
          distanceFilter: 20,
          interval: 8000,
          fastestInterval: 3000,
        },
      );
    }

    return () => {
      if (watchId !== null) {
        Geolocation.clearWatch(watchId);
      }
    };
  }, [
    showUserLocation,
    followUserLocation,
    status,
    getUserLocation,
    region.latitudeDelta,
    region.longitudeDelta,
  ]);

  // Map event handlers
  const handleMapReady = () => {
    setIsMapLoaded(true);
  };

  const handleRegionChangeComplete = (newRegion: Region) => {
    setRegion(newRegion);
    onRegionChangeComplete?.(newRegion);
  };

  // Map control functions
  const handleCenterUser = () => {
    if (mapRef.current && userLocation) {
      const newRegion = {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: region.latitudeDelta,
        longitudeDelta: region.longitudeDelta,
      };
      mapRef.current.animateToRegion(newRegion, 500);
    }
  };

  const handleSearchResultSelect = (result: RNMapSearchResult) => {
    if (mapRef.current && result.location) {
      const newRegion = {
        latitude: result.location.latitude,
        longitude: result.location.longitude,
        latitudeDelta: 0.01, // Zoom in closer
        longitudeDelta: 0.01,
      };
      mapRef.current.animateToRegion(newRegion, 500);
    }
    onSearchResultSelect?.(result);
  };

  // Add map movement handlers
  const handleMapMoveStart = useCallback((event: any) => {
    setIsMapMoving(true);
    onTouchMove?.(event);
  }, []);

  const handleMapMoveEnd = useCallback((event: any) => {
    setIsMapMoving(false);
    onTouchEnd?.(event);
  }, []);

  // Handle load marker button press
  const handleLoadMarkerPress = useCallback(() => {
    if (!isMapMoving) {
      refreshMapState();
      onLoadMarkerPress?.();
    }
  }, [onLoadMarkerPress, refreshMapState]);

  // Update map center when region changes
  useEffect(() => {
    if (region) {
      setMapCenter([region.longitude, region.latitude]);
    }
  }, [region, setMapCenter]);

  // Render tags above map
  const renderTags = () => {
    if (tags.length === 0) {
      return null;
    }

    return (
      <View style={styles.tagsContainer}>
        {tags.map(tag => (
          <Button
            key={tag.id}
            onPress={tag.onPress}
            variant={tag.isActive ? 'primary' : 'secondary'}
            title={tag.name}
            style={[
              tagStyles.tag,
              tag.isActive && {
                backgroundColor: tag.color || colors.primary.main,
              },
            ]}
            textStyle={{
              ...tagStyles.tagText,
              ...(tag.isActive ? {color: colors.neutral.white} : {}),
            }}
          />
        ))}
      </View>
    );
  };

  // Render loading indicator
  if (status === 'requesting' && loadingIndicator) {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={loadingIndicatorColor} />
          <Text>Requesting location permission...</Text>
        </View>
      </View>
    );
  }

  return (
    <>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={[styles.container, style]}>
          <MapView
            ref={mapRef}
            style={[styles.map, !isMapLoaded && styles.hiddenMap]}
            provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
            initialRegion={initialRegion || region}
            region={followUserLocation ? undefined : region}
            mapType={mapType}
            customMapStyle={customMapStyle}
            showsUserLocation={showUserLocation && status === 'granted'}
            followsUserLocation={followUserLocation && status === 'granted'}
            showsCompass={showCompass}
            showsScale={showScale}
            showsBuildings={showsBuildings}
            showsIndoors={showIndoors}
            zoomEnabled={zoomEnabled}
            zoomControlEnabled={zoomControlEnabled}
            rotateEnabled={rotateEnabled}
            scrollEnabled={scrollEnabled}
            pitchEnabled={pitchEnabled}
            toolbarEnabled={toolbarEnabled}
            maxZoomLevel={maxZoomLevel}
            minZoomLevel={minZoomLevel}
            onMapReady={handleMapReady}
            onRegionChange={onRegionChange}
            onRegionChangeComplete={handleRegionChangeComplete}
            onPress={onPress}
            onLongPress={onLongPress}
            onTouchMove={handleMapMoveStart}
            onTouchEnd={handleMapMoveEnd}>
            {/* Render polylines */}
            {polylines.map((polyline: RNMapPolyline) => (
              <Polyline
                key={`polyline-${polyline.id}`}
                coordinates={polyline.coordinates}
                strokeWidth={polyline.strokeWidth || 2}
                strokeColor={polyline.strokeColor || colors.primary.main}
                lineCap={polyline.lineCap || 'round'}
                lineJoin={polyline.lineJoin || 'round'}
                geodesic={polyline.geodesic}
                lineDashPattern={polyline.lineDashPattern}
              />
            ))}

            {/* Render circles */}
            {circles.map((circle: RNMapCircle) => (
              <Circle
                key={`circle-${circle.id}`}
                center={circle.center}
                radius={circle.radius}
                fillColor={circle.fillColor || 'rgba(0, 0, 255, 0.1)'}
                strokeColor={circle.strokeColor || colors.primary.main}
                strokeWidth={circle.strokeWidth || 1}
              />
            ))}

            {/* Render markers with clustering if enabled */}
            {clusteringEnabled ? (
              <RNMapCluster
                markers={visibleMarkers}
                radius={clusteringRadius}
                onMarkerSelect={clusterMarker => {
                  onMarkerSelect?.(clusterMarker);
                  setIsShowLoadMarkerButton(false);
                }}
                onMarkerDeselect={() => {
                  onMarkerDeselect?.();
                  setIsShowLoadMarkerButton(true);
                }}
              />
            ) : (
              visibleMarkers.map(marker => (
                <RNMapMarker
                  ref={markerRef}
                  key={`marker-${marker.id}`}
                  marker={marker}
                  onSelect={() => {
                    onMarkerSelect?.(marker);
                    setIsShowLoadMarkerButton(false);
                  }}
                  onDeselect={() => {
                    onMarkerDeselect?.();
                    setIsShowLoadMarkerButton(true);
                  }}
                  mapRef={mapRef}
                />
              ))
            )}

            {/* Render additional children */}
            {children}
          </MapView>

          {/* Search bar with animation */}
          {showSearchBar && (
            <Animated.View
              style={{
                position: 'absolute',
                width: '100%',
                transform: [{translateY: searchBarTranslate}],
              }}>
              <RNMapSearch
                onResultSelect={handleSearchResultSelect}
                placeholder="Search locations..."
              />
            </Animated.View>
          )}

          {/* Tags with animation */}
          {tags.length > 0 && (
            <Animated.View
              style={{
                position: 'absolute',
                width: '100%',
                transform: [{translateY: tagsTranslate}],
              }}>
              {renderTags()}
            </Animated.View>
          )}

          {/* Map controls with animation */}
          {zoomControlEnabled && (
            <Animated.View
              style={{
                position: 'absolute',
                width: '100%',
                transform: [{translateX: zoomControlsTranslate}],
              }}>
              <RNMapControls
                onZoomIn={handleZoomIn}
                onZoomOut={handleZoomOut}
                onCenterUser={handleCenterUser}
                userLocationAvailable={!!userLocation}
                onReopenOverlay={handleReopenOverlay}
              />
            </Animated.View>
          )}

          {/* Load marker button with animation */}
          {isShowLoadMarkerButton && (
            <Animated.View
              style={{
                transform: [{translateY: loadButtonTranslate}],
              }}>
              <Button
                style={[styles.loadMarkerButton, {bottom: insets.bottom + 70}]}
                onPress={handleLoadMarkerPress}
                variant="primary"
                shape="round"
                title="Search in this area"
                textStyle={{
                  color: colors.neutral.white,
                }}
                disabled={isMapMoving}
              />
            </Animated.View>
          )}

          {/* Debug info with animation */}
          {/* {markers.length > 0 && (
            <Animated.View
              style={{
                transform: [{translateY: debugInfoTranslate}],
              }}>
              <View style={styles.debugInfo}>
                <Text style={styles.debugInfoText}>
                  Visible: {visibleMarkers.length} / {markers.length}
                </Text>
                <Text style={styles.debugInfoText}>
                  Radius: {dynamicRadiusKm} km
                </Text>
              </View>
            </Animated.View>
          )} */}

          {/* Loading overlay */}
          {!isMapLoaded && loadingIndicator && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={loadingIndicatorColor} />
            </View>
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

// Additional styles for tags and buttons
const tagStyles = StyleSheet.create({
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: colors.neutral.white,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  tagText: {
    fontSize: 14,
    color: colors.neutral.black,
  },
});
