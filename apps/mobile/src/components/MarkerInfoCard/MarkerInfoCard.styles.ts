import {StyleSheet} from 'react-native';
import {colors, radius, spacing, getShadow} from '@theme';

export const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.neutral.white,
    borderRadius: radius.lg,
    ...getShadow('small'),
    maxWidth: '90%',
  },
  compactContainer: {
    borderRadius: radius.md,
  },
  elevatedContainer: {
    ...getShadow('medium'),
  },
  content: {
    padding: spacing.md,
  },
  closeButton: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 30,
    height: 30,
    backgroundColor: colors.neutral.black,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  titleIcon: {
    marginRight: spacing.xs,
  },
  title: {
    flex: 1,
  },
  subtitle: {
    marginBottom: spacing.sm,
  },
  infoLinesContainer: {
    marginVertical: spacing.sm,
    gap: spacing.sm,
  },
  infoLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  infoTextContainer: {
    flex: 1,
    flexDirection: 'column',
  },
  infoIcon: {
    marginRight: spacing.sm,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  tag: {
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
  },
  actionsContainer: {
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  primarySecondaryActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  secondaryButton: {
    backgroundColor: colors.status.successDark,
  },
});
