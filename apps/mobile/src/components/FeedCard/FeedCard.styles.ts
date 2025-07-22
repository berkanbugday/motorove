import {StyleSheet} from 'react-native';
import {colors, spacing, radius, getShadow} from '@theme';

export const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.neutral.white,
    borderRadius: radius.lg,
    marginVertical: spacing.sm,
    ...getShadow('small'),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.neutral.black,
    marginRight: spacing.sm,
  },
  headerInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  labelsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    marginTop: -spacing.xs,
    marginBottom: spacing.sm,
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  label: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.md,
    marginBottom: spacing.xs,
  },
  labelIcon: {
    marginRight: spacing.xs / 2,
  },
  labelText: {
    fontWeight: '500',
  },
  content: {
    paddingHorizontal: spacing.md,
  },
  mainImage: {
    width: '100%',
    height: 200,
    alignSelf: 'center',
    borderRadius: radius.lg,
  },
  imageContainer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    position: 'relative',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.neutral.black,
    borderRadius: radius.lg,
  },
  carouselContainer: {
    position: 'relative',
    overflow: 'hidden',
  },
  routeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.secondary.light,
    borderRadius: radius.sm,
    marginTop: spacing.md,
    marginLeft: spacing.md,
    marginRight: spacing.md,
  },
  routeTitle: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  actionBar: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.xl,
  },
  saveButton: {
    marginLeft: 'auto',
    marginRight: 0,
  },
  actionText: {
    marginLeft: spacing.xs,
  },
  labelChip: {
    marginRight: spacing.xs,
  },
  // Pagination styles
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
});
