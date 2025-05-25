import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Button} from '@components/Button';
import {RNMapControlsProps} from './types';
import {colors} from '@theme/colors';
import {getShadow} from '@theme/shadows';
import {spacing} from '@theme/spacing';

/**
 * A component to display map controls (zoom in, zoom out, recenter)
 */
export const RNMapControls: React.FC<RNMapControlsProps> = ({
  onZoomIn,
  onZoomOut,
  onCenterUser,
  userLocationAvailable = false,
  onReopenOverlay,
}) => {
  return (
    <View style={styles.controlButtonsContainer}>
      <Button
        onPress={onZoomIn}
        variant="primary"
        shape="circle"
        size="small"
        style={styles.zoomButton}
        iconName="plus"
        iconSize={16}
        iconColor={colors.neutral.black}
        testID="map-zoom-in-button"
      />
      <Button
        onPress={onZoomOut}
        variant="primary"
        shape="circle"
        size="small"
        style={styles.zoomButton}
        iconName="minus"
        iconSize={16}
        iconColor={colors.neutral.black}
        testID="map-zoom-out-button"
      />
      <Button
        onPress={userLocationAvailable ? onCenterUser : onReopenOverlay}
        variant="dark"
        shape="circle"
        size="small"
        iconName="user-location"
        iconSize={16}
        style={styles.recenterButton}
        testID="map-location-button"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  controlButtonsContainer: {
    position: 'absolute',
    right: spacing.md,
    top: 200,
    flexDirection: 'column',
    gap: spacing.sm,
  },
  zoomButton: {
    width: 40,
    height: 40,
    backgroundColor: colors.neutral.white,
    ...getShadow('small'),
  },
  recenterButton: {
    width: 40,
    height: 40,
    marginTop: spacing.sm,
    ...getShadow('small'),
  },
});
