/**
 * Location and route utility functions
 */

import { intervalToDuration, formatDuration } from "date-fns";
import { tr, enUS } from "date-fns/locale";
import { Language } from "../enums";

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface RouteResult {
  distanceKm: number;
  durationText: string;
  durationSeconds: number;
}

/**
 * Calculate the distance between two geographic coordinates using the Haversine formula
 * @param from - Starting coordinates
 * @param to - Destination coordinates
 * @returns Distance in kilometers, rounded to 1 decimal place
 */
export const calculateDistance = (
  from: Coordinates,
  to: Coordinates
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
  unit: string = "km"
): string => {
  return `${distanceKm.toFixed(1)} ${unit}`;
};

/**
 * Calculate route distance and duration using Google Maps Routes API (v2)
 * @param startLat - Starting latitude
 * @param startLng - Starting longitude
 * @param endLat - Destination latitude
 * @param endLng - Destination longitude
 * @param language - Language for duration formatting (default: Turkish)
 * @returns Route information including distance and formatted duration
 * @throws Error if route calculation fails
 */
export const calculateRoute = async (
  apiKey: string,
  startLat: number,
  startLng: number,
  endLat: number,
  endLng: number,
  language: Language = Language.TR
): Promise<RouteResult> => {
  // Use Google Maps Routes API (v2) to calculate route distance and duration
  const url = "https://routes.googleapis.com/directions/v2:computeRoutes";

  const requestBody = {
    origin: {
      location: {
        latLng: {
          latitude: startLat,
          longitude: startLng,
        },
      },
    },
    destination: {
      location: {
        latLng: {
          latitude: endLat,
          longitude: endLng,
        },
      },
    },
    travelMode: "DRIVE",
    routingPreference: "TRAFFIC_AWARE",
    computeAlternativeRoutes: false,
    languageCode: language.toLowerCase(),
    units: "METRIC",
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask":
        "routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline",
    },
    body: JSON.stringify(requestBody),
  });

  const data = await response.json();

  if (!data.routes || data.routes.length === 0) {
    throw new Error(
      `Route calculation failed: ${data.error?.message || "No routes found"}`
    );
  }

  const route = data.routes[0];
  const distanceKm = Math.round(route.distanceMeters / 1000); // Convert meters to km
  const durationSeconds = parseInt(route.duration.replace("s", ""), 10); // Parse duration string (e.g., "1234s")
  const durationHours = durationSeconds / 3600; // Convert seconds to hours

  // Format duration using date-fns
  const durationMs = durationSeconds * 1000; // Convert seconds to milliseconds
  const duration = intervalToDuration({ start: 0, end: durationMs });

  // Get the correct locale based on language setting
  const locale =
    language.toLowerCase() === Language.TR.toLowerCase() ? tr : enUS;

  let durationText: string;
  if (durationHours < 1) {
    // For durations less than 1 hour, display minutes only
    durationText = formatDuration(
      { minutes: duration.minutes || 0 },
      {
        format: ["minutes"],
        locale: locale,
      }
    );
    if (!durationText && duration.seconds) {
      // If less than a minute, use localized version of '1 minute'
      durationText = formatDuration(
        { minutes: 1 },
        { format: ["minutes"], locale: locale }
      );
    }
  } else {
    // For longer durations, display hours and minutes
    durationText = formatDuration(
      { hours: duration.hours || 0, minutes: duration.minutes || 0 },
      {
        format: ["hours", "minutes"],
        delimiter: " ",
        locale: locale,
      }
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
  durationText: string
): string => {
  return `${distanceKm} km • ${durationText}`;
};
