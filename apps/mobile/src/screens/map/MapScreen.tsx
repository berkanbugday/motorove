import React, {useState, useCallback, useEffect} from 'react';
import {StyleSheet, View} from 'react-native';
import {RNMap, RNMapMarkerCard, RNMapMarkerCardItem} from '@components/RNMap';
import {RNMapMarkerType} from '@components/RNMap/types';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useMapMarkerCards} from '../../hooks';
import {BusinessService} from '@services/business.service';
import {BusinessCategory} from '@motorove/shared';

export const MapScreen = () => {
  const insets = useSafeAreaInsets();

  // Use the business service to get business data
  const {businesses, loading, refetch} = BusinessService.useGetBusinesses();

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

  // Convert businesses to map markers
  const convertBusinessesToMarkers = useCallback(() => {
    if (!businesses || businesses.length === 0) {
      return [];
    }

    return businesses
      .map(business => {
        return {
          id: business.id,
          coordinate: {
            latitude: business.address?.latitude || 0,
            longitude: business.address?.longitude || 0,
          },
          title: business.name,
          description: business.address?.address || 'No address provided',
          image: require('@assets/images/pin.png'),
        };
      })
      .filter(
        marker =>
          // Filter out markers with invalid coordinates
          marker.coordinate.latitude !== 0 && marker.coordinate.longitude !== 0,
      );
  }, [businesses]);

  // Handler for loading markers
  const handleLoadMarkers = useCallback(() => {
    const businessMarkers = convertBusinessesToMarkers();
    setMarkers(businessMarkers);
  }, [convertBusinessesToMarkers]);

  // Handler for when a marker is pressed
  const handleMarkerSelect = useCallback(
    (marker: RNMapMarkerType) => {
      // Get the original business data from the marker
      const businessData = marker.metadata?.originalData;
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
          // Pass the original business data, not just the marker
          originalData: businessData || marker,
        },
      };

      // Debug to see what data is available
      console.log('Selected business data:', businessData);

      setSelectedMarker(info);

      // Show cards for this marker using our hook
      // Create marker cards with business data
      // Add business data to all markers to ensure it's available in the card
      const updatedMarkers = markers.map(m => {
        if (m.id === marker.id) {
          return {
            ...m,
            metadata: {
              ...m.metadata,
              originalData: marker.metadata?.originalData,
            },
          };
        }
        return m;
      });
      // Use the custom hook to convert markers to card items
      showCardsForMarker(updatedMarkers, marker.id || '', 50);
    },
    [markers, showCardsForMarker],
  );

  const handleMapPress = useCallback(() => {
    // Hide the marker info card when clicking elsewhere on the map
    setSelectedMarker(null);
    hideCards();
  }, [hideCards]);

  const handleSearchResultSelect = useCallback(() => {}, []);

  const handleCardPress = useCallback(
    (item: RNMapMarkerCardItem) => {
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
      // Toggle favorite state using our hook
      toggleFavorite(item.id);
    },
    [toggleFavorite],
  );

  const handleClose = useCallback(() => {
    setSelectedMarker(null);
    hideCards();
  }, [hideCards]);

  // Load markers when businesses data is available
  useEffect(() => {
    if (!loading && businesses && businesses.length > 0) {
      handleLoadMarkers();
    }
  }, [businesses, loading, handleLoadMarkers]);

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
        loadingIndicator={loading}
        showLoadMarkerButton={true}
        onLoadMarkerPress={refetch}
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
