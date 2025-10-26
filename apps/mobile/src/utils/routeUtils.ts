/**
 * Route calculation utilities using OSRM API
 */

import {intervalToDuration, formatDuration} from 'date-fns';
import {tr, enUS} from 'date-fns/locale';
import {Language} from '@motorove/shared';

export interface RouteResult {
  distanceKm: number;
  durationText: string;
  durationSeconds: number;
}

/**
 * Calculate route distance and duration using OSRM API (OpenStreetMap Routing Machine)
 * @param startLat - Starting latitude
 * @param startLng - Starting longitude
 * @param endLat - Destination latitude
 * @param endLng - Destination longitude
 * @param language - Language for duration formatting (default: English)
 * @returns Route information including distance and formatted duration
 * @throws Error if route calculation fails
 */
export const calculateRouteWithOSRM = async (
  startLat: number,
  startLng: number,
  endLat: number,
  endLng: number,
  language: Language = Language.EN,
): Promise<RouteResult> => {
  // Use the OSRM API to calculate route distance and duration
  const url = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=false`;

  const response = await fetch(url);
  const data = await response.json();

  if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
    throw new Error('Route calculation failed');
  }

  const routeData = data.routes[0];
  const distanceKm = Math.round(routeData.distance / 1000); // Convert meters to km
  const durationSeconds = routeData.duration;
  const durationHours = durationSeconds / 3600; // Convert seconds to hours

  // Format duration using date-fns
  const durationMs = durationSeconds * 1000; // Convert seconds to milliseconds
  const duration = intervalToDuration({start: 0, end: durationMs});

  // Get the correct locale based on language setting
  const locale =
    language.toLowerCase() === Language.TR.toLowerCase() ? tr : enUS;

  let durationText: string;
  if (durationHours < 1) {
    // For durations less than 1 hour, display minutes only
    durationText = formatDuration(
      {minutes: duration.minutes || 0},
      {
        format: ['minutes'],
        locale: locale,
      },
    );
    if (!durationText && duration.seconds) {
      // If less than a minute, use localized version of '1 minute'
      durationText = formatDuration(
        {minutes: 1},
        {format: ['minutes'], locale: locale},
      );
    }
  } else {
    // For longer durations, display hours and minutes
    durationText = formatDuration(
      {hours: duration.hours || 0, minutes: duration.minutes || 0},
      {
        format: ['hours', 'minutes'],
        delimiter: ' ',
        locale: locale,
      },
    );
  }

  return {
    distanceKm,
    durationText,
    durationSeconds,
  };
};

/**
 * Format route information as a display string
 * @param distanceKm - Distance in kilometers
 * @param durationText - Formatted duration text
 * @returns Formatted route info string (e.g., "15 km • 20 minutes")
 */
export const formatRouteInfo = (
  distanceKm: number,
  durationText: string,
): string => {
  return `${distanceKm} km • ${durationText}`;
};
