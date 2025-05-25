import React, {useState, useEffect, useRef} from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Text,
  ScrollView,
  Keyboard,
} from 'react-native';
import {RNMapSearchProps, RNMapSearchResult} from './types';
import {colors} from '@theme/colors';
import {Icon} from '@components';
import {RNMapFilter} from './RNMapFilter';
import {MapFilterState} from '@hooks/useMapFilter';
import {getShadow} from '@theme/shadows';

// Mock search results for demonstration
const MOCK_SEARCH_RESULTS: RNMapSearchResult[] = [
  {
    id: '1',
    name: 'San Francisco',
    address: 'California, USA',
    location: {latitude: 37.7749, longitude: -122.4194},
  },
  {
    id: '2',
    name: 'New York',
    address: 'New York, USA',
    location: {latitude: 40.7128, longitude: -74.006},
  },
  {
    id: '3',
    name: 'Los Angeles',
    address: 'California, USA',
    location: {latitude: 34.0522, longitude: -118.2437},
  },
];

/**
 * A component to search locations on the map
 */
export const RNMapSearch: React.FC<RNMapSearchProps> = ({
  onResultSelect,
  onSearchStart,
  onSearchEnd,
  placeholder = 'Search location...',
  debounceMs = 500,
  showFilter = true,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<RNMapSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  // Search for locations based on query
  const searchLocations = (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    onSearchStart?.();

    // Mock API call with timeout
    // In a real implementation, this would be replaced with a call to a geocoding service
    setTimeout(() => {
      const filteredResults = MOCK_SEARCH_RESULTS.filter(
        result =>
          result.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          result.address?.toLowerCase().includes(searchQuery.toLowerCase()),
      );
      setResults(filteredResults);
      setIsLoading(false);
      onSearchEnd?.();
    }, 500);
  };

  // Debounce search to avoid too many API calls
  useEffect(() => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    if (query.trim()) {
      debounceTimeout.current = setTimeout(() => {
        searchLocations(query);
      }, debounceMs);
    } else {
      setResults([]);
    }

    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [query, debounceMs]);

  // Handle selection of a search result
  const handleSelectResult = (result: RNMapSearchResult) => {
    onResultSelect?.(result);
    setQuery(result.name);
    setShowResults(false);
    Keyboard.dismiss();
  };

  const handleClearSearch = () => {
    setQuery('');
    setResults([]);
  };

  const handleFilterChange = (newFilter: MapFilterState) => {
    // Filter results based on the new filter state
    const filteredResults = results.filter(result => {
      // Add your filtering logic here based on the result's metadata
      // For example, if result has price and distance information:
      const resultPrice = result.metadata?.price || 0;
      const resultDistance = result.metadata?.distance || 0;

      return (
        resultPrice >= newFilter.priceRange[0] &&
        resultPrice <= newFilter.priceRange[1] &&
        resultDistance <= newFilter.distance
      );
    });
    setResults(filteredResults);
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <View
          style={[
            styles.searchInputContainer,
            !showFilter && styles.searchInputContainerFull,
          ]}>
          <Icon
            name="search"
            size={14}
            color={colors.neutral.grey}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder={placeholder}
            placeholderTextColor={colors.neutral.grey}
            value={query}
            onChangeText={setQuery}
            onFocus={() => {
              if (results.length > 0) {
                setShowResults(true);
              }
            }}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity
              style={styles.clearSearchButton}
              onPress={handleClearSearch}>
              <Icon name="close" size={16} />
            </TouchableOpacity>
          )}
          {isLoading && (
            <ActivityIndicator
              size="small"
              color={colors.primary.main}
              style={styles.searchLoader}
            />
          )}
        </View>
        {showFilter && <RNMapFilter onFilterChange={handleFilterChange} />}
      </View>

      {showResults && results.length > 0 && (
        <ScrollView
          style={styles.searchResultsContainer}
          bounces={false}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          {results.map(result => (
            <TouchableOpacity
              key={result.id}
              style={styles.searchResultItem}
              onPress={() => handleSelectResult(result)}>
              <Text style={styles.searchResultName}>{result.name}</Text>
              {result.address && (
                <Text style={styles.searchResultAddress} numberOfLines={1}>
                  {result.address}
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 10,
    right: 10,
    zIndex: 10,
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '90%',
  },
  searchInputContainer: {
    flexDirection: 'row',
    backgroundColor: colors.neutral.white,
    borderRadius: 200,
    width: '85%',
    paddingHorizontal: 20,
    alignItems: 'center',
    ...getShadow('small'),
  },
  searchInputContainerFull: {
    width: '100%',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
    color: colors.neutral.black,
  },
  clearSearchButton: {
    padding: 4,
  },
  searchLoader: {
    marginLeft: 8,
  },
  searchResultsContainer: {
    backgroundColor: colors.neutral.white,
    borderRadius: 8,
    marginTop: 5,
    width: '90%',
    maxHeight: 300,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchResultItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.lightGrey,
  },
  searchResultName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.neutral.black,
  },
  searchResultAddress: {
    fontSize: 14,
    color: colors.neutral.darkGrey,
    marginTop: 3,
  },
});
