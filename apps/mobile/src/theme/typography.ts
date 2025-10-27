/**
 * Typography system for consistent text styling
 * Use these values for font sizes, weights, and text styles
 */

export const fontSizes = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 24,
  xxl: 32,
};

export const fontWeights = {
  regular: '400',
  medium: '500',
  semiBold: '600',
  bold: '700',
};

export const typography = {
  // Text variants
  largeTitle: {
    fontSize: fontSizes.xxl,
    fontWeight: fontWeights.bold,
    lineHeight: 38,
  },
  title: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.semiBold,
    lineHeight: 28,
  },
  subtitle: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.medium,
    lineHeight: 24,
  },
  body: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.regular,
    lineHeight: 22,
  },
  bodySmall: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.regular,
    lineHeight: 20,
  },
  caption: {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.regular,
    lineHeight: 16,
  },

  // Button text
  buttonText: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semiBold,
  },
  xsmallButtonText: {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.semiBold,
  },
  smallButtonText: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semiBold,
  },
  mediumButtonText: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semiBold,
  },
  largeButtonText: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semiBold,
  },
};

// Types for accessing typography with type safety
export type FontSizeType = typeof fontSizes;
export type FontWeightType = typeof fontWeights;
export type TypographyType = typeof typography;
