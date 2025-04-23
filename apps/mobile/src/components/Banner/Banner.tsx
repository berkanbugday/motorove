import React from 'react';
import {View, Text, TouchableOpacity, ViewStyle, TextStyle} from 'react-native';
import {colors} from '@theme';
import {Icon, IconName} from '../Icon';
import {styles} from './Banner.styles';

export type BannerVariant =
  | 'info'
  | 'success'
  | 'warning'
  | 'error'
  | 'neutral'
  | 'contrast';
export type BannerAction = {
  label: string;
  onPress: () => void;
};

export interface BannerProps {
  /**
   * The banner message to display
   */
  message: string;
  /**
   * Title of the banner (optional)
   */
  title?: string;
  /**
   * Subtitle of the banner (optional)
   */
  subtitle?: string;
  /**
   * Banner variant that controls the color scheme
   * @default 'info'
   */
  variant?: BannerVariant;
  /**
   * Icon name to display (optional)
   */
  iconName?: IconName;
  /**
   * Actions to display as buttons (optional)
   */
  actions?: BannerAction[];
  /**
   * Whether the banner is dismissible
   * @default false
   */
  dismissible?: boolean;
  /**
   * Function called when the dismiss button is pressed
   */
  onDismiss?: () => void;
  /**
   * Additional styles for the banner container
   */
  style?: ViewStyle;
  /**
   * Additional styles for the text container
   */
  textContainerStyle?: ViewStyle;
  /**
   * Additional styles for the title text
   */
  titleStyle?: TextStyle;
  /**
   * Additional styles for the subtitle text
   */
  subtitleStyle?: TextStyle;
  /**
   * Additional styles for the message text
   */
  messageStyle?: TextStyle;
  /**
   * Whether to use a filled background style
   * @default true
   */
  filled?: boolean;
}

/**
 * A reusable banner component that can be used to display information, warnings, errors, or success messages.
 */
const Banner: React.FC<BannerProps> = ({
  message,
  title,
  subtitle,
  variant = 'info',
  iconName,
  actions = [],
  dismissible = false,
  onDismiss,
  style,
  textContainerStyle,
  titleStyle,
  subtitleStyle,
  messageStyle,
  filled = true,
}) => {
  // Get the appropriate colors based on the variant
  const getVariantStyles = () => {
    const variantColors = {
      info: {
        background: filled ? colors.status.info + '20' : 'transparent', // 20% opacity
        border: colors.status.info,
        text: colors.status.info,
        icon: colors.status.info,
      },
      success: {
        background: filled ? colors.status.success + '20' : 'transparent',
        border: colors.status.success,
        text: colors.status.success,
        icon: colors.status.success,
      },
      warning: {
        background: filled ? colors.status.warning + '20' : 'transparent',
        border: colors.status.warning,
        text: colors.neutral.darkGrey,
        icon: colors.status.warning,
      },
      error: {
        background: filled ? colors.status.error + '20' : 'transparent',
        border: colors.status.error,
        text: colors.status.error,
        icon: colors.status.error,
      },
      neutral: {
        background: filled ? colors.neutral.veryLightGrey : 'transparent',
        border: colors.neutral.lightGrey,
        text: colors.neutral.darkGrey,
        icon: colors.neutral.grey,
      },
      contrast: {
        background: filled ? colors.neutral.black : 'transparent',
        border: colors.neutral.black,
        text: colors.neutral.white,
        icon: colors.neutral.white,
      },
    };

    return variantColors[variant];
  };

  const variantStyles = getVariantStyles();

  const containerStyle: ViewStyle = {
    backgroundColor: variantStyles.background,
    borderColor: variantStyles.border,
    borderWidth: filled ? 0 : 1,
  };

  const textStyle: TextStyle = {
    color: variantStyles.text,
  };

  return (
    <View style={[styles.container, containerStyle, style]}>
      {/* Icon */}
      {iconName && (
        <View style={styles.iconContainer}>
          <Icon name={iconName} size={24} color={variantStyles.icon} />
        </View>
      )}

      <View style={styles.contentContainer}>
        {/* Title, subtitle and message */}
        <View style={[styles.textContainer, textContainerStyle]}>
          {title && (
            <Text style={[styles.title, textStyle, titleStyle]}>{title}</Text>
          )}
          {subtitle && (
            <Text style={[styles.subtitle, textStyle, subtitleStyle]}>
              {subtitle}
            </Text>
          )}
          <Text style={[styles.message, textStyle, messageStyle]}>
            {message}
          </Text>
        </View>

        {/* Actions */}
        {actions.length > 0 && (
          <View style={styles.actionsContainer}>
            {actions.map((action, index) => (
              <TouchableOpacity
                key={`action-${index}`}
                style={styles.actionButton}
                onPress={action.onPress}>
                <Text style={[styles.actionText, textStyle]}>
                  {action.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Dismiss button */}
      {dismissible && onDismiss && (
        <TouchableOpacity style={styles.dismissButton} onPress={onDismiss}>
          <Icon name="close" size={20} color={variantStyles.text} />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default Banner;
