/**
 * Location utility functions
 */

export interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Calculate the distance between two geographic coordinates using the Haversine formula
 * @param from - Starting coordinates
 * @param to - Destination coordinates
 * @returns Distance in kilometers, rounded to 1 decimal place
 */
export const calculateDistance = (
  from: Coordinates,
  to: Coordinates,
): number => {
  const R = 6371; // Earth's radius in km
  const dLat = ((to.latitude - from.latitude) * Math.PI) / 180;
  const dLon = ((to.longitude - from.longitude) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((from.latitude * Math.PI) / 180) *
      Math.cos((to.latitude * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return parseFloat(d.toFixed(1));
};

/**
 * Format distance with unit
 * @param distanceKm - Distance in kilometers
 * @param unit - Unit to display (default: 'km')
 * @returns Formatted distance string
 */
export const formatDistance = (
  distanceKm: number,
  unit: string = 'km',
): string => {
  return `${distanceKm.toFixed(1)} ${unit}`;
};
