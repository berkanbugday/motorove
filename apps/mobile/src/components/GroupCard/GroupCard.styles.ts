import {StyleSheet} from 'react-native';
import {colors, spacing, radius} from '@theme';

export const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.neutral.white,
    borderBottomWidth: 0.5,
    borderTopWidth: 0.5,
    borderColor: colors.secondary.main,
  },
  content: {
    flexDirection: 'row',
    padding: spacing.md,
  },
  logo: {
    width: 70,
    height: 70,
    borderWidth: 1,
    borderColor: colors.neutral.black,
    borderRadius: radius.round,
    marginRight: spacing.md,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginTop: spacing.xs / 2,
  },
  tagSeparator: {
    marginHorizontal: spacing.xs / 2,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  memberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  privacyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    marginLeft: spacing.xs / 2,
  },
  badge: {
    position: 'absolute',
    top: 3,
    left: spacing.xs,
    backgroundColor: colors.primary.light,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: radius.round,
    zIndex: 1,
  },
  joinButtonContainer: {
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },
});
