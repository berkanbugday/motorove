import React, {useEffect, useRef} from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Easing,
  ViewStyle,
  StyleProp,
  DimensionValue,
} from 'react-native';
import {colors} from '@theme';

export type SkeletonShape = 'rectangle' | 'circle' | 'pill';
export type SkeletonSize = 'small' | 'medium' | 'large' | 'full';
export type SkeletonVariant = 'default' | 'card' | 'avatar' | 'text' | 'button';

export interface SkeletonProps {
  /**
   * The shape of the skeleton
   * @default 'rectangle'
   */
  shape?: SkeletonShape;

  /**
   * Predefined size of the skeleton
   * @default 'medium'
   */
  size?: SkeletonSize;

  /**
   * Predefined variant with specific dimensions
   * @default 'default'
   */
  variant?: SkeletonVariant;

  /**
   * Width of the skeleton (overrides size)
   */
  width?: DimensionValue;

  /**
   * Height of the skeleton (overrides size)
   */
  height?: DimensionValue;

  /**
   * Border radius of the skeleton
   * For shape='circle', this is automatically calculated
   */
  borderRadius?: number;

  /**
   * Enable animation effect
   * @default true
   */
  animated?: boolean;

  /**
   * Animation speed in milliseconds
   * @default 1200
   */
  animationSpeed?: number;

  /**
   * Color of the skeleton
   * @default colors.neutral.veryLightGrey
   */
  backgroundColor?: string;

  /**
   * Highlight color for the animation
   * @default colors.neutral.white
   */
  highlightColor?: string;

  /**
   * Additional styles to apply
   */
  style?: StyleProp<ViewStyle>;
}

/**
 * Skeleton component for loading states
 *
 * Usage examples:
 * <Skeleton /> - Default rectangle
 * <Skeleton shape="circle" size="large" /> - Large circle
 * <Skeleton variant="avatar" /> - Avatar placeholder
 * <Skeleton width={100} height={20} /> - Custom dimensions
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  shape = 'rectangle',
  size = 'medium',
  variant = 'default',
  width,
  height,
  borderRadius,
  animated = true,
  animationSpeed = 1200,
  backgroundColor = colors.neutral.veryLightGrey,
  highlightColor = colors.neutral.white,
  style,
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animated) {
      const animation = Animated.loop(
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: animationSpeed,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      );
      animation.start();

      return () => {
        animation.stop();
      };
    }
  }, [animated, animatedValue, animationSpeed]);

  // Calculate dimensions based on size and variant
  const dimensions = getSkeletonDimensions(size, variant);

  // Override dimensions if custom width/height provided
  const finalWidth = width ?? dimensions.width;
  const finalHeight = height ?? dimensions.height;

  // Calculate final border radius
  const finalBorderRadius =
    shape === 'circle'
      ? typeof finalHeight === 'number'
        ? finalHeight / 2
        : 999
      : shape === 'pill'
      ? 999
      : borderRadius ?? dimensions.borderRadius;

  // Create animated gradient for shimmer effect
  const shimmerWidth = typeof finalWidth === 'number' ? finalWidth * 2 : 500;
  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-shimmerWidth, shimmerWidth],
  });

  return (
    <View
      style={[
        styles.container,
        {
          width: finalWidth,
          height: finalHeight,
          borderRadius: finalBorderRadius,
          backgroundColor,
        },
        style,
      ]}>
      {animated && (
        <Animated.View
          style={[
            styles.shimmer,
            {
              backgroundColor: highlightColor,
              transform: [{translateX}],
            },
          ]}
        />
      )}
    </View>
  );
};

/**
 * Get dimensions based on size and variant
 */
const getSkeletonDimensions = (
  size: SkeletonSize,
  variant: SkeletonVariant,
): {width: DimensionValue; height: DimensionValue; borderRadius: number} => {
  // Variant-specific dimensions
  switch (variant) {
    case 'avatar':
      return {
        width: getAvatarSize(size),
        height: getAvatarSize(size),
        borderRadius: 0, // Will be overridden for circle shape
      };
    case 'card':
      return {
        width: '100%',
        height: size === 'small' ? 80 : size === 'medium' ? 120 : 180,
        borderRadius: 8,
      };
    case 'text':
      return {
        width:
          size === 'small'
            ? 100
            : size === 'medium'
            ? 150
            : size === 'large'
            ? 200
            : '100%',
        height: size === 'small' ? 12 : size === 'medium' ? 16 : 20,
        borderRadius: 4,
      };
    case 'button':
      return {
        width: size === 'small' ? 80 : size === 'medium' ? 120 : 180,
        height: size === 'small' ? 30 : size === 'medium' ? 44 : 54,
        borderRadius: 8,
      };
    default:
      // Size-specific dimensions for default variant
      return getSizeBasedDimensions(size);
  }
};

/**
 * Get dimensions based on size
 */
const getSizeBasedDimensions = (
  size: SkeletonSize,
): {width: DimensionValue; height: DimensionValue; borderRadius: number} => {
  switch (size) {
    case 'small':
      return {width: 60, height: 60, borderRadius: 4};
    case 'medium':
      return {width: 120, height: 120, borderRadius: 6};
    case 'large':
      return {width: 200, height: 200, borderRadius: 8};
    case 'full':
      return {width: '100%', height: 150, borderRadius: 8};
    default:
      return {width: 120, height: 120, borderRadius: 6};
  }
};

/**
 * Get avatar dimensions based on size
 */
const getAvatarSize = (size: SkeletonSize): number => {
  switch (size) {
    case 'small':
      return 32;
    case 'medium':
      return 48;
    case 'large':
      return 64;
    case 'full':
      return 96;
    default:
      return 48;
  }
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  shimmer: {
    width: '30%',
    height: '100%',
    opacity: 0.2,
    position: 'absolute',
    top: 0,
    left: 0,
  },
});

export default Skeleton;
