import React, {useState, useCallback} from 'react';
import {StyleSheet, View, StyleProp, ViewStyle} from 'react-native';
import DatePicker from 'react-native-date-picker';
import {
  Controller,
  Control,
  Path,
  FieldValues,
  FieldError,
} from 'react-hook-form';
import {colors} from '@theme';
import {Icon, IconName} from '../Icon';
import {AnimatedInput} from '../AnimatedInput';

// Define picker modes
type DateTimePickerMode = 'date' | 'time' | 'datetime';

interface BaseDateTimePickerProps {
  /**
   * Placeholder text when no date is selected
   */
  placeholder?: string;
  /**
   * Format to display the date
   */
  displayFormat?: 'short' | 'medium' | 'long' | 'full';
  /**
   * Minimum selectable date
   */
  minimumDate?: Date;
  /**
   * Maximum selectable date
   */
  maximumDate?: Date;
  /**
   * Whether the date picker is disabled
   */
  disabled?: boolean;
  /**
   * Additional styling for the container
   */
  style?: StyleProp<ViewStyle>;
  /**
   * Test ID for component testing
   */
  testID?: string;
  /**
   * Mode of the picker: 'date', 'time', or 'datetime'
   */
  mode?: DateTimePickerMode;
  /**
   * Use 24 hour format
   */
  is24Hour?: boolean;
  /**
   * Minute interval
   */
  minuteInterval?: 1 | 2 | 3 | 4 | 5 | 6 | 10 | 12 | 15 | 20 | 30;
  /**
   * Theme to use for the picker
   */
  theme?: 'light' | 'dark' | 'auto';
}

interface StandaloneDateTimePickerProps extends BaseDateTimePickerProps {
  /**
   * Currently selected date
   */
  value: Date;
  /**
   * Callback function when date changes
   */
  onChange: (date: Date) => void;
  /**
   * Error message to display
   */
  error?: FieldError;
  control?: undefined;
  name?: undefined;
}

interface FormDateTimePickerProps<T extends FieldValues>
  extends BaseDateTimePickerProps {
  control: Control<T>;
  name: Path<T>;
  value?: undefined;
  onChange?: undefined;
  error?: FieldError;
}

type DateTimePickerProps<T extends FieldValues = any> =
  | StandaloneDateTimePickerProps
  | FormDateTimePickerProps<T>;

export function DateTimePicker<T extends FieldValues = any>(
  props: DateTimePickerProps<T>,
) {
  // Determine if we're using form mode
  const isFormMode = props.control !== undefined && props.name !== undefined;

  // If we're in form mode, render with Controller
  if (isFormMode) {
    const {
      control,
      name,
      placeholder,
      displayFormat,
      minimumDate,
      maximumDate,
      disabled,
      style,
      testID,
      error,
      mode = 'date',
      is24Hour = true,
      minuteInterval,
      theme,
    } = props as FormDateTimePickerProps<T>;

    return (
      <Controller
        control={control}
        name={name}
        render={({field: {onChange, value}}) => (
          <DateTimePickerBase
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            displayFormat={displayFormat}
            minimumDate={minimumDate}
            maximumDate={maximumDate}
            disabled={disabled}
            style={style}
            testID={testID}
            error={error}
            mode={mode}
            is24Hour={is24Hour}
            minuteInterval={minuteInterval}
            theme={theme}
          />
        )}
      />
    );
  }

  // If we're in standalone mode, render directly
  const {
    value,
    onChange,
    placeholder,
    displayFormat,
    minimumDate,
    maximumDate,
    disabled,
    style,
    testID,
    error,
    mode = 'date',
    is24Hour = true,
    minuteInterval,
    theme,
  } = props as StandaloneDateTimePickerProps;

  return (
    <DateTimePickerBase
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      displayFormat={displayFormat}
      minimumDate={minimumDate}
      maximumDate={maximumDate}
      disabled={disabled}
      style={style}
      testID={testID}
      error={error}
      mode={mode}
      is24Hour={is24Hour}
      minuteInterval={minuteInterval}
      theme={theme}
    />
  );
}

// The base date picker component without form integration
interface DateTimePickerBaseProps {
  value: Date;
  onChange: (date: Date) => void;
  placeholder?: string;
  displayFormat?: 'short' | 'medium' | 'long' | 'full';
  minimumDate?: Date;
  maximumDate?: Date;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  error?: FieldError;
  mode?: DateTimePickerMode;
  is24Hour?: boolean;
  minuteInterval?: 1 | 2 | 3 | 4 | 5 | 6 | 10 | 12 | 15 | 20 | 30;
  theme?: 'light' | 'dark' | 'auto';
}

function DateTimePickerBase({
  value,
  onChange,
  placeholder = 'Select date',
  displayFormat = 'medium',
  minimumDate,
  maximumDate,
  disabled = false,
  style,
  testID,
  error,
  mode = 'date',
  is24Hour = true,
  minuteInterval,
  theme = 'auto',
}: DateTimePickerBaseProps) {
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const currentValue = value || new Date();

  const formatDateTime = (date: Date): string => {
    if (!date) {
      return placeholder;
    }

    const dateOptions: Intl.DateTimeFormatOptions = {};
    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: 'numeric',
      minute: 'numeric',
      hour12: !is24Hour,
    };

    switch (displayFormat) {
      case 'short':
        dateOptions.year = 'numeric';
        dateOptions.month = 'numeric';
        dateOptions.day = 'numeric';
        break;
      case 'medium':
        dateOptions.year = 'numeric';
        dateOptions.month = 'short';
        dateOptions.day = 'numeric';
        break;
      case 'long':
        dateOptions.year = 'numeric';
        dateOptions.month = 'long';
        dateOptions.day = 'numeric';
        break;
      case 'full':
        dateOptions.weekday = 'long';
        dateOptions.year = 'numeric';
        dateOptions.month = 'long';
        dateOptions.day = 'numeric';
        break;
    }

    if (mode === 'date') {
      return date.toLocaleDateString(undefined, dateOptions);
    } else if (mode === 'time') {
      return date.toLocaleTimeString(undefined, timeOptions);
    } else {
      return `${date.toLocaleDateString(
        undefined,
        dateOptions,
      )} ${date.toLocaleTimeString(undefined, timeOptions)}`;
    }
  };

  const handleConfirm = useCallback(
    (date: Date) => {
      setDatePickerVisible(false);
      onChange(date);
    },
    [onChange],
  );

  const handleCancel = useCallback(() => {
    setDatePickerVisible(false);
  }, []);

  const handlePress = useCallback(() => {
    if (!disabled) {
      setDatePickerVisible(true);
    }
  }, [disabled]);

  const getIconName = (): IconName => {
    return mode === 'time' ? 'clock-filled' : 'calendar-filled';
  };

  return (
    <View style={[styles.container, style]} testID={testID}>
      <AnimatedInput
        value={value ? formatDateTime(value) : ''}
        onChangeText={() => {}} // Read-only input
        placeholder={placeholder}
        icon={
          <Icon
            name={getIconName()}
            size={20}
            color={disabled ? colors.neutral.lightGrey : colors.neutral.grey}
          />
        }
        editable={false}
        onPress={handlePress}
        showClearButton={false}
        error={error?.message}
        testID={testID}
        label={placeholder}
      />

      <DatePicker
        modal
        title={placeholder}
        open={isDatePickerVisible}
        date={currentValue}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        mode={mode}
        minimumDate={minimumDate}
        maximumDate={maximumDate}
        minuteInterval={minuteInterval}
        theme={theme}
        is24hourSource={is24Hour ? 'device' : 'locale'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
});
