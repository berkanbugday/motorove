import {StyleSheet} from 'react-native';
import {colors, spacing, radius, getShadow} from '@theme';

export const styles = StyleSheet.create({
  // Container styles
  container: {
    flex: 1,
    width: '100%',
  },
  tabsContainer: {
    flexDirection: 'row',
    position: 'relative',
    marginHorizontal: spacing.md,
  },
  contentContainer: {
    paddingTop: spacing.md,
  },

  // Tab alignment styles
  alignStart: {
    justifyContent: 'flex-start',
  },
  alignCenter: {
    justifyContent: 'center',
  },
  alignStretch: {
    justifyContent: 'space-between',
  },

  // Base tab styles
  tab: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  equalWidthTab: {
    flex: 1,
  },
  disabledTab: {
    opacity: 0.5,
  },

  // Tab content layout styles
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabContentHorizontal: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tabContentVertical: {
    flexDirection: 'column',
    alignItems: 'center',
  },

  // Badge styles
  badgeContainer: {
    backgroundColor: colors.status.error,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
    position: 'absolute',
    top: -8,
    right: -8,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },

  // Indicator styles
  indicator: {
    position: 'absolute',
    bottom: -1,
    height: 2,
    borderRadius: radius.xs,
  },
  defaultIndicator: {
    backgroundColor: colors.neutral.black,
  },
  underlinedIndicator: {
    backgroundColor: colors.neutral.black,
  },
  minimalIndicator: {
    backgroundColor: colors.neutral.black,
  },

  // Size variants
  smallTab: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    minWidth: 60,
  },
  mediumTab: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    minWidth: 80,
  },
  largeTab: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    minWidth: 100,
  },

  // Default variant
  defaultContainer: {
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.veryLightGrey,
  },
  defaultTab: {
    backgroundColor: 'transparent',
  },
  defaultActiveTab: {
    backgroundColor: 'transparent',
  },
  defaultText: {
    color: colors.neutral.grey,
  },
  defaultActiveText: {
    color: colors.neutral.black,
  },

  // Filled variant
  filledContainer: {
    backgroundColor: colors.secondary.main,
    borderRadius: radius.md,
    padding: 2,
  },
  filledTab: {
    borderRadius: radius.sm,
    backgroundColor: 'transparent',
  },
  filledActiveTab: {
    backgroundColor: colors.neutral.white,
    ...getShadow('small'),
    borderRadius: radius.sm,
  },
  filledText: {
    color: colors.neutral.grey,
  },
  filledActiveText: {
    color: colors.neutral.black,
  },

  // Pill variant
  pillContainer: {
    backgroundColor: colors.secondary.main,
    borderRadius: radius.round,
    padding: 4,
  },
  pillTab: {
    borderRadius: radius.round,
    backgroundColor: 'transparent',
  },
  pillActiveTab: {
    backgroundColor: colors.neutral.white,
    ...getShadow('small'),
    borderRadius: radius.round,
  },
  pillText: {
    color: colors.neutral.grey,
  },
  pillActiveText: {
    color: colors.neutral.black,
  },

  // Underlined variant
  underlinedContainer: {
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.veryLightGrey,
  },
  underlinedTab: {
    backgroundColor: 'transparent',
  },
  underlinedActiveTab: {
    backgroundColor: 'transparent',
  },
  underlinedText: {
    color: colors.neutral.grey,
  },
  underlinedActiveText: {
    color: colors.neutral.black,
  },

  // Minimal variant
  minimalContainer: {},
  minimalTab: {
    backgroundColor: 'transparent',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    minWidth: 60,
  },
  minimalActiveTab: {
    backgroundColor: 'transparent',
  },
  minimalText: {
    color: colors.neutral.grey,
  },
  minimalActiveText: {
    color: colors.neutral.black,
  },
});
