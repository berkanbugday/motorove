import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import {colors, spacing, componentRadius, typography} from '@theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  shape?: 'default' | 'round' | 'circle';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
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
  style,
  textStyle,
  testID,
}: ButtonProps) {
  const buttonStyles = [
    styles.button,
    variant === 'primary' && styles.primaryButton,
    variant === 'secondary' && styles.secondaryButton,
    variant === 'outline' && styles.outlineButton,
    variant === 'text' && styles.textButton,
    shape === 'round' && styles.roundButton,
    shape === 'circle' && styles.circleButton,
    size === 'small' && styles.smallButton,
    size === 'large' && styles.largeButton,
    (disabled || loading) && styles.disabledButton,
    style,
  ];

  const textStyles = [
    styles.buttonText,
    variant === 'primary' && styles.primaryButtonText,
    variant === 'secondary' && styles.secondaryButtonText,
    variant === 'outline' && styles.outlineButtonText,
    variant === 'text' && styles.textButtonText,
    size === 'small' && styles.smallButtonText,
    size === 'large' && styles.largeButtonText,
    (disabled || loading) && styles.disabledButtonText,
    textStyle,
  ];

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled || loading}
      testID={testID}>
      {loading ? (
        <ActivityIndicator
          size="small"
          color={
            variant === 'primary' ? colors.neutral.white : colors.primary.main
          }
        />
      ) : (
        <Text style={textStyles}>{title}</Text>
      )}
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
    paddingHorizontal: spacing.sm,
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
  largeButton: {
    paddingVertical: spacing.button.paddingVertical.large,
    paddingHorizontal: spacing.button.paddingHorizontal.large,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: typography.buttonText.fontSize,
    fontWeight: typography.buttonText.fontWeight as TextStyle['fontWeight'],
  },
  smallButtonText: {
    fontSize: typography.smallButtonText.fontSize,
    fontWeight: typography.smallButtonText
      .fontWeight as TextStyle['fontWeight'],
  },
  largeButtonText: {
    fontSize: typography.largeButtonText.fontSize,
    fontWeight: typography.largeButtonText
      .fontWeight as TextStyle['fontWeight'],
  },
  primaryButtonText: {
    color: colors.neutral.white,
  },
  secondaryButtonText: {
    color: colors.neutral.darkGrey,
  },
  outlineButtonText: {
    color: colors.neutral.black,
  },
  textButtonText: {
    color: colors.neutral.darkGrey,
  },
  disabledButtonText: {
    // No additional styles needed, opacity is applied to the button
  },
});
