import {StyleSheet} from 'react-native';
import {colors, spacing, radius, getShadow} from '@theme';

export const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.neutral.white,
    borderRadius: radius.lg,
    overflow: 'hidden',
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
    paddingBottom: spacing.md,
  },
  mainImage: {
    width: '100%',
    height: 240,
  },
  routeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.neutral.lightGrey,
  },
  routeTitle: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  routeButton: {
    backgroundColor: colors.primary.main,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
  },
  actionBar: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.lg,
  },
  saveButton: {
    marginLeft: 'auto',
    marginRight: 0,
  },
  actionText: {
    marginLeft: spacing.xs / 2,
  },
});
