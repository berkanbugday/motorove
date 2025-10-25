import {IBusiness} from '@motorove/shared';
import {StyleProp, ViewStyle} from 'react-native';

export interface BusinessDetailModalProps {
  /**
   * Whether the modal is visible
   */
  visible: boolean;

  /**
   * Business data to display
   */
  business: IBusiness | null;

  /**
   * Function to call when the modal should be closed
   */
  onClose: () => void;

  /**
   * User location for distance calculation
   */
  userLocation?: {
    latitude: number;
    longitude: number;
  };

  /**
   * Animation duration in milliseconds
   */
  animationDuration?: number;

  /**
   * Custom style for the modal container
   */
  containerStyle?: StyleProp<ViewStyle>;

  /**
   * Whether to close on backdrop press
   */
  closeOnBackdropPress?: boolean;

  /**
   * Test ID for testing purposes
   */
  testID?: string;
}

export interface BusinessDetailModalRef {
  /**
   * Programmatically open the modal
   */
  open: (business: IBusiness) => void;

  /**
   * Programmatically close the modal
   */
  close: () => void;
}
