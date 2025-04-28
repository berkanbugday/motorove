import React from 'react';
import {View} from 'react-native';
import {Button} from '@components';
import {styles} from './MapView.styles';

interface LoadMarkerButtonProps {
  onPress: () => void;
  refreshMapState: () => void;
}

export const LoadMarkerButton: React.FC<LoadMarkerButtonProps> = ({
  onPress,
  refreshMapState,
}) => {
  return (
    <View style={styles.loadMarkerButtonContainer}>
      <Button
        onPress={() => {
          refreshMapState();
          if (onPress) {
            onPress();
          }
        }}
        variant="primary"
        shape="round"
        size="medium"
        title="Load Markers"
        iconName="map-pin"
        textStyle={styles.loadMarkerButtonText}
      />
    </View>
  );
};
