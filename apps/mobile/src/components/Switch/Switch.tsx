import React from 'react';
import {
  TouchableOpacity,
  View,
  StyleSheet,
  ViewStyle,
  Animated,
} from 'react-native';
import {colors} from '@theme';
import {Typography} from '../Typography';

export interface SwitchProps {
  value?: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
  activeColor?: string;
  inactiveColor?: string;
  thumbColor?: string;
  label?: string;
  description?: string;
  style?: ViewStyle;
  testID?: string;
}

export const Switch: React.FC<SwitchProps> = ({
  value,
  onValueChange,
  disabled = false,
  size = 'medium',
  activeColor = colors.neutral.black,
  inactiveColor = colors.neutral.lightGrey,
  thumbColor = colors.neutral.white,
  label,
  description,
  style,
  testID,
}) => {
  const animatedValue = React.useRef(new Animated.Value(value ? 1 : 0)).current;

  React.useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: value ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [value, animatedValue]);

  const toggleSwitch = () => {
    if (!disabled) {
      onValueChange(!value);
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          container: {width: 40, height: 24, borderRadius: 12, padding: 2},
          thumb: {width: 20, height: 20, borderRadius: 10},
        };
      case 'large':
        return {
          container: {width: 60, height: 36, borderRadius: 18, padding: 3},
          thumb: {width: 30, height: 30, borderRadius: 15},
        };
      default: // medium
        return {
          container: {width: 50, height: 30, borderRadius: 15, padding: 2},
          thumb: {width: 26, height: 26, borderRadius: 13},
        };
    }
  };

  const sizeStyles = getSizeStyles();

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [
      0,
      sizeStyles.container.width -
        sizeStyles.thumb.width -
        sizeStyles.container.padding * 2,
    ],
  });

  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [inactiveColor, activeColor],
  });

  const opacity = disabled ? 0.7 : 1;

  const hasText = label || description;

  if (hasText) {
    return (
      <View style={[styles.wrapper, style]}>
        <View style={styles.textContainer}>
          <View style={styles.textContent}>
            {label && (
              <Typography
                variant="body"
                weight="medium"
                style={[styles.label, {opacity}]}>
                {label}
              </Typography>
            )}
            {description && (
              <Typography
                variant="caption"
                color={colors.neutral.grey}
                style={[styles.description, {opacity}]}>
                {description}
              </Typography>
            )}
          </View>
          <View style={styles.switchContainer}>
            <TouchableOpacity
              onPress={toggleSwitch}
              disabled={disabled}
              activeOpacity={0.8}
              testID={testID}>
              <Animated.View
                style={[
                  styles.track,
                  sizeStyles.container,
                  {backgroundColor, opacity},
                ]}>
                <Animated.View
                  style={[
                    styles.thumb,
                    sizeStyles.thumb,
                    {
                      backgroundColor: thumbColor,
                      transform: [{translateX}],
                      opacity,
                    },
                  ]}
                />
              </Animated.View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <TouchableOpacity
      onPress={toggleSwitch}
      disabled={disabled}
      activeOpacity={0.8}
      style={style}
      testID={testID}>
      <Animated.View
        style={[
          styles.track,
          sizeStyles.container,
          {backgroundColor, opacity},
        ]}>
        <Animated.View
          style={[
            styles.thumb,
            sizeStyles.thumb,
            {
              backgroundColor: thumbColor,
              transform: [{translateX}],
              opacity,
            },
          ]}
        />
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  textContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  textContent: {
    flex: 1,
    marginRight: 16,
  },
  label: {
    marginBottom: 2,
  },
  description: {
    lineHeight: 18,
  },
  switchContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  track: {
    justifyContent: 'center',
  },
  thumb: {
    backgroundColor: colors.neutral.white,
  },
});

export default Switch;
