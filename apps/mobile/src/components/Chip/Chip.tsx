import React from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  View,
  ViewStyle,
  TextStyle,
  StyleProp,
} from 'react-native';
import {colors, spacing, radius} from '@theme';
import {Typography} from '../Typography';
import {Icon, IconName} from '../Icon';

export type ChipVariant = 'filled' | 'outlined' | 'ghost';
export type ChipSize = 'small' | 'medium' | 'large';
export type ChipColor =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'dark'
  | 'light';

export interface ChipProps {
  /** Text content of the chip */
  label: string;
  /** Function called when the chip is pressed */
  onPress?: () => void;
  /** Function called when the remove icon is pressed */
  onRemove?: () => void;
  /** Visual style variant of the chip */
  variant?: ChipVariant;
  /** Size of the chip */
  size?: ChipSize;
  /** Color theme of the chip */
  color?: ChipColor;
  /** Whether the chip is in a selected state */
  selected?: boolean;
  /** Whether the chip is disabled */
  disabled?: boolean;
  /** Optional icon to display at the start */
  leadingIcon?: IconName;
  /** Whether to show a remove/close icon */
  removable?: boolean;
  /** Custom style for the chip container */
  style?: StyleProp<ViewStyle>;
  /** Custom style for the label text */
  labelStyle?: StyleProp<TextStyle>;
  /** Test ID for testing */
  testID?: string;
}

/**
 * Chip component for displaying compact elements that represent an input, attribute, or action.
 */
export const Chip: React.FC<ChipProps> = ({
  label,
  onPress,
  onRemove,
  variant = 'outlined',
  size = 'medium',
  color = 'light',
  selected = false,
  disabled = false,
  leadingIcon,
  removable = false,
  style,
  labelStyle,
  testID,
}) => {
  // Determine background and text colors based on variant, color, and states
  const getBackgroundColor = () => {
    // if (disabled) {
    //   return colors.neutral.veryLightGrey;
    // }

    if (variant === 'filled') {
      if (selected) {
        switch (color) {
          case 'primary':
            return colors.primary.dark;
          case 'secondary':
            return colors.secondary.dark;
          case 'success':
            return colors.status.success;
          case 'warning':
            return colors.status.warning;
          case 'error':
            return colors.status.error;
          case 'info':
            return colors.status.info;
          case 'dark':
            return colors.neutral.black;
          case 'light':
            return colors.neutral.white;
          default:
            return colors.primary.main;
        }
      } else {
        switch (color) {
          case 'primary':
            return colors.primary.main;
          case 'secondary':
            return colors.secondary.main;
          case 'success':
            return colors.status.success;
          case 'warning':
            return colors.status.warning;
          case 'error':
            return colors.status.error;
          case 'info':
            return colors.status.info;
          case 'dark':
            return colors.neutral.black;
          case 'light':
            return colors.neutral.white;
          default:
            return colors.primary.main;
        }
      }
    }

    // For outlined and ghost variants, use transparent background if not selected
    if (!selected) {
      return 'transparent';
    }

    // For outlined and ghost when selected, use a light version of the color
    switch (color) {
      case 'primary':
        return `${colors.primary.main}20`; // 20 is hex for 12% opacity
      case 'secondary':
        return `${colors.secondary.main}20`;
      case 'success':
        return `${colors.status.success}20`;
      case 'warning':
        return `${colors.status.warning}20`;
      case 'error':
        return `${colors.status.error}20`;
      case 'info':
        return `${colors.status.info}20`;
      case 'dark':
        return `${colors.neutral.black}20`;
      case 'light':
        return `${colors.neutral.white}20`;
      default:
        return `${colors.primary.main}20`;
    }
  };

  const getBorderColor = () => {
    // if (disabled) {
    //   return colors.neutral.lightGrey;
    // }
    if (variant !== 'outlined') {
      return 'transparent';
    }

    switch (color) {
      case 'primary':
        return colors.primary.main;
      case 'secondary':
        return colors.secondary.main;
      case 'success':
        return colors.status.success;
      case 'warning':
        return colors.status.warning;
      case 'error':
        return colors.status.error;
      case 'info':
        return colors.status.info;
      case 'dark':
        return colors.neutral.black;
      case 'light':
        return colors.neutral.white;
      default:
        return colors.primary.main;
    }
  };

  const getTextColor = () => {
    // if (disabled) {
    //   return colors.neutral.grey;
    // }

    if (variant === 'filled') {
      // For filled variant, use white text on dark backgrounds, and dark text on light backgrounds
      switch (color) {
        case 'secondary':
        case 'warning':
        case 'light':
          return colors.neutral.black;
        default:
          return colors.neutral.white;
      }
    }

    // For outlined and ghost variants, use the color of the chip
    switch (color) {
      case 'primary':
        return colors.primary.main;
      case 'secondary':
        return colors.secondary.dark;
      case 'success':
        return colors.status.success;
      case 'warning':
        return colors.status.warning;
      case 'error':
        return colors.status.error;
      case 'info':
        return colors.status.info;
      case 'dark':
        return colors.neutral.black;
      case 'light':
        return colors.neutral.white;
      default:
        return colors.primary.main;
    }
  };

  const getIconColor = () => {
    // Icon color should generally match text color
    return getTextColor();
  };

  const getTypographyVariant = () => {
    switch (size) {
      case 'small':
        return 'caption';
      case 'large':
        return 'body';
      default:
        return 'bodySmall';
    }
  };

  // Build style arrays
  const containerStyles = [
    styles.container,
    size === 'small' && styles.smallContainer,
    size === 'large' && styles.largeContainer,
    {
      backgroundColor: getBackgroundColor(),
      borderColor: getBorderColor(),
      borderWidth:
        variant === 'outlined' || variant === 'filled' || variant === 'ghost'
          ? 1
          : 0,
    },
    style,
  ];

  // Handle press events
  const handlePress = () => {
    if (!disabled && onPress) {
      onPress();
    }
  };

  const handleRemove = (e: any) => {
    // Prevent the chip's onPress from firing
    e.stopPropagation();
    if (!disabled && onRemove) {
      onRemove();
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={disabled ? 1 : 0.7}
      style={containerStyles}
      onPress={handlePress}
      disabled={disabled}
      testID={testID}>
      <View style={styles.contentContainer}>
        {leadingIcon && (
          <View style={styles.leadingIconContainer}>
            <Icon
              name={leadingIcon}
              size={size === 'small' ? 14 : size === 'large' ? 20 : 16}
              color={getIconColor()}
            />
          </View>
        )}

        <Typography
          variant={getTypographyVariant()}
          color={getTextColor()}
          style={[
            styles.label,
            leadingIcon && styles.labelWithLeadingIcon,
            removable && styles.labelWithTrailingIcon,
            labelStyle,
          ]}>
          {label}
        </Typography>

        {removable && (
          <TouchableOpacity
            style={styles.removeIconContainer}
            onPress={handleRemove}
            disabled={disabled}>
            <Icon
              name="close"
              size={size === 'small' ? 14 : size === 'large' ? 20 : 16}
              color={getIconColor()}
            />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.round,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.xs,
    alignSelf: 'flex-start',
  },
  smallContainer: {
    paddingVertical: spacing.xs / 2,
    paddingHorizontal: spacing.xs,
  },
  largeContainer: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  contentContainer: {
    paddingRight: spacing.xs,
    paddingLeft: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  leadingIconContainer: {
    marginRight: spacing.xs / 2,
  },
  label: {
    textAlign: 'center',
  },
  labelWithLeadingIcon: {
    marginLeft: spacing.xs / 2,
  },
  labelWithTrailingIcon: {
    marginRight: spacing.xs / 2,
    marginLeft: spacing.xs / 2,
  },
  removeIconContainer: {
    marginLeft: spacing.xs,
  },
});
