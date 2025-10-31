import React, {useState, useCallback, useRef, useMemo, useEffect} from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  ScrollView,
  Platform,
  Animated,
} from 'react-native';
import MapView, {
  PROVIDER_GOOGLE,
  Region,
  PROVIDER_DEFAULT,
} from 'react-native-maps';
import {RNMapProps, RNMapMarkerItem, MapTabType} from './types';
import {RNMapMarker} from './RNMapMarker';
import {RNMapBusinessMarkerCard} from './RNMapBusinessMarkerCard';
import {RNMapWarningMarkerCard} from './RNMapWarningMarkerCard';
import {RNMapEmergencyMarkerCard} from './RNMapEmergencyMarkerCard';
import {useAnimatedRegion} from '@hooks/useAnimatedRegion';
import {Button} from '@components/Button/Button';
import {useTranslation} from '@hooks/useTranslation';
import {getShadow} from '@theme/shadows';
import {colors} from '@theme/colors';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {spacing} from '@theme/spacing';
import {Chip} from '@components/Chip';

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
  showMyLocationButton = true,
  hasActiveFilters = false,
  showEmergencyButton = false,
  onEmergencyPress,
  showWarningButton = false,
  onWarningPress,
  selectedTab,
  onTabChange,
  showTabs = false,
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showScrollView, setShowScrollView] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);
  const [isWarningExpanded, setIsWarningExpanded] = useState(false);
  const [isEmergencyExpanded, setIsEmergencyExpanded] = useState(false);
  const internalMapRef = useRef<MapView>(null);
  const activeMapRef = mapRef || internalMapRef;
  const scrollViewRef = useRef<ScrollView>(null);
  const isProgrammaticChange = useRef(false);
  const regionChangeTimeout = useRef<NodeJS.Timeout | null>(null);
  const lastUserInteraction = useRef(false);
  const warningButtonWidth = useRef(new Animated.Value(48)).current;
  const emergencyButtonWidth = useRef(new Animated.Value(48)).current;
  const warningCollapseTimeout = useRef<NodeJS.Timeout | null>(null);
  const emergencyCollapseTimeout = useRef<NodeJS.Timeout | null>(null);
  const {t} = useTranslation();
  const inset = useSafeAreaInsets();
  // Animated region hook
  const {getRegionForIndex} = useAnimatedRegion(initialRegion, markers);

  /**
   * Generic expandable button methods
   */
  const expandButton = useCallback(
    (
      buttonWidth: Animated.Value,
      setExpanded: (expanded: boolean) => void,
      collapseTimeoutRef: React.MutableRefObject<NodeJS.Timeout | null>,
    ) => {
      setExpanded(true);

      // Animate to expanded width
      Animated.timing(buttonWidth, {
        toValue: 180,
        duration: 300,
        useNativeDriver: false,
      }).start();

      // Clear existing timeout
      if (collapseTimeoutRef.current) {
        clearTimeout(collapseTimeoutRef.current);
      }

      // Set new timeout for 3 seconds
      collapseTimeoutRef.current = setTimeout(() => {
        setExpanded(false);
        Animated.timing(buttonWidth, {
          toValue: 48,
          duration: 300,
          useNativeDriver: false,
        }).start();
      }, 3000);
    },
    [],
  );

  const collapseButton = useCallback(
    (
      buttonWidth: Animated.Value,
      setExpanded: (expanded: boolean) => void,
      collapseTimeoutRef: React.MutableRefObject<NodeJS.Timeout | null>,
    ) => {
      setExpanded(false);

      // Clear timeout
      if (collapseTimeoutRef.current) {
        clearTimeout(collapseTimeoutRef.current);
        collapseTimeoutRef.current = null;
      }

      // Animate to collapsed width
      Animated.timing(buttonWidth, {
        toValue: 48,
        duration: 300,
        useNativeDriver: false,
      }).start();
    },
    [],
  );

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
   * Note: Scroll position will be calculated based on filtered markers in useEffect
   */
  const handleMarkerPress = useCallback(
    (marker: RNMapMarkerItem, index: number) => {
      updateSelectedMarker(index);
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
    // Collapse expandable buttons if expanded
    if (isWarningExpanded) {
      collapseButton(
        warningButtonWidth,
        setIsWarningExpanded,
        warningCollapseTimeout,
      );
    }
    if (isEmergencyExpanded) {
      collapseButton(
        emergencyButtonWidth,
        setIsEmergencyExpanded,
        emergencyCollapseTimeout,
      );
    }
  }, [
    isWarningExpanded,
    isEmergencyExpanded,
    collapseButton,
    warningButtonWidth,
    emergencyButtonWidth,
    warningCollapseTimeout,
    emergencyCollapseTimeout,
  ]);

  /**
   * Handle warning button press - toggle expansion
   */
  const handleWarningPress = useCallback(() => {
    if (!isWarningExpanded) {
      // Expand button
      expandButton(
        warningButtonWidth,
        setIsWarningExpanded,
        warningCollapseTimeout,
      );
    } else {
      onWarningPress?.();
    }
  }, [
    isWarningExpanded,
    expandButton,
    collapseButton,
    warningButtonWidth,
    onWarningPress,
  ]);

  /**
   * Handle emergency button press - toggle expansion
   */
  const handleEmergencyPress = useCallback(() => {
    if (!isEmergencyExpanded) {
      // Expand button
      expandButton(
        emergencyButtonWidth,
        setIsEmergencyExpanded,
        emergencyCollapseTimeout,
      );
    } else {
      onEmergencyPress?.();
    }
  }, [
    isEmergencyExpanded,
    expandButton,
    collapseButton,
    emergencyButtonWidth,
    onEmergencyPress,
  ]);

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

  // Cleanup collapse timers on unmount
  useEffect(() => {
    return () => {
      if (warningCollapseTimeout.current) {
        clearTimeout(warningCollapseTimeout.current);
      }
      if (emergencyCollapseTimeout.current) {
        clearTimeout(emergencyCollapseTimeout.current);
      }
    };
  }, []);

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

  // Split markers by type for organized rendering
  const businessMarkers = useMemo(
    () => markers.filter(marker => marker.business),
    [markers],
  );

  const warningMarkers = useMemo(
    () => markers.filter(marker => marker.warning),
    [markers],
  );

  const emergencyMarkers = useMemo(
    () => markers.filter(marker => marker.emergency),
    [markers],
  );

  // Determine which marker type is currently selected
  const selectedMarkerType = useMemo(() => {
    if (selectedIndex === null) {
      return null;
    }
    const selectedMarker = markers[selectedIndex];
    if (!selectedMarker) {
      return null;
    }

    if (selectedMarker.business) {
      return 'business';
    }
    if (selectedMarker.warning) {
      return 'warning';
    }
    if (selectedMarker.emergency) {
      return 'emergency';
    }
    return null;
  }, [selectedIndex, markers]);

  // Filter cards to show only the same type as selected marker
  const filteredMarkers = useMemo(() => {
    if (!selectedMarkerType) {
      return [];
    }

    switch (selectedMarkerType) {
      case 'business':
        return businessMarkers;
      case 'warning':
        return warningMarkers;
      case 'emergency':
        return emergencyMarkers;
      default:
        return [];
    }
  }, [selectedMarkerType, businessMarkers, warningMarkers, emergencyMarkers]);

  /**
   * Handle card scroll end - update selected marker and center map
   * Only scrolls within the same marker type (business, warning, or emergency)
   */
  const handleScrollEnd = useCallback(
    (event: any) => {
      const scrollIndex = Math.round(
        event.nativeEvent.contentOffset.x / (ITEM_WIDTH + ITEM_SPACING),
      );

      // Get the marker from filtered list
      if (scrollIndex >= 0 && scrollIndex < filteredMarkers.length) {
        const scrolledMarker = filteredMarkers[scrollIndex];
        // Find its original index in the full markers array
        const originalIndex = markers.findIndex(
          m => m.id === scrolledMarker.id,
        );

        if (originalIndex !== -1 && originalIndex !== selectedIndex) {
          updateSelectedMarker(originalIndex);
        }
      }
    },
    [filteredMarkers, markers, selectedIndex, updateSelectedMarker],
  );

  /**
   * Scroll to selected marker within filtered list when selection changes
   */
  useEffect(() => {
    if (selectedIndex !== null && scrollViewRef.current) {
      const selectedMarker = markers[selectedIndex];
      if (selectedMarker) {
        // Find the index in filtered markers
        const filteredIndex = filteredMarkers.findIndex(
          m => m.id === selectedMarker.id,
        );

        if (filteredIndex !== -1) {
          setTimeout(() => {
            scrollViewRef.current?.scrollTo({
              x: filteredIndex * (ITEM_WIDTH + ITEM_SPACING),
              animated: true,
            });
          }, 100);
        }
      }
    }
  }, [selectedIndex, markers, filteredMarkers]);

  // Memoize card rendering for performance - only show cards of selected type
  const renderedCards = useMemo(
    () =>
      filteredMarkers.map((marker: RNMapMarkerItem) => {
        // Find the original index in all markers
        const originalIndex = markers.findIndex(m => m.id === marker.id);

        return (
          <View key={marker.id} style={[styles.item]}>
            {marker.business && (
              <RNMapBusinessMarkerCard
                business={marker.business}
                onPress={() => {
                  if (originalIndex !== -1) {
                    handleMarkerPress(marker, originalIndex);
                  }
                }}
                userLocation={userLocation}
                onClose={() => handleTouchMove()}
                onDetailScreenOpen={onDetailScreenOpen}
              />
            )}
            {marker.warning && (
              <RNMapWarningMarkerCard
                warning={marker.warning}
                onPress={() => {
                  if (originalIndex !== -1) {
                    handleMarkerPress(marker, originalIndex);
                  }
                }}
                userLocation={userLocation}
                onClose={() => handleTouchMove()}
              />
            )}
            {marker.emergency && (
              <RNMapEmergencyMarkerCard
                emergency={marker.emergency}
                onPress={() => {
                  if (originalIndex !== -1) {
                    handleMarkerPress(marker, originalIndex);
                  }
                }}
                userLocation={userLocation}
                onClose={() => handleTouchMove()}
              />
            )}
          </View>
        );
      }),
    [
      filteredMarkers,
      markers,
      handleMarkerPress,
      userLocation,
      onDetailScreenOpen,
      handleTouchMove,
    ],
  );

  // Render animated map with scrollable cards
  return (
    <View style={[styles.container, style]}>
      {/* Tab Chips */}
      {showTabs && isMapReady && (
        <View style={[styles.tabContainer, {top: 20 + inset.top}]}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabScrollContent}>
            {Object.values(MapTabType).map((tab: MapTabType) => (
              <Chip
                key={tab}
                label={t(`screens.map.tabs.${tab}`)}
                selected={selectedTab === tab}
                onPress={() => onTabChange?.(tab)}
                variant="filled"
                color={
                  selectedTab === tab
                    ? tab === MapTabType.WARNINGS
                      ? 'warning'
                      : tab === MapTabType.EMERGENCIES
                      ? 'error'
                      : 'dark'
                    : 'light'
                }
                size="large"
                leadingIcon={
                  tab === MapTabType.BUSINESSES
                    ? 'wrench-filled'
                    : tab === MapTabType.WARNINGS
                    ? 'error-filled'
                    : tab === MapTabType.EMERGENCIES
                    ? 'bell-exclamation-filled'
                    : undefined
                }
              />
            ))}
          </ScrollView>
        </View>
      )}

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
        <View style={[styles.filterButtonContainer, {top: 150 + inset.top}]}>
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

      {/* Warning Button - expandable */}
      {isMapReady && showWarningButton && onWarningPress && (
        <View style={[styles.warningButtonContainer, {top: 230 + inset.top}]}>
          <Animated.View
            style={[styles.warningButton, {width: warningButtonWidth}]}>
            <Button
              title={
                isWarningExpanded ? t('screens.map.warning_title') : undefined
              }
              iconName="error-filled"
              iconSize={20}
              onPress={handleWarningPress}
              variant="secondary"
              shape={isWarningExpanded ? 'round' : 'circle'}
              style={[styles.warningButtonInner]}
            />
          </Animated.View>
        </View>
      )}

      {/* Emergency Button - expandable */}
      {isMapReady && showEmergencyButton && onEmergencyPress && (
        <View style={[styles.emergencyButtonContainer, {top: 310 + inset.top}]}>
          <Animated.View
            style={[styles.emergencyButton, {width: emergencyButtonWidth}]}>
            <Button
              title={
                isEmergencyExpanded
                  ? t('screens.map.emergency_title')
                  : undefined
              }
              iconName="bell-exclamation-filled"
              iconSize={20}
              onPress={handleEmergencyPress}
              variant="primary"
              shape={isEmergencyExpanded ? 'round' : 'circle'}
              style={[styles.emergencyButtonInner]}
            />
          </Animated.View>
        </View>
      )}

      {/* My Location Button - always visible */}
      {isMapReady && showMyLocationButton && onMyLocationPress && (
        <View style={[styles.showMyLocationContainer, {top: 390 + inset.top}]}>
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
    right: spacing.md,
    ...getShadow('small'),
  },
  showMyLocationContainer: {
    position: 'absolute',
    right: spacing.md,
    ...getShadow('small'),
  },
  filterButton: {
    width: 48,
    height: 48,
    backgroundColor: colors.neutral.white,
  },
  emergencyButtonContainer: {
    position: 'absolute',
    right: spacing.md,
    ...getShadow('small'),
  },
  emergencyButton: {
    height: 48,
    backgroundColor: colors.status.error,
    borderRadius: 24,
    overflow: 'hidden',
  },
  emergencyButtonInner: {
    width: '100%',
    height: 48,
    backgroundColor: colors.status.error,
  },
  warningButtonContainer: {
    position: 'absolute',
    right: spacing.md,
    ...getShadow('small'),
  },
  warningButton: {
    height: 48,
    backgroundColor: colors.status.warning,
    borderRadius: 24,
    overflow: 'hidden',
  },
  warningButtonInner: {
    width: '100%',
    height: 48,
    backgroundColor: colors.status.warning,
  },
  tabContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 1000,
    ...getShadow('medium'),
  },
  tabScrollContent: {
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    gap: spacing.md,
  },
});

// Export memoized component for performance
export const RNMap = React.memo(RNMapComponent);
