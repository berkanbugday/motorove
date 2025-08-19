import {useState, useCallback} from 'react';
import {RNMapMarkerCardItem} from '../components/RNMap';
import {RNMapMarkerType} from '../components/RNMap/types';
import {Region} from 'react-native-maps';

/**
 * Custom hook to manage map marker cards
 * This hook handles the state and logic for the RNMapMarkerCard component
 * optimized for use with react-native-maps
 */
export const useMapMarkerCards = () => {
  // State for marker cards
  const [markerCards, setMarkerCards] = useState<RNMapMarkerCardItem[]>([]);
  const [selectedCardIndex, setSelectedCardIndex] = useState<number>(0);
  const [isCardsVisible, setIsCardsVisible] = useState<boolean>(false);

  // Function to calculate distance between coordinates in kilometers
  const calculateDistance = useCallback(
    (lat1: number, lon1: number, lat2: number, lon2: number): number => {
      const R = 6371; // Radius of the earth in km
      const dLat = deg2rad(lat2 - lat1);
      const dLon = deg2rad(lon2 - lon1);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) *
          Math.cos(deg2rad(lat2)) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    },
    [],
  );

  const deg2rad = (deg: number): number => {
    return deg * (Math.PI / 180);
  };

  // Generate marker cards from map markers
  const generateMarkerCards = useCallback(
    (
      markers: RNMapMarkerType[],
      selectedMarkerId?: string | number,
      radiusKm: number = 50,
    ) => {
      if (!markers.length) {
        setMarkerCards([]);
        setIsCardsVisible(false);
        return;
      }

      // Find the selected marker
      const selectedMarker = markers.find(m => m.id === selectedMarkerId);
      if (!selectedMarker || !selectedMarker.coordinate) {
        setMarkerCards([]);
        setIsCardsVisible(false);
        return;
      }

      const selectedCoord = {
        latitude: selectedMarker.coordinate.latitude,
        longitude: selectedMarker.coordinate.longitude,
      };

      // Filter markers within radius and convert to card format
      const cardsData = markers
        .filter(m => {
          if (m.id === selectedMarkerId) {
            return true;
          } // Always include selected marker
          if (!m.coordinate) {
            return false;
          }

          const distance = calculateDistance(
            selectedCoord.latitude,
            selectedCoord.longitude,
            m.coordinate.latitude,
            m.coordinate.longitude,
          );

          return distance <= radiusKm;
        })
        .map(m => {
          // Create a card with more detailed info
          return {
            id: m.id?.toString() || '',
            images: m.metadata?.originalData?.images || [],
            title: m.title || 'Unknown Location',
            location: m.description || 'Unknown Location',
            rating: m.metadata?.rating || m.metadata?.originalData?.rating || 0,
            dates: m.metadata?.dateRange || '',
            price: m.metadata?.price || 0,
            currency: 'USD',
            isFavorite: m.metadata?.isFavorite || false,
            isGuestFavorite: m.metadata?.isGuestFavorite || false,
          } as RNMapMarkerCardItem;
        })
        .sort((a, b) => {
          // Ensure the selected marker is first in the list
          if (a.id === selectedMarkerId?.toString()) {
            return -1;
          }
          if (b.id === selectedMarkerId?.toString()) {
            return 1;
          }
          return 0;
        });

      // If no cards were generated but we have a selected marker, create at least one card for it
      if (cardsData.length === 0) {
        cardsData.push({
          id: selectedMarker.id?.toString() || '',
          images: [`https://picsum.photos/seed/${selectedMarker.id}/200/300`],
          title: selectedMarker.title || 'Unknown Location',
          location: selectedMarker.description || 'Unknown Location',
          rating: parseFloat((Math.random() * (5 - 3) + 3).toFixed(2)),
          dates: 'Available Now',
          price: Math.floor(Math.random() * 100) + 50,
          currency: 'USD',
          isFavorite: false,
          isGuestFavorite: Math.random() > 0.7,
        });
      }

      // Set cards data and ensure visibility is true when we have a selected marker
      setMarkerCards(cardsData);
      setSelectedCardIndex(0);
      setIsCardsVisible(true); // Always set to true when we have a selected marker
    },
    [calculateDistance],
  );

  // Show cards for a specific marker
  const showCardsForMarker = useCallback(
    (
      markers: RNMapMarkerType[],
      markerId: string | number,
      radiusKm?: number,
    ) => {
      generateMarkerCards(markers, markerId, radiusKm);
    },
    [generateMarkerCards],
  );

  // Hide all cards
  const hideCards = useCallback(() => {
    setMarkerCards([]);
    setIsCardsVisible(false);
  }, []);

  // Toggle favorite status for a card
  const toggleFavorite = useCallback((cardId: string) => {
    setMarkerCards(prevCards =>
      prevCards.map(card =>
        card.id === cardId ? {...card, isFavorite: !card.isFavorite} : card,
      ),
    );
  }, []);

  // Handle card selection change
  const handleCardChange = useCallback((index: number) => {
    setSelectedCardIndex(index);
  }, []);

  // Get the current region to focus on selected card
  const getRegionForSelectedCard = useCallback((): Region | null => {
    const selectedCard = markerCards[selectedCardIndex];
    if (!selectedCard) {
      return null;
    }

    // This would need the actual coordinate from the original marker
    // For now, return null as we don't have direct access to coordinates here
    return null;
  }, [markerCards, selectedCardIndex]);

  return {
    markerCards,
    selectedCardIndex,
    isCardsVisible,
    showCardsForMarker,
    hideCards,
    toggleFavorite,
    handleCardChange,
    getRegionForSelectedCard,
  };
};
