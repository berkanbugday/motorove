import {IconName} from '@components/Icon';
import {MapMarker} from '@components/MapView';
import {colors} from '@theme/colors';

// Define Turkey mainland regions as polygons to avoid sea
// These are simplified polygons representing the main land areas of Turkey
const TURKEY_MAINLAND = [
  // Central Anatolia
  {
    minLat: 38.0,
    maxLat: 40.5,
    minLong: 31.0,
    maxLong: 36.0,
    name: 'Central Anatolia',
  },
  // Eastern Anatolia
  {
    minLat: 38.0,
    maxLat: 41.0,
    minLong: 36.0,
    maxLong: 44.0,
    name: 'Eastern Anatolia',
  },
  // Western Turkey
  {
    minLat: 37.0,
    maxLat: 41.5,
    minLong: 26.5,
    maxLong: 31.0,
    name: 'Western Turkey',
  },
  // Black Sea Region
  {
    minLat: 40.5,
    maxLat: 42.0,
    minLong: 31.0,
    maxLong: 42.0,
    name: 'Black Sea',
  },
  // Mediterranean Region
  {
    minLat: 36.0,
    maxLat: 38.0,
    minLong: 28.0,
    maxLong: 36.5,
    name: 'Mediterranean',
  },
  // Southeastern Anatolia
  {
    minLat: 36.5,
    maxLat: 38.0,
    minLong: 36.5,
    maxLong: 43.0,
    name: 'Southeastern Anatolia',
  },
];

// Istanbul area defined separately
const ISTANBUL_REGION = {
  minLat: 40.8,
  maxLat: 41.2,
  minLong: 28.5,
  maxLong: 29.5,
  name: 'Istanbul',
};

// Icons to use for markers
const MARKER_ICONS: IconName[] = ['wrench-filled', 'shop', 'droplet'];

// Colors to use for markers
const MARKER_COLORS: string[] = [colors.status.success, colors.status.info];

// Generate random coordinates within Istanbul area
const generateIstanbulCoordinates = (): [number, number] => {
  // Generate coordinates within Istanbul bounds
  const lat =
    ISTANBUL_REGION.minLat +
    Math.random() * (ISTANBUL_REGION.maxLat - ISTANBUL_REGION.minLat);
  const long =
    ISTANBUL_REGION.minLong +
    Math.random() * (ISTANBUL_REGION.maxLong - ISTANBUL_REGION.minLong);

  return [long, lat];
};

// Generate random coordinates within Turkey mainland
const generateTurkeyCoordinates = (): [number, number] => {
  // Pick a random region
  const region =
    TURKEY_MAINLAND[Math.floor(Math.random() * TURKEY_MAINLAND.length)];

  // Generate coordinates within that region
  const lat = region.minLat + Math.random() * (region.maxLat - region.minLat);
  const long =
    region.minLong + Math.random() * (region.maxLong - region.minLong);

  return [long, lat];
};

// Generate 100 random markers across Turkey mainland
export const turkeyMarkers: MapMarker[] = Array.from({length: 100}, (_, i) => {
  // Generate mainland coordinates
  const [longitude, latitude] = generateTurkeyCoordinates();

  // Pick a random icon and color
  const icon = MARKER_ICONS[Math.floor(Math.random() * MARKER_ICONS.length)];
  const color =
    icon === 'wrench-filled'
      ? colors.primary.main
      : icon === 'shop'
      ? colors.status.info
      : colors.status.success;

  return {
    id: `turkey-marker-${i + 1}`,
    coordinates: [longitude, latitude] as [number, number],
    icon,
    color,
    onPress: () => console.log(`Turkey marker ${i + 1} pressed`),
  };
});

// Generate 300 additional markers specifically in Istanbul
const istanbulMarkers: MapMarker[] = Array.from({length: 300}, (_, i) => {
  // Get coordinates within Istanbul
  const coordinates = generateIstanbulCoordinates();

  // Pick a random icon and color
  const icon = MARKER_ICONS[Math.floor(Math.random() * MARKER_ICONS.length)];
  const color =
    icon === 'wrench-filled'
      ? colors.primary.main
      : icon === 'shop'
      ? colors.status.info
      : colors.status.success;

  return {
    id: `istanbul-marker-${i + 1}`,
    coordinates,
    icon,
    color,
    onPress: () => console.log(`Istanbul marker ${i + 1} pressed`),
  };
});

// Combine the markers
export const allMarkers: MapMarker[] = [...turkeyMarkers, ...istanbulMarkers];

// Export some marker categories for potential filtering
export const repairMarkers = allMarkers.filter(
  marker => marker.icon === 'wrench-filled',
);

export const shopMarkers = allMarkers.filter(marker => marker.icon === 'shop');

export const washingMarkers = allMarkers.filter(
  marker => marker.icon === 'droplet',
);
