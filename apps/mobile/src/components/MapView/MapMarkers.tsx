import React from 'react';
import {View} from 'react-native';
import Mapbox from '@rnmapbox/maps';
import {Icon} from '@components';
import {colors} from '@theme';
import {styles} from './MapView.styles';
import {MapMarker} from './types';

interface MapMarkersProps {
  markers: MapMarker[];
}

export const MapMarkers: React.FC<MapMarkersProps> = ({markers}) => {
  if (!markers || markers.length === 0) {
    return null;
  }

  return (
    <>
      {markers.map(marker => (
        <Mapbox.PointAnnotation
          key={marker.id}
          id={marker.id}
          coordinate={marker.coordinates}
          onSelected={marker.onPress}>
          <View
            style={[
              styles.markerContainer,
              marker.color ? {backgroundColor: marker.color} : null,
            ]}
            collapsable={false}>
            {marker.icon ? (
              <Icon name={marker.icon} size={12} color={colors.neutral.white} />
            ) : (
              <Icon name="map-pin" size={12} color={colors.neutral.white} />
            )}
          </View>
        </Mapbox.PointAnnotation>
      ))}
    </>
  );
};
