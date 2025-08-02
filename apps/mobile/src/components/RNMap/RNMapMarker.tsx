import React, {useCallback, useMemo} from 'react';
import {StyleSheet, View, Animated} from 'react-native';
import {Marker} from 'react-native-maps';
import {RNMapMarkerProps} from './types';

/**
 * A component to display individual markers on the map
 * Optimized to prevent unnecessary re-renders on Android
 */
const RNMapMarkerComponent: React.FC<RNMapMarkerProps> = ({
  marker,
  onSelect,
  onDeselect,
  mapRef,
}) => {
  const {
    id,
    coordinate,
    pinColor,
    image,
    icon,
    opacity = 1,
    zIndex = 0,
    rotation = 0,
  } = marker;

  // Memoize animation value to prevent recreation on every render
  const scaleAnim = useMemo(() => new Animated.Value(0.8), []);

  // Stable event handlers - only recreate if dependencies actually change
  const handlePress = useCallback((event: any) => {
    // Prevent event from bubbling up to map onPress (Android fix)
    event.stopPropagation && event.stopPropagation();

    // First scale up
    Animated.spring(scaleAnim, {
      toValue: 1.5,
      friction: 5,
      tension: 40,
      useNativeDriver: true,
    }).start();

    // Center map on marker
    if (mapRef?.current) {
      mapRef.current.animateToRegion(
        {
          latitude: coordinate.latitude,
          longitude: coordinate.longitude,
          latitudeDelta: 1, // Zoom in closer
          longitudeDelta: 1,
        },
        500,
      );
    }

    onSelect?.();
  }, [coordinate.latitude, coordinate.longitude, mapRef, onSelect, scaleAnim]);

  const handleDeselect = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.8,
      friction: 5,
      tension: 40,
      useNativeDriver: true,
    }).start();

    onDeselect?.();
  }, [onDeselect, scaleAnim]);

  // Memoize animated style to prevent recreation
  const animatedImageStyle = useMemo(() => ([
    styles.image,
    {
      transform: [{scale: scaleAnim}],
    },
  ]), [scaleAnim]);

  return (
    <Marker
      identifier={id?.toString()}
      coordinate={coordinate}
      pinColor={pinColor}
      opacity={opacity}
      zIndex={zIndex}
      rotation={rotation}
      onPress={handlePress}
      onDeselect={handleDeselect}
      tracksViewChanges={false}>
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      {image && (
        <View style={styles.imageContainer}>
          <Animated.Image
            source={image}
            style={animatedImageStyle}
          />
        </View>
      )}
    </Marker>
  );
};

// Use simple React.memo without custom comparison for better performance
// This will do a shallow comparison of all props
export const RNMapMarker = React.memo(RNMapMarkerComponent);

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
    height: 65,
  },
  image: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
});
