import {useCallback, useRef, useState, useMemo, RefObject} from 'react';
import MapView, {Region} from 'react-native-maps';

export interface MapStateHookProps {
  initialCoordinates?: {
    latitude: number;
    longitude: number;
  };
  initialZoom?: number;
  mapRef?: RefObject<MapView>;
}

export const useMapState = ({
  initialCoordinates = {latitude: 37.78825, longitude: -122.4324},
  initialZoom = 14,
  mapRef,
}: MapStateHookProps = {}) => {
  // If no external mapRef is provided, create an internal one
  const internalMapRef = useRef<MapView>(null);
  const activeMapRef = mapRef || internalMapRef;

  const [currentZoom, setCurrentZoom] = useState(initialZoom);

  // Map center state
  const [mapCenter, setMapCenter] = useState<[number, number]>([
    initialCoordinates.longitude,
    initialCoordinates.latitude,
  ]);

  // Calculate dynamic marker radius based on zoom level
  const getDynamicMarkerRadius = useCallback((zoom: number): number => {
    // Zoom levels typically range from 0 (entire world) to 22 (building details)
    if (zoom <= 4) {
      return 100; // Very zoomed out (country level)
    }
    if (zoom <= 6) {
      return 75; // Continent/large country level
    }
    if (zoom <= 8) {
      return 50; // Region level
    }
    if (zoom <= 10) {
      return 25; // City level
    }
    if (zoom <= 12) {
      return 10; // Neighborhood level
    }
    return 5; // Very zoomed in
  }, []);

  // Current dynamic radius - memoized based on current zoom
  const dynamicRadiusKm = useMemo(
    () => getDynamicMarkerRadius(currentZoom),
    [currentZoom, getDynamicMarkerRadius],
  );

  // Refresh map state (center and zoom) - optimized with request animation frame
  const refreshMapState = useCallback(() => {
    if (!activeMapRef.current) {
      return;
    }

    // Use requestAnimationFrame to avoid layout thrashing
    requestAnimationFrame(() => {
      const region = activeMapRef.current?.props.region;
      if (region) {
        setMapCenter([region.longitude, region.latitude]);
        // Convert latitudeDelta to zoom level
        const zoom = Math.round(Math.log2(360 / region.latitudeDelta));
        setCurrentZoom(zoom);
      }
    });
  }, [activeMapRef]);

  // Handle zoom in - memoized to avoid recreating on each render
  const handleZoomIn = useCallback(() => {
    if (!activeMapRef.current) {
      return;
    }

    const newZoom = Math.min(currentZoom + 1, 20);
    setCurrentZoom(newZoom);
    const region = activeMapRef.current.props.region;
    if (region) {
      const newLatitudeDelta = 360 / Math.pow(2, newZoom);
      const newLongitudeDelta =
        newLatitudeDelta * (region.longitudeDelta / region.latitudeDelta);
      const newRegion: Region = {
        latitude: region.latitude,
        longitude: region.longitude,
        latitudeDelta: newLatitudeDelta,
        longitudeDelta: newLongitudeDelta,
      };
      activeMapRef.current.animateToRegion(newRegion, 300);
    }
  }, [currentZoom, activeMapRef]);

  // Handle zoom out - memoized to avoid recreating on each render
  const handleZoomOut = useCallback(() => {
    if (!activeMapRef.current) {
      return;
    }

    const newZoom = Math.max(currentZoom - 1, 1);
    setCurrentZoom(newZoom);
    const region = activeMapRef.current.props.region;
    if (region) {
      const newLatitudeDelta = 360 / Math.pow(2, newZoom);
      const newLongitudeDelta =
        newLatitudeDelta * (region.longitudeDelta / region.latitudeDelta);
      const newRegion: Region = {
        latitude: region.latitude,
        longitude: region.longitude,
        latitudeDelta: newLatitudeDelta,
        longitudeDelta: newLongitudeDelta,
      };
      activeMapRef.current.animateToRegion(newRegion, 300);
    }
  }, [currentZoom, activeMapRef]);

  // Memoized setter for map center to avoid recreating the function
  const setMapCenterMemoized = useCallback((center: [number, number]) => {
    setMapCenter(center);
  }, []);

  return {
    mapRef: activeMapRef,
    currentZoom,
    mapCenter,
    dynamicRadiusKm,
    refreshMapState,
    handleZoomIn,
    handleZoomOut,
    setMapCenter: setMapCenterMemoized,
  };
};
