import React from 'react';
import {View} from 'react-native';
import {Button} from '@components';
import {colors} from '@theme';
import {styles} from './MapView.styles';

interface ZoomControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onRecenter?: () => void;
  showUserLocation?: boolean;
  locationStatus: string;
  userLocation: {latitude: number; longitude: number} | null;
  onReopenOverlay: () => void;
}

export const ZoomControls: React.FC<ZoomControlsProps> = ({
  onZoomIn,
  onZoomOut,
  onRecenter,
  showUserLocation = false,
  locationStatus,
  userLocation,
  onReopenOverlay,
}) => {
  return (
    <View style={styles.controlButtonsContainer}>
      <Button
        onPress={onZoomIn}
        variant="primary"
        shape="round"
        size="small"
        style={styles.zoomButton}
        iconName="plus"
        iconSize={16}
        iconColor={colors.neutral.black}
      />
      <Button
        onPress={onZoomOut}
        variant="primary"
        shape="round"
        size="small"
        style={styles.zoomButton}
        iconName="minus"
        iconSize={16}
        iconColor={colors.neutral.black}
      />
      {/* Location Button - Combined for all location states */}
      {showUserLocation && (
        <Button
          onPress={
            locationStatus === 'granted' && userLocation
              ? onRecenter
              : onReopenOverlay
          }
          variant="primary"
          shape="round"
          size="small"
          iconName="user-location"
          iconSize={20}
          style={styles.recenterButton}
        />
      )}
    </View>
  );
};
