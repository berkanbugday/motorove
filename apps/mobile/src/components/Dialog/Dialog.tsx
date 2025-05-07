import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
  forwardRef,
} from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextStyle,
  TextInput,
  Keyboard,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import {Typography} from '../Typography';
import {Button} from '../Button';
import {colors, spacing, componentRadius} from '@theme';
import {DialogProps, DialogRef} from './types';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

const Dialog = forwardRef<DialogRef, DialogProps>(
  (
    {
      // Content
      title,
      message,
      children,

      // Customization
      variant = 'alert',
      titleStyle,
      messageStyle,
      containerStyle,
      contentContainerStyle,

      // Buttons and actions
      confirmButton,
      cancelButton,
      buttons,

      // Prompt specific props
      promptPlaceholder = 'Enter text',
      promptDefaultValue = '',
      promptKeyboardType = 'default',
      onPromptSubmit,

      // Behavior
      visible = false,
      onClose,
      onDismiss,
      backdropOpacity = 0.5,
      closeOnBackdropPress = true,
      closeOnButtonPress = true,
      animationDuration = 300,

      // Accessibility
      testID,
    },
    ref,
  ) => {
    // State
    const [isVisible, setIsVisible] = useState(visible);
    const [promptValue, setPromptValue] = useState(promptDefaultValue);

    // Animation values
    const opacity = useSharedValue(0);
    const scale = useSharedValue(0.8);

    // Update visibility based on prop changes
    useEffect(() => {
      if (visible) {
        setIsVisible(true);
        opacity.value = withTiming(1, {
          duration: animationDuration,
          easing: Easing.out(Easing.cubic),
        });
        scale.value = withTiming(1, {
          duration: animationDuration,
          easing: Easing.out(Easing.cubic),
        });
      } else {
        opacity.value = withTiming(
          0,
          {
            duration: animationDuration,
            easing: Easing.in(Easing.cubic),
          },
          finished => {
            if (finished) {
              // Run on JS thread after animation
              runOnJS(handleAnimationComplete)();
            }
          },
        );
        scale.value = withTiming(0.8, {
          duration: animationDuration,
          easing: Easing.in(Easing.cubic),
        });
      }
    }, [visible, opacity, scale, animationDuration, onDismiss]);

    // Handle animation completion
    const handleAnimationComplete = useCallback(() => {
      setIsVisible(false);
      if (onDismiss) {
        onDismiss();
      }
    }, [onDismiss]);

    // Dialog handlers
    const handleOpen = useCallback(() => {
      setIsVisible(true);
      opacity.value = withTiming(1, {
        duration: animationDuration,
        easing: Easing.out(Easing.cubic),
      });
      scale.value = withTiming(1, {
        duration: animationDuration,
        easing: Easing.out(Easing.cubic),
      });
    }, [opacity, scale, animationDuration]);

    const handleClose = useCallback(() => {
      Keyboard.dismiss();
      opacity.value = withTiming(
        0,
        {
          duration: animationDuration,
          easing: Easing.in(Easing.cubic),
        },
        finished => {
          if (finished) {
            runOnJS(handleCloseComplete)();
          }
        },
      );
      scale.value = withTiming(0.8, {
        duration: animationDuration,
        easing: Easing.in(Easing.cubic),
      });
    }, [opacity, scale, animationDuration, onClose]);

    const handleCloseComplete = useCallback(() => {
      setIsVisible(false);
      if (onClose) {
        onClose();
      }
    }, [onClose]);

    const handleBackdropPress = useCallback(() => {
      if (closeOnBackdropPress) {
        handleClose();
      }
    }, [closeOnBackdropPress, handleClose]);

    const handleConfirm = useCallback(() => {
      if (variant === 'prompt' && onPromptSubmit) {
        onPromptSubmit(promptValue);
      }

      if (confirmButton?.onPress) {
        confirmButton.onPress();
      }

      if (closeOnButtonPress) {
        handleClose();
      }
    }, [
      variant,
      promptValue,
      onPromptSubmit,
      confirmButton,
      closeOnButtonPress,
      handleClose,
    ]);

    const handleCancel = useCallback(() => {
      if (cancelButton?.onPress) {
        cancelButton.onPress();
      }

      if (closeOnButtonPress) {
        handleClose();
      }
    }, [cancelButton, closeOnButtonPress, handleClose]);

    // Expose methods via ref
    useImperativeHandle(
      ref,
      () => ({
        open: handleOpen,
        close: handleClose,
        setPromptValue,
      }),
      [handleOpen, handleClose, setPromptValue],
    );

    // Animated styles
    const containerAnimatedStyle = useAnimatedStyle(() => {
      return {
        opacity: opacity.value,
        transform: [{scale: scale.value}],
      };
    });

    const backdropAnimatedStyle = useAnimatedStyle(() => {
      return {
        opacity: opacity.value * backdropOpacity,
      };
    });

    // Dialog content based on variant
    const renderContent = () => {
      switch (variant) {
        case 'prompt':
          return (
            <>
              {title && (
                <Typography variant="title" style={[styles.title, titleStyle]}>
                  {title}
                </Typography>
              )}

              {message && (
                <Typography
                  variant="body"
                  style={[styles.message, messageStyle]}>
                  {message}
                </Typography>
              )}

              <TextInput
                style={styles.promptInput}
                placeholder={promptPlaceholder}
                value={promptValue}
                onChangeText={setPromptValue}
                keyboardType={promptKeyboardType}
                autoCapitalize="none"
                autoFocus
              />

              {renderButtons()}
            </>
          );

        case 'custom':
          return children;

        case 'alert':
        case 'confirm':
        default:
          return (
            <>
              {title && (
                <Typography variant="title" style={[styles.title, titleStyle]}>
                  {title}
                </Typography>
              )}

              {message && (
                <Typography
                  variant="body"
                  style={[styles.message, messageStyle]}>
                  {message}
                </Typography>
              )}

              {children}

              {renderButtons()}
            </>
          );
      }
    };

    // Render buttons based on variant or custom buttons
    const renderButtons = () => {
      if (buttons && buttons.length > 0) {
        return (
          <View style={styles.buttonsContainer}>
            {buttons.map((button, index) => (
              <View
                key={`dialog-button-${index}`}
                style={[
                  styles.buttonWrapper,
                  index < buttons.length - 1 && styles.buttonWithMargin,
                ]}>
                <Button
                  title={button.text}
                  onPress={button.onPress}
                  variant={button.variant || 'primary'}
                  loading={button.loading}
                  disabled={button.disabled}
                  style={styles.button}
                  textStyle={button.textStyle as TextStyle}
                />
              </View>
            ))}
          </View>
        );
      }

      switch (variant) {
        case 'confirm':
        case 'prompt':
          return (
            <View style={styles.buttonsContainer}>
              {cancelButton && (
                <View style={[styles.buttonWrapper, styles.buttonWithMargin]}>
                  <Button
                    title={cancelButton.text || 'Cancel'}
                    onPress={handleCancel}
                    variant={cancelButton.variant || 'outline'}
                    loading={cancelButton.loading}
                    disabled={cancelButton.disabled}
                    style={styles.button}
                    textStyle={cancelButton.textStyle as TextStyle}
                  />
                </View>
              )}

              {confirmButton && (
                <View style={styles.buttonWrapper}>
                  <Button
                    title={confirmButton.text || 'OK'}
                    onPress={handleConfirm}
                    variant={confirmButton.variant || 'primary'}
                    loading={confirmButton.loading}
                    disabled={confirmButton.disabled}
                    style={styles.button}
                    textStyle={confirmButton.textStyle as TextStyle}
                  />
                </View>
              )}
            </View>
          );

        case 'alert':
        default:
          return (
            <View style={styles.buttonsContainer}>
              <View style={styles.buttonWrapper}>
                <Button
                  title={confirmButton?.text || 'OK'}
                  onPress={handleConfirm}
                  variant={confirmButton?.variant || 'primary'}
                  loading={confirmButton?.loading}
                  disabled={confirmButton?.disabled}
                  style={styles.button}
                  textStyle={confirmButton?.textStyle as TextStyle}
                />
              </View>
            </View>
          );
      }
    };

    if (!isVisible) {
      return null;
    }

    return (
      <Modal
        visible={isVisible}
        transparent
        animationType="none"
        onRequestClose={handleClose}
        statusBarTranslucent
        testID={testID}>
        <View style={styles.modalContainer}>
          <TouchableOpacity
            activeOpacity={1}
            style={[StyleSheet.absoluteFill]}
            onPress={handleBackdropPress}>
            <Animated.View style={[styles.backdrop, backdropAnimatedStyle]} />
          </TouchableOpacity>

          <Animated.View
            style={[
              styles.dialogContainer,
              containerAnimatedStyle,
              containerStyle,
            ]}>
            <View style={[styles.contentContainer, contentContainerStyle]}>
              {renderContent()}
            </View>
          </Animated.View>
        </View>
      </Modal>
    );
  },
);

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.neutral.black,
  },
  dialogContainer: {
    width: SCREEN_WIDTH * 0.85,
    maxWidth: 400,
    backgroundColor: colors.neutral.white,
    borderRadius: componentRadius.card,
    shadowColor: colors.neutral.black,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  contentContainer: {
    padding: spacing.lg,
  },
  title: {
    marginBottom: spacing.sm,
  },
  message: {
    marginBottom: spacing.md,
  },
  promptInput: {
    borderWidth: 1,
    borderColor: colors.neutral.lightGrey,
    borderRadius: componentRadius.input,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginVertical: spacing.sm,
    fontSize: 16,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: spacing.md,
  },
  buttonWrapper: {
    flex: 1,
  },
  buttonWithMargin: {
    marginRight: spacing.sm,
  },
  button: {
    minWidth: 80,
  },
});

export default Dialog;
