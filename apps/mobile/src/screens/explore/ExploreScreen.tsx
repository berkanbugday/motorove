import React, {useState} from 'react';
import {View, StyleSheet, Text, TouchableOpacity} from 'react-native';
import {MapView} from '@components/MapView';
import {useLocationPermission} from '@hooks/useLocationPermission';
import {colors, spacing, rs} from '@theme';
import {SafeAreaView} from 'react-native-safe-area-context';

export const ExploreScreen: React.FC = () => {
  const {status} = useLocationPermission();
  const [mapStyle, setMapStyle] = useState<string>(
    'mapbox://styles/mapbox/streets-v11',
  );

  // Handle style toggle
  const toggleMapStyle = () => {
    setMapStyle(
      mapStyle === 'mapbox://styles/mapbox/streets-v11'
        ? 'mapbox://styles/mapbox/satellite-v9'
        : 'mapbox://styles/mapbox/streets-v11',
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Explore</Text>
        <TouchableOpacity onPress={toggleMapStyle} style={styles.styleToggle}>
          <Text style={styles.styleToggleText}>
            {mapStyle.includes('satellite') ? 'Street View' : 'Satellite View'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.mapContainer}>
        <MapView
          showUserLocation={true}
          followUserLocation={status === 'granted'}
          fullscreen={false}
          styleURL={mapStyle}
          showZoomControls={true}
          style={styles.map}
          onMapLoaded={() => console.log('Map loaded')}
          onMapPress={coords => console.log('Map pressed at', coords)}
        />
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>Nearby Riding Routes</Text>
        <Text style={styles.infoSubtitle}>
          {status === 'granted'
            ? 'Discover popular motorcycle routes in your area'
            : 'Enable location to see nearby routes'}
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.white,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.neutral.black,
  },
  styleToggle: {
    backgroundColor: colors.primary.main,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: rs(20),
  },
  styleToggleText: {
    color: colors.neutral.white,
    fontWeight: '500',
  },
  mapContainer: {
    paddingHorizontal: spacing.md,
    height: 400,
  },
  map: {
    borderRadius: rs(12),
    height: '100%',
  },
  infoSection: {
    padding: spacing.md,
    backgroundColor: colors.neutral.background,
    margin: spacing.md,
    borderRadius: rs(12),
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
    color: colors.neutral.black,
  },
  infoSubtitle: {
    fontSize: 14,
    color: colors.neutral.grey,
  },
});
