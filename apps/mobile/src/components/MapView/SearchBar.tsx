import React from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Text,
  ScrollView,
} from 'react-native';
import {Button, Icon} from '@components';
import {colors} from '@theme';
import Mapbox from '@rnmapbox/maps';
import {styles} from './MapView.styles';
import {SearchResult} from './types';

interface SearchBarProps {
  searchQuery: string;
  searchResults: SearchResult[];
  isSearching: boolean;
  showSearchResults: boolean;
  showFilterButton?: boolean;
  onSearchQueryChange: (text: string) => void;
  onClearSearch: () => void;
  onSelectSearchResult: (
    result: SearchResult,
    camera?: React.RefObject<Mapbox.Camera | null>,
    setMapCenter?: (center: [number, number]) => void,
  ) => void;
  onFilterPress?: () => void;
  setShowSearchResults: (show: boolean) => void;
  camera: React.RefObject<Mapbox.Camera | null>;
  setMapCenter: (center: [number, number]) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  searchResults,
  isSearching,
  showSearchResults,
  showFilterButton = false,
  onSearchQueryChange,
  onClearSearch,
  onSelectSearchResult,
  onFilterPress,
  setShowSearchResults,
  camera,
  setMapCenter,
}) => {
  return (
    <View style={styles.searchContainer}>
      <View style={styles.searchInputContainer}>
        <Icon
          name="search"
          size={14}
          color={colors.neutral.grey}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search"
          value={searchQuery}
          onChangeText={onSearchQueryChange}
          onFocus={() => {
            if (searchResults.length > 0) {
              setShowSearchResults(true);
            }
          }}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            style={styles.clearSearchButton}
            onPress={onClearSearch}>
            <Icon name="close" size={16} />
          </TouchableOpacity>
        )}
        {isSearching && (
          <ActivityIndicator
            size="small"
            color={colors.primary.main}
            style={styles.searchLoader}
          />
        )}
      </View>

      {showSearchResults && searchResults.length > 0 && (
        <ScrollView
          style={styles.searchResultsContainer}
          bounces={false}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          {searchResults.map(result => (
            <TouchableOpacity
              key={result.id}
              style={styles.searchResultItem}
              onPress={() =>
                onSelectSearchResult(result, camera, setMapCenter)
              }>
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
      {showFilterButton && (
        <Button
          variant="primary"
          shape="circle"
          size="small"
          iconName="sliders"
          iconSize={16}
          style={styles.filterButton}
          iconColor={colors.neutral.black}
          onPress={onFilterPress || (() => {})}
        />
      )}
    </View>
  );
};
