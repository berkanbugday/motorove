import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
  StatusBar,
  Text,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {colors, radius, spacing} from '@theme';
import {Icon, IconName} from '../Icon';
import {Typography, BodySmall, Subtitle} from '../Typography';

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
   * Optional icon name for the second right button
   */
  secondRightIconName?: IconName;

  /**
   * Optional text for the second right button
   */
  secondRightButtonText?: string;

  /**
   * Function to call when the second right button is pressed
   */
  onSecondRightButtonPress?: () => void;

  /**
   * Number to display as a badge on the second right icon (if > 0)
   */
  secondRightIconBadgeCount?: number;

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
  secondRightIconName,
  secondRightButtonText,
  onSecondRightButtonPress,
  secondRightIconBadgeCount = 0,
  backgroundColor = colors.neutral.white,
  textColor = colors.neutral.black,
  containerStyle,
  titleStyle,
  subtitleStyle,
  showShadow = true,
  includeStatusBar = true,
}: TopHeaderBarProps) {
  // Get status bar height from safe area insets
  const insets = useSafeAreaInsets();
  const statusBarHeight = includeStatusBar ? insets.top : 0;

  return (
    <View
      style={[
        styles.container,
        showShadow && styles.shadow,
        {
          backgroundColor,
          paddingTop: statusBarHeight,
        },
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
              <Icon name="arrow-left" size={20} color={textColor} />
            </TouchableOpacity>
          ) : leftIconName ? (
            <TouchableOpacity
              onPress={onLeftIconPress}
              style={styles.backButton}
              hitSlop={{top: 10, right: 10, bottom: 10, left: 10}}>
              <Icon name={leftIconName} size={20} color={textColor} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Middle section (title) */}
        <View style={styles.titleSection}>
          {title && (
            <Subtitle color={textColor} style={titleStyle} numberOfLines={1}>
              {title}
            </Subtitle>
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

        {/* Right section (optional buttons/icons) */}
        <View style={styles.rightSection}>
          {(rightIconName || rightButtonText) && (
            <TouchableOpacity
              onPress={onRightButtonPress}
              style={styles.rightButton}
              hitSlop={{top: 10, right: 10, bottom: 10, left: 10}}>
              {rightIconName ? (
                <View>
                  <Icon name={rightIconName} size={20} color={textColor} />
                </View>
              ) : rightButtonText ? (
                <Typography variant="buttonText" color={textColor}>
                  {rightButtonText}
                </Typography>
              ) : null}
            </TouchableOpacity>
          )}
          {(secondRightIconName || secondRightButtonText) && (
            <TouchableOpacity
              onPress={onSecondRightButtonPress}
              style={styles.rightButton}
              hitSlop={{top: 10, right: 10, bottom: 10, left: 10}}>
              {secondRightIconName ? (
                <View>
                  <Icon
                    name={secondRightIconName}
                    size={20}
                    color={textColor}
                  />
                  {secondRightIconBadgeCount > 0 && (
                    <View style={styles.badgeContainer}>
                      <Text style={styles.badgeText}>
                        {secondRightIconBadgeCount > 99
                          ? '99+'
                          : secondRightIconBadgeCount}
                      </Text>
                    </View>
                  )}
                </View>
              ) : secondRightButtonText ? (
                <Typography variant="buttonText" color={textColor}>
                  {secondRightButtonText}
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
    zIndex: 10,
    paddingBottom: spacing.sm,
    borderBottomEndRadius: 20,
    borderBottomStartRadius: 20,
  },
  shadow: {
    shadowColor: colors.neutral.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    paddingHorizontal: spacing.screen.horizontal,
  },
  leftSection: {
    width: '5%',
    alignItems: 'flex-start',
  },
  backButton: {
    padding: spacing.xs,
  },
  titleSection: {
    flex: 1,
    width: '85%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightSection: {
    width: '10%',
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    gap: spacing.sm,
  },
  rightButton: {
    padding: spacing.sm,
    borderRadius: radius.round,
    backgroundColor: colors.secondary.light,
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
