import React, {useState, useCallback, useRef} from 'react';
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

const screen = Dimensions.get('window');
const ITEM_SPACING = 10;
const ITEM_PREVIEW = 10;
const ITEM_WIDTH = screen.width - 2 * ITEM_SPACING - 2 * ITEM_PREVIEW;
const ITEM_PREVIEW_HEIGHT = 200;

/**
 * RNMap Component
 * Advanced map component with business markers and animated regions
 *
 * Features:
 * - Business markers with custom styling and scale animations
 * - Animated region transitions (always enabled)
 * - Scrollable marker cards with snap-to-interval behavior
 * - Automatic map centering on marker selection
 * - User location tracking
 * - Bidirectional sync between map markers and cards
 */
export const RNMap: React.FC<RNMapProps> = ({
  initialRegion,
  style,
  markers = [],
  onPress,
  onMarkerPress,
  showUserLocation = false,
  onRegionChange,
  mapRef,
  onBusinessSelect,
  selectedBusinessId,
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showScrollView, setShowScrollView] = useState(false);
  const internalMapRef = useRef<MapView>(null);
  const activeMapRef = mapRef || internalMapRef;
  const scrollViewRef = useRef<ScrollView>(null);
  const isProgrammaticChange = useRef(false);

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
        activeMapRef.current.animateToRegion(region, 350);
        // Reset flag after animation completes
        setTimeout(() => {
          isProgrammaticChange.current = false;
        }, 400);
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

      // Scroll to the selected marker card
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({
          x: index * (ITEM_WIDTH + ITEM_SPACING),
          animated: true,
        });
      }
    },
    [updateSelectedMarker],
  );

  const handleRegionChange = useCallback(
    (region: Region) => {
      // Only hide ScrollView and reset selection on user-initiated region changes
      if (!isProgrammaticChange.current) {
        setShowScrollView(false);
        setSelectedIndex(null);
      }
      onRegionChange?.(region);
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
        showsUserLocation={showUserLocation}>
        {markers.map((marker, index) => (
          <RNMapMarker
            key={marker.id}
            marker={marker}
            onPress={() => handleMarkerPress(marker, index)}
            isSelected={
              selectedBusinessId
                ? marker.business?.id === selectedBusinessId
                : selectedIndex !== null && index === selectedIndex
            }
          />
        ))}
      </MapView>

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
          style={styles.scrollView}
          onMomentumScrollEnd={handleScrollEnd}>
          {markers.map((marker, index) => (
            <View
              key={marker.id}
              style={[
                styles.item,
                selectedIndex !== null &&
                  index === selectedIndex &&
                  styles.selectedItem,
              ]}>
              {marker.business && (
                <RNMapMarkerCard
                  business={marker.business}
                  onPress={() => handleMarkerPress(marker, index)}
                />
              )}
            </View>
          ))}
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
  cardContainer: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
  },
  scrollView: {
    position: 'absolute',
    bottom: 120,
    left: 0,
    right: 0,
  },
  scrollViewContent: {
    paddingHorizontal: ITEM_SPACING / 2,
  },
  item: {
    width: ITEM_WIDTH,
    height: ITEM_PREVIEW_HEIGHT,
    marginHorizontal: ITEM_SPACING / 2,
    overflow: 'hidden',
  },
  selectedItem: {
    // Add any additional styling for selected card if needed
  },
});
