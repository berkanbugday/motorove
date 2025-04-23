import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  FlexAlignType,
} from 'react-native';
import {colors, spacing} from '@theme';

export type PageIndicatorType = 'dot' | 'line' | 'pill';
export type PageIndicatorPosition = 'top' | 'bottom' | 'left' | 'right';

export interface PageIndicatorProps {
  /**
   * Total number of pages
   */
  totalPages: number;

  /**
   * Current active page (0-indexed)
   */
  currentPage: number;

  /**
   * Function to handle page change when indicator is pressed
   */
  onPageChange?: (index: number) => void;

  /**
   * Type of indicator to display
   * @default 'dot'
   */
  type?: PageIndicatorType;

  /**
   * Position of the indicator
   * @default 'bottom'
   */
  position?: PageIndicatorPosition;

  /**
   * Size of indicator dots/pills
   * @default 8
   */
  indicatorSize?: number;

  /**
   * Size of active indicator (should be >= indicatorSize)
   * @default 10
   */
  activeIndicatorSize?: number;

  /**
   * Space between indicators
   * @default 8
   */
  spacing?: number;

  /**
   * Custom color for inactive indicators
   */
  inactiveColor?: string;

  /**
   * Custom color for active indicator
   */
  activeColor?: string;

  /**
   * Optional style for container
   */
  containerStyle?: ViewStyle;

  /**
   * Maximum number of visible indicators
   * If total pages > maxVisibleDots, it will show truncated indicators
   */
  maxVisibleDots?: number;
}

export const PageIndicator: React.FC<PageIndicatorProps> = ({
  totalPages,
  currentPage,
  onPageChange,
  type = 'dot',
  position = 'bottom',
  indicatorSize = 8,
  activeIndicatorSize = 10,
  spacing: indicatorSpacing = 8,
  inactiveColor = colors.neutral.lightGrey,
  activeColor = colors.neutral.black,
  containerStyle,
  maxVisibleDots,
}) => {
  // Determine which indicators to show if maxVisibleDots is set
  const getVisiblePages = () => {
    if (!maxVisibleDots || totalPages <= maxVisibleDots) {
      return Array.from({length: totalPages}, (_, i) => i);
    }

    // Calculate visible range with current page in the middle when possible
    const halfVisible = Math.floor(maxVisibleDots / 2);
    let start = Math.max(0, currentPage - halfVisible);
    let end = Math.min(totalPages - 1, start + maxVisibleDots - 1);

    // Adjust start if end is at maximum
    if (end === totalPages - 1) {
      start = Math.max(0, end - maxVisibleDots + 1);
    }

    return Array.from({length: maxVisibleDots}, (_, i) => start + i);
  };

  const visiblePages = maxVisibleDots
    ? getVisiblePages()
    : Array.from({length: totalPages}, (_, i) => i);

  // Handle indicator press
  const handlePress = (index: number) => {
    if (onPageChange) {
      onPageChange(index);
    }
  };

  // Determine container style based on position
  const getContainerStyle = (): ViewStyle => {
    const isHorizontal = position === 'top' || position === 'bottom';
    const alignItemsValue: FlexAlignType = 'center';

    const baseStyle: ViewStyle = {
      flexDirection: isHorizontal ? 'row' : 'column',
      justifyContent: 'center',
      alignItems: alignItemsValue,
    };

    if (position === 'left') {
      return {
        ...baseStyle,
        position: 'absolute',
        left: spacing.md,
        top: '50%',
        transform: [{translateY: -50}],
      };
    }

    if (position === 'right') {
      return {
        ...baseStyle,
        position: 'absolute',
        right: spacing.md,
        top: '50%',
        transform: [{translateY: -50}],
      };
    }

    return baseStyle;
  };

  // Render individual indicator based on type
  const renderIndicator = (index: number) => {
    const isActive = index === currentPage;
    const size = isActive ? activeIndicatorSize : indicatorSize;

    // Base styles for all indicator types
    const baseStyle = {
      marginHorizontal:
        position === 'top' || position === 'bottom' ? indicatorSpacing / 2 : 0,
      marginVertical:
        position === 'left' || position === 'right' ? indicatorSpacing / 2 : 0,
      backgroundColor: isActive ? activeColor : inactiveColor,
    };

    // Type-specific styles
    const typeStyle = (() => {
      switch (type) {
        case 'line':
          return {
            width: isActive ? 20 : 10,
            height: indicatorSize / 2,
            borderRadius: indicatorSize / 4,
          };
        case 'pill':
          return {
            width: isActive ? activeIndicatorSize * 2 : indicatorSize,
            height: indicatorSize,
            borderRadius: indicatorSize / 2,
          };
        case 'dot':
        default:
          return {
            width: size,
            height: size,
            borderRadius: size / 2,
          };
      }
    })();

    return (
      <TouchableOpacity
        key={`indicator-${index}`}
        onPress={() => handlePress(index)}
        activeOpacity={0.7}
        disabled={!onPageChange}>
        <View style={[styles.indicator, baseStyle, typeStyle]} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, getContainerStyle(), containerStyle]}>
      {visiblePages.map(index => renderIndicator(index))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.xs,
  },
  indicator: {
    // Base styles applied in renderIndicator
  },
});
