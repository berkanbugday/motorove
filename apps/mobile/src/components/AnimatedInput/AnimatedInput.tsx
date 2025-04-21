import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Animated,
  TextStyle,
} from 'react-native';
import {
  Controller,
  Control,
  Path,
  FieldValues,
  FieldError,
} from 'react-hook-form';
import {Icon} from '@components/Icon';
import {colors, spacing, radius, fontSizes} from '@theme';

// Animation constants
const ANIMATION_DURATION = 200;

// Input layout constants
const INPUT_ICON_WIDTH = spacing.xl;
const LABEL_LEFT_POSITION = spacing.md;
const LABEL_TOP_POSITION = spacing.md;
const ICON_HORIZONTAL_POSITION = spacing.md;
const ICON_VERTICAL_POSITION = spacing.md;

// Z-index constants
const zIndex = {
  base: 1,
  elevated: 5,
};

interface BaseAnimatedInputProps {
  label: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  onToggleSecureEntry?: () => void;
  showPassword?: boolean;
  testID?: string;
}

interface StandaloneAnimatedInputProps extends BaseAnimatedInputProps {
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  control?: undefined;
  name?: undefined;
}

interface FormAnimatedInputProps<T extends FieldValues>
  extends BaseAnimatedInputProps {
  control: Control<T>;
  name: Path<T>;
  value?: undefined;
  onChangeText?: undefined;
  error?: FieldError;
}

type AnimatedInputProps<T extends FieldValues = any> =
  | StandaloneAnimatedInputProps
  | FormAnimatedInputProps<T>;

export function AnimatedInput<T extends FieldValues = any>(
  props: AnimatedInputProps<T>,
) {
  // Determine if we're using form mode
  const isFormMode = props.control !== undefined && props.name !== undefined;

  // If we're in form mode, render with Controller
  if (isFormMode) {
    const {
      control,
      name,
      label,
      secureTextEntry = false,
      keyboardType = 'default',
      icon,
      iconPosition = 'right',
      error,
      onToggleSecureEntry,
      showPassword,
      testID,
    } = props as FormAnimatedInputProps<T>;

    return (
      <Controller
        control={control}
        name={name}
        render={({field: {onChange, value, onBlur: _onBlur}}) => (
          <AnimatedInputBase
            label={label}
            value={value}
            onChangeText={onChange}
            secureTextEntry={secureTextEntry}
            keyboardType={keyboardType}
            icon={icon}
            iconPosition={iconPosition}
            error={error?.message}
            onToggleSecureEntry={onToggleSecureEntry}
            showPassword={showPassword}
            testID={testID}
          />
        )}
      />
    );
  }

  // If we're in standalone mode, render directly
  const {
    label,
    value,
    onChangeText,
    secureTextEntry = false,
    keyboardType = 'default',
    icon,
    iconPosition = 'right',
    error,
    onToggleSecureEntry,
    showPassword,
    testID,
  } = props as StandaloneAnimatedInputProps;

  return (
    <AnimatedInputBase
      label={label}
      value={value}
      onChangeText={onChangeText}
      secureTextEntry={secureTextEntry}
      keyboardType={keyboardType}
      icon={icon}
      iconPosition={iconPosition}
      error={error}
      onToggleSecureEntry={onToggleSecureEntry}
      showPassword={showPassword}
      testID={testID}
    />
  );
}

// The base input component without form integration
interface AnimatedInputBaseProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  error?: string;
  onToggleSecureEntry?: () => void;
  showPassword?: boolean;
  testID?: string;
}

function AnimatedInputBase({
  label,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = 'default',
  icon,
  iconPosition = 'right',
  error,
  onToggleSecureEntry,
  showPassword,
  testID,
}: AnimatedInputBaseProps) {
  const [isFocused, setIsFocused] = useState(false);
  const animatedIsFocused = useRef(new Animated.Value(value ? 1 : 0)).current;
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    Animated.timing(animatedIsFocused, {
      toValue: isFocused || value ? 1 : 0,
      duration: ANIMATION_DURATION,
      useNativeDriver: false,
    }).start();
  }, [animatedIsFocused, isFocused, value]);

  const labelStyle: Animated.AnimatedProps<TextStyle> = {
    position: 'absolute',
    left: LABEL_LEFT_POSITION,
    top: animatedIsFocused.interpolate({
      inputRange: [0, 1],
      outputRange: [LABEL_TOP_POSITION, -10],
    }),
    fontSize: animatedIsFocused.interpolate({
      inputRange: [0, 1],
      outputRange: [fontSizes.md, fontSizes.xs],
    }),
    color: animatedIsFocused.interpolate({
      inputRange: [0, 1],
      outputRange: [colors.neutral.grey, colors.neutral.black],
    }),
    backgroundColor: colors.neutral.white,
    paddingHorizontal: spacing.xs,
    zIndex: zIndex.elevated,
  };

  const handleLabelPress = () => {
    inputRef.current?.focus();
  };

  const getInputStyles = () => {
    const baseStyles: any[] = [styles.input, error && styles.inputError];

    if (iconPosition === 'left') {
      baseStyles.push(styles.inputWithLeftIcon);
    } else if (iconPosition === 'right') {
      baseStyles.push(styles.inputWithRightIcon);
    }

    return baseStyles;
  };

  const getIconContainerStyle = () => {
    return iconPosition === 'left' ? styles.leftIcon : styles.rightIcon;
  };

  return (
    <View style={styles.inputContainer} testID={testID}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={handleLabelPress}
        style={styles.labelContainer}>
        <Animated.Text style={labelStyle}>{label}</Animated.Text>
      </TouchableOpacity>
      <TextInput
        ref={inputRef}
        style={getInputStyles()}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        autoCapitalize="none"
        testID={`${testID}-input`}
      />
      <View style={getIconContainerStyle()}>
        {onToggleSecureEntry ? (
          <TouchableOpacity
            onPress={onToggleSecureEntry}
            testID={`${testID}-toggle`}>
            <Icon name={showPassword ? 'eye' : 'eye-slash'} size={20} />
          </TouchableOpacity>
        ) : (
          icon
        )}
      </View>
      {error ? (
        <Text style={styles.errorText} testID={`${testID}-error`}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    marginBottom: spacing.form.inputMarginBottom,
    position: 'relative',
  },
  labelContainer: {
    position: 'absolute',
    left: 0,
    top: 0,
    zIndex: zIndex.base,
  },
  input: {
    height: spacing.form.inputHeight,
    borderWidth: 1,
    borderColor: colors.neutral.veryLightGrey,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.form.inputPaddingHorizontal,
    fontSize: fontSizes.md,
  },
  inputWithLeftIcon: {
    paddingLeft: INPUT_ICON_WIDTH,
  },
  inputWithRightIcon: {
    paddingRight: INPUT_ICON_WIDTH,
  },
  inputError: {
    borderColor: colors.status.error,
  },
  leftIcon: {
    position: 'absolute',
    left: ICON_HORIZONTAL_POSITION,
    top: ICON_VERTICAL_POSITION,
    zIndex: zIndex.base,
  },
  rightIcon: {
    position: 'absolute',
    right: ICON_HORIZONTAL_POSITION,
    top: ICON_VERTICAL_POSITION,
    zIndex: zIndex.base,
  },
  errorText: {
    color: colors.status.error,
    fontSize: fontSizes.xs,
    marginTop: spacing.xs,
    marginLeft: spacing.md,
  },
});
