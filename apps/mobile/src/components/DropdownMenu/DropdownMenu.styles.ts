import {StyleSheet} from 'react-native';
import {colors, spacing, radius, getShadow} from '@theme';

export const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  dropdown: {
    position: 'absolute',
    minWidth: 150,
    height: 'auto',
    maxHeight: 300,
    backgroundColor: colors.neutral.white,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.secondary.light,
    ...getShadow('small'),
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.neutral.white,
  },
  firstMenuItem: {
    borderTopEndRadius: radius.sm,
    borderTopStartRadius: radius.sm,
  },
  lastMenuItem: {
    borderBottomEndRadius: radius.sm,
    borderBottomStartRadius: radius.sm,
  },
  itemIcon: {
    marginRight: spacing.sm,
  },
  itemText: {
    flex: 1,
    fontSize: 14,
    color: colors.neutral.black,
  },
  highlightedText: {
    color: colors.status.error,
    fontWeight: '500',
  },
  disabledItem: {
    opacity: 0.6,
  },
  disabledText: {
    color: colors.neutral.lightGrey,
  },
  divider: {
    height: 1,
    backgroundColor: colors.secondary.light,
    width: '80%',
    alignSelf: 'center',
  },
});
