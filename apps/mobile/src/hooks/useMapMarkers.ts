import {useEffect, useState, useMemo, useCallback} from 'react';
import {MapMarker} from '@components/MapView';

export interface MapMarkerHookProps {
  markers: MapMarker[];
  mapCenter: [number, number];
  dynamicRadiusKm: number;
  maxVisibleMarkers?: number;
}

// Constants outside component to avoid recreating on each render
const EARTH_RADIUS_KM = 6371;
const DEG_TO_RAD = Math.PI / 180;

export const useMapMarkers = ({
  markers = [],
  mapCenter,
  dynamicRadiusKm,
  maxVisibleMarkers = 1000,
}: MapMarkerHookProps) => {
  const [visibleMarkers, setVisibleMarkers] = useState<MapMarker[]>([]);

  // Memoize marker IDs for change detection
  const markerIds = useMemo(
    () => markers.map(marker => marker.id).join(','),
    [markers],
  );

  // Optimized distance calculation using haversine formula
  const calculateDistance = useCallback(
    (point1: [number, number], point2: [number, number]): number => {
      const [lon1, lat1] = point1;
      const [lon2, lat2] = point2;

      // Pre-calculate trigonometric values to avoid repeated calculations
      const latRad1 = lat1 * DEG_TO_RAD;
      const latRad2 = lat2 * DEG_TO_RAD;
      const deltaLat = (lat2 - lat1) * DEG_TO_RAD;
      const deltaLon = (lon2 - lon1) * DEG_TO_RAD;

      // Haversine formula
      const a =
        Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
        Math.cos(latRad1) *
          Math.cos(latRad2) *
          Math.sin(deltaLon / 2) *
          Math.sin(deltaLon / 2);

      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

      return EARTH_RADIUS_KM * c;
    },
    [],
  );

  // Filter markers based on distance from map center
  useEffect(() => {
    if (!mapCenter || !markers.length) {
      setVisibleMarkers([]);
      return;
    }

    // Use web worker or requestIdleCallback for better performance in large datasets
    const filterMarkers = () => {
      // Square of radius for faster comparison (avoid sqrt operations)
      const radius = dynamicRadiusKm;

      // Only process markers if we have valid inputs
      const filteredMarkers = markers.filter(
        marker => calculateDistance(mapCenter, marker.coordinates) <= radius,
      );

      // Limit markers and set state
      const limitedMarkers =
        filteredMarkers.length > maxVisibleMarkers
          ? filteredMarkers.slice(0, maxVisibleMarkers)
          : filteredMarkers;

      setVisibleMarkers(limitedMarkers);
    };

    // Use requestAnimationFrame to avoid blocking the main thread
    // when processing large numbers of markers
    requestAnimationFrame(filterMarkers);
  }, [
    mapCenter,
    markerIds,
    dynamicRadiusKm,
    maxVisibleMarkers,
    calculateDistance,
  ]);

  // Memoize visible markers to prevent unnecessary re-renders
  const memoizedVisibleMarkers = useMemo(
    () => visibleMarkers,
    [visibleMarkers],
  );

  return {
    visibleMarkers: memoizedVisibleMarkers,
    calculateDistance,
  };
};
