import React, {useState, useRef, useEffect, useCallback} from 'react';
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
import {colors, spacing, radius, fontSizes} from '@theme';
import {Caption} from '@components/Typography';

// Animation constants
const ANIMATION_DURATION = 200;

// Input layout constants
const LABEL_LEFT_POSITION = spacing.md;
const LABEL_TOP_POSITION = spacing.md;

// Z-index constants
const zIndex = {
  base: 1,
  elevated: 5,
};

interface BaseNumberAnimatedInputProps {
  label?: string;
  placeholder?: string;
  decimalPlaces?: number;
  thousandSeparator?: string;
  decimalSeparator?: string;
  allowNegative?: boolean;
  maxValue?: number;
  minValue?: number;
  testID?: string;
  editable?: boolean;
  onPress?: () => void;
  onEndEditing?: () => void;
}

interface StandaloneNumberAnimatedInputProps
  extends BaseNumberAnimatedInputProps {
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  control?: undefined;
  name?: undefined;
}

interface FormNumberAnimatedInputProps<T extends FieldValues>
  extends BaseNumberAnimatedInputProps {
  control: Control<T>;
  name: Path<T>;
  value?: undefined;
  onChangeText?: undefined;
  error?: FieldError;
}

type NumberAnimatedInputProps<T extends FieldValues = any> =
  | StandaloneNumberAnimatedInputProps
  | FormNumberAnimatedInputProps<T>;

export function NumberAnimatedInput<T extends FieldValues = any>(
  props: NumberAnimatedInputProps<T>,
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
      decimalPlaces = 2,
      thousandSeparator = '.',
      decimalSeparator = ',',
      allowNegative = false,
      maxValue,
      minValue = 0,
      error,
      testID,
      editable = true,
      onPress,
      onEndEditing,
    } = props as FormNumberAnimatedInputProps<T>;

    return (
      <Controller
        control={control}
        name={name}
        render={({field: {onChange, value, onBlur: _onBlur}}) => (
          <NumberAnimatedInputBase
            label={label}
            placeholder={placeholder}
            value={value}
            onChangeText={onChange}
            decimalPlaces={decimalPlaces}
            thousandSeparator={thousandSeparator}
            decimalSeparator={decimalSeparator}
            allowNegative={allowNegative}
            maxValue={maxValue}
            minValue={minValue}
            error={error?.message}
            testID={testID}
            editable={editable}
            onPress={onPress}
            onEndEditing={onEndEditing}
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
    decimalPlaces = 2,
    thousandSeparator = '.',
    decimalSeparator = ',',
    allowNegative = false,
    maxValue,
    minValue = 0,
    error,
    testID,
    editable = true,
    onPress,
    onEndEditing,
  } = props as StandaloneNumberAnimatedInputProps;

  return (
    <NumberAnimatedInputBase
      label={label}
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      decimalPlaces={decimalPlaces}
      thousandSeparator={thousandSeparator}
      decimalSeparator={decimalSeparator}
      allowNegative={allowNegative}
      maxValue={maxValue}
      minValue={minValue}
      error={error}
      testID={testID}
      editable={editable}
      onPress={onPress}
      onEndEditing={onEndEditing}
    />
  );
}

// The base number input component without form integration
interface NumberAnimatedInputBaseProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  decimalPlaces: number;
  thousandSeparator: string;
  decimalSeparator: string;
  allowNegative: boolean;
  maxValue?: number;
  minValue: number;
  error?: string;
  testID?: string;
  editable?: boolean;
  onPress?: () => void;
  onEndEditing?: () => void;
}

function NumberAnimatedInputBase({
  label,
  placeholder,
  value,
  onChangeText,
  decimalPlaces,
  thousandSeparator,
  decimalSeparator,
  allowNegative,
  maxValue,
  minValue,
  error,
  testID,
  editable = true,
  onPress,
  onEndEditing,
}: NumberAnimatedInputBaseProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [displayValue, setDisplayValue] = useState('');
  const animatedIsFocused = useRef(new Animated.Value(value ? 1 : 0)).current;
  const inputRef = useRef<TextInput>(null);

  // Format number with thousand separators
  const formatNumber = useCallback(
    (num: string): string => {
      if (!num) {
        return '';
      }

      // Remove all non-numeric characters except decimal separator and minus
      let cleanNum = num.replace(
        new RegExp(`[^0-9${decimalSeparator}${allowNegative ? '-' : ''}]`, 'g'),
        '',
      );

      // Handle negative sign
      const isNegative = allowNegative && cleanNum.startsWith('-');
      if (isNegative) {
        cleanNum = cleanNum.substring(1);
      }

      // Split by decimal separator
      const parts = cleanNum.split(decimalSeparator);
      let integerPart = parts[0] || '';
      let decimalPart = parts[1] || '';

      // Limit decimal places
      if (decimalPart.length > decimalPlaces) {
        decimalPart = decimalPart.substring(0, decimalPlaces);
      }

      // Add thousand separators to integer part
      if (integerPart.length > 3) {
        integerPart = integerPart.replace(
          /\B(?=(\d{3})+(?!\d))/g,
          thousandSeparator,
        );
      }

      // Combine parts
      let formatted = integerPart;
      if (decimalPlaces > 0 && (decimalPart || parts.length > 1)) {
        formatted += decimalSeparator + decimalPart;
      }

      return isNegative ? '-' + formatted : formatted;
    },
    [decimalSeparator, decimalPlaces, thousandSeparator, allowNegative],
  );

  // Parse formatted number back to raw number
  const parseNumber = useCallback(
    (formatted: string): string => {
      if (!formatted) {
        return '';
      }

      // Escape special regex characters in thousand separator and remove them
      const escapedThousandSeparator = thousandSeparator.replace(
        /[.*+?^${}()|[\]\\]/g,
        '\\$&',
      );
      return formatted.replace(new RegExp(escapedThousandSeparator, 'g'), '');
    },
    [thousandSeparator],
  );

  // Validate number against min/max constraints
  const validateNumber = useCallback(
    (num: string): boolean => {
      if (!num) {
        return true;
      }

      const numValue = parseFloat(parseNumber(num));
      if (isNaN(numValue)) {
        return false;
      }

      if (numValue < minValue) {
        return false;
      }
      if (maxValue !== undefined && numValue > maxValue) {
        return false;
      }

      return true;
    },
    [parseNumber, minValue, maxValue],
  );

  // Handle text change with formatting
  const handleTextChange = useCallback(
    (text: string) => {
      const formatted = formatNumber(text);

      if (validateNumber(formatted)) {
        setDisplayValue(formatted);
        onChangeText(parseNumber(formatted));
      }
    },
    [formatNumber, parseNumber, validateNumber, onChangeText],
  );

  // Update display value when value prop changes
  useEffect(() => {
    if (value !== parseNumber(displayValue)) {
      setDisplayValue(formatNumber(value));
    }
  }, [value, displayValue, formatNumber, parseNumber]);

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
      outputRange: [fontSizes.sm, fontSizes.xs],
    }),
    color: animatedIsFocused.interpolate({
      inputRange: [0, 1],
      outputRange: [
        colors.neutral.grey,
        error ? colors.status.error : colors.neutral.black,
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

  const handleLabelPress = () => {
    inputRef.current?.focus();
  };

  const getInputStyles = () => {
    const baseStyles: any[] = [styles.input, error && styles.inputError];
    return baseStyles;
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

  return (
    <View style={styles.inputContainer} testID={testID}>
      {label && renderLabelView()}
      <TextInput
        ref={inputRef}
        placeholder={placeholder}
        style={getInputStyles()}
        value={displayValue}
        onChangeText={handleTextChange}
        keyboardType="numeric"
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        autoCapitalize="none"
        testID={`${testID}-input`}
        editable={editable}
        onEndEditing={onEndEditing || (() => {})}
        placeholderTextColor={colors.neutral.lightGrey}
      />
      {onPress && !editable && (
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.touchableOverlay}
          onPress={onPress}
          testID={`${testID}-touchable-overlay`}
        />
      )}
      {renderError()}
    </View>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    position: 'relative',
    zIndex: 1,
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
    color: colors.neutral.black,
  },
  inputError: {
    borderColor: colors.status.error,
  },
  errorContainer: {
    marginTop: spacing.xs,
    marginLeft: spacing.sm,
  },
  touchableOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    zIndex: zIndex.base,
  },
});
