# Map Hooks

This directory contains custom React hooks for the map functionality in the mobile app.

## Hooks Overview

### useMapState

Manages the map's state including center coordinates, zoom level, and dynamic marker radius.

**Usage:**

```tsx
const {
  mapRef,
  camera,
  mapCenter,
  dynamicRadiusKm,
  refreshMapState,
  handleZoomIn,
  handleZoomOut,
  setMapCenter,
} = useMapState({
  initialCoordinates: {latitude: 37.78, longitude: -122.43},
  initialZoom: 14,
});
```

**Performance Optimizations:**

- Uses `useMemo` to prevent recalculating values unnecessarily
- Dynamic marker radius calculated only when zoom changes
- `requestAnimationFrame` for smooth map state updates
- Memoized callback functions to prevent recreating on each render

### useMapMarkers

Handles filtering markers based on distance from the map center and current dynamic radius.

**Usage:**

```tsx
const {visibleMarkers} = useMapMarkers({
  markers,
  mapCenter,
  dynamicRadiusKm,
  maxVisibleMarkers: 1000,
});
```

**Performance Optimizations:**

- Optimized Haversine distance calculation with pre-computed values
- Marker filtering deferred with `requestAnimationFrame` to avoid UI blocking
- Only re-filters when marker IDs or map center changes
- Uses memoization to prevent unnecessary re-renders

### useMapSearch

Provides search functionality for the map using Mapbox Geocoding API.

**Usage:**

```tsx
const {
  searchQuery,
  searchResults,
  isSearching,
  showSearchResults,
  setShowSearchResults,
  handleSearchQueryChange,
  handleSelectSearchResult,
  handleClearSearch,
} = useMapSearch({
  onSearchResult: result => {
    console.log('Selected search result:', result);
  },
  debounceTime: 300, // debounce delay in ms
});
```

**Performance Optimizations:**

- Debouncing to limit API calls during typing
- Request cancellation to prevent race conditions
- Cleanup on unmount to prevent memory leaks
- Memoized search results to prevent unnecessary re-renders

## Integration with MapView

These hooks are used in the MapView component to separate concerns and make the component more maintainable.

Example:

```tsx
// In MapView.tsx
import {useMapState, useMapMarkers, useMapSearch} from '@hooks';

// Initialize hooks
const mapState = useMapState({initialCoordinates, initialZoom});
const {visibleMarkers} = useMapMarkers({
  markers,
  mapCenter: mapState.mapCenter,
  dynamicRadiusKm: mapState.dynamicRadiusKm,
});
const search = useMapSearch({onSearchResult});

// Use hook values and functions in your component
```

This approach follows React best practices by:

1. Separating concerns
2. Making code more reusable
3. Improving testability
4. Reducing component complexity

## Additional Performance Tips

1. **Marker Rendering**

   - Limit visible markers based on distance and zoom level
   - Use clustering for large datasets (consider react-native-map-clustering)

2. **Viewport Calculations**

   - Only perform expensive calculations when necessary
   - Cache results when possible

3. **Memory Management**
   - Clean up event listeners and timers
   - Use `useCallback` and `useMemo` to prevent recreation of functions and objects
