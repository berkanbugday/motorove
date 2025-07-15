import {StyleSheet, Animated, TextStyle} from 'react-native';
import {colors, fontSizes, spacing, radius} from '@theme';

interface StyleProps {
  isOpen: boolean;
  maxHeight?: number;
  hasError: boolean;
  disabled: boolean;
  error?: string;
  modalPosition?: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
  animatedIsFocused?: Animated.Value;
}

// Animation constants
const LABEL_LEFT_POSITION = spacing.md;
const LABEL_TOP_POSITION = spacing.md;

export const createStyles = (props: StyleProps) => {
  // Create animated label style if animatedIsFocused is provided
  const getLabelStyle = (): Animated.AnimatedProps<TextStyle> | undefined => {
    if (!props.animatedIsFocused) return undefined;

    return {
      position: 'absolute',
      left: LABEL_LEFT_POSITION,
      top: props.animatedIsFocused.interpolate({
        inputRange: [0, 1],
        outputRange: [LABEL_TOP_POSITION, -10],
      }),
      fontSize: props.animatedIsFocused.interpolate({
        inputRange: [0, 1],
        outputRange: [fontSizes.sm, fontSizes.xs],
      }),
      color: props.animatedIsFocused.interpolate({
        inputRange: [0, 1],
        outputRange: [
          colors.neutral.grey,
          props.error
            ? colors.status.error
            : props.isOpen
            ? colors.neutral.black
            : colors.neutral.black,
        ],
      }),
      fontWeight: props.animatedIsFocused.interpolate({
        inputRange: [0, 1],
        outputRange: ['500', '600'],
      }),
      backgroundColor: colors.neutral.white,
      paddingHorizontal: 4,
      zIndex: 5,
    };
  };

  // Create modal styles
  const getModalStyles = () => {
    return StyleSheet.create({
      backdrop: {
        flex: 1,
        backgroundColor: 'transparent',
      },
      dropdownContainer: {
        position: 'absolute',
        top: props.modalPosition?.top || 0,
        left: props.modalPosition?.left || 0,
        width: props.modalPosition?.width || '100%',
        maxHeight: props.modalPosition?.height || 200,
        borderWidth: 1,
        borderColor: colors.neutral.lightGrey,
        borderRadius: 8,
        backgroundColor: colors.neutral.white,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
    });
  };

  return {
    styles: StyleSheet.create({
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
      // Added styles for real-time chip updates
      flexContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
      },
      chipScrollView: {
        maxHeight: spacing.form.inputHeight - spacing.xs,
        marginVertical: spacing.xs,
      },
      // End of added styles
      selectedItemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
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
      },
      selectedItem: {
        backgroundColor: colors.secondary.main,
      },
      itemText: {
        fontSize: fontSizes.md,
        color: colors.neutral.black,
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
      iconContainer: {
        padding: spacing.xs,
        justifyContent: 'center',
        alignItems: 'center',
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
      touchableLabel: {
        zIndex: 5,
      },
      fullWidth: {
        width: '100%',
      },
    }),
    labelStyle: getLabelStyle(),
    modalStyles: getModalStyles(),
  };
};
