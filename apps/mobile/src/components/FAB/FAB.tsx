import React, {useMemo} from 'react';
import {View, Text, TouchableOpacity, Animated, StyleSheet} from 'react-native';

import {FABProps} from './types';
import {
  createFABStyles,
  getPositionStyles,
  getSizeStyles,
  getVariantStyles,
  getShadowStyle,
  FAB_SIZES,
} from './FAB.styles';

/**
 * Floating Action Button (FAB) component that supports multiple variants,
 * sizes, positions, and customizations.
 */
const FAB: React.FC<FABProps> = ({
  icon,
  label,
  onPress,
  onLongPress,
  position = 'bottomRight',
  customPosition,
  size = 'medium',
  shape = 'circle',
  variant = 'primary',
  backgroundColor,
  color,
  disabled = false,
  shadow = true,
  animationType = 'scale',
  visible = true,
  style,
  labelStyle,
  testID,
  accessibilityLabel,
  iconRotation,
}) => {
  // Create base styles based on props
  const positionStyle = useMemo(
    () => getPositionStyles(position, customPosition),
    [position, customPosition],
  );

  const sizeStyle = useMemo(() => getSizeStyles(size, shape), [size, shape]);

  const variantStyle = useMemo(
    () => getVariantStyles(variant, backgroundColor),
    [variant, backgroundColor],
  );

  const shadowStyle = useMemo(() => getShadowStyle(shadow), [shadow]);

  // Calculate the icon size based on the FAB size
  const iconSize = FAB_SIZES[size].iconSize;

  // Animation value
  const animatedValue = useMemo(() => new Animated.Value(visible ? 1 : 0), []);

  // Update animation when visibility changes
  React.useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: visible ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [visible, animatedValue]);

  // Create animation style based on animation type
  const animationStyle = useMemo(() => {
    switch (animationType) {
      case 'scale':
        return {
          transform: [
            {
              scale: animatedValue,
            },
          ],
          opacity: animatedValue,
        };
      case 'fade':
        return {
          opacity: animatedValue,
        };
      case 'none':
      default:
        return visible ? {} : {display: 'none'};
    }
  }, [animationType, animatedValue, visible]);

  // Apply all styles to component
  const containerStyle = [
    createFABStyles.container,
    positionStyle,
    sizeStyle,
    {backgroundColor: variantStyle.backgroundColor},
    shadowStyle,
    disabled && createFABStyles.disabled,
    style,
    animationStyle,
  ];

  // Get the text/icon color
  const contentColor = color || variantStyle.textColor;

  // Render component
  return (
    <Animated.View
      style={containerStyle}
      testID={testID}
      accessibilityRole="button"
      accessibilityState={{disabled}}
      accessibilityLabel={accessibilityLabel || label}>
      <TouchableOpacity
        onPress={onPress}
        onLongPress={onLongPress}
        disabled={disabled}
        activeOpacity={0.8}
        style={StyleSheet.absoluteFill}>
        <View style={createFABStyles.contentContainer}>
          {/* Render icon */}
          {React.isValidElement(icon) && (
            <Animated.View
              style={{
                transform: iconRotation ? [{rotate: iconRotation as any}] : [],
              }}>
              {React.cloneElement(icon as React.ReactElement<any>, {
                // Only clone with properties that the icon component supports
                color: contentColor,
                // Pass the size as a prop that most icon libraries support
                size: iconSize,
              })}
            </Animated.View>
          )}

          {/* Render label for extended FAB */}
          {shape === 'extended' && label && (
            <Text
              style={[createFABStyles.label, {color: contentColor}, labelStyle]}
              numberOfLines={1}>
              {label}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default FAB;
