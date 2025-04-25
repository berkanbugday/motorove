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
    backgroundColor: colors.neutral.white,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.secondary.light,
    ...getShadow('small'),
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  firstMenuItem: {
    borderTopLeftRadius: radius.sm,
    borderTopRightRadius: radius.sm,
  },
  lastMenuItem: {
    borderBottomLeftRadius: radius.sm,
    borderBottomRightRadius: radius.sm,
  },
  itemIcon: {
    marginRight: spacing.sm,
  },
  itemText: {
    fontSize: 14,
    color: colors.neutral.black,
  },
  highlightedItem: {
    backgroundColor: colors.secondary.light,
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
});
