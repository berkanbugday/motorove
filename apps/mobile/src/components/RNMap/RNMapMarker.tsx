import React, {useRef} from 'react';
import {StyleSheet, View, Animated} from 'react-native';
import {Marker} from 'react-native-maps';
import {RNMapMarkerProps} from './types';

/**
 * A component to display individual markers on the map
 */
export const RNMapMarker: React.FC<RNMapMarkerProps> = ({
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

  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  const handlePress = (event: any) => {
    // Prevent event from bubbling up to map onPress (Android fix)
    event.stopPropagation && event.stopPropagation();

    // First scale down
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
  };

  const handleDeselect = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.8,
      friction: 5,
      tension: 40,
      useNativeDriver: true,
    }).start();

    onDeselect?.();
  };

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
            style={[
              styles.image,
              {
                transform: [{scale: scaleAnim}],
              },
            ]}
          />
        </View>
      )}
    </Marker>
  );
};

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
