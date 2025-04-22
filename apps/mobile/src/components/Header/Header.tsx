import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
  StatusBar,
  Platform,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {colors, spacing, typography} from '@theme';
import {Icon, IconName} from '../Icon';

export interface HeaderProps {
  /**
   * Title text to display in the header
   */
  title?: string;

  /**
   * Optional subtitle text to display below the title
   */
  subtitle?: string;

  /**
   * Whether to show a back button on the left
   */
  showBackButton?: boolean;

  /**
   * Function to call when the back button is pressed
   */
  onBackPress?: () => void;

  /**
   * Optional icon name for the left side
   */
  leftIconName?: IconName;

  /**
   * Function to call when the left icon is pressed
   */
  onLeftIconPress?: () => void;

  /**
   * Optional icon name for the right button
   */
  rightIconName?: IconName;

  /**
   * Optional text for the right button
   */
  rightButtonText?: string;

  /**
   * Function to call when the right button is pressed
   */
  onRightButtonPress?: () => void;

  /**
   * Background color for the header
   */
  backgroundColor?: string;

  /**
   * Text color for the header title
   */
  textColor?: string;

  /**
   * Additional styles for the header container
   */
  containerStyle?: ViewStyle;

  /**
   * Additional styles for the header title
   */
  titleStyle?: TextStyle;

  /**
   * Whether to show a shadow under the header
   */
  showShadow?: boolean;

  /**
   * Whether to include status bar height in the header
   */
  includeStatusBar?: boolean;
}

export function Header({
  title,
  subtitle,
  showBackButton = false,
  onBackPress,
  leftIconName,
  onLeftIconPress,
  rightIconName,
  rightButtonText,
  onRightButtonPress,
  backgroundColor = colors.neutral.white,
  textColor = colors.neutral.black,
  containerStyle,
  titleStyle,
  showShadow = false,
  includeStatusBar = false,
}: HeaderProps) {
  // Get status bar height from safe area insets
  const insets = useSafeAreaInsets();
  const statusBarHeight = includeStatusBar ? insets.top : 0;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor,
          paddingTop: statusBarHeight,
        },
        showShadow && styles.shadow,
        containerStyle,
      ]}>
      <StatusBar
        barStyle={
          backgroundColor === colors.neutral.white ||
          backgroundColor === colors.neutral.background
            ? 'dark-content'
            : 'light-content'
        }
        backgroundColor={backgroundColor}
      />

      <View style={styles.contentContainer}>
        {/* Left section (back button or custom icon) */}
        <View style={styles.leftSection}>
          {showBackButton ? (
            <TouchableOpacity
              onPress={onBackPress}
              style={styles.backButton}
              hitSlop={{top: 10, right: 10, bottom: 10, left: 10}}>
              <Icon name="arrow-left" size={24} color={textColor} />
            </TouchableOpacity>
          ) : leftIconName ? (
            <TouchableOpacity
              onPress={onLeftIconPress}
              style={styles.backButton}
              hitSlop={{top: 10, right: 10, bottom: 10, left: 10}}>
              <Icon name={leftIconName} size={24} color={textColor} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Middle section (title) */}
        <View style={styles.titleSection}>
          {title && (
            <Text
              style={[styles.title, {color: textColor}, titleStyle]}
              numberOfLines={1}>
              {title}
            </Text>
          )}
          {subtitle && (
            <Text
              style={[styles.subtitle, {color: textColor}]}
              numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>

        {/* Right section (optional button/icon) */}
        <View style={styles.rightSection}>
          {(rightIconName || rightButtonText) && (
            <TouchableOpacity
              onPress={onRightButtonPress}
              style={styles.rightButton}
              hitSlop={{top: 10, right: 10, bottom: 10, left: 10}}>
              {rightIconName ? (
                <Icon name={rightIconName} size={24} color={textColor} />
              ) : rightButtonText ? (
                <Text style={[styles.rightButtonText, {color: textColor}]}>
                  {rightButtonText}
                </Text>
              ) : null}
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  shadow: {
    ...Platform.select({
      ios: {
        shadowColor: colors.neutral.black,
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    paddingHorizontal: spacing.screen.horizontal,
  },
  leftSection: {
    width: 40,
    alignItems: 'flex-start',
  },
  backButton: {
    padding: spacing.xs,
  },
  titleSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: typography.subtitle.fontSize,
    fontWeight: typography.subtitle.fontWeight as TextStyle['fontWeight'],
    lineHeight: typography.subtitle.lineHeight,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.caption.fontSize,
    fontWeight: typography.caption.fontWeight as TextStyle['fontWeight'],
    lineHeight: typography.caption.lineHeight,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  rightSection: {
    width: 40,
    alignItems: 'flex-end',
  },
  rightButton: {
    padding: spacing.xs,
  },
  rightButtonText: {
    fontSize: typography.bodySmall.fontSize,
    fontWeight: typography.buttonText.fontWeight as TextStyle['fontWeight'],
  },
});
