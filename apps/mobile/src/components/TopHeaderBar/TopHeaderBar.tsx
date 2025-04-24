import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
  StatusBar,
  Platform,
  Text,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {colors, spacing} from '@theme';
import {Icon, IconName} from '../Icon';
import {Typography, Title, BodySmall} from '../Typography';

export interface TopHeaderBarProps {
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
   * Number to display as a badge on the right icon (if > 0)
   */
  rightIconBadgeCount?: number;

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
   * Additional styles for the header subtitle
   */
  subtitleStyle?: TextStyle;

  /**
   * Whether to show a shadow under the header
   */
  showShadow?: boolean;

  /**
   * Whether to include status bar height in the header
   */
  includeStatusBar?: boolean;
}

export function TopHeaderBar({
  title,
  subtitle,
  showBackButton = false,
  onBackPress,
  leftIconName,
  onLeftIconPress,
  rightIconName,
  rightButtonText,
  onRightButtonPress,
  rightIconBadgeCount = 0,
  backgroundColor = colors.neutral.white,
  textColor = colors.neutral.black,
  containerStyle,
  titleStyle,
  subtitleStyle,
  showShadow = false,
  includeStatusBar = true,
}: TopHeaderBarProps) {
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
            <Title color={textColor} style={titleStyle} numberOfLines={1}>
              {title}
            </Title>
          )}
          {subtitle && (
            <BodySmall
              color={textColor}
              style={subtitleStyle}
              numberOfLines={1}>
              {subtitle}
            </BodySmall>
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
                <View>
                  <Icon name={rightIconName} size={20} color={textColor} />
                  {rightIconBadgeCount > 0 && (
                    <View style={styles.badgeContainer}>
                      <Text style={styles.badgeText}>
                        {rightIconBadgeCount > 99 ? '99+' : rightIconBadgeCount}
                      </Text>
                    </View>
                  )}
                </View>
              ) : rightButtonText ? (
                <Typography variant="buttonText" color={textColor}>
                  {rightButtonText}
                </Typography>
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
  rightSection: {
    width: 46,
    height: 46,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: 'transparent',
    borderRadius: 50,
    alignItems: 'flex-end',
    backgroundColor: colors.neutral.backgroundLight,
  },
  rightButton: {
    padding: spacing.xs,
  },
  badgeContainer: {
    position: 'absolute',
    top: -15,
    right: -15,
    backgroundColor: colors.primary.main,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: colors.neutral.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
});
