import React, {useState, useEffect, useCallback, useRef, useMemo} from 'react';
import {StyleSheet, View, Platform} from 'react-native';
import {RNMap, RNMapMarkerItem, MapTabType} from '@components/RNMap';
import {useGetBusinesses} from '@services/business.service';
import {IBusiness, ICreateWarning, ICreateEmergency} from '@motorove/shared';
import {
  useGetWarnings,
  useGetWarning,
  useCreateWarning,
} from '@services/warning.service';
import {
  IconName,
  Button,
  useBottomSheet,
  EmergencyBottomSheet,
  WarningBottomSheet,
  showToast,
  LoadingIndicator,
} from '@components';
import {colors} from '@theme/colors';
import {getWarningIconAndColor} from '@utils/warningUtils';
import Geolocation from '@react-native-community/geolocation';
import {Region} from 'react-native-maps';
import {useTranslation} from '@hooks/useTranslation';
import {navigateToScreen} from '@navigation/utils/navigationHelpers';
import {useNavigation, useRoute} from '@react-navigation/native';
import {
  MainScreenNavigationProp,
  TabScreenRouteProp,
} from '@navigation/types/navigationTypes';
import {MapFilter, MapFilterValues} from '@components/MapFilter';
import {
  useGetEmergencies,
  useGetEmergency,
  useCreateEmergency,
} from '@services/emergency.service';
import {getEmergencyIconAndColor} from '@utils/emergencyUtils';
import {useAuth} from '@contexts';
import {loggingService} from '@services/logging.service';

// Default region (Turkey - Ankara)
const DEFAULT_REGION: Region = {
  latitude: 39.9334,
  longitude: 32.8597,
  latitudeDelta: 0.5,
  longitudeDelta: 0.5,
};

const ZOOM_THRESHOLD_CLOSE = 0.05; // Very zoomed in
const ZOOM_THRESHOLD_FAR = 0.5; // Very zoomed out

export const MapScreen = () => {
  const {t} = useTranslation();
  const {user} = useAuth();
  const navigation =
    useNavigation<MainScreenNavigationProp<'BusinessDetail'>>();
  const route = useRoute<TabScreenRouteProp<'MapTab'>>();
  const [region, setRegion] = useState<Region>(DEFAULT_REGION);
  const [selectedBusinessId, setSelectedBusinessId] = useState<
    string | undefined
  >();
  const [selectedBusiness, setSelectedBusiness] = useState<
    IBusiness | undefined
  >(undefined);
  const [currentRegion, setCurrentRegion] = useState<Region>(DEFAULT_REGION);
  const [mapBounds, setMapBounds] = useState<{
    northEast: {latitude: number; longitude: number};
    southWest: {latitude: number; longitude: number};
  } | null>(null);
  const [showSearchButton, setShowSearchButton] = useState(false);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [filterValues, setFilterValues] = useState<MapFilterValues>({
    categories: [],
    minRating: undefined,
    isOpen: undefined,
    isOpen24h: undefined,
    searchQuery: '',
  });
  const mapRef = useRef<any>(null);
  const isUserInteraction = useRef(false);
  const {openBottomSheet, closeBottomSheet} = useBottomSheet();
  const {createEmergency} = useCreateEmergency();
  const {createWarning} = useCreateWarning();
  const [selectedTab, setSelectedTab] = useState<MapTabType>();

  // Get focused warning/emergency IDs from route params
  const warningId = route.params?.warningId;
  const emergencyId = route.params?.emergencyId;
  // Fetch specific warning if warning ID is provided
  const {warning: focusedWarning, loading: focusedWarningLoading} =
    useGetWarning(warningId);

  // Fetch specific emergency if emergency ID is provided
  const {emergency: focusedEmergency, loading: focusedEmergencyLoading} =
    useGetEmergency(emergencyId || '');

  // Memoize mapBounds to prevent unnecessary re-renders
  const memoizedMapBounds = useMemo(() => mapBounds || undefined, [mapBounds]);

  // Fetch businesses from backend based on map viewport bounds (polygon) and filters
  const {businesses, loading, error, refetch} = useGetBusinesses(
    memoizedMapBounds,
    filterValues,
  );

  // Fetch warnings from backend based on map viewport bounds
  const {warnings, loading: warningsLoading} =
    useGetWarnings(memoizedMapBounds);

  // Fetch emergencies from backend based on map viewport bounds
  const {emergencies, loading: emergenciesLoading} =
    useGetEmergencies(memoizedMapBounds);

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
      return 0.6;
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

        // Store user location for distance calculations
        setUserLocation({latitude, longitude});

        // Update region to user location
        const newRegion: Region = {
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };
        setRegion(newRegion);
        setCurrentRegion(newRegion);

        // Animate to user location
        if (mapRef.current) {
          mapRef.current.animateToRegion(newRegion, 1000);
        }
      },
      () => {
        loggingService;
        showToast({
          text1: t('common.error'),
          text2: t('screens.map.error_getting_location'),
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
    if (!warningId && !emergencyId) {
      getUserLocation();
    }
  }, [getUserLocation, warningId, emergencyId]);

  // Handle focused warning/emergency from route params
  useEffect(() => {
    if (warningId && focusedWarning) {
      // Set warnings tab
      setSelectedTab(MapTabType.WARNINGS);

      // Clear business selection
      setSelectedBusinessId(undefined);
      setSelectedBusiness(undefined);

      // Get warning location from addresses
      const warningAddress = focusedWarning.addresses?.[0];
      if (warningAddress?.latitude && warningAddress?.longitude) {
        const warningRegion: Region = {
          latitude: warningAddress.latitude,
          longitude: warningAddress.longitude,
          latitudeDelta: 0.01, // Close zoom like getUserLocation
          longitudeDelta: 0.01,
        };

        setRegion(warningRegion);
        setCurrentRegion(warningRegion);

        // Animate to warning location
        if (mapRef.current) {
          mapRef.current.animateToRegion(warningRegion, 1000);
        }

        // Set map bounds to trigger data fetch for the area
        const bounds = calculateBounds(warningRegion);
        setMapBounds(bounds);
      }
    } else if (emergencyId && focusedEmergency) {
      // Set emergencies tab
      setSelectedTab(MapTabType.EMERGENCIES);

      // Clear business selection
      setSelectedBusinessId(undefined);
      setSelectedBusiness(undefined);

      // Get emergency location from addresses
      const emergencyAddress = focusedEmergency.addresses?.[0];
      if (emergencyAddress?.latitude && emergencyAddress?.longitude) {
        const emergencyRegion: Region = {
          latitude: emergencyAddress.latitude,
          longitude: emergencyAddress.longitude,
          latitudeDelta: 0.01, // Close zoom like getUserLocation
          longitudeDelta: 0.01,
        };

        setRegion(emergencyRegion);
        setCurrentRegion(emergencyRegion);

        // Animate to emergency location
        if (mapRef.current) {
          mapRef.current.animateToRegion(emergencyRegion, 1000);
        }

        // Set map bounds to trigger data fetch for the area
        const bounds = calculateBounds(emergencyRegion);
        setMapBounds(bounds);
      }
    } else {
      getUserLocation();
    }
  }, [
    warningId,
    focusedWarning,
    emergencyId,
    focusedEmergency,
    calculateBounds,
  ]);

  // Handle "Search This Area" button press
  const handleSearchThisArea = useCallback(() => {
    const bounds = calculateBounds(currentRegion);
    setMapBounds(bounds);
    setShowSearchButton(false);
  }, [currentRegion, calculateBounds]);

  // Convert businesses, warnings, and emergencies to map markers - memoized for performance
  const allMarkers: RNMapMarkerItem[] = useMemo(() => {
    // Business markers
    const businessMarkers: RNMapMarkerItem[] = businesses.map(
      (business, index) => ({
        id: `business-${business.id}`,
        coordinate: {
          latitude: business.addresses[0].latitude,
          longitude: business.addresses[0].longitude,
        },
        business,
        iconName: 'wrench-filled' as IconName,
        pinColor: colors.neutral.black,
        zIndex: selectedBusinessId === business.id ? 1000 : index,
      }),
    );

    // Warning markers
    const warningMarkers: RNMapMarkerItem[] = warnings.map((warning, index) => {
      const {iconName, iconColor, pinColor} = getWarningIconAndColor(
        warning.type,
      );
      const address = warning.addresses?.[0];

      return {
        id: `warning-${warning.id}`,
        coordinate: {
          latitude: address?.latitude || 0,
          longitude: address?.longitude || 0,
        },
        warning,
        iconName,
        iconColor,
        pinColor,
        zIndex: 500 + index, // Warnings above businesses but below selected
      };
    });

    // Emergency markers
    const emergencyMarkers: RNMapMarkerItem[] = emergencies.map(
      (emergency, index) => {
        const {iconName, iconColor, pinColor} = getEmergencyIconAndColor(
          emergency.type,
        );
        const address = emergency.addresses?.[0];

        return {
          id: `emergency-${emergency.id}`,
          coordinate: {
            latitude: address?.latitude || 0,
            longitude: address?.longitude || 0,
          },
          emergency,
          iconName,
          iconColor,
          pinColor,
          zIndex: 600 + index, // Emergencies above warnings (highest priority)
        };
      },
    );

    // Combine and sort by geographic position for consistent display
    const combinedMarkers = [
      ...businessMarkers,
      ...warningMarkers,
      ...emergencyMarkers,
    ].sort((a, b) => {
      if (a.coordinate.latitude !== b.coordinate.latitude) {
        return a.coordinate.latitude - b.coordinate.latitude;
      }
      return a.coordinate.longitude - b.coordinate.longitude;
    });

    return combinedMarkers;
  }, [businesses, warnings, emergencies, selectedBusinessId]);

  // Filter markers based on selected tab
  const markers: RNMapMarkerItem[] = useMemo(() => {
    // If no tab selected or ALL tab selected, show all markers
    if (!selectedTab) {
      return allMarkers;
    }

    switch (selectedTab) {
      case MapTabType.BUSINESSES:
        return allMarkers.filter(marker => marker.business);
      case MapTabType.WARNINGS:
        return allMarkers.filter(marker => marker.warning);
      case MapTabType.EMERGENCIES:
        return allMarkers.filter(marker => marker.emergency);
      default:
        return allMarkers;
    }
  }, [allMarkers, selectedTab]);

  // Handle tab change
  const handleTabChange = useCallback(
    (tab: MapTabType) => {
      // If the same tab is pressed, deselect it
      if (selectedTab === tab) {
        setSelectedTab(undefined);
      } else {
        setSelectedTab(tab);
      }
      // Reset selected business when changing tabs
      setSelectedBusinessId(undefined);
      setSelectedBusiness(undefined);
    },
    [selectedTab],
  );

  const handleBusinessSelect = useCallback((business: IBusiness) => {
    setSelectedBusinessId(business.id);
    setSelectedBusiness(business);
  }, []);

  const handleDetailScreenOpen = useCallback(() => {
    if (!selectedBusiness) {
      return;
    }
    navigateToScreen(navigation, 'BusinessDetail', {
      business: selectedBusiness,
    });
  }, [navigation, selectedBusiness]);

  const handleMarkerPress = useCallback((marker: RNMapMarkerItem) => {
    // Clear all selections first
    setSelectedBusinessId(undefined);
    setSelectedBusiness(undefined);

    // Set the appropriate selection based on marker type
    if (marker.business) {
      setSelectedBusinessId(marker.business.id);
      setSelectedBusiness(marker.business);
    }
    // Note: Warning and emergency selections are now handled internally by RNMap component
  }, []);

  // Handle my location button press
  const handleMyLocationPress = useCallback(() => {
    getUserLocation();
  }, [getUserLocation]);

  // Handle filter button press
  const handleFilterPress = useCallback(() => {
    openBottomSheet({
      content: (
        <MapFilter
          initialValues={filterValues}
          onApply={newFilters => {
            setFilterValues(newFilters);
            // Trigger search with new filters
            if (mapBounds) {
              refetch();
            }
          }}
          onReset={() => {
            setFilterValues({categories: []});
            // Trigger search with cleared filters
            if (mapBounds) {
              refetch();
            }
          }}
          onClose={closeBottomSheet}
        />
      ),
      snapPoint: 'full',
      title: t('screens.map.filter_title'),
      closeButtonPosition: 'top-right',
    });
  }, [filterValues, mapBounds, refetch, openBottomSheet, closeBottomSheet, t]);

  // Handle emergency button press
  const handleEmergencyPress = useCallback(() => {
    openBottomSheet({
      content: (
        <EmergencyBottomSheet
          onSubmit={async (emergency: ICreateEmergency) => {
            const createdEmergency = await createEmergency(emergency);
            if (createdEmergency.id) {
              closeBottomSheet();
            }
          }}
          onClose={closeBottomSheet}
        />
      ),
      snapPoint: 'full',
      title: t('screens.map.emergency_title'),
      closeButtonPosition: 'top-right',
    });
  }, [createEmergency, openBottomSheet, closeBottomSheet, t]);

  // Handle warning button press
  const handleWarningPress = useCallback(() => {
    openBottomSheet({
      content: (
        <WarningBottomSheet
          onSubmit={async (warning: ICreateWarning) => {
            const createdWarning = await createWarning(warning);
            if (createdWarning.id) {
              closeBottomSheet();
            }
          }}
          onClose={closeBottomSheet}
        />
      ),
      snapPoint: 'full',
      title: t('screens.map.warning_title'),
      closeButtonPosition: 'top-right',
    });
  }, [createWarning, openBottomSheet, closeBottomSheet, t]);

  // Handle profile press - navigate to profile screen
  const handleProfilePress = useCallback(
    (userId: string) => {
      if (userId !== user?.id) {
        navigateToScreen(navigation, 'Profile', {userId});
      }
    },
    [navigation, user],
  );

  // Check if filters are active
  const hasActiveFilters = useMemo(() => {
    return (
      filterValues.categories.length > 0 ||
      filterValues.minRating !== undefined ||
      (filterValues.searchQuery && filterValues.searchQuery.trim() !== '') ||
      filterValues.isOpen !== undefined ||
      filterValues.isOpen24h !== undefined
    );
  }, [filterValues]);

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
        onDetailScreenOpen={handleDetailScreenOpen}
        selectedBusinessId={selectedBusinessId}
        mapRef={mapRef}
        style={styles.map}
        onRegionChange={handleRegionChangeComplete}
        showSearchButton={showSearchButton}
        onSearchThisArea={handleSearchThisArea}
        searchButtonLoading={loading}
        userLocation={userLocation || undefined}
        onMyLocationPress={handleMyLocationPress}
        showFilterButton={true}
        onFilterPress={handleFilterPress}
        hasActiveFilters={hasActiveFilters}
        showEmergencyButton={true}
        onEmergencyPress={handleEmergencyPress}
        showWarningButton={true}
        onWarningPress={handleWarningPress}
        selectedTab={selectedTab}
        onTabChange={handleTabChange}
        showTabs={true}
        onProfilePress={handleProfilePress}
      />
      <LoadingIndicator
        visible={
          loading ||
          warningsLoading ||
          emergenciesLoading ||
          focusedWarningLoading ||
          focusedEmergencyLoading
        }
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
