import {StyleSheet} from 'react-native';
import {radius, spacing} from '@theme';

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: 'flex-start',
    alignSelf: 'center',
    overflow: 'hidden',
  },
  iconContainer: {
    marginRight: spacing.sm,
  },
  contentContainer: {
    flex: 1,
  },
  textContainer: {
    flexShrink: 1,
  },
  title: {
    fontWeight: '600',
    fontSize: 16,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: spacing.xs,
    fontWeight: '500',
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
  },
  actionsContainer: {
    flexDirection: 'row',
    marginTop: spacing.sm,
    flexWrap: 'wrap',
  },
  actionButton: {
    marginRight: spacing.sm,
    marginTop: spacing.xs,
  },
  actionText: {
    fontWeight: '600',
    fontSize: 14,
  },
  dismissButton: {
    marginLeft: spacing.xs,
    padding: spacing.xs,
  },
});
