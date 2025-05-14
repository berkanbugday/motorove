/**
 * Responsive sizing system to handle different screen sizes
 * Use these functions to calculate sizes that adapt to the device screen
 */

import {Dimensions, PixelRatio, Platform} from 'react-native';

// Get device dimensions
export const {width: screenWidth, height: screenHeight} =
  Dimensions.get('window');

// Base dimensions we're designing for (based on standard iPhone dimensions)
const baseWidth = 375;
const baseHeight = 812;

// Scales
export const widthScale = screenWidth / baseWidth;
export const heightScale = screenHeight / baseHeight;

// Use the smaller scale to avoid stretching UI elements
export const scale = Math.min(widthScale, heightScale);

/**
 * Converts a size value to a responsive size relative to screen dimensions
 * @param size - Size in pixels for base screen width (375px)
 * @returns Responsive size in pixels
 */
export const rs = (size: number): number => {
  return Math.round(size * scale);
};

/**
 * Converts a size value to a responsive horizontal size
 * @param size - Size in pixels for base screen width (375px)
 * @returns Responsive horizontal size in pixels
 */
export const rw = (size: number): number => {
  return Math.round(size / widthScale);
};

/**
 * Converts a size value to a responsive vertical size
 * @param size - Size in pixels for base screen height (812px)
 * @returns Responsive vertical size in pixels
 */
export const rh = (size: number): number => {
  return Math.round(size / heightScale);
};

/**
 * Converts a value to a responsive font size
 * Adjusted for platform specifics
 * @param size - Font size in pixels for base screen
 * @returns Responsive font size in pixels
 */
export const rf = (size: number): number => {
  // Scale factor for responsive fonts
  const scaleFactor = Math.min(widthScale, heightScale);

  // Different scaling adjustments per platform
  const newSize = size * scaleFactor;

  if (Platform.OS === 'ios') {
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  }

  return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2;
};

// Screen size breakpoints
export const breakpoints = {
  smallPhone: 340,
  phone: 375,
  largePhone: 414,
  tablet: 768,
  largeTablet: 1024,
};

/**
 * Checks if the current device is a tablet based on screen width
 * @returns Boolean indicating if device is a tablet
 */
export const isTablet = (): boolean => {
  return screenWidth >= breakpoints.tablet;
};

// Export for type checking
export type BreakpointType = typeof breakpoints;
