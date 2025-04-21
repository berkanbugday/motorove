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
import {Icon} from '@components/Icon';

interface AnimatedInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  icon?: React.ReactNode;
  error?: string;
  onToggleSecureEntry?: () => void;
  showPassword?: boolean;
  testID?: string;
}

export function AnimatedInput({
  label,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = 'default',
  icon,
  error,
  onToggleSecureEntry,
  showPassword,
  testID,
}: AnimatedInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const animatedIsFocused = useRef(new Animated.Value(value ? 1 : 0)).current;
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    Animated.timing(animatedIsFocused, {
      toValue: isFocused || value ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [animatedIsFocused, isFocused, value]);

  const labelStyle: Animated.AnimatedProps<TextStyle> = {
    position: 'absolute',
    left: 15,
    top: animatedIsFocused.interpolate({
      inputRange: [0, 1],
      outputRange: [15, -10],
    }),
    fontSize: animatedIsFocused.interpolate({
      inputRange: [0, 1],
      outputRange: [16, 12],
    }),
    color: animatedIsFocused.interpolate({
      inputRange: [0, 1],
      outputRange: ['#888', '#121212'],
    }),
    backgroundColor: '#fff',
    paddingHorizontal: 5,
    zIndex: 5,
  };

  const handleLabelPress = () => {
    inputRef.current?.focus();
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
        style={[styles.input, error && styles.inputError]}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        autoCapitalize="none"
        testID={`${testID}-input`}
      />
      <View style={styles.inputIcon}>
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
    marginBottom: 24,
    position: 'relative',
  },
  labelContainer: {
    position: 'absolute',
    left: 0,
    top: 0,
    zIndex: 1,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    paddingLeft: 40, // space for icon
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  inputIcon: {
    position: 'absolute',
    left: 12,
    top: 15,
    zIndex: 1,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 16,
  },
});
