import React, {useEffect, useRef, useState, useCallback} from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  TextInput,
  TouchableOpacity,
  Keyboard,
  TouchableWithoutFeedback,
  ScrollView,
} from 'react-native';
import Mapbox from '@rnmapbox/maps';
import {useLocationPermission} from '@hooks/useLocationPermission';
import {
  Button,
  Icon,
  LocationPermissionOverlay,
  Chip,
  ChipColor,
} from '@components';
import {colors, rs, spacing, getShadow, radius} from '@theme';
import {IconName} from '@components/Icon';
import {MAPBOX_ACCESS_TOKEN} from '@env';
// Configure Mapbox access token
Mapbox.setAccessToken(MAPBOX_ACCESS_TOKEN);

export interface Tag {
  id: string;
  label: string;
  color?: ChipColor;
  onPress?: () => void;
  onRemove?: () => void;
  removable?: boolean;
  leadingIcon?: IconName;
}

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

  // Search related state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<
    Array<{
      id: string;
      name: string;
      coordinates: [number, number];
      address?: string;
    }>
  >([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

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
    // Hide search results when map is pressed
    setShowSearchResults(false);
    // Dismiss keyboard when map is pressed
    Keyboard.dismiss();

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

  // Handle search query changes
  const handleSearchQueryChange = (text: string) => {
    setSearchQuery(text);
    if (text.length > 2) {
      performSearch(text);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  };

  // Perform search using Mapbox Geocoding API
  const performSearch = async (query: string) => {
    if (!query.trim()) return;

    setIsSearching(true);

    try {
      // Build Mapbox Geocoding API URL
      const endpoint = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        query,
      )}.json?access_token=${MAPBOX_ACCESS_TOKEN}&limit=5`;

      const response = await fetch(endpoint);
      const data = await response.json();

      if (data.features) {
        const formattedResults = data.features.map((feature: any) => ({
          id: feature.id,
          name: feature.text,
          coordinates: feature.center as [number, number],
          address: feature.place_name,
        }));

        setSearchResults(formattedResults);
        setShowSearchResults(true);
      }
    } catch (error) {
      console.error('Error searching for location:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle selecting a search result
  const handleSelectSearchResult = (result: {
    name: string;
    coordinates: [number, number];
    address?: string;
  }) => {
    // Move camera to the selected location
    if (camera.current) {
      camera.current.setCamera({
        centerCoordinate: result.coordinates,
        zoomLevel: 15,
        animationDuration: 1000,
      });
    }

    // Clear search
    setSearchQuery(result.name);
    setSearchResults([]);
    setShowSearchResults(false);
    Keyboard.dismiss();

    // Call the callback if provided
    if (onSearchResult) {
      onSearchResult(result);
    }
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowSearchResults(false);
    Keyboard.dismiss();
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

  // Render tags
  const renderTags = () => {
    if (!tags || tags.length === 0) return null;

    return (
      <View style={styles.tagsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tagsScrollViewContent}>
          {tags.map(tag => (
            <Chip
              key={tag.id}
              label={tag.label}
              onPress={tag.onPress}
              onRemove={tag.onRemove}
              color={tag.color || 'light'}
              variant="filled"
              size="large"
              removable={tag.removable}
              leadingIcon={tag.leadingIcon}
            />
          ))}
        </ScrollView>
      </View>
    );
  };

  // Render search bar and results
  const renderSearchBar = () => {
    if (!showSearch) return null;

    return (
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Icon
            name="search"
            size={14}
            color={colors.neutral.grey}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search locations..."
            value={searchQuery}
            onChangeText={handleSearchQueryChange}
            onFocus={() => {
              if (searchResults.length > 0) {
                setShowSearchResults(true);
              }
            }}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              style={styles.clearSearchButton}
              onPress={handleClearSearch}>
              <Icon name="close" size={16} />
            </TouchableOpacity>
          )}
          {isSearching && (
            <ActivityIndicator
              size="small"
              color={colors.primary.main}
              style={styles.searchLoader}
            />
          )}
        </View>

        {showSearchResults && searchResults.length > 0 && (
          <ScrollView
            style={styles.searchResultsContainer}
            bounces={false}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled">
            {searchResults.map(result => (
              <TouchableOpacity
                key={result.id}
                style={styles.searchResultItem}
                onPress={() => handleSelectSearchResult(result)}>
                <Text style={styles.searchResultName}>{result.name}</Text>
                {result.address && (
                  <Text style={styles.searchResultAddress} numberOfLines={1}>
                    {result.address}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
        {showFilterButton && (
          <Button
            variant="primary"
            shape="round"
            size="small"
            iconName="sliders"
            iconSize={16}
            style={styles.filterButton}
            iconColor={colors.neutral.black}
            onPress={onFilterPress || (() => {})}
          />
        )}
      </View>
    );
  };

  return (
    <>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View
          style={[fullscreen ? styles.fullscreen : styles.container, style]}>
          <Mapbox.MapView
            style={styles.map}
            logoEnabled={false}
            attributionEnabled={false}
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

          {/* Search Bar */}
          {renderSearchBar()}

          {/* Tags */}
          {renderTags()}

          {/* Zoom Controls */}
          {showZoomControls && (
            <View style={styles.controlButtonsContainer}>
              <Button
                onPress={handleZoomIn}
                variant="primary"
                shape="round"
                size="small"
                style={styles.zoomButton}
                iconName="plus"
                iconSize={16}
                iconColor={colors.neutral.black}
              />
              <Button
                onPress={handleZoomOut}
                variant="primary"
                shape="round"
                size="small"
                style={styles.zoomButton}
                iconName="minus"
                iconSize={16}
                iconColor={colors.neutral.black}
              />
              {/* Location Button - Combined for all location states */}
              {showUserLocation && (
                <Button
                  onPress={
                    status === 'granted' && userLocation
                      ? handleRecenterToUser
                      : handleReopenOverlay
                  }
                  variant="primary"
                  shape="round"
                  size="small"
                  iconName="user-location"
                  iconSize={20}
                  style={styles.recenterButton}
                />
              )}
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
  controlButtonsContainer: {
    position: 'absolute',
    right: spacing.md,
    top: 230,
    flexDirection: 'column',
    gap: spacing.sm,
  },
  zoomButton: {
    width: 40,
    height: 40,
    backgroundColor: colors.neutral.white,
    ...getShadow('small'),
  },
  recenterButton: {
    width: 40,
    height: 40,
    backgroundColor: colors.neutral.black,
    marginTop: spacing.sm,
    ...getShadow('small'),
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
  searchContainer: {
    position: 'absolute',
    top: spacing.xxxl,
    left: spacing.md,
    right: spacing.md,
    zIndex: 11,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.white,
    borderRadius: radius.round,
    padding: spacing.sm,
    width: '85%',
    ...getShadow('small'),
  },
  filterButton: {
    backgroundColor: colors.neutral.white,
    height: '100%',
    position: 'absolute',
    right: 0,
    top: 0,
    ...getShadow('small'),
  },
  searchInput: {
    flex: 1,
    height: 30,
    paddingHorizontal: spacing.sm,
  },
  searchIcon: {
    marginLeft: spacing.sm,
  },
  clearSearchButton: {
    paddingRight: spacing.md,
  },
  searchLoader: {
    paddingRight: spacing.sm,
  },
  searchResultsContainer: {
    position: 'absolute',
    width: '77%',
    top: spacing.xxl,
    left: spacing.md,
    backgroundColor: colors.neutral.white,
    borderRadius: rs(16),
    maxHeight: rs(300),
    overflow: 'hidden',
  },
  searchResultItem: {
    padding: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.veryLightGrey,
  },
  searchResultName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.neutral.black,
  },
  searchResultAddress: {
    fontSize: 12,
    color: colors.neutral.grey,
    marginTop: spacing.xs,
  },
  tagsContainer: {
    position: 'absolute',
    width: '100%',
    top: 130,
    left: spacing.md,
    zIndex: 10,
    ...getShadow('small'),
  },
  tagsScrollViewContent: {
    gap: spacing.sm,
  },
});
