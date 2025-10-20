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
  imageContainer: {
    position: 'relative',
  },
  carouselContainer: {
    position: 'relative',
  },
  paginationContainer: {
    paddingVertical: spacing.sm,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  paginationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.neutral.white,
    marginHorizontal: spacing.xs / 2,
  },
  paginationInactiveDot: {
    backgroundColor: colors.neutral.white,
  },
  blurContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    overflow: 'hidden',
  },
  blurView: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  censoredOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  censoredText: {
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  hideButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
  },
});
