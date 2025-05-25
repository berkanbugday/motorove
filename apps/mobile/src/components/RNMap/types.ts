import {ViewStyle} from 'react-native';
import {Region, LatLng, MapStyleElement} from 'react-native-maps';
import MapView from 'react-native-maps';

/**
 * Type definition for map markers
 */
export interface RNMapMarkerType {
  id: string | number;
  coordinate: LatLng;
  pinColor?: string;
  image?: any;
  imageSelected?: any;
  icon?: any;
  opacity?: number;
  zIndex?: number;
  rotation?: number;
  metadata?: any;
}

/**
 * Type definition for polylines
 */
export interface RNMapPolyline {
  id: string | number;
  coordinates: LatLng[];
  strokeWidth?: number;
  strokeColor?: string;
  lineCap?: 'butt' | 'round' | 'square';
  lineJoin?: 'miter' | 'round' | 'bevel';
  geodesic?: boolean;
  lineDashPattern?: number[];
}

/**
 * Type definition for circles
 */
export interface RNMapCircle {
  id: string | number;
  center: LatLng;
  radius: number;
  fillColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
}

/**
 * Type definition for search results
 */
export interface RNMapSearchResult {
  id: string;
  name: string;
  description?: string;
  location?: LatLng;
  address?: string;
  metadata?: any;
}

/**
 * Type definition for map tags
 */
export interface RNMapTag {
  id: string;
  name: string;
  isActive?: boolean;
  color?: string;
  onPress?: () => void;
}

/**
 * Props for the RNMap component
 */
export interface RNMapProps {
  /**
   * Initial region of the map
   */
  initialRegion?: Region;

  /**
   * Show user's location on the map
   */
  showUserLocation?: boolean;

  /**
   * Map follows user's location automatically
   */
  followUserLocation?: boolean;

  /**
   * Map type (standard, satellite, hybrid, terrain)
   */
  mapType?: 'standard' | 'satellite' | 'hybrid' | 'terrain';

  /**
   * Markers to display on the map
   */
  markers?: RNMapMarkerType[];

  /**
   * Polylines to display on the map
   */
  polylines?: RNMapPolyline[];

  /**
   * Circles to display on the map
   */
  circles?: RNMapCircle[];

  /**
   * Custom map style (GeoJSON)
   */
  customMapStyle?: MapStyleElement[];

  /**
   * Callback when map region changes
   */
  onRegionChange?: (region: Region) => void;

  /**
   * Callback when map region change completes
   */
  onRegionChangeComplete?: (region: Region) => void;

  /**
   * Callback when map is pressed
   */
  onPress?: (event: any) => void;

  /**
   * Callback when map is long pressed
   */
  onLongPress?: (event: any) => void;

  /**
   * Callback when marker is pressed
   */
  onMarkerSelect?: (marker: RNMapMarkerType) => void;

  /**
   * Maximum zoom level
   */
  maxZoomLevel?: number;

  /**
   * Minimum zoom level
   */
  minZoomLevel?: number;

  /**
   * Show compass
   */
  showCompass?: boolean;

  /**
   * Show scale
   */
  showScale?: boolean;

  /**
   * Show indoor maps
   */
  showIndoors?: boolean;

  /**
   * Enable zooming
   */
  zoomEnabled?: boolean;

  /**
   * Enable zoom controls
   */
  zoomControlEnabled?: boolean;

  /**
   * Enable rotation
   */
  rotateEnabled?: boolean;

  /**
   * Enable scrolling
   */
  scrollEnabled?: boolean;

  /**
   * Enable pitch
   */
  pitchEnabled?: boolean;

  /**
   * Enable toolbar
   */
  toolbarEnabled?: boolean;

  /**
   * Show buildings
   */
  showsBuildings?: boolean;

  /**
   * Custom style for container
   */
  style?: ViewStyle;

  /**
   * Enable marker clustering
   */
  clusteringEnabled?: boolean;

  /**
   * Radius for clustering markers
   */
  clusteringRadius?: number;

  /**
   * Show loading indicator
   */
  loadingIndicator?: boolean;

  /**
   * Color of the loading indicator
   */
  loadingIndicatorColor?: string;

  /**
   * Show search bar
   */
  showSearchBar?: boolean;

  /**
   * Callback when search result is selected
   */
  onSearchResultSelect?: (result: RNMapSearchResult) => void;

  /**
   * Tags to display above the map
   */
  tags?: RNMapTag[];

  /**
   * Radius in kilometers to show markers around map center
   */
  markerRadiusKm?: number;

  /**
   * Max number of markers to render at once
   */
  maxVisibleMarkers?: number;

  /**
   * Show load marker button
   */
  showLoadMarkerButton?: boolean;

  /**
   * Callback when load marker button is pressed
   */
  onLoadMarkerPress?: () => void;

  /**
   * Children components to render on top of the map
   */
  children?: React.ReactNode;
}

/**
 * Props for the RNMapMarker component
 */
export interface RNMapMarkerProps {
  /**
   * Marker data
   */
  marker: RNMapMarkerType;

  /**
   * Callback when marker is pressed
   */
  onSelect?: () => void;

  /**
   * Reference to the map component
   */
  mapRef?: React.RefObject<MapView | null>;
}

/**
 * Props for the RNMapControls component
 */
export interface RNMapControlsProps {
  /**
   * Callback when zoom in button is pressed
   */
  onZoomIn?: () => void;

  /**
   * Callback when zoom out button is pressed
   */
  onZoomOut?: () => void;

  /**
   * Callback to center map on user location
   */
  onCenterUser?: () => void;

  /**
   * Whether user location is available
   */
  userLocationAvailable?: boolean;

  /**
   * Callback to reopen the location permission overlay
   */
  onReopenOverlay?: () => void;
}

/**
 * Props for the RNMapSearch component
 */
export interface RNMapSearchProps {
  /**
   * Callback when a search result is selected
   */
  onResultSelect?: (result: RNMapSearchResult) => void;

  /**
   * Callback when search starts
   */
  onSearchStart?: () => void;

  /**
   * Callback when search ends
   */
  onSearchEnd?: () => void;

  /**
   * Placeholder text for search input
   */
  placeholder?: string;

  /**
   * Debounce time in milliseconds
   */
  debounceMs?: number;

  /**
   * Whether to show the filter component
   */
  showFilter?: boolean;
}

/**
 * Props for the RNMapCluster component
 */
export interface RNMapClusterProps {
  /**
   * Markers to cluster
   */
  markers: RNMapMarkerType[];

  /**
   * Radius for clustering markers
   */
  radius?: number;

  /**
   * Callback when marker is pressed
   */
  onMarkerSelect?: (marker: RNMapMarkerType) => void;

  /**
   * Maximum zoom level for clustering
   */
  maxZoom?: number;

  /**
   * Minimum zoom level for clustering
   */
  minZoom?: number;

  /**
   * Color of the cluster marker
   */
  clusterColor?: string;

  /**
   * Text color of the cluster marker
   */
  clusterTextColor?: string;

  /**
   * Border color of the cluster marker
   */
  clusterBorderColor?: string;

  /**
   * Border width of the cluster marker
   */
  clusterBorderWidth?: number;

  /**
   * Whether to spiderify cluster when zoomed to max level
   */
  spiderifyOnMaxZoom?: boolean;
}
