import {useState, useEffect} from 'react';
import Geolocation from '@react-native-community/geolocation';

export interface Marker {
  id: string;
  type: 'repair' | 'dealer' | 'parking';
  coordinates: [number, number];
  title: string;
  description: string;
}

interface UseMapReturn {
  userLocation: [number, number] | null;
  markers: Marker[];
  searchLocation: (query: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export const useMap = (): UseMapReturn => {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null,
  );
  const [markers, setMarkers] = useState<Marker[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getCurrentLocation();
    fetchNearbyPlaces();
  }, []);

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      position => {
        setUserLocation([position.coords.longitude, position.coords.latitude]);
      },
      error => {
        setError('Error getting location: ' + error.message);
      },
      {enableHighAccuracy: true, timeout: 20000, maximumAge: 1000},
    );
  };

  const fetchNearbyPlaces = async () => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call to your backend
      const mockData: Marker[] = [
        {
          id: '1',
          type: 'repair',
          coordinates: [-73.9866, 40.7306],
          title: 'NYC Moto Shop',
          description: 'Expert motorcycle repairs and maintenance',
        },
        {
          id: '2',
          type: 'dealer',
          coordinates: [-73.9877, 40.7297],
          title: 'Motorcycle Dealership',
          description: 'New and used motorcycles for sale',
        },
        {
          id: '3',
          type: 'parking',
          coordinates: [-73.9855, 40.7315],
          title: 'Secure Moto Parking',
          description: '24/7 secure motorcycle parking',
        },
      ];
      setMarkers(mockData);
    } catch (err) {
      setError('Error fetching nearby places');
    } finally {
      setIsLoading(false);
    }
  };

  const searchLocation = async (query: string) => {
    if (!query.trim()) return;

    setIsLoading(true);
    try {
      // TODO: Implement Mapbox Geocoding API call
      // For now, just log the search query
      console.log('Searching for:', query);

      // Mock search results
      // In real implementation, update markers based on search results
      await fetchNearbyPlaces();
    } catch (err) {
      setError('Error searching location');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    userLocation,
    markers,
    searchLocation,
    isLoading,
    error,
  };
};
