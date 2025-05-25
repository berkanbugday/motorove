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

  const handleSelect = () => {
    // First scale down
    Animated.spring(scaleAnim, {
      toValue: 1.2,
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
  };

  return (
    <Marker
      identifier={id?.toString()}
      coordinate={coordinate}
      pinColor={pinColor}
      opacity={opacity}
      zIndex={zIndex}
      rotation={rotation}
      onSelect={handleSelect}
      onDeselect={handleDeselect}
      tracksViewChanges={false}>
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      {image && (
        <Animated.Image
          source={image}
          style={[
            styles.image,
            {
              transform: [{scale: scaleAnim}],
            },
          ]}
        />
      )}
    </Marker>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  calloutContainer: {
    width: 200,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  calloutTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 5,
  },
  calloutDescription: {
    fontSize: 14,
  },
});
