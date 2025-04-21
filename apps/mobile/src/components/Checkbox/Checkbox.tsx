import React from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import {
  Controller,
  Control,
  Path,
  FieldValues,
  FieldError,
} from 'react-hook-form';
import {colors, spacing, radius, typography} from '@theme/index';

interface BaseCheckboxProps {
  /**
   * Label text to display next to checkbox
   */
  label?: string;
  /**
   * Visual variant of the checkbox
   */
  variant?: 'primary' | 'secondary' | 'outline';
  /**
   * Size of the checkbox
   */
  size?: 'small' | 'medium' | 'large';
  /**
   * Whether the checkbox is disabled
   */
  disabled?: boolean;
  /**
   * Position of the label relative to checkbox
   */
  labelPosition?: 'left' | 'right';
  /**
   * Additional styles for the container
   */
  style?: ViewStyle;
  /**
   * Additional styles for the checkbox
   */
  checkboxStyle?: ViewStyle;
  /**
   * Additional styles for the label
   */
  labelStyle?: TextStyle;
  /**
   * Test ID for testing
   */
  testID?: string;
}

interface StandaloneCheckboxProps extends BaseCheckboxProps {
  /**
   * Whether the checkbox is checked
   */
  checked: boolean;
  /**
   * Function to call when checkbox is toggled
   */
  onToggle: () => void;
  /**
   * Error message to display
   */
  error?: string;
  control?: undefined;
  name?: undefined;
}

interface FormCheckboxProps<T extends FieldValues> extends BaseCheckboxProps {
  /**
   * React Hook Form control instance
   */
  control: Control<T>;
  /**
   * Name of the field in the form
   */
  name: Path<T>;
  /**
   * Error from react-hook-form validation
   */
  error?: FieldError;
  checked?: undefined;
  onToggle?: undefined;
}

type CheckboxProps<T extends FieldValues = any> =
  | StandaloneCheckboxProps
  | FormCheckboxProps<T>;

export function Checkbox<T extends FieldValues = any>(props: CheckboxProps<T>) {
  // Determine if we're using form mode
  const isFormMode = props.control !== undefined && props.name !== undefined;

  // If we're in form mode, render with Controller
  if (isFormMode) {
    const {
      control,
      name,
      label,
      variant = 'primary',
      size = 'medium',
      disabled = false,
      labelPosition = 'right',
      style,
      checkboxStyle,
      labelStyle,
      error,
      testID,
    } = props as FormCheckboxProps<T>;

    return (
      <Controller
        control={control}
        name={name}
        render={({field: {onChange, value}}) => (
          <CheckboxBase
            checked={!!value}
            onToggle={() => onChange(!value)}
            label={label}
            variant={variant}
            size={size}
            disabled={disabled}
            labelPosition={labelPosition}
            style={style}
            checkboxStyle={checkboxStyle}
            labelStyle={labelStyle}
            error={error?.message}
            testID={testID}
          />
        )}
      />
    );
  }

  // If we're in standalone mode, render directly
  const {
    checked,
    onToggle,
    label,
    variant = 'primary',
    size = 'medium',
    disabled = false,
    labelPosition = 'right',
    style,
    checkboxStyle,
    labelStyle,
    error,
    testID,
  } = props as StandaloneCheckboxProps;

  return (
    <CheckboxBase
      checked={checked}
      onToggle={onToggle}
      label={label}
      variant={variant}
      size={size}
      disabled={disabled}
      labelPosition={labelPosition}
      style={style}
      checkboxStyle={checkboxStyle}
      labelStyle={labelStyle}
      error={error}
      testID={testID}
    />
  );
}

// The base checkbox component without form integration
interface CheckboxBaseProps {
  checked: boolean;
  onToggle: () => void;
  label?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  labelPosition?: 'left' | 'right';
  style?: ViewStyle;
  checkboxStyle?: ViewStyle;
  labelStyle?: TextStyle;
  error?: string;
  testID?: string;
}

function CheckboxBase({
  checked,
  onToggle,
  label,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  labelPosition = 'right',
  style,
  checkboxStyle,
  labelStyle,
  error,
  testID,
}: CheckboxBaseProps) {
  const containerStyles = [
    styles.container,
    labelPosition === 'left' && styles.containerReverse,
    disabled && styles.disabledContainer,
    style,
  ];

  const checkboxStyles = [
    styles.checkbox,
    variant === 'primary' && styles.primaryCheckbox,
    variant === 'secondary' && styles.secondaryCheckbox,
    variant === 'outline' && styles.outlineCheckbox,
    checked && variant === 'primary' && styles.primaryChecked,
    checked && variant === 'secondary' && styles.secondaryChecked,
    checked && variant === 'outline' && styles.outlineChecked,
    size === 'small' && styles.smallCheckbox,
    size === 'large' && styles.largeCheckbox,
    disabled && styles.disabledCheckbox,
    error && styles.errorCheckbox,
    checkboxStyle,
  ];

  const labelStyles = [
    styles.label,
    size === 'small' && styles.smallLabel,
    size === 'large' && styles.largeLabel,
    disabled && styles.disabledLabel,
    error && styles.errorLabel,
    labelStyle,
  ];

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity
        style={containerStyles}
        onPress={onToggle}
        disabled={disabled}
        activeOpacity={0.7}
        testID={testID}>
        <View style={checkboxStyles}>
          {checked && variant === 'outline' && (
            <View style={styles.innerFill} />
          )}
        </View>
        {label && <Text style={labelStyles}>{label}</Text>}
      </TouchableOpacity>
      {error ? (
        <Text style={styles.errorText} testID={`${testID}-error`}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const BOX_SIZE_MEDIUM = 20;

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.xs,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.xs,
  },
  containerReverse: {
    flexDirection: 'row-reverse',
    justifyContent: 'flex-end',
  },
  checkbox: {
    width: BOX_SIZE_MEDIUM,
    height: BOX_SIZE_MEDIUM,
    borderRadius: radius.xs,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
  primaryCheckbox: {
    borderColor: colors.primary.main,
  },
  secondaryCheckbox: {
    borderColor: colors.secondary.main,
  },
  outlineCheckbox: {
    borderColor: colors.neutral.lightGrey,
  },
  primaryChecked: {
    backgroundColor: colors.primary.main,
    borderColor: colors.primary.main,
  },
  secondaryChecked: {
    backgroundColor: colors.secondary.main,
    borderColor: colors.secondary.main,
  },
  outlineChecked: {
    backgroundColor: 'transparent',
    borderColor: colors.primary.main,
  },
  innerFill: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.primary.main,
    borderRadius: radius.xs / 2,
  },
  smallCheckbox: {
    width: BOX_SIZE_MEDIUM - 4,
    height: BOX_SIZE_MEDIUM - 4,
    borderWidth: 1.5,
  },
  largeCheckbox: {
    width: BOX_SIZE_MEDIUM + 4,
    height: BOX_SIZE_MEDIUM + 4,
    borderWidth: 2.5,
  },
  disabledCheckbox: {
    borderColor: colors.neutral.lightGrey,
    backgroundColor: colors.neutral.veryLightGrey,
  },
  errorCheckbox: {
    borderColor: colors.status.error,
  },
  disabledContainer: {
    opacity: 0.6,
  },
  label: {
    marginLeft: spacing.xs,
    marginRight: spacing.xs,
    fontSize: typography.body.fontSize,
    fontWeight: typography.body.fontWeight as TextStyle['fontWeight'],
    color: colors.neutral.black,
  },
  smallLabel: {
    fontSize: typography.bodySmall.fontSize,
    fontWeight: typography.bodySmall.fontWeight as TextStyle['fontWeight'],
  },
  largeLabel: {
    fontSize: typography.subtitle.fontSize,
    fontWeight: typography.subtitle.fontWeight as TextStyle['fontWeight'],
  },
  disabledLabel: {
    color: colors.neutral.grey,
  },
  errorLabel: {
    color: colors.status.error,
  },
  errorText: {
    color: colors.status.error,
    fontSize: typography.bodySmall.fontSize,
    marginTop: spacing.xs / 2,
    marginLeft: spacing.md,
  },
});
