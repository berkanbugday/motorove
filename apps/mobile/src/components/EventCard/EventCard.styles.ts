import {StyleSheet} from 'react-native';
import {colors, spacing, radius} from '@theme';

export const styles = StyleSheet.create({
  featuredContainer: {
    borderWidth: 2,
    borderColor: colors.primary.main,
  },
  image: {
    width: '100%',
    height: 140,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
  },
  content: {
    padding: spacing.md,
  },
  featuredBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary.main,
    paddingVertical: spacing.xs / 2,
    paddingHorizontal: spacing.xs,
    borderRadius: radius.sm,
    zIndex: 1,
  },
  featuredText: {
    marginLeft: 4,
  },
  categoryContainer: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    zIndex: 1,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  dateTime: {
    marginLeft: spacing.xs,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  location: {
    marginLeft: spacing.xs,
  },
  participantsContainer: {
    marginTop: spacing.xs,
  },
});
