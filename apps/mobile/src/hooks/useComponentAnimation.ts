import {useRef, useEffect} from 'react';
import {Animated} from 'react-native';

interface AnimationConfig {
  duration?: number;
}

/**
 * Hook to manage component animations based on map movement
 * @param isMapMoving Boolean indicating if map is moving
 * @param config Animation configuration
 * @returns Object containing animation values for different components
 */
export const useComponentAnimation = (
  isMapMoving: boolean,
  config: AnimationConfig = {},
) => {
  const {duration = 300} = config;
  const slideAnimation = useRef(new Animated.Value(0)).current;

  // Update animation when map movement changes
  useEffect(() => {
    Animated.timing(slideAnimation, {
      toValue: isMapMoving ? 1 : 0,
      duration,
      useNativeDriver: true,
    }).start();
  }, [isMapMoving, slideAnimation, duration]);

  // Create interpolated values for different components
  const searchBarTranslate = slideAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -300],
  });

  const tagsTranslate = slideAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -300],
  });

  const zoomControlsTranslate = slideAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 300],
  });

  const loadButtonTranslate = slideAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 300],
  });

  const debugInfoTranslate = slideAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 300],
  });

  return {
    slideAnimation,
    searchBarTranslate,
    tagsTranslate,
    zoomControlsTranslate,
    loadButtonTranslate,
    debugInfoTranslate,
  };
};
