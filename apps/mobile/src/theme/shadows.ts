/**
 * Shadow system for consistent elevation and depth
 * Use these values for buttons, cards, modals, etc.
 */

import {Platform} from 'react-native';
import {colors} from './colors';
export const shadows = {
  // For iOS
  ios: {
    small: {
      shadowColor: colors.neutral.black,
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },
    medium: {
      shadowColor: colors.neutral.black,
      shadowOffset: {width: 0, height: 4},
      shadowOpacity: 0.15,
      shadowRadius: 4,
    },
    large: {
      shadowColor: colors.neutral.black,
      shadowOffset: {width: 0, height: 6},
      shadowOpacity: 0.2,
      shadowRadius: 6,
    },
  },

  // For Android
  android: {
    small: {
      elevation: 2,
    },
    medium: {
      elevation: 4,
    },
    large: {
      elevation: 8,
    },
  },
};

// Helper function to get the appropriate shadow based on platform
export const getShadow = (size: 'small' | 'medium' | 'large') => {
  return Platform.OS === 'ios' ? shadows.ios[size] : shadows.android[size];
};

// Type for accessing shadow values with type safety
export type ShadowType = typeof shadows;
export type ShadowSizeType = 'small' | 'medium' | 'large';
