import React, {useState, useCallback, useRef, useMemo, useEffect} from 'react';
import {View, StyleSheet, Dimensions, ScrollView, Platform} from 'react-native';
import MapView, {
  PROVIDER_GOOGLE,
  Region,
  PROVIDER_DEFAULT,
} from 'react-native-maps';
import {RNMapProps, RNMapMarkerItem} from './types';
import {RNMapMarker} from './RNMapMarker';
import {RNMapMarkerCard} from './RNMapMarkerCard';
import {useAnimatedRegion} from '@hooks/useAnimatedRegion';
import {Button} from '@components/Button/Button';
import {useTranslation} from '@hooks/useTranslation';
import {getShadow} from '@theme/shadows';
import {colors} from '@theme/colors';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {spacing} from '@theme/spacing';

const screen = Dimensions.get('window');
const ITEM_SPACING = 10;
const ITEM_PREVIEW = 10;
const ITEM_WIDTH = screen.width - 2 * ITEM_SPACING - 2 * ITEM_PREVIEW;

const RNMapComponent: React.FC<RNMapProps> = ({
  initialRegion,
  style,
  markers = [],
  onPress,
  onMarkerPress,
  showUserLocation = false,
  onRegionChange,
  mapRef,
  onBusinessSelect,
  onDetailScreenOpen,
  selectedBusinessId,
  showSearchButton = false,
  onSearchThisArea,
  searchButtonLoading = false,
  userLocation,
  onMyLocationPress,
  onFilterPress,
  showFilterButton = false,
  hasActiveFilters = false,
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showScrollView, setShowScrollView] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);
  const internalMapRef = useRef<MapView>(null);
  const activeMapRef = mapRef || internalMapRef;
  const scrollViewRef = useRef<ScrollView>(null);
  const isProgrammaticChange = useRef(false);
  const regionChangeTimeout = useRef<NodeJS.Timeout | null>(null);
  const lastUserInteraction = useRef(false);
  const {t} = useTranslation();
  const inset = useSafeAreaInsets();
  // Animated region hook
  const {getRegionForIndex} = useAnimatedRegion(initialRegion, markers);

  /**
   * Update selected marker and sync map + card scroll
   */
  const updateSelectedMarker = useCallback(
    (index: number) => {
      if (index < 0 || index >= markers.length) {
        return;
      }

      const marker = markers[index];
      setSelectedIndex(index);
      setShowScrollView(true); // Show ScrollView when marker is selected
      onMarkerPress?.(marker);
      if (marker.business) {
        onBusinessSelect?.(marker.business);
      }

      // Animate map to center on marker
      if (activeMapRef.current) {
        isProgrammaticChange.current = true;
        const region = getRegionForIndex(index);
        activeMapRef.current.animateToRegion(region, 100);
        // Reset flag after animation completes
        setTimeout(() => {
          isProgrammaticChange.current = false;
        }, 100);
      }
    },
    [markers, onMarkerPress, onBusinessSelect, activeMapRef, getRegionForIndex],
  );

  /**
   * Handle marker press - update selection and scroll to card
   */
  const handleMarkerPress = useCallback(
    (marker: RNMapMarkerItem, index: number) => {
      updateSelectedMarker(index);

      // Scroll to the selected marker card after a small delay to ensure ScrollView is rendered
      setTimeout(() => {
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollTo({
            x: index * (ITEM_WIDTH + ITEM_SPACING),
            animated: true,
          });
        }
      }, 100);
    },
    [updateSelectedMarker],
  );

  // Debounced region change handler for performance
  const handleRegionChange = useCallback(
    (region: Region) => {
      // Determine if this is a user-initiated change
      const isUserInitiated = !isProgrammaticChange.current;

      // Debounce region change callback to prevent excessive calls
      if (regionChangeTimeout.current) {
        clearTimeout(regionChangeTimeout.current);
      }
      regionChangeTimeout.current = setTimeout(() => {
        onRegionChange?.(region, isUserInitiated);
      }, 300); // 300ms debounce
    },
    [onRegionChange],
  );

  /**
   * Handle card scroll end - update selected marker and center map
   */
  const handleScrollEnd = useCallback(
    (event: any) => {
      const newIndex = Math.round(
        event.nativeEvent.contentOffset.x / (ITEM_WIDTH + ITEM_SPACING),
      );
      if (
        newIndex !== selectedIndex &&
        newIndex >= 0 &&
        newIndex < markers.length
      ) {
        updateSelectedMarker(newIndex);
      }
    },
    [selectedIndex, markers.length, updateSelectedMarker],
  );

  /**
   * Handle map ready - enables user location on Android
   */
  const handleMapReady = useCallback(() => {
    setIsMapReady(true);
  }, []);

  /**
   * Handle user touch start - close marker cards and mark as user interaction
   */
  const handleTouchMove = useCallback(() => {
    lastUserInteraction.current = true;
    // Close marker cards when user touches the map
    setShowScrollView(false);
    setSelectedIndex(null);
  }, []);

  /**
   * Handle programmatic region changes - reset user interaction flag after delay
   */
  useEffect(() => {
    if (isProgrammaticChange.current) {
      const timer = setTimeout(() => {
        lastUserInteraction.current = false;
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [selectedIndex]);

  // Memoize marker rendering for performance
  const renderedMarkers = useMemo(
    () =>
      markers.map((marker: RNMapMarkerItem, index: number) => (
        <RNMapMarker
          key={marker.id}
          marker={marker}
          onPress={() => handleMarkerPress(marker, index)}
          isSelected={selectedIndex !== null && index === selectedIndex}
        />
      )),
    [markers, handleMarkerPress, selectedBusinessId, selectedIndex],
  );

  // Memoize card rendering for performance
  const renderedCards = useMemo(
    () =>
      markers.map((marker: RNMapMarkerItem, index: number) => (
        <View key={marker.id} style={[styles.item]}>
          {marker.business && (
            <RNMapMarkerCard
              business={marker.business}
              onPress={() => handleMarkerPress(marker, index)}
              userLocation={userLocation}
              onClose={() => handleTouchMove()}
              onDetailScreenOpen={onDetailScreenOpen}
            />
          )}
        </View>
      )),
    [markers, selectedIndex, handleMarkerPress, userLocation],
  );

  // Render animated map with scrollable cards
  return (
    <View style={[styles.container, style]}>
      <MapView
        ref={activeMapRef}
        provider={Platform.OS === 'ios' ? PROVIDER_DEFAULT : PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={initialRegion}
        onPress={onPress}
        showsCompass={false}
        onRegionChange={handleRegionChange}
        onMapReady={handleMapReady}
        showsUserLocation={isMapReady && showUserLocation}
        showsMyLocationButton={false}
        onTouchMove={handleTouchMove}>
        {renderedMarkers}
      </MapView>

      {/* Search This Area Button - hidden when scrollview or marker is selected */}
      {showSearchButton &&
        !showScrollView &&
        selectedIndex === null &&
        isMapReady && (
          <View
            style={[styles.searchButtonContainer, {bottom: 80 + inset.bottom}]}>
            <Button
              title={t('screens.map.search_in_this_area')}
              iconName="map-pin-filled"
              iconColor={colors.neutral.white}
              onPress={onSearchThisArea}
              variant="primary"
              shape="round"
              loading={searchButtonLoading}
            />
          </View>
        )}

      {/* Filter Button - always visible */}
      {isMapReady && showFilterButton && onFilterPress && (
        <View style={[styles.filterButtonContainer, {top: 20 + inset.top}]}>
          <Button
            iconName={hasActiveFilters ? 'filter-filled' : 'filter'}
            iconSize={20}
            iconColor={colors.neutral.black}
            onPress={onFilterPress}
            variant="dark"
            shape="circle"
            badge={hasActiveFilters}
            badgePosition="left"
            style={styles.filterButton}
          />
        </View>
      )}

      {/* My Location Button - always visible */}
      {isMapReady && onMyLocationPress && (
        <View style={[styles.showMyLocationContainer, {top: 90 + inset.top}]}>
          <Button
            iconName="user-location"
            iconSize={20}
            onPress={onMyLocationPress}
            variant="dark"
            shape="circle"
            style={{width: 48, height: 48}}
          />
        </View>
      )}

      {/* Scrollable marker cards - only shown after marker selection */}
      {showScrollView && (
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled={false}
          decelerationRate="fast"
          snapToInterval={ITEM_WIDTH + ITEM_SPACING}
          snapToAlignment="center"
          contentInset={{
            top: 0,
            left: ITEM_SPACING / 2 + ITEM_PREVIEW,
            bottom: 0,
            right: ITEM_SPACING / 2 + ITEM_PREVIEW,
          }}
          contentContainerStyle={styles.scrollViewContent}
          showsHorizontalScrollIndicator={false}
          style={[styles.scrollView, {bottom: 80 + inset.bottom}]}
          onMomentumScrollEnd={handleScrollEnd}
          removeClippedSubviews={true}>
          {renderedCards}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  scrollView: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  scrollViewContent: {
    paddingHorizontal: ITEM_SPACING / 2,
  },
  item: {
    width: ITEM_WIDTH,
    marginHorizontal: ITEM_SPACING / 2,
    overflow: 'hidden',
  },
  searchButtonContainer: {
    position: 'absolute',
    alignSelf: 'center',
    ...getShadow('small'),
  },
  filterButtonContainer: {
    position: 'absolute',
    right: spacing.xl,
    ...getShadow('small'),
  },
  showMyLocationContainer: {
    position: 'absolute',
    right: spacing.xl,
    ...getShadow('small'),
  },
  filterButton: {
    width: 48,
    height: 48,
    backgroundColor: colors.neutral.white,
  },
});

// Export memoized component for performance
export const RNMap = React.memo(RNMapComponent);
