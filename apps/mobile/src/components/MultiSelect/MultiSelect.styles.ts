import {StyleSheet} from 'react-native';
import {colors, fontSizes, spacing, radius} from '../../theme';

interface StyleProps {
  isOpen: boolean;
  maxHeight?: number;
  hasError: boolean;
  disabled: boolean;
}

export const createStyles = (props: StyleProps) => {
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
      height: spacing.form.inputHeight,
      borderWidth: 1,
      borderColor: props.hasError
        ? colors.status.error
        : props.isOpen
        ? colors.neutral.lightGrey
        : colors.neutral.lightGrey,
      borderRadius: radius.sm,
      paddingHorizontal: spacing.form.inputPaddingHorizontal,
      backgroundColor: props.disabled
        ? colors.neutral.veryLightGrey
        : colors.neutral.white,
      flexDirection: 'row',
      alignItems: 'center',
      position: 'relative',
      zIndex: 1,
    },
    input: {
      flex: 1,
      fontSize: fontSizes.md,
      color: props.disabled ? colors.neutral.lightGrey : colors.neutral.black,
      padding: 0,
      height: '100%',
    },
    // Added styles for real-time chip updates
    flexContainer: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
    },
    chipScrollView: {
      maxHeight: spacing.form.inputHeight - spacing.xs,
      marginVertical: spacing.xs / 2,
    },
    // End of added styles
    selectedItemContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      // flexWrap: 'wrap',
      flex: 1,
      gap: spacing.xs,
    },
    selectedItemText: {
      fontSize: fontSizes.md,
      color: colors.neutral.black,
      fontWeight: '500',
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
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    selectedItem: {
      backgroundColor: colors.secondary.main,
    },
    itemText: {
      fontSize: fontSizes.md,
      color: colors.neutral.black,
      flex: 1,
    },
    disabledText: {
      color: colors.neutral.lightGrey,
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
      marginLeft: spacing.sm,
    },
    maxItemsText: {
      color: colors.status.warning,
      fontSize: fontSizes.xs,
      marginTop: spacing.xs,
      marginLeft: spacing.sm,
    },
    loadingContainer: {
      padding: spacing.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    clearButton: {
      padding: spacing.xs,
    },
    placeholder: {
      color: colors.neutral.grey,
      fontSize: fontSizes.md,
    },
    arrowIcon: {
      width: 16,
      height: 16,
      marginLeft: spacing.xs,
    },
  });
};
