import React from 'react';
import {StyleProp, ViewStyle, TextStyle} from 'react-native';

// Types for different dialog variants
export type DialogVariant = 'alert' | 'confirm' | 'prompt' | 'custom';

// Props for dialog buttons
export interface DialogButtonProps {
  text: string;
  onPress?: () => void;
  variant?: 'primary' | 'dark' | 'secondary' | 'outline' | 'text';
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

// Main Dialog component props
export interface DialogProps {
  // Content
  title?: string;
  message?: string;
  children?: React.ReactNode;

  // Customization
  variant?: DialogVariant;
  titleStyle?: StyleProp<TextStyle>;
  messageStyle?: StyleProp<TextStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;

  // Buttons and actions
  confirmButton?: DialogButtonProps;
  cancelButton?: DialogButtonProps;
  buttons?: DialogButtonProps[];

  // Prompt specific props
  promptPlaceholder?: string;
  promptDefaultValue?: string;
  promptKeyboardType?:
    | 'default'
    | 'number-pad'
    | 'decimal-pad'
    | 'numeric'
    | 'email-address'
    | 'phone-pad';
  onPromptSubmit?: (value: string) => void;

  // Behavior
  visible?: boolean;
  onClose?: () => void;
  onDismiss?: () => void;
  backdropOpacity?: number;
  closeOnBackdropPress?: boolean;
  closeOnButtonPress?: boolean;
  animationDuration?: number;

  // Accessibility
  testID?: string;
}

// Ref interface for programmatic control
export interface DialogRef {
  open: () => void;
  close: () => void;
  setPromptValue: (value: string) => void;
}
