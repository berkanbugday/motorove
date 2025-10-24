import {useCallback} from 'react';
import {Region} from 'react-native-maps';
import {RNMapMarkerItem} from '@components/RNMap/types';
import {Dimensions} from 'react-native';

const screen = Dimensions.get('window');
const ASPECT_RATIO = screen.width / screen.height;
const LATITUDE_DELTA = 0.03;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

/**
 * Custom hook for animated map region
 * Simplified version that focuses on marker-based region updates
 *
 * Features:
 * - Returns region for selected marker
 * - Smooth transitions between markers
 * - Simple and maintainable
 */
export const useAnimatedRegion = (
  initialRegion: Region,
  displayedMarkers: RNMapMarkerItem[],
) => {
  /**
   * Get region for a specific marker index
   */
  const getRegionForIndex = useCallback(
    (index: number): Region => {
      if (index < 0 || index >= displayedMarkers.length) {
        return initialRegion;
      }

      const marker = displayedMarkers[index];
      return {
        latitude: marker.coordinate.latitude,
        longitude: marker.coordinate.longitude,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      };
    },
    [displayedMarkers, initialRegion],
  );

  return {
    getRegionForIndex,
    LATITUDE_DELTA,
    LONGITUDE_DELTA,
  };
};
