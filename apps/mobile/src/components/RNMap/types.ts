import {Region, LatLng} from 'react-native-maps';
import {IBusiness, IWarning, IEmergency} from '@motorove/shared';
import {StyleProp, ViewStyle} from 'react-native';
import {IconName} from '@components/Icon';

/**
 * Map tab types for filtering markers
 */
export enum MapTabType {
  BUSINESSES = 'businesses',
  WARNINGS = 'warnings',
  EMERGENCIES = 'emergencies',
}

/**
 * Marker item for animated map
 */
export interface RNMapMarkerItem {
  id: string;
  coordinate: LatLng;
  business?: IBusiness;
  warning?: IWarning;
  emergency?: IEmergency;
  title?: string;
  description?: string;
  pinColor?: string;
  iconName?: IconName;
  iconColor?: string;
  zIndex?: number;
}

/**
 * RNMap component props
 */
export interface RNMapProps {
  // Map configuration
  initialRegion: Region;
  style?: StyleProp<ViewStyle>;

  // Markers
  markers?: RNMapMarkerItem[];
  onMarkerPress?: (marker: RNMapMarkerItem) => void;

  // User location
  showUserLocation?: boolean;
  followUserLocation?: boolean;

  // Controls
  showZoomControls?: boolean;
  showSearchBar?: boolean;
  showLoadMarkerButton?: boolean;
  zoomControlEnabled?: boolean;

  // Events
  onPress?: (event: {nativeEvent: {coordinate: LatLng}}) => void;
  onRegionChange?: (region: Region, isUserInitiated: boolean) => void;
  onRegionChangeComplete?: (region: Region) => void;

  // Map ref
  mapRef?: React.RefObject<any>;

  // Business-specific
  onBusinessSelect?: (business: IBusiness) => void;
  onDetailScreenOpen?: () => void;
  selectedBusinessId?: string;

  // Search button
  showSearchButton?: boolean;
  onSearchThisArea?: () => void;
  searchButtonLoading?: boolean;

  // User location for distance calculation
  userLocation?: {
    latitude: number;
    longitude: number;
  };

  // Location button
  showMyLocationButton?: boolean;
  onMyLocationPress?: () => void;

  // Filter button
  showFilterButton?: boolean;
  onFilterPress?: () => void;
  hasActiveFilters?: boolean;

  // Emergency button
  showEmergencyButton?: boolean;
  onEmergencyPress?: () => void;

  // Warning button
  showWarningButton?: boolean;
  onWarningPress?: () => void;

  // Tab filtering
  selectedTab?: MapTabType;
  onTabChange?: (tab: MapTabType) => void;
  showTabs?: boolean;
}

/**
 * Business marker card props
 */
export interface RNMapMarkerCardProps {
  business: IBusiness;
  onPress?: () => void;
  onClose?: () => void;
  style?: StyleProp<ViewStyle>;
  userLocation?: {
    latitude: number;
    longitude: number;
  };
  /**
   * Callback when business detail screen is opened
   */
  onDetailScreenOpen?: () => void;
}

/**
 * Warning marker card props
 */
export interface RNMapWarningMarkerCardProps {
  warning: IWarning;
  onPress?: () => void;
  onClose?: () => void;
  style?: StyleProp<ViewStyle>;
  userLocation?: {
    latitude: number;
    longitude: number;
  };
}

/**
 * Emergency marker card props
 */
export interface RNMapEmergencyMarkerCardProps {
  emergency: IEmergency;
  onPress?: () => void;
  onClose?: () => void;
  style?: StyleProp<ViewStyle>;
  userLocation?: {
    latitude: number;
    longitude: number;
  };
  onHelpPress?: () => void;
}
