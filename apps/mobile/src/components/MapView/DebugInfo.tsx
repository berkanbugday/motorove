import React from 'react';
import {View, Text} from 'react-native';
import {styles} from './MapView.styles';

interface DebugInfoProps {
  visibleMarkers: number;
  totalMarkers: number;
  radiusKm: number;
}

export const DebugInfo: React.FC<DebugInfoProps> = ({
  visibleMarkers,
  totalMarkers,
  radiusKm,
}) => {
  return (
    <View style={styles.debugInfo}>
      <Text style={styles.debugText}>
        {`Visible markers: ${visibleMarkers}/${totalMarkers} (Radius: ${radiusKm}km)`}
      </Text>
    </View>
  );
};
