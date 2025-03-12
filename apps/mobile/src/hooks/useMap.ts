import {useState, useEffect, useCallback, useRef} from 'react';
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
  refreshLocation: () => void;
}

export const useMap = (): UseMapReturn => {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null,
  );
  const [markers, setMarkers] = useState<Marker[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const markersGeneratedRef = useRef(false);

  const getCurrentLocation = useCallback(() => {
    setIsLoading(true);
    setError(null);

    Geolocation.requestAuthorization();

    Geolocation.getCurrentPosition(
      position => {
        setUserLocation([position.coords.longitude, position.coords.latitude]);
        setIsLoading(false);
      },
      locationError => {
        let errorMessage = 'Error getting location: ';
        switch (locationError.code) {
          case 1:
            errorMessage +=
              'Permission denied. Please enable location services.';
            break;
          case 2:
            errorMessage += 'Position unavailable. Please try again.';
            break;
          case 3:
            errorMessage += 'Location request timed out. Please try again.';
            break;
          default:
            errorMessage += locationError.message;
        }
        setError(errorMessage);
        setIsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 1000,
      },
    );
  }, []);

  const generateStableMarkers = useCallback(
    (baseLocation: [number, number]) => {
      if (markersGeneratedRef.current) return;

      const types: ('repair' | 'dealer' | 'parking')[] = [
        'repair',
        'dealer',
        'parking',
      ];
      const titles = {
        repair: [
          'Quick Fix Moto',
          'Pro Motorcycle Service',
          'Bike Mechanics',
          'MotoTech Repairs',
          'Elite Motorcycle Shop',
        ],
        dealer: [
          'Premium Motorcycles',
          'City Moto Dealer',
          'Luxury Bikes',
          'Classic Motorcycles',
          'Modern Moto Store',
        ],
        parking: [
          'Secure Bike Parking',
          '24/7 Moto Parking',
          'Premium Parking',
          'Safe Spot Parking',
          'Covered Bike Storage',
        ],
      };

      const descriptions = {
        repair: [
          'Expert repairs and maintenance',
          'Professional motorcycle service',
          'Quick and reliable repairs',
          'Certified mechanics',
          'Full-service workshop',
        ],
        dealer: [
          'New and used motorcycles',
          'Premium bike selection',
          'Authorized dealer',
          'Custom motorcycles',
          'Best deals in town',
        ],
        parking: [
          '24/7 secure parking',
          'Camera surveillance',
          'Covered parking spots',
          'Monthly rates available',
          'Easy access parking',
        ],
      };

      // Use a seeded random number generator for stable positions
      const seedRandom = (seed: number) => {
        return () => {
          seed = (seed * 16807) % 2147483647;
          return (seed - 1) / 2147483646;
        };
      };

      const random = seedRandom(12345); // Use a fixed seed for stable generation

      const mockData: Marker[] = Array.from({length: 20}, (_, i) => {
        // Use seeded random for stable offsets
        const latOffset = (random() - 0.5) * 0.04;
        const lngOffset = (random() - 0.5) * 0.04;

        const typeIndex = Math.floor(random() * types.length);
        const randomType = types[typeIndex];

        const titleIndex = Math.floor(random() * 5);
        const descriptionIndex = Math.floor(random() * 5);

        return {
          id: (i + 1).toString(),
          type: randomType,
          coordinates: [
            baseLocation[0] + lngOffset,
            baseLocation[1] + latOffset,
          ],
          title: titles[randomType][titleIndex],
          description: descriptions[randomType][descriptionIndex],
        };
      });

      setMarkers(mockData);
      markersGeneratedRef.current = true;
    },
    [],
  );

  const fetchNearbyPlaces = useCallback(async () => {
    try {
      if (!userLocation) {
        return;
      }
      generateStableMarkers(userLocation);
    } catch (err) {
      setError('Error fetching nearby places');
    }
  }, [userLocation, generateStableMarkers]);

  useEffect(() => {
    getCurrentLocation();
  }, [getCurrentLocation]);

  useEffect(() => {
    if (userLocation) {
      fetchNearbyPlaces();
    }
  }, [userLocation, fetchNearbyPlaces]);

  const searchLocation = async (query: string) => {
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);
    try {
      // TODO: Implement Mapbox Geocoding API call
      console.log('Searching for:', query);
      await fetchNearbyPlaces();
    } catch (err) {
      setError('Error searching location');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshLocation = useCallback(() => {
    markersGeneratedRef.current = false;
    getCurrentLocation();
  }, [getCurrentLocation]);

  return {
    userLocation,
    markers,
    searchLocation,
    isLoading,
    error,
    refreshLocation,
  };
};
