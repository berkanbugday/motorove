import React, {useState, useRef, useEffect} from 'react';
import {
  View,
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
import {Caption} from '@components/Typography';

// Animation constants
const ANIMATION_DURATION = 200;

// Input layout constants
const INPUT_ICON_WIDTH = spacing.xxl;
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
  label?: string;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  onToggleSecureEntry?: () => void;
  showPassword?: boolean;
  testID?: string;
  multiline?: boolean;
  shape?: 'default' | 'round';
  showClearButton?: boolean;
  onClearSearch?: () => void;
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
      placeholder,
      secureTextEntry = false,
      keyboardType = 'default',
      icon,
      iconPosition = 'right',
      error,
      onToggleSecureEntry,
      showPassword,
      testID,
      multiline = false,
      shape = 'default',
      showClearButton = true,
      onClearSearch,
    } = props as FormAnimatedInputProps<T>;

    return (
      <Controller
        control={control}
        name={name}
        render={({field: {onChange, value, onBlur: _onBlur}}) => (
          <AnimatedInputBase
            label={label}
            placeholder={placeholder}
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
            multiline={multiline}
            shape={shape}
            showClearButton={showClearButton}
            onClearSearch={() => {
              onChange('');
              onClearSearch?.();
            }}
          />
        )}
      />
    );
  }

  // If we're in standalone mode, render directly
  const {
    label,
    placeholder,
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
    multiline = false,
    shape = 'default',
    showClearButton = true,
    onClearSearch,
  } = props as StandaloneAnimatedInputProps;

  return (
    <AnimatedInputBase
      label={label}
      placeholder={placeholder}
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
      multiline={multiline}
      shape={shape}
      showClearButton={showClearButton}
      onClearSearch={() => {
        onChangeText('');
        onClearSearch?.();
      }}
    />
  );
}

// The base input component without form integration
interface AnimatedInputBaseProps {
  label?: string;
  placeholder?: string;
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
  multiline?: boolean;
  shape?: 'default' | 'round';
  showClearButton?: boolean;
  onClearSearch?: () => void;
}

function AnimatedInputBase({
  label,
  placeholder,
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
  multiline = false,
  shape = 'default',
  showClearButton = false,
  onClearSearch,
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
    left: iconPosition === 'left' ? INPUT_ICON_WIDTH : LABEL_LEFT_POSITION,
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
      outputRange: [colors.neutral.grey, colors.neutral.black],
    }),
    backgroundColor: colors.neutral.white,
    zIndex: zIndex.elevated,
    fontWeight: '500',
  };

  const handleLabelPress = () => {
    inputRef.current?.focus();
  };

  const getInputStyles = () => {
    const baseStyles: any[] = [styles.input, error && styles.inputError];

    if (icon && iconPosition === 'left') {
      baseStyles.push(styles.inputWithLeftIcon);
    }
    if (icon && iconPosition === 'right') {
      baseStyles.push(styles.inputWithRightIcon);
    }
    if (icon && iconPosition === 'right' && showClearButton) {
      baseStyles.push(styles.inputWithRightIconAndClearButton);
    } else if (showClearButton) {
      baseStyles.push(styles.inputWithRightIcon);
    }

    if (multiline) {
      baseStyles.push(styles.multilineInput);
    }

    if (shape === 'round') {
      baseStyles.push(styles.roundInput);
    }

    return baseStyles;
  };

  const getIconContainerStyle = () => {
    return iconPosition === 'left' ? styles.leftIcon : styles.rightIcon;
  };

  const renderLabelView = () => {
    return (
      <TouchableOpacity
        activeOpacity={1}
        onPress={handleLabelPress}
        style={styles.labelContainer}>
        <Animated.Text style={labelStyle}>{label}</Animated.Text>
      </TouchableOpacity>
    );
  };

  const renderError = () => {
    if (!error) {
      return null;
    }
    return (
      <View style={styles.errorContainer}>
        <Caption color={colors.status.error}>{error}</Caption>
      </View>
    );
  };

  const renderClearButton = () => {
    if (showClearButton && value) {
      return (
        <TouchableOpacity
          style={[
            styles.clearButton,
            {
              right:
                icon && iconPosition === 'right'
                  ? INPUT_ICON_WIDTH
                  : ICON_HORIZONTAL_POSITION,
            },
          ]}
          onPress={onClearSearch}
          testID={`${testID}-clear-button`}>
          <Icon name="close" size={18} color={colors.neutral.grey} />
        </TouchableOpacity>
      );
    }
    return null;
  };

  return (
    <View style={styles.inputContainer} testID={testID}>
      {label && renderLabelView()}
      <TextInput
        ref={inputRef}
        placeholder={placeholder}
        style={getInputStyles()}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        autoCapitalize="none"
        testID={`${testID}-input`}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
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
      {renderClearButton()}
      {renderError()}
    </View>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
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
    borderColor: colors.neutral.lightGrey,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.form.inputPaddingHorizontal,
    fontSize: fontSizes.md,
  },
  roundInput: {
    borderRadius: radius.round,
  },
  multilineInput: {
    height: spacing.form.inputHeight * 2,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    textAlignVertical: 'top',
  },
  inputWithLeftIcon: {
    paddingLeft: INPUT_ICON_WIDTH,
  },
  inputWithRightIcon: {
    paddingRight: INPUT_ICON_WIDTH,
  },
  inputWithRightIconAndClearButton: {
    paddingRight: INPUT_ICON_WIDTH * 1.5,
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
  clearButton: {
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
  errorContainer: {
    marginTop: spacing.xs,
    marginLeft: spacing.sm,
  },
});
