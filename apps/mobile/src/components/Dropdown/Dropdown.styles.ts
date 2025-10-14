import {StyleSheet, Animated, TextStyle} from 'react-native';
import {colors, fontSizes, getShadow, radius, spacing} from '@theme';

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
      width: '100%',
      zIndex: 1000,
      elevation: 5,
      marginTop: 2,
      borderWidth: 1,
      borderColor: colors.neutral.lightGrey,
      borderRadius: radius.sm,
      backgroundColor: colors.neutral.white,
      maxHeight: props.maxHeight || 200,
      overflow: 'hidden',
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
    touchableLabel: {
      zIndex: 5,
    },
    fullWidth: {
      width: '100%',
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor: colors.neutral.lightGrey,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
    },
    searchInput: {
      flex: 1,
      height: 40,
      fontSize: fontSizes.md,
      color: colors.neutral.black,
      paddingHorizontal: spacing.sm,
      borderWidth: 1,
      borderColor: colors.neutral.lightGrey,
      borderRadius: radius.sm,
      backgroundColor: colors.neutral.white,
    },
    searchClearButton: {
      padding: spacing.xs,
      marginLeft: spacing.sm,
    },
  });
};

export const modalStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  dropdownContainer: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: colors.neutral.lightGrey,
    borderRadius: 8,
    backgroundColor: colors.neutral.white,
    ...getShadow('small'),
  },
});

export const createAnimatedLabelStyle = (
  animatedIsFocused: Animated.Value,
  isOpen: boolean,
  error?: string,
): Animated.AnimatedProps<TextStyle> => {
  // Animation constants
  const LABEL_LEFT_POSITION = spacing.md;
  const LABEL_TOP_POSITION = spacing.md;

  return {
    position: 'absolute',
    left: LABEL_LEFT_POSITION,
    top: animatedIsFocused.interpolate({
      inputRange: [0, 1],
      outputRange: [LABEL_TOP_POSITION, -10],
    }),
    fontSize: animatedIsFocused.interpolate({
      inputRange: [0, 1],
      outputRange: [fontSizes.sm, fontSizes.xs],
    }),
    color: animatedIsFocused.interpolate({
      inputRange: [0, 1],
      outputRange: [
        colors.neutral.grey,
        error
          ? colors.status.error
          : isOpen
          ? colors.neutral.black
          : colors.neutral.black,
      ],
    }),
    fontWeight: animatedIsFocused.interpolate({
      inputRange: [0, 1],
      outputRange: ['500', '600'],
    }),
    backgroundColor: colors.neutral.white,
    paddingHorizontal: 4,
    zIndex: 5,
  };
};
