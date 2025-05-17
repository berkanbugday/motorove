import React, {useState, useEffect, useCallback} from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  View,
  Platform,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import {
  Controller,
  Control,
  Path,
  FieldValues,
  FieldError,
} from 'react-hook-form';
import {colors, spacing, componentRadius} from '@theme';
import {Typography, Caption} from '../Typography';
import {Icon, IconName} from '../Icon';
import {useBottomSheet, BottomSheetConfig} from '../BottomSheet';
import {Button} from '../Button';

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
   * Additional styling for the text
   */
  textStyle?: StyleProp<TextStyle>;
  /**
   * Test ID for component testing
   */
  testID?: string;
  /**
   * Mode of the picker: 'date', 'time', or 'datetime'
   */
  mode?: DateTimePickerMode;
  /**
   * Use 24 hour format (Android and iOS)
   */
  is24Hour?: boolean;
  /**
   * Minute interval (iOS only when display is spinner)
   */
  minuteInterval?: 1 | 2 | 3 | 4 | 5 | 6 | 10 | 12 | 15 | 20 | 30;
  /**
   * Text color (iOS only)
   */
  textColor?: string;
  /**
   * Accent color (iOS only)
   */
  accentColor?: string;
  /**
   * Theme variant ('light' or 'dark') (iOS only)
   */
  themeVariant?: 'light' | 'dark';
  /**
   * Display mode (platform specific)
   */
  display?: 'default' | 'spinner' | 'compact' | 'inline';
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

export function AnimatedDateTimePicker<T extends FieldValues = any>(
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
      textStyle,
      testID,
      error,
      mode = 'date',
      is24Hour = true,
      minuteInterval,
      textColor,
      accentColor,
      themeVariant,
      display,
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
            textStyle={textStyle}
            testID={testID}
            error={error}
            mode={mode}
            is24Hour={is24Hour}
            minuteInterval={minuteInterval}
            textColor={textColor}
            accentColor={accentColor}
            themeVariant={themeVariant}
            display={display}
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
    textStyle,
    testID,
    error,
    mode = 'date',
    is24Hour = true,
    minuteInterval,
    textColor,
    accentColor,
    themeVariant,
    display,
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
      textStyle={textStyle}
      testID={testID}
      error={error}
      mode={mode}
      is24Hour={is24Hour}
      minuteInterval={minuteInterval}
      textColor={textColor}
      accentColor={accentColor}
      themeVariant={themeVariant}
      display={display}
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
  textStyle?: StyleProp<TextStyle>;
  testID?: string;
  error?: FieldError;
  mode?: DateTimePickerMode;
  is24Hour?: boolean;
  minuteInterval?: 1 | 2 | 3 | 4 | 5 | 6 | 10 | 12 | 15 | 20 | 30;
  textColor?: string;
  accentColor?: string;
  themeVariant?: 'light' | 'dark';
  display?: 'default' | 'spinner' | 'compact' | 'inline';
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
  textStyle,
  testID,
  error,
  mode = 'date',
  is24Hour = true,
  minuteInterval,
  textColor,
  accentColor,
  themeVariant,
  display,
}: DateTimePickerBaseProps) {
  const [currentValue, setCurrentValue] = useState<Date>(value || new Date());
  const [currentMode, setCurrentMode] = useState<'date' | 'time'>(
    mode === 'time' ? 'time' : 'date',
  );

  // Use the bottom sheet provider hook
  const {openBottomSheet, closeBottomSheet} = useBottomSheet();

  useEffect(() => {
    // Update internal state when external value changes
    if (value) {
      setCurrentValue(value);
    }
  }, [value]);

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
      default:
        dateOptions.year = 'numeric';
        dateOptions.month = 'short';
        dateOptions.day = 'numeric';
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

  const handleDateTimeChange = useCallback(
    (event: DateTimePickerEvent, selectedDate?: Date) => {
      if (event.type === 'set' && selectedDate) {
        setCurrentValue(selectedDate);

        if (mode === 'datetime' && currentMode === 'date') {
          // If in datetime mode and we just selected a date, switch to time selection
          setCurrentMode('time');

          // Close current bottom sheet and open a new one with time picker
          closeBottomSheet();
          setTimeout(() => {
            showDateTimePicker();
          }, 300);
        }
        // We don't automatically close the sheet or call onChange anymore
        // The user will need to click the Confirm button
      } else if (event.type === 'dismissed') {
        closeBottomSheet();
      }
    },
    [closeBottomSheet, currentMode, mode, onChange],
  );

  // Function to handle confirm button press
  const handleConfirm = useCallback(() => {
    console.log('currentValue', currentValue.toISOString());
    // Apply the selected date/time value
    onChange(currentValue);
    // Close the bottom sheet
    closeBottomSheet();
  }, [closeBottomSheet, currentValue, onChange]);

  // Function to render the bottom sheet content
  const renderDateTimePickerContent = useCallback(() => {
    return (
      <View style={styles.pickerContainer}>
        <DateTimePicker
          testID="dateTimePicker"
          value={currentValue}
          mode={currentMode}
          display={display || (Platform.OS === 'ios' ? 'spinner' : 'default')}
          onChange={handleDateTimeChange}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
          is24Hour={is24Hour}
          minuteInterval={minuteInterval}
          textColor={textColor}
          accentColor={accentColor}
          themeVariant={themeVariant}
        />

        {mode === 'datetime' && (
          <Typography style={styles.pickerLabel}>
            {currentMode === 'date' ? 'Select Date' : 'Select Time'}
          </Typography>
        )}

        <View style={styles.bottomSheetButtonContainer}>
          <Button
            title="Cancel"
            variant="outline"
            onPress={() => closeBottomSheet()}
            style={{flex: 1}}
          />
          {mode === 'datetime' && currentMode === 'date' && (
            <Button
              title="Next"
              variant="dark"
              onPress={() => {
                setCurrentMode('time');
                closeBottomSheet();
                setTimeout(() => {
                  showDateTimePicker();
                }, 300);
              }}
              style={{flex: 1}}
            />
          )}
          {(mode !== 'datetime' || currentMode === 'time') && (
            <Button
              title="Confirm"
              variant="dark"
              onPress={handleConfirm}
              style={{flex: 1}}
            />
          )}
        </View>
      </View>
    );
  }, [
    currentValue,
    currentMode,
    display,
    handleDateTimeChange,
    minimumDate,
    maximumDate,
    is24Hour,
    minuteInterval,
    textColor,
    accentColor,
    themeVariant,
    mode,
    closeBottomSheet,
    handleConfirm,
  ]);

  // Function to show the date time picker
  const showDateTimePicker = useCallback(() => {
    if (disabled) {
      return;
    }

    const config: BottomSheetConfig = {
      content: renderDateTimePickerContent(),
      snapPoint: 'partial',
      closeOnBackdropPress: true,
      contentStyle: styles.bottomSheetContent,
      onClose: () => {
        // Reset to date mode if this is a datetime picker when the sheet closes
        if (mode === 'datetime') {
          setCurrentMode('date');
        }
      },
    };

    openBottomSheet(config);
  }, [disabled, renderDateTimePickerContent, openBottomSheet, mode]);

  const handlePress = useCallback(() => {
    // Set the initial mode based on the type of picker
    setCurrentMode(mode === 'time' ? 'time' : 'date');
    showDateTimePicker();
  }, [mode, showDateTimePicker]);

  const renderError = () => {
    if (!error) {
      return null;
    }
    return (
      <View style={styles.errorContainer}>
        <Caption color={colors.status.error}>{error.message}</Caption>
      </View>
    );
  };

  const getIconName = (): IconName => {
    // Return icon name based on mode
    return mode === 'time' ? 'clock-filled' : 'calendar-filled';
  };

  return (
    <View style={[styles.container, style]} testID={testID}>
      <TouchableOpacity
        style={[
          styles.input,
          disabled && styles.inputDisabled,
          error && styles.inputError,
        ]}
        onPress={handlePress}
        disabled={disabled}
        activeOpacity={0.7}>
        <Typography
          style={[styles.inputText, textStyle]}
          color={disabled ? colors.neutral.grey : colors.neutral.black}>
          {currentValue ? formatDateTime(currentValue) : placeholder}
        </Typography>
        <Icon
          name={getIconName()}
          size={20}
          color={disabled ? colors.neutral.lightGrey : colors.neutral.grey}
        />
      </TouchableOpacity>

      {renderError()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.neutral.white,
    borderWidth: 1,
    borderColor: colors.neutral.lightGrey,
    borderRadius: componentRadius.input,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    minHeight: 48,
  },
  inputDisabled: {
    backgroundColor: colors.neutral.veryLightGrey,
    borderColor: colors.neutral.lightGrey,
  },
  inputError: {
    borderColor: colors.status.error,
  },
  inputText: {
    flex: 1,
  },
  errorContainer: {
    marginTop: spacing.xs,
    marginLeft: spacing.sm,
  },
  bottomSheetContent: {
    padding: spacing.md,
  },
  pickerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerLabel: {
    marginTop: spacing.md,
    fontWeight: 'bold',
  },
  bottomSheetButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
});
