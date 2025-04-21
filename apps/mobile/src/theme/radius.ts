/**
 * Border radius system for consistent corner rounding
 * Use these values for buttons, cards, inputs, etc.
 */

export const radius = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  round: 50, // for circular elements
};

// Component-specific radius values
export const componentRadius = {
  button: {
    default: radius.sm,
    round: radius.xl,
    circle: radius.round,
  },
  card: radius.md,
  input: radius.sm,
};

// Type for accessing radius values with type safety
export type RadiusType = typeof radius;
export type ComponentRadiusType = typeof componentRadius;
