import React, {useEffect, useRef} from 'react';
import {View, StyleSheet, Animated} from 'react-native';
import {Marker} from 'react-native-maps';
import {RNMapMarkerItem} from './types';
import {colors} from '@theme/colors';
import {Icon} from '@components/Icon';
import {getShadow} from '@theme/shadows';
import {radius} from '@theme/radius';

interface RNMapMarkerProps {
  marker: RNMapMarkerItem;
  onPress?: () => void;
  isSelected?: boolean;
}

/**
 * Custom map marker component for businesses
 * Displays business icon with category-based styling
 */
export const RNMapMarker: React.FC<RNMapMarkerProps> = ({
  marker,
  onPress,
  isSelected = false,
}) => {
  const markerColor = marker.pinColor || colors.neutral.black;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Animate scale when selection changes
  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: isSelected ? 1 : 0.8,
      useNativeDriver: true,
      friction: 8,
      tension: 40,
    }).start();
  }, [isSelected, scaleAnim]);

  return (
    <Marker
      coordinate={marker.coordinate}
      onPress={onPress}
      tracksViewChanges={false}
      zIndex={marker.zIndex || (isSelected ? 1000 : 1)}>
      <Animated.View
        style={[
          styles.markerContainer,
          {
            transform: [{scale: scaleAnim}],
          },
        ]}>
        <View
          style={[
            styles.markerInner,
            {backgroundColor: markerColor},
            isSelected && styles.markerInnerSelected,
          ]}>
          {marker.iconName ? (
            <Icon
              name={marker.iconName}
              size={20}
              color={marker.iconColor || colors.neutral.white}
            />
          ) : (
            <Icon
              name="map-pin-filled"
              size={20}
              color={marker.iconColor || colors.neutral.white}
            />
          )}
        </View>
      </Animated.View>
    </Marker>
  );
};

const styles = StyleSheet.create({
  markerContainer: {
    alignItems: 'center',
  },
  markerInner: {
    width: 36,
    height: 36,
    borderRadius: radius.round,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.neutral.white,
    ...getShadow('medium'),
  },
  markerInnerSelected: {
    width: 40,
    height: 40,
    borderRadius: radius.round,
    borderWidth: 4,
  },
  markerLabel: {
    marginTop: 4,
    backgroundColor: colors.neutral.black,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    maxWidth: 120,
  },
  markerText: {
    fontSize: 11,
  },
});
