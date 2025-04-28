import {useCallback, useState, useRef, useEffect, useMemo} from 'react';
import {MAPBOX_ACCESS_TOKEN} from '@env';
import Mapbox from '@rnmapbox/maps';
import {Keyboard} from 'react-native';

export interface SearchResult {
  id: string;
  name: string;
  coordinates: [number, number];
  address?: string;
}

export interface MapSearchHookProps {
  onSearchResult?: (result: {
    name: string;
    coordinates: [number, number];
    address?: string;
  }) => void;
  debounceTime?: number;
}

export const useMapSearch = ({
  onSearchResult,
  debounceTime = 300,
}: MapSearchHookProps = {}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Use a ref to store the latest search timer id
  const searchTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Use a ref to store the abort controller for fetch cancellation
  const abortControllerRef = useRef<AbortController | null>(null);

  // Handle search query changes with debouncing
  const handleSearchQueryChange = useCallback(
    (text: string) => {
      setSearchQuery(text);

      // Clear any existing timer
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current);
        searchTimerRef.current = null;
      }

      // Cancel any in-flight requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }

      if (text.length > 2) {
        // Set a new timer for debouncing
        searchTimerRef.current = setTimeout(() => {
          performSearch(text);
        }, debounceTime);
      } else {
        setSearchResults([]);
        setShowSearchResults(false);
      }
    },
    [debounceTime],
  );

  // Clean up timer and abort controller on unmount
  useEffect(() => {
    return () => {
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Perform search using Mapbox Geocoding API
  const performSearch = async (query: string) => {
    if (!query.trim()) {
      return;
    }

    setIsSearching(true);

    // Create a new abort controller for this request
    abortControllerRef.current = new AbortController();
    const {signal} = abortControllerRef.current;

    try {
      // Build Mapbox Geocoding API URL
      const endpoint = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        query,
      )}.json?access_token=${MAPBOX_ACCESS_TOKEN}&limit=5`;

      const response = await fetch(endpoint, {signal});

      // Check if the request was aborted
      if (signal.aborted) {
        return;
      }

      const data = await response.json();

      if (data.features) {
        const formattedResults = data.features.map((feature: any) => ({
          id: feature.id,
          name: feature.text,
          coordinates: feature.center as [number, number],
          address: feature.place_name,
        }));

        setSearchResults(formattedResults);
        setShowSearchResults(true);
      }
    } catch (error) {
      // Only log errors if they're not from an aborted request
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Error searching for location:', error);
      }
    } finally {
      // Only update state if the request wasn't aborted
      if (!signal.aborted) {
        setIsSearching(false);
      }
    }
  };

  // Handle selecting a search result - optimized with type safety
  const handleSelectSearchResult = useCallback(
    (
      result: SearchResult,
      camera?: React.RefObject<Mapbox.Camera | null>,
      setMapCenter?: (center: [number, number]) => void,
    ) => {
      // Move camera to the selected location if camera ref is provided
      if (camera?.current) {
        if (setMapCenter) {
          setMapCenter(result.coordinates);
        }

        camera.current.setCamera({
          centerCoordinate: result.coordinates,
          zoomLevel: 15,
          animationDuration: 1000,
        });
      }

      // Clear search
      setSearchQuery(result.name);
      setSearchResults([]);
      setShowSearchResults(false);
      Keyboard.dismiss();

      // Call the callback if provided
      if (onSearchResult) {
        onSearchResult(result);
      }
    },
    [onSearchResult],
  );

  // Clear search
  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
    setSearchResults([]);
    setShowSearchResults(false);
    Keyboard.dismiss();

    // Cancel any in-flight search requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  // Memoize results to prevent unnecessary re-renders
  const memoizedSearchResults = useMemo(() => searchResults, [searchResults]);

  return {
    searchQuery,
    searchResults: memoizedSearchResults,
    isSearching,
    showSearchResults,
    setShowSearchResults,
    handleSearchQueryChange,
    handleSelectSearchResult,
    handleClearSearch,
  };
};
