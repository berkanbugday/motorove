import React, {useEffect, useRef} from 'react';
import {View, StyleSheet} from 'react-native';
import {Marker, Callout} from 'react-native-maps';
import {RNMapMarkerItem} from './types';
import {colors, getShadow, radius, spacing} from '@theme';
import {Icon, Body} from '@components';
import {useTranslation} from '@hooks/useTranslation';

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
  const {t} = useTranslation();
  const markerColor = marker.pinColor || colors.neutral.black;
  const markerRef = useRef<any>(null);

  // Show/hide callout when selection changes
  useEffect(() => {
    if (!markerRef.current) {
      return;
    }

    if (isSelected) {
      // Show callout after map animation completes
      const timer = setTimeout(() => {
        markerRef.current?.showCallout();
      }, 400);
      return () => clearTimeout(timer);
    } else {
      markerRef.current.hideCallout();
    }
  }, [isSelected, marker.id]);

  // Get callout title based on marker type
  const getCalloutTitle = () => {
    if (marker.business) {
      return marker.business.name;
    }
    if (marker.warning) {
      return t(`enums.warningType.${marker.warning.type.toLowerCase()}`);
    }
    if (marker.emergency) {
      return t(`enums.emergencyType.${marker.emergency.type.toLowerCase()}`);
    }
    return marker.title || '';
  };

  return (
    <Marker
      ref={markerRef}
      coordinate={marker.coordinate}
      onPress={onPress}
      tracksViewChanges={false}>
      <View style={[styles.markerInner, {backgroundColor: markerColor}]}>
        {marker.iconName ? (
          <Icon
            name={marker.iconName}
            size={16}
            color={marker.iconColor || colors.neutral.white}
          />
        ) : (
          <Icon
            name="map-pin-filled"
            size={16}
            color={marker.iconColor || colors.neutral.white}
          />
        )}
      </View>
      {marker.iconName && (
        <Callout tooltip>
          <View style={styles.calloutContainer}>
            <Body
              align="center"
              weight="semiBold"
              color={colors.neutral.black}
              numberOfLines={2}>
              {getCalloutTitle()}
            </Body>
          </View>
        </Callout>
      )}
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
  calloutContainer: {
    backgroundColor: colors.neutral.white,
    padding: spacing.sm,
    borderRadius: radius.md,
    minWidth: 100,
    ...getShadow('medium'),
  },
});
