import {ReactNode} from 'react';
import {StyleProp, ViewStyle, TextStyle} from 'react-native';
import {ShadowSizeType as ThemeShadowSizeType} from '../../theme';

/**
 * FAB position options
 */
export type FABPosition =
  | 'bottomRight'
  | 'bottomLeft'
  | 'topRight'
  | 'topLeft'
  | 'custom';

/**
 * FAB size variants
 */
export type FABSize = 'small' | 'medium' | 'large';

/**
 * FAB shape variants
 */
export type FABShape = 'circle' | 'extended';

/**
 * FAB variants (visual styles)
 */
export type FABVariant =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'error'
  | 'custom';

/**
 * Animation types for FAB
 */
export type FABAnimationType = 'scale' | 'fade' | 'none';

/**
 * Re-export ShadowSizeType from theme
 */
export type ShadowSizeType = ThemeShadowSizeType;

/**
 * Props for the FAB component
 */
export interface FABProps {
  /**
   * Icon to display in the FAB
   */
  icon: ReactNode;

  /**
   * Text label for extended FAB variant
   */
  label?: string;

  /**
   * Function to call when FAB is pressed
   */
  onPress: () => void;

  /**
   * Function to call when FAB is long pressed
   */
  onLongPress?: () => void;

  /**
   * Position of the FAB on the screen
   * @default 'bottomRight'
   */
  position?: FABPosition;

  /**
   * Custom position coordinates for the FAB
   * Only used when position is set to 'custom'
   */
  customPosition?: {
    bottom?: number;
    top?: number;
    left?: number;
    right?: number;
  };

  /**
   * Size variant of the FAB
   * @default 'medium'
   */
  size?: FABSize;

  /**
   * Shape variant of the FAB
   * @default 'circle'
   */
  shape?: FABShape;

  /**
   * Visual variant of the FAB
   * @default 'primary'
   */
  variant?: FABVariant;

  /**
   * Custom background color for the FAB
   * Only used when variant is set to 'custom'
   */
  backgroundColor?: string;

  /**
   * Custom text/icon color for the FAB
   */
  color?: string;

  /**
   * Whether the FAB is disabled
   * @default false
   */
  disabled?: boolean;

  /**
   * Whether to show a shadow under the FAB
   * @default true
   */
  shadow?: boolean | ShadowSizeType;

  /**
   * Type of animation to use when showing/hiding the FAB
   * @default 'scale'
   */
  animationType?: FABAnimationType;

  /**
   * Whether the FAB is visible
   * @default true
   */
  visible?: boolean;

  /**
   * Additional styles for the FAB container
   */
  style?: StyleProp<ViewStyle>;

  /**
   * Additional styles for the FAB label
   */
  labelStyle?: StyleProp<TextStyle>;

  /**
   * Test ID for testing
   */
  testID?: string;

  /**
   * Accessibility label for screen readers
   */
  accessibilityLabel?: string;
}

/**
 * Props for the FABGroup component
 */
export interface FABGroupProps {
  /**
   * Main FAB props
   */
  mainFAB: Omit<FABProps, 'onPress'>;

  /**
   * Array of actions/FABs to show in the speed dial
   */
  actions: Array<{
    icon: ReactNode;
    label?: string;
    onPress: () => void;
    backgroundColor?: string;
    color?: string;
    style?: StyleProp<ViewStyle>;
    labelStyle?: StyleProp<TextStyle>;
    testID?: string;
    accessibilityLabel?: string;
  }>;

  /**
   * Whether the FAB group is open
   * @default false
   */
  open?: boolean;

  /**
   * Function to call when the open state changes
   */
  onStateChange?: (open: boolean) => void;

  /**
   * Position of the FAB group on the screen
   * @default 'bottomRight'
   */
  position?: FABPosition;

  /**
   * Custom position coordinates for the FAB group
   * Only used when position is set to 'custom'
   */
  customPosition?: {
    bottom?: number;
    top?: number;
    left?: number;
    right?: number;
  };

  /**
   * Whether to show labels next to actions in the speed dial
   * @default true
   */
  showLabels?: boolean;

  /**
   * Whether to show a backdrop when the speed dial is open
   * @default true
   */
  showBackdrop?: boolean;

  /**
   * Style for the backdrop
   */
  backdropStyle?: StyleProp<ViewStyle>;

  /**
   * Color for the backdrop
   * @default 'rgba(0, 0, 0, 0.4)'
   */
  backdropColor?: string;

  /**
   * Additional styles for the FAB group container
   */
  style?: StyleProp<ViewStyle>;

  /**
   * Test ID for testing
   */
  testID?: string;
}
