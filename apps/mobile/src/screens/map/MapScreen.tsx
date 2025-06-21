import React, {useState, useMemo, useCallback} from 'react';
import {StyleSheet, View} from 'react-native';
import {RNMap, RNMapMarkerCard, RNMapMarkerCardItem} from '@components/RNMap';
import {RNMapMarkerType, RNMapSearchResult} from '@components/RNMap/types';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
// Import the Turkey markers
import {allMarkers} from './turkeyMarkers';
import {loggingService} from '@services/logging.service';
// Import the new hook - use correct path
import {useMapMarkerCards} from '../../hooks';

export const MapScreen = () => {
  const insets = useSafeAreaInsets();
  // Create an enhanced version of markers with more info using useMemo
  const enhancedMarkers = useMemo(() => {
    return allMarkers.map(marker => {
      // Get marker type based on icon
      const markerType =
        marker.icon === 'wrench-filled'
          ? 'Repair Shop'
          : marker.icon === 'shop'
          ? 'Dealer'
          : 'Washing Station';

      // Convert to RNMap marker format
      return {
        id: marker.id,
        coordinate: {
          latitude: marker.coordinates[1],
          longitude: marker.coordinates[0],
        },
        title: `${markerType} #${marker.id.split('-').pop()}`,
        description: `Located in ${
          marker.coordinates[1] > 40.8 && marker.coordinates[1] < 41.2
            ? 'Istanbul'
            : 'Turkey Mainland'
        }`,
        pinColor:
          marker.icon === 'wrench-filled'
            ? '#FF5722'
            : marker.icon === 'shop'
            ? '#2196F3'
            : '#4CAF50',
        image: marker.image,
        imageSelected: marker.imageSelected,
        metadata: {
          type: markerType,
          originalData: marker,
        },
      };
    });
  }, []);

  const [markers, setMarkers] = useState<RNMapMarkerType[]>([]);
  const [selectedMarker, setSelectedMarker] = useState<RNMapMarkerType | null>(
    null,
  );

  // Use our custom hook instead of direct state management
  const {
    markerCards,
    selectedCardIndex,
    showCardsForMarker,
    hideCards,
    toggleFavorite,
    handleCardChange,
  } = useMapMarkerCards();

  // Handler for loading markers
  const handleLoadMarkers = useCallback(() => {
    loggingService.info('Loading markers...');
    setMarkers(enhancedMarkers);
  }, [enhancedMarkers]);

  // Handler for when a marker is pressed
  const handleMarkerSelect = useCallback(
    (marker: RNMapMarkerType) => {
      loggingService.info(`Marker ${marker.id} pressed`);

      // Create info for this marker, adapted for RNMapMarkerCard
      const info: RNMapMarkerType = {
        id: marker.id?.toString() || '',
        coordinate: {
          latitude: marker.coordinate.latitude,
          longitude: marker.coordinate.longitude,
        },
        pinColor: marker.pinColor,
        icon: marker.icon,
        metadata: {
          type: marker.metadata?.type,
          originalData: marker,
        },
      };

      setSelectedMarker(info);

      // Show cards for this marker using our hook
      showCardsForMarker(markers, marker.id || '', 50);
    },
    [markers, showCardsForMarker],
  );

  const handleMapPress = useCallback(
    (event: any) => {
      loggingService.info('Map pressed at', event.nativeEvent.coordinate);
      // Hide the marker info card when clicking elsewhere on the map
      setSelectedMarker(null);
      hideCards();
    },
    [hideCards],
  );

  const handleSearchResultSelect = useCallback((result: RNMapSearchResult) => {
    loggingService.info(`Search result selected: ${result.name}`);
  }, []);

  const handleCardPress = useCallback(
    (item: RNMapMarkerCardItem) => {
      loggingService.info(`Card pressed for marker ${item.id}`);
      // Find the corresponding map marker
      const mapMarker = markers.find(m => m.id?.toString() === item.id);

      if (mapMarker) {
        // Update the selected marker to center the map on it
        handleMarkerSelect(mapMarker);
      }
    },
    [markers, handleMarkerSelect],
  );

  const handleFavoritePress = useCallback(
    (item: RNMapMarkerCardItem) => {
      loggingService.info(`Favorite pressed for marker ${item.id}`);
      // Toggle favorite state using our hook
      toggleFavorite(item.id);
    },
    [toggleFavorite],
  );

  const handleClose = useCallback(() => {
    setSelectedMarker(null);
    hideCards();
  }, [hideCards]);

  return (
    <View style={styles.container}>
      <RNMap
        initialRegion={{
          latitude: 39.9334,
          longitude: 32.8597,
          latitudeDelta: 10,
          longitudeDelta: 10,
        }}
        showUserLocation={true}
        markers={markers}
        onMarkerSelect={handleMarkerSelect}
        onPress={handleMapPress}
        showSearchBar={true}
        onSearchResultSelect={handleSearchResultSelect}
        markerRadiusKm={50}
        maxVisibleMarkers={1000}
        loadingIndicator={true}
        showLoadMarkerButton={true}
        onLoadMarkerPress={handleLoadMarkers}
      />

      {/* Use RNMapMarkerCard to display the selected marker and nearby markers */}
      {selectedMarker && markerCards.length > 0 && (
        <RNMapMarkerCard
          items={markerCards}
          selectedIndex={selectedCardIndex}
          onCardPress={handleCardPress}
          onFavoritePress={handleFavoritePress}
          onClosePress={handleClose}
          onCardChange={handleCardChange}
          tabBarHeight={insets.bottom + 70}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  cardContainer: {
    position: 'absolute',
    width: '100%',
    bottom: 100,
    paddingHorizontal: 10,
  },
  infoCard: {
    width: '100%',
  },
});
