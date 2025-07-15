import {StyleSheet} from 'react-native';
import {colors, fontSizes, radius, spacing} from '@theme';

export const createStyles = (props: {
  isOpen: boolean;
  maxHeight?: number;
  hasError?: boolean;
  disabled?: boolean;
}) => {
  return StyleSheet.create({
    container: {
      width: '100%',
      position: 'relative',
      zIndex: props.isOpen ? 10 : 1,
    },
    inputWrapper: {
      position: 'relative',
      width: '100%',
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: props.hasError
        ? colors.status.error
        : props.isOpen
        ? colors.neutral.lightGrey
        : colors.neutral.lightGrey,
      borderRadius: radius.sm,
      paddingHorizontal: spacing.form.inputPaddingHorizontal,
      height: spacing.form.inputHeight,
      backgroundColor: props.disabled
        ? colors.neutral.veryLightGrey
        : colors.neutral.white,
    },
    input: {
      flex: 1,
      height: spacing.form.inputHeight,
      color: props.disabled ? colors.neutral.lightGrey : colors.neutral.black,
    },
    iconContainer: {
      padding: spacing.xs,
      justifyContent: 'center',
      alignItems: 'center',
    },
    dropdown: {
      position: 'absolute',
      top: '100%',
      left: 0,
      right: 0,
      marginTop: spacing.xs / 2,
      borderWidth: 1,
      borderColor: colors.neutral.lightGrey,
      borderRadius: radius.sm,
      backgroundColor: colors.neutral.white,
      maxHeight: props.maxHeight || 200,
      overflow: 'hidden',
      zIndex: 20,
    },
    item: {
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
    },
    selectedItem: {
      backgroundColor: colors.secondary.main,
    },
    selectedItemContainer: {
      flex: 1,
      justifyContent: 'center',
    },
    itemText: {
      fontSize: fontSizes.md,
      color: colors.neutral.black,
    },
    selectedItemText: {
      fontWeight: '500',
      color: colors.neutral.black,
    },
    noResults: {
      padding: spacing.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    noResultsText: {
      color: colors.neutral.grey,
      fontSize: fontSizes.md,
    },
    errorText: {
      color: colors.status.error,
      fontSize: fontSizes.xs,
      marginTop: spacing.xs,
      marginLeft: spacing.sm,
    },
    helperText: {
      color: colors.neutral.grey,
      fontSize: fontSizes.xs,
      marginTop: spacing.xs / 2,
    },
    loadingContainer: {
      padding: spacing.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    clearButton: {
      padding: spacing.xs,
    },
  });
};
