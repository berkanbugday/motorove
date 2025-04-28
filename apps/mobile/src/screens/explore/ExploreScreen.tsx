import React, {useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {MapView, Tag, MapMarker} from '@components/MapView';
import {SafeAreaView} from 'react-native-safe-area-context';
// Import the Turkey markers
import {allMarkers} from './turkeyMarkers';
import {MarkerInfoCard, InfoLine} from '@components/MarkerInfoCard';
import {colors, rs} from '@theme';

interface MarkerInfo {
  id: string;
  title: string;
  subtitle: string;
  coordinates: [number, number];
  infoLines: InfoLine[];
  tags: Array<{
    id: string;
    label: string;
    color?:
      | 'primary'
      | 'secondary'
      | 'success'
      | 'warning'
      | 'error'
      | 'info'
      | 'light'
      | 'dark';
  }>;
  distance: string;
}

export const ExploreScreen: React.FC = () => {
  const [tags, setTags] = useState<Tag[]>([
    {
      id: '1',
      label: 'Repairs',
      color: 'light',
      onPress: () => {
        setTags(prevTags =>
          prevTags.map(tag =>
            tag.id === '1'
              ? {...tag, color: tag.color === 'light' ? 'dark' : 'light'}
              : tag,
          ),
        );
      },
    },
    {
      id: '2',
      label: 'Dealers',
      color: 'light',
      onPress: () => {
        setTags(prevTags =>
          prevTags.map(tag =>
            tag.id === '2'
              ? {...tag, color: tag.color === 'light' ? 'dark' : 'light'}
              : tag,
          ),
        );
      },
    },
    {
      id: '3',
      label: 'Washing',
      color: 'light',
      onPress: () => {
        setTags(prevTags =>
          prevTags.map(tag =>
            tag.id === '3'
              ? {...tag, color: tag.color === 'light' ? 'dark' : 'light'}
              : tag,
          ),
        );
      },
    },
  ]);

  // Create an enhanced version of markers with more info
  const enhancedMarkers = allMarkers.map(marker => {
    // Get marker type based on icon
    const markerType =
      marker.icon === 'wrench-filled'
        ? 'Repair Shop'
        : marker.icon === 'shop'
        ? 'Dealer'
        : 'Washing Station';

    // Add more interactive onPress handler
    return {
      ...marker,
      onPress: () =>
        handleMarkerPress(marker.id, marker.coordinates, markerType),
    };
  });

  const [markers] = useState<MapMarker[]>(enhancedMarkers);
  const [selectedMarker, setSelectedMarker] = useState<MarkerInfo | null>(null);

  // Handler for when a marker is pressed
  const handleMarkerPress = (
    id: string,
    coordinates: [number, number],
    type: string,
  ) => {
    console.log(`Marker ${id} pressed at ${coordinates}`);

    // Create mock data for this marker based on its type
    const info: MarkerInfo = {
      id,
      title: `${type} #${id.split('-').pop()}`,
      subtitle: `Located in ${
        coordinates[1] > 40.8 && coordinates[1] < 41.2
          ? 'Istanbul'
          : 'Turkey Mainland'
      }`,
      coordinates,
      infoLines: [
        {
          icon: 'map-pin',
          text: 'Atatürk Mah. Cumhuriyet Cad. No:123',
          iconColor: colors.neutral.grey,
        },
        {
          icon: 'clock',
          text: '9:00 AM - 8:00 PM',
          iconColor: colors.neutral.grey,
        },
        {
          icon: 'phone',
          text: '+90 555 123 4567',
          iconColor: colors.neutral.grey,
        },
      ],
      tags: [
        {
          id: '2',
          label: 'Open Now',
          color: 'success',
        },
      ],
      distance: `${(Math.random() * 10).toFixed(1)} km`,
    };

    setSelectedMarker(info);
  };

  const handleMapPress = (coords: [number, number]) => {
    console.log('Map pressed at', coords);
    // Hide the marker info card when clicking elsewhere on the map
    setSelectedMarker(null);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <MapView
        tags={tags}
        markers={markers}
        showSearch={true}
        showFilterButton={true}
        showUserLocation={true}
        fullscreen={true}
        showZoomControls={true}
        style={styles.map}
        onMapLoaded={() => console.log('Map loaded')}
        onMapPress={handleMapPress}
        // Set initial coordinates to Turkey
        initialCoordinates={{latitude: 39.1667, longitude: 35.6667}}
        initialZoom={5}
      />

      {/* MarkerInfoCard displays when a marker is selected */}
      {selectedMarker && (
        <View style={styles.cardContainer}>
          <MarkerInfoCard
            showCloseButton={true}
            title={selectedMarker.title}
            subtitle={selectedMarker.subtitle}
            infoLines={selectedMarker.infoLines}
            tags={selectedMarker.tags}
            distance={selectedMarker.distance}
            primaryAction="Get Directions"
            onPrimaryAction={() => console.log('Navigate pressed')}
            secondaryAction="Call Now"
            onSecondaryAction={() => console.log('Call Now pressed')}
            thirdyAction="Save to Favorites"
            onThirdyAction={() => console.log('Save to Favorites pressed')}
            onClose={() => setSelectedMarker(null)}
            variant="normal"
            style={styles.infoCard}
          />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    height: '100%',
  },
  cardContainer: {
    position: 'absolute',
    width: '100%',
    bottom: rs(100),
    alignItems: 'center',
  },
  infoCard: {
    width: '100%',
  },
});
