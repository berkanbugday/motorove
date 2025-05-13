import React from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
  StyleProp,
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
  iconPosition?: 'left' | 'right' | 'top' | 'bottom';
  style?: ViewStyle | StyleProp<ViewStyle>;
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
    if (iconSize) {
      return iconSize;
    }

    if (size === 'small') {
      return 14;
    }
    if (size === 'medium') {
      return 16;
    }
    if (size === 'large') {
      return 20;
    }
    return 16; // medium size default
  };

  const renderContent = () => {
    if (loading) {
      return <ActivityIndicator size="small" color={colors.neutral.white} />;
    }

    if (iconName && !title) {
      return (
        <Icon name={iconName} size={getIconSize()} color={getIconColor()} />
      );
    }

    if (iconName && title) {
      const isVerticalLayout =
        iconPosition === 'top' || iconPosition === 'bottom';
      return (
        <View
          style={[
            styles.contentContainer,
            isVerticalLayout && styles.verticalContentContainer,
          ]}>
          {(iconPosition === 'left' || iconPosition === 'top') && (
            <View
              style={[
                styles.iconContainer,
                iconPosition === 'top' && styles.topIconContainer,
              ]}>
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
          {(iconPosition === 'right' || iconPosition === 'bottom') && (
            <View
              style={[
                styles.iconContainer,
                iconPosition === 'bottom' && styles.bottomIconContainer,
              ]}>
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
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  verticalContentContainer: {
    flexDirection: 'column',
  },
  iconContainer: {
    marginHorizontal: spacing.xs,
  },
  topIconContainer: {
    marginHorizontal: 0,
    marginBottom: spacing.xs,
  },
  bottomIconContainer: {
    marginHorizontal: 0,
    marginTop: spacing.xs,
  },
});
