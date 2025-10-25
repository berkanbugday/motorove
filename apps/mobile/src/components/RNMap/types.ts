import {Region, LatLng} from 'react-native-maps';
import {IBusiness} from '@motorove/shared';
import {StyleProp, ViewStyle} from 'react-native';

/**
 * Marker item for animated map
 */
export interface RNMapMarkerItem {
  id: string;
  coordinate: LatLng;
  business?: IBusiness;
  title?: string;
  description?: string;
  pinColor?: string;
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
   * Whether to show the business detail modal on press
   * If false, only onPress callback will be triggered
   */
  showDetailModal?: boolean;
  /**
   * Callback when business detail modal is opened
   */
  onDetailModalOpen?: (business: IBusiness) => void;
  /**
   * Callback when business detail modal is closed
   */
  onDetailModalClose?: () => void;
}
