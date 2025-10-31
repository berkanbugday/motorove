import {StyleSheet} from 'react-native';
import {colors, spacing, radius, getShadow, fontSizes} from '@theme';

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
    minHeight: 120,
    maxHeight: 200,
  },
  mediumCard: {
    minHeight: 180,
    maxHeight: 260,
  },
  largeCard: {
    minHeight: 240,
    maxHeight: 320,
  },

  // Image background style
  imageBackground: {
    width: '100%',
    height: '100%',
  },

  // Content styles
  content: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.3)', // Semi-transparent overlay
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

  // Header styles
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
    padding: spacing.sm,
  },

  // Title styles
  title: {
    padding: spacing.xs,
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
  },
  titleContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.round,
    alignSelf: 'flex-start',
    marginBottom: spacing.sm,
  },

  // Text styles
  subtitle: {
    fontSize: fontSizes.md,
    fontWeight: 'light',
    marginTop: spacing.xs,
    marginLeft: spacing.lg,
    marginBottom: spacing.sm,
  },
  text: {
    marginBottom: spacing.sm,
  },

  // Footer styles
  footer: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },

  // State styles
  disabledCard: {
    opacity: 0.6,
  },
});
