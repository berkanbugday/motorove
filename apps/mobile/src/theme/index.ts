/**
 * Theme index file
 * Import this file to access all theme components in one import
 */

import {colors, ColorType} from './colors';
import {spacing, SpacingType} from './spacing';
import {
  radius,
  componentRadius,
  RadiusType,
  ComponentRadiusType,
} from './radius';
import {
  fontSizes,
  fontWeights,
  typography,
  FontSizeType,
  FontWeightType,
  TypographyType,
} from './typography';
import {shadows, getShadow, ShadowType, ShadowSizeType} from './shadows';
import {
  screenWidth,
  screenHeight,
  scale,
  widthScale,
  heightScale,
  rs,
  rw,
  rh,
  rf,
  breakpoints,
  isTablet,
  BreakpointType,
} from './responsive';
import {commonStyles} from './commonStyles';

// Export all theme elements
export {
  // Colors
  colors,

  // Spacing
  spacing,

  // Border radius
  radius,
  componentRadius,

  // Typography
  fontSizes,
  fontWeights,
  typography,

  // Shadows
  shadows,
  getShadow,

  // Responsive
  screenWidth,
  screenHeight,
  scale,
  widthScale,
  heightScale,
  rs,
  rw,
  rh,
  rf,
  breakpoints,
  isTablet,

  // Common styles
  commonStyles,
};

// Export types
export type {
  ColorType,
  SpacingType,
  RadiusType,
  ComponentRadiusType,
  FontSizeType,
  FontWeightType,
  TypographyType,
  ShadowType,
  ShadowSizeType,
  BreakpointType,
};

// Default export for all theme elements
export default {
  colors,
  spacing,
  radius,
  componentRadius,
  fontSizes,
  fontWeights,
  typography,
  shadows,
  getShadow,
  screenWidth,
  screenHeight,
  scale,
  widthScale,
  heightScale,
  rs,
  rw,
  rh,
  rf,
  breakpoints,
  isTablet,
  commonStyles,
};
