import {StyleSheet} from 'react-native';
import {colors, spacing, radius, getShadow} from '@theme';

export const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.neutral.white,
    overflow: 'hidden',
    marginVertical: spacing.xs,
    borderWidth: 0,
    borderRadius: radius.lg,
  },

  // Variant styles
  elevatedCard: {
    ...getShadow('small'),
  },
  outlinedCard: {
    borderWidth: 1,
    borderRadius: radius.lg,
    borderColor: colors.neutral.lightGrey,
  },
  flatCard: {},

  // Size styles
  smallCard: {
    minHeight: 80,
  },
  mediumCard: {
    minHeight: 120,
  },
  largeCard: {
    minHeight: 160,
  },

  // Content padding based on size
  content: {
    flex: 1,
  },
  smallContent: {
    padding: spacing.sm,
  },
  mediumContent: {
    padding: spacing.md,
  },
  largeContent: {
    padding: spacing.lg,
  },

  // Image styles
  image: {
    width: '100%',
    height: 150,
  },

  // Full image overlay styles
  fullImageContent: {
    padding: spacing.md,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    flex: 1,
    justifyContent: 'flex-end',
  },

  // Text styles
  title: {
    marginBottom: spacing.xs,
  },
  titleContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    borderRadius: radius.round,
    alignSelf: 'flex-start',
    paddingTop: spacing.sm,
  },
  subtitle: {
    marginBottom: spacing.sm,
  },
  text: {
    marginBottom: spacing.sm,
  },

  // Footer styles
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.neutral.veryLightGrey,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  fullImageFooter: {
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },

  // State styles
  disabledCard: {
    opacity: 0.6,
  },
});
