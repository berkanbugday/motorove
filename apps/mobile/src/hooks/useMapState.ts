import {useCallback, useRef, useState, useMemo} from 'react';
import Mapbox from '@rnmapbox/maps';

export interface MapStateHookProps {
  initialCoordinates?: {
    latitude: number;
    longitude: number;
  };
  initialZoom?: number;
}

export const useMapState = ({
  initialCoordinates = {latitude: 37.78825, longitude: -122.4324},
  initialZoom = 14,
}: MapStateHookProps = {}) => {
  const mapRef = useRef<Mapbox.MapView>(null);
  const camera = useRef<Mapbox.Camera>(null);
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
      return 50; // Continent/large country level
    }
    if (zoom <= 8) {
      return 25; // Region level
    }
    if (zoom <= 10) {
      return 10; // City level
    }
    if (zoom <= 12) {
      return 5; // Neighborhood level
    }
    return 2; // Very zoomed in
  }, []);

  // Current dynamic radius - memoized based on current zoom
  const dynamicRadiusKm = useMemo(
    () => getDynamicMarkerRadius(currentZoom),
    [currentZoom, getDynamicMarkerRadius],
  );

  // Refresh map state (center and zoom) - optimized with request animation frame
  const refreshMapState = useCallback(() => {
    if (!mapRef.current) {
      return;
    }

    // Use requestAnimationFrame to avoid layout thrashing
    requestAnimationFrame(() => {
      Promise.all([mapRef.current?.getCenter(), mapRef.current?.getZoom()])
        .then(([center, zoom]) => {
          if (center) {
            setMapCenter(center as [number, number]);
          }

          if (zoom) {
            const newZoom = zoom as number;
            setCurrentZoom(newZoom);
          }
        })
        .catch(err => {
          console.warn('Error updating map state:', err);
        });
    });
  }, []);

  // Handle zoom in - memoized to avoid recreating on each render
  const handleZoomIn = useCallback(() => {
    if (camera.current) {
      const newZoom = Math.min(currentZoom + 1, 20);
      setCurrentZoom(newZoom);
      camera.current.setCamera({
        zoomLevel: newZoom,
        animationDuration: 300,
      });
    }
  }, [currentZoom]);

  // Handle zoom out - memoized to avoid recreating on each render
  const handleZoomOut = useCallback(() => {
    if (camera.current) {
      const newZoom = Math.max(currentZoom - 1, 1);
      setCurrentZoom(newZoom);
      camera.current.setCamera({
        zoomLevel: newZoom,
        animationDuration: 300,
      });
    }
  }, [currentZoom]);

  // Memoized setter for map center to avoid recreating the function
  const setMapCenterMemoized = useCallback((center: [number, number]) => {
    setMapCenter(center);
  }, []);

  return {
    mapRef,
    camera,
    currentZoom,
    mapCenter,
    dynamicRadiusKm,
    refreshMapState,
    handleZoomIn,
    handleZoomOut,
    setMapCenter: setMapCenterMemoized,
  };
};
