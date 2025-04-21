/**
 * App color palette
 * Use these colors throughout the app instead of hardcoding color values
 */

export const colors = {
  // Primary brand colors
  primary: {
    main: '#FF3B30',
    light: '#FF6B62',
    dark: '#CC2F26',
  },

  // Secondary brand colors
  secondary: {
    main: '#E5E5EA',
    light: '#F5F5F7',
    dark: '#C7C7CC',
  },

  // Neutral colors for text, backgrounds, etc.
  neutral: {
    black: '#121212',
    darkGrey: '#1C1C1E',
    grey: '#666666',
    lightGrey: '#C4C4C4',
    veryLightGrey: '#E0E0E0',
    white: '#FFFFFF',
    background: '#F9FAFB',
  },

  // Status colors
  status: {
    success: '#34C759',
    warning: '#FFCC00',
    error: '#FF3B30',
    info: '#007AFF',
  },

  // Social media colors
  social: {
    facebook: '#121212',
    google: '#121212',
    apple: '#121212',
  },
};

// Type for accessing colors with type safety
export type ColorType = typeof colors;
