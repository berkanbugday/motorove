/**
 * Spacing system for paddings, margins, and layout
 * Use these values for consistent spacing throughout the app
 */

export const spacing = {
  // Base spacing unit (4px)
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,

  // Specific spacing for components
  button: {
    paddingVertical: {
      small: 8,
      medium: 14,
      large: 16,
    },
    paddingHorizontal: {
      small: 16,
      medium: 24,
      large: 32,
    },
  },

  // Screen padding
  screen: {
    horizontal: 20,
    vertical: 20,
  },

  // Form spacing
  form: {
    inputMarginBottom: 24,
    inputHeight: 50,
    inputPaddingHorizontal: 16,
  },
};

// Type for accessing spacing with type safety
export type SpacingType = typeof spacing;
