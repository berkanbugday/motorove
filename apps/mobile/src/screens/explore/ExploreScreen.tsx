import React, {useState} from 'react';
import {StyleSheet} from 'react-native';
import {MapView, Tag, MapMarker} from '@components/MapView';
import {SafeAreaView} from 'react-native-safe-area-context';
// Import the Turkey markers
import {allMarkers} from './turkeyMarkers';

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

  // Combine sample SF markers with Turkey markers
  const [markers, _setMarkers] = useState<MapMarker[]>([
    // Add all Turkey markers
    ...allMarkers,
  ]);

  const handleMapPress = (coords: [number, number]) => {
    console.log('Map pressed at', coords);
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
});
