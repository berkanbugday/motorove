import React, {useState, useEffect, useCallback, useRef, useMemo} from 'react';
import {StyleSheet, View, Platform} from 'react-native';
import {RNMap, RNMapMarkerItem} from '@components/RNMap';
import {useGetBusinesses} from '@services/business.service';
import {IBusiness} from '@motorove/shared';
import {colors} from '@theme/colors';
import Geolocation from '@react-native-community/geolocation';
import {Region} from 'react-native-maps';
import {Button} from '@components/Button';
import {useTranslation} from '@hooks/useTranslation';
import {showToast} from '@components/ToastMessage';

// Default region (Turkey - Ankara)
const DEFAULT_REGION: Region = {
  latitude: 39.9334,
  longitude: 32.8597,
  latitudeDelta: 0.5,
  longitudeDelta: 0.5,
};

// Zoom-based bounds calculation thresholds
// When zoomed in (small delta), search wider area
// When zoomed out (large delta), search focused center area
const ZOOM_THRESHOLD_CLOSE = 0.05; // Very zoomed in
const ZOOM_THRESHOLD_FAR = 0.5; // Very zoomed out

/**
 * MapScreen Component
 * Displays businesses on an interactive map with animated markers
 *
 * Features:
 * - Business markers from backend service
 * - User location detection
 * - Animated region transitions
 * - Business detail cards
 * - Real-time business data
 * - Dynamic search area based on zoom level
 */
export const MapScreen = () => {
  const {t} = useTranslation();
  const [region, setRegion] = useState<Region>(DEFAULT_REGION);
  const [selectedBusinessId, setSelectedBusinessId] = useState<
    string | undefined
  >();
  const [currentRegion, setCurrentRegion] = useState<Region>(DEFAULT_REGION);
  const [mapBounds, setMapBounds] = useState<{
    northEast: {latitude: number; longitude: number};
    southWest: {latitude: number; longitude: number};
  } | null>(null);
  const [showSearchButton, setShowSearchButton] = useState(false);
  const [displayedBusinesses, setDisplayedBusinesses] = useState<IBusiness[]>(
    [],
  );
  const mapRef = useRef<any>(null);
  const isUserInteraction = useRef(false);

  // Fetch businesses from backend based on map viewport bounds (polygon)
  const {businesses, loading, error, refetch} = useGetBusinesses(
    mapBounds || undefined,
  );

  // Update displayed businesses only when new data arrives
  useEffect(() => {
    if (businesses.length > 0) {
      setDisplayedBusinesses(businesses);
    }
  }, [businesses]);

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = useCallback(
    (lat1: number, lon1: number, lat2: number, lon2: number): number => {
      const R = 6371; // Earth's radius in km
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLon = ((lon2 - lon1) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    },
    [],
  );

  // Calculate dynamic bounds factor based on zoom level
  const calculateBoundsFactor = useCallback((delta: number): number => {
    // When very zoomed in (delta < 0.05), use 0.4 (80% of visible area)
    if (delta < ZOOM_THRESHOLD_CLOSE) {
      return 0.4;
    }
    // When very zoomed out (delta > 0.5), use 0.15 (30% of visible area)
    if (delta > ZOOM_THRESHOLD_FAR) {
      return 0.15;
    }
    // Linear interpolation between 0.4 and 0.15 based on zoom level
    // More zoomed in = larger factor, more zoomed out = smaller factor
    const range = ZOOM_THRESHOLD_FAR - ZOOM_THRESHOLD_CLOSE;
    const position = (delta - ZOOM_THRESHOLD_CLOSE) / range;
    return 0.4 - position * 0.25; // 0.4 to 0.15
  }, []);

  // Calculate map bounds from region - dynamic based on zoom level
  const calculateBounds = useCallback(
    (reg: Region) => {
      const {latitude, longitude, latitudeDelta, longitudeDelta} = reg;
      // Use average of lat/lon deltas for factor calculation
      const avgDelta = (latitudeDelta + longitudeDelta) / 2;
      const factor = calculateBoundsFactor(avgDelta);

      return {
        northEast: {
          latitude: latitude + latitudeDelta * factor,
          longitude: longitude + longitudeDelta * factor,
        },
        southWest: {
          latitude: latitude - latitudeDelta * factor,
          longitude: longitude - longitudeDelta * factor,
        },
      };
    },
    [calculateBoundsFactor],
  );

  // Track map region changes to show "Search This Area" button
  const handleRegionChangeComplete = useCallback(
    (newRegion: Region, isUserInitiated: boolean) => {
      setCurrentRegion(newRegion);
      isUserInteraction.current = isUserInitiated;

      // Show search button if user has moved the map significantly
      if (mapBounds) {
        // Calculate factor based on current zoom level
        const avgDelta =
          (newRegion.latitudeDelta + newRegion.longitudeDelta) / 2;
        const factor = calculateBoundsFactor(avgDelta);

        const distance = calculateDistance(
          mapBounds.northEast.latitude,
          mapBounds.northEast.longitude,
          newRegion.latitude + newRegion.latitudeDelta * factor,
          newRegion.longitude + newRegion.longitudeDelta * factor,
        );
        // Show button if moved more than 1km
        setShowSearchButton(distance > 1);
      } else {
        // Show button on initial load (no search performed yet)
        setShowSearchButton(true);
      }
    },
    [mapBounds, calculateDistance, calculateBoundsFactor],
  );

  const getUserLocation = useCallback(() => {
    Geolocation.getCurrentPosition(
      position => {
        const {latitude, longitude} = position.coords;

        // Update region to user location
        const newRegion: Region = {
          latitude,
          longitude,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        };
        setRegion(newRegion);
        setCurrentRegion(newRegion);

        // Animate to user location
        if (mapRef.current) {
          mapRef.current.animateToRegion(newRegion, 1000);
        }
      },
      err => {
        console.error('Error getting user location:', err);
        showToast({
          text1: t('common.error'),
          text2: t('screens.map.errorGettingLocation'),
          type: 'error',
        });
      },
      {
        enableHighAccuracy: Platform.OS === 'ios',
        timeout: 15000,
        maximumAge: 10000,
      },
    );
  }, [t]);

  // Get user location on mount
  useEffect(() => {
    getUserLocation();
  }, [getUserLocation]);

  // Handle "Search This Area" button press
  const handleSearchThisArea = useCallback(() => {
    const bounds = calculateBounds(currentRegion);
    console.log('Searching area with bounds:', bounds);
    setMapBounds(bounds);
    setShowSearchButton(false);
  }, [currentRegion, calculateBounds]);

  // Convert businesses to map markers - memoized for performance
  // Sort by geographic position (lat, long) for consistent display
  // Use displayedBusinesses to prevent map clearing while loading new data
  const markers: RNMapMarkerItem[] = useMemo(() => {
    const sorted = [...displayedBusinesses].sort((a, b) => {
      // Sort by latitude first, then longitude
      if (a.address.latitude !== b.address.latitude) {
        return a.address.latitude - b.address.latitude;
      }
      return a.address.longitude - b.address.longitude;
    });

    return sorted.map((business, index) => ({
      id: business.id,
      coordinate: {
        latitude: business.address.latitude,
        longitude: business.address.longitude,
      },
      business,
      pinColor: colors.neutral.black,
      zIndex: selectedBusinessId === business.id ? 1000 : index,
    }));
  }, [displayedBusinesses, selectedBusinessId]);

  const handleBusinessSelect = useCallback((business: IBusiness) => {
    setSelectedBusinessId(business.id);
    // You can navigate to business detail screen here
    console.log('Selected business:', business.name);
  }, []);

  const handleMarkerPress = useCallback((marker: RNMapMarkerItem) => {
    if (marker.business) {
      setSelectedBusinessId(marker.business.id);
    }
  }, []);

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Button
          title={t('common.try_again')}
          onPress={refetch}
          variant="primary"
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <RNMap
        initialRegion={region}
        markers={markers}
        showUserLocation={true}
        onMarkerPress={handleMarkerPress}
        onBusinessSelect={handleBusinessSelect}
        selectedBusinessId={selectedBusinessId}
        mapRef={mapRef}
        style={styles.map}
        onRegionChange={handleRegionChangeComplete}
        showSearchButton={showSearchButton}
        onSearchThisArea={handleSearchThisArea}
        searchButtonLoading={loading}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.white,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  map: {
    flex: 1,
  },
});
