import {StyleSheet} from 'react-native';
import {colors, spacing, getShadow, rh} from '../../theme';
import {
  FABPosition,
  FABSize,
  FABShape,
  FABVariant,
  ShadowSizeType,
} from './types';

/**
 * Default sizes for different FAB variants
 */
export const FAB_SIZES = {
  small: {
    size: 40,
    iconSize: 16,
    paddingHorizontal: spacing.md,
  },
  medium: {
    size: 56,
    iconSize: 20,
    paddingHorizontal: spacing.lg,
  },
  large: {
    size: 72,
    iconSize: 24,
    paddingHorizontal: spacing.xl,
  },
};

/**
 * Get position styles for FAB
 */
export const getPositionStyles = (
  position: FABPosition,
  customPosition?: {
    bottom?: number;
    top?: number;
    left?: number;
    right?: number;
  },
) => {
  // Default margin from screen edge
  const bottomMargin = rh(90);
  const topMargin = spacing.lg;
  const leftMargin = spacing.lg;
  const rightMargin = spacing.lg;

  switch (position) {
    case 'bottomRight':
      return {
        position: 'absolute',
        bottom: bottomMargin,
        right: rightMargin,
      };
    case 'bottomLeft':
      return {
        position: 'absolute',
        bottom: bottomMargin,
        left: leftMargin,
      };
    case 'bottomCenter':
      return {
        position: 'absolute',
        bottom: bottomMargin,
        alignSelf: 'center',
      };
    case 'topRight':
      return {
        position: 'absolute',
        top: topMargin,
        right: rightMargin,
      };
    case 'topLeft':
      return {
        position: 'absolute',
        top: topMargin,
        left: leftMargin,
      };
    case 'topCenter':
      return {
        position: 'absolute',
        top: topMargin,
        alignSelf: 'center',
      };
    case 'custom':
      return {
        position: 'absolute',
        ...(customPosition || {}),
      };
    default:
      return {
        position: 'absolute',
        bottom: bottomMargin,
        right: rightMargin,
      };
  }
};

/**
 * Get size styles for FAB
 */
export const getSizeStyles = (size: FABSize, shape: FABShape) => {
  const sizeConfig = FAB_SIZES[size];
  const fabSize = sizeConfig.size;
  const paddingHorizontal = sizeConfig.paddingHorizontal;

  const baseStyle = {
    width: '40%',
    height: fabSize,
    minWidth: fabSize,
  };

  // Circle FAB has equal width and height
  if (shape === 'circle') {
    return {
      ...baseStyle,
      width: fabSize,
      borderRadius: fabSize / 2,
    };
  }

  // Extended FAB has additional horizontal padding for text
  return {
    ...baseStyle,
    paddingHorizontal,
    borderRadius: fabSize / 2,
  };
};

/**
 * Get variant styles for FAB
 */
export const getVariantStyles = (variant: FABVariant, customColor?: string) => {
  // Default text/icon color is white for most variants
  const defaultTextColor = colors.neutral.white;

  switch (variant) {
    case 'primary':
      return {
        backgroundColor: colors.primary.main,
        textColor: defaultTextColor,
      };
    case 'secondary':
      return {
        backgroundColor: colors.secondary.main,
        textColor: colors.neutral.black,
      };
    case 'success':
      return {
        backgroundColor: colors.status.success,
        textColor: defaultTextColor,
      };
    case 'error':
      return {
        backgroundColor: colors.status.error,
        textColor: defaultTextColor,
      };
    case 'custom':
      return {
        backgroundColor: customColor || colors.primary.main,
        textColor: defaultTextColor,
      };
    default:
      return {
        backgroundColor: colors.primary.main,
        textColor: defaultTextColor,
      };
  }
};

/**
 * Get shadow style for FAB
 */
export const getShadowStyle = (shadow: boolean | ShadowSizeType) => {
  if (shadow === false) {
    return {};
  }

  const shadowSize: 'small' | 'medium' | 'large' =
    typeof shadow === 'string' ? shadow : 'medium';
  return getShadow(shadowSize);
};

/**
 * Create FAB styles
 */
export const createFABStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    marginLeft: spacing.sm,
    fontWeight: '500',
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

/**
 * Create FAB Group styles
 */
export const createFABGroupStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignItems: 'flex-end',
  },
  actionsContainer: {
    marginBottom: spacing.md,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  actionLabel: {
    backgroundColor: colors.neutral.darkGrey,
    borderRadius: 5,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginRight: spacing.sm,
  },
  actionLabelText: {
    color: colors.neutral.white,
    fontWeight: '500',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
});
