/**
 * App color palette
 * Use these colors throughout the app instead of hardcoding color values
 */

export const colors = {
  // Primary brand colors
  primary: {
    main: '#FF3B30',
    light: '#FF6B61',
    dark: '#D32F2F',
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
  weather: {
    sunny: '#FFD700',
    cloudy: '#E0E0E0',
    partlyCloudy: '#B0C4DE',
    rainy: '#87CEEB',
    stormy: '#4682B4',
    snowy: '#FFFFFF',
    foggy: '#D3D3D3',
    windy: '#ADD8E6',
  },

  // Status colors
  status: {
    success: '#34C759',
    successDark: '#16A34A',
    warning: '#FFCC00',
    error: '#FF3B30',
    info: '#4682B4',
  },
};

// Type for accessing colors with type safety
export type ColorType = typeof colors;
