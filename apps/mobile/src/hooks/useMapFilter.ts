import {useState, useCallback} from 'react';

export interface MapFilterState {
  priceRange: [number, number];
  distance: number;
  categories: string[];
  sortBy: 'price' | 'distance' | 'rating';
}

const DEFAULT_FILTER_STATE: MapFilterState = {
  priceRange: [0, 1000],
  distance: 50,
  categories: [],
  sortBy: 'distance',
};

export const useMapFilter = () => {
  const [filterState, setFilterState] =
    useState<MapFilterState>(DEFAULT_FILTER_STATE);
  const [isFilterVisible, setIsFilterVisible] = useState(false);

  const updateFilter = useCallback((newFilter: Partial<MapFilterState>) => {
    setFilterState(prev => ({...prev, ...newFilter}));
  }, []);

  const resetFilter = useCallback(() => {
    setFilterState(DEFAULT_FILTER_STATE);
  }, []);

  const toggleFilter = useCallback(() => {
    setIsFilterVisible(prev => !prev);
  }, []);

  return {
    filterState,
    isFilterVisible,
    updateFilter,
    resetFilter,
    toggleFilter,
  };
};
