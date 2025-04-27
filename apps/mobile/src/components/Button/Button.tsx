import React from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import {colors, spacing, componentRadius} from '@theme';
import {Typography} from '../Typography';
import {Icon, IconName} from '../Icon';

interface ButtonProps {
  title?: string;
  onPress?: () => void;
  variant?: 'primary' | 'dark' | 'secondary' | 'outline' | 'text';
  shape?: 'default' | 'round' | 'circle';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  iconName?: IconName;
  iconSize?: number;
  iconColor?: string;
  iconPosition?: 'left' | 'right';
  style?: ViewStyle;
  textStyle?: TextStyle;
  testID?: string;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  shape = 'default',
  size = 'medium',
  disabled = false,
  loading = false,
  iconName,
  iconSize,
  iconColor,
  iconPosition = 'left',
  style,
  textStyle,
  testID,
}: ButtonProps) {
  const buttonStyles = [
    styles.button,
    variant === 'primary' && styles.primaryButton,
    variant === 'dark' && styles.darkButton,
    variant === 'secondary' && styles.secondaryButton,
    variant === 'outline' && styles.outlineButton,
    variant === 'text' && styles.textButton,
    shape === 'round' && styles.roundButton,
    shape === 'circle' && styles.circleButton,
    size === 'small' && styles.smallButton,
    size === 'medium' && styles.mediumButton,
    size === 'large' && styles.largeButton,
    (disabled || loading) && styles.disabledButton,
    style,
  ];

  const getTypographyVariant = () => {
    if (size === 'small') {
      return 'smallButtonText';
    }
    if (size === 'medium') {
      return 'mediumButtonText';
    }
    if (size === 'large') {
      return 'largeButtonText';
    }
    return 'buttonText';
  };

  const getTextColor = () => {
    if (disabled || loading) {
      return undefined; // Let the Typography component handle disabled state
    }
    if (variant === 'primary') {
      return colors.neutral.white;
    }
    if (variant === 'dark') {
      return colors.neutral.white;
    }
    if (variant === 'secondary') {
      return colors.neutral.darkGrey;
    }
    if (variant === 'outline') {
      return colors.neutral.black;
    }
    if (variant === 'text') {
      return colors.neutral.darkGrey;
    }
    return colors.neutral.black;
  };

  const getIconColor = () => {
    return iconColor || getTextColor() || colors.neutral.black;
  };

  const getIconSize = () => {
    if (iconSize) return iconSize;

    if (size === 'small') return 14;
    if (size === 'medium') return 16;
    if (size === 'large') return 20;
    return 16; // medium size default
  };

  const renderContent = () => {
    if (loading) {
      return (
        <ActivityIndicator
          size="small"
          color={
            variant === 'primary' ? colors.neutral.white : colors.primary.main
          }
        />
      );
    }

    if (iconName && !title) {
      return (
        <Icon name={iconName} size={getIconSize()} color={getIconColor()} />
      );
    }

    if (iconName && title) {
      return (
        <View style={styles.contentContainer}>
          {iconPosition === 'left' && (
            <View style={styles.iconContainer}>
              <Icon
                name={iconName}
                size={getIconSize()}
                color={getIconColor()}
              />
            </View>
          )}
          <Typography
            align="center"
            variant={getTypographyVariant() as any}
            color={getTextColor()}
            style={textStyle}>
            {title}
          </Typography>
          {iconPosition === 'right' && (
            <View style={styles.iconContainer}>
              <Icon
                name={iconName}
                size={getIconSize()}
                color={getIconColor()}
              />
            </View>
          )}
        </View>
      );
    }

    return (
      <Typography
        align="center"
        variant={getTypographyVariant() as any}
        color={getTextColor()}
        style={textStyle}>
        {title}
      </Typography>
    );
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled || loading}
      testID={testID}>
      {renderContent()}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: spacing.button.paddingVertical.medium,
    paddingHorizontal: spacing.button.paddingHorizontal.medium,
    borderRadius: componentRadius.button.default,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  primaryButton: {
    backgroundColor: colors.primary.main,
  },
  darkButton: {
    backgroundColor: colors.neutral.black,
  },
  secondaryButton: {
    backgroundColor: colors.secondary.main,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.neutral.black,
  },
  textButton: {
    backgroundColor: 'transparent',
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs,
  },
  roundButton: {
    borderRadius: componentRadius.button.round,
  },
  circleButton: {
    borderRadius: componentRadius.button.circle,
    width: 48,
    height: 48,
    paddingHorizontal: 0,
  },
  smallButton: {
    paddingVertical: spacing.button.paddingVertical.small,
    paddingHorizontal: spacing.button.paddingHorizontal.small,
  },
  mediumButton: {
    paddingVertical: spacing.button.paddingVertical.medium,
    paddingHorizontal: spacing.button.paddingHorizontal.medium,
  },
  largeButton: {
    paddingVertical: spacing.button.paddingVertical.large,
    paddingHorizontal: spacing.button.paddingHorizontal.large,
  },
  disabledButton: {
    opacity: 0.6,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginHorizontal: spacing.xs,
  },
});
