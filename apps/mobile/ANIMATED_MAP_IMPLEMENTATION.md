# Animated Map Region Implementation

## Overview
Complete implementation of animated map region functionality with scrollable marker cards, automatic centering, and marker scale animations.

## Features Implemented

### 1. **Scrollable Marker Cards** ✅
- Horizontal ScrollView with snap-to-interval behavior
- Smooth scrolling between business marker cards
- Automatic synchronization with map position
- Pagination-like experience with card snapping

### 2. **Center Focusing with Animation** ✅
- Selected marker automatically centers on map
- Smooth 350ms animation to new position
- Uses `animateToRegion` for fluid transitions
- Delta value set to 0.03 for optimal zoom level

### 3. **Marker Scale Animation** ✅
- Selected marker scales to 1.2x size
- Smooth spring animation with friction and tension
- Uses native driver for optimal performance
- Automatic scale-down when deselected

### 4. **Bidirectional Synchronization** ✅
- Tapping marker → scrolls to card & centers map
- Scrolling cards → updates selected marker & centers map
- Index tracking ensures consistency across all interactions

## Technical Implementation

### Hook: `useAnimatedRegion`
```typescript
export const useAnimatedRegion = (
  initialRegion: Region,
  displayedMarkers: RNMapMarkerItem[],
  onIndexChange?: (index: number) => void,
)
```

**Key Features:**
- LATITUDE_DELTA: 0.03 (optimal zoom level)
- Index change callback for synchronization
- Bounds checking to prevent invalid indices
- Pan gesture listeners for smooth scrolling

### Component: `RNMap`
```typescript
<RNMap
  initialRegion={region}
  markers={markers}
  useAnimatedRegion={true}  // Enable animated features
  onMarkerPress={handleMarkerPress}
  onBusinessSelect={handleBusinessSelect}
  selectedBusinessId={selectedBusinessId}
/>
```

**Key Features:**
- ScrollView with snap-to-interval for card scrolling
- `onMomentumScrollEnd` for detecting scroll completion
- Automatic map centering on marker selection
- Index-based marker selection tracking

### Component: `RNMapMarker`
```typescript
const scaleAnim = useRef(new Animated.Value(1)).current;

useEffect(() => {
  Animated.spring(scaleAnim, {
    toValue: isSelected ? 1.2 : 1,
    useNativeDriver: true,
    friction: 8,
    tension: 40,
  }).start();
}, [isSelected, scaleAnim]);
```

**Key Features:**
- Spring animation for natural feel
- 1.2x scale for selected markers
- Native driver for 60fps performance
- Smooth transitions on selection change

## User Experience Flow

### Scenario 1: User Taps a Marker
1. Marker scales to 1.2x with spring animation
2. Map animates to center on marker (350ms)
3. ScrollView scrolls to corresponding card
4. Card becomes visible and highlighted
5. Business details are displayed

### Scenario 2: User Scrolls Cards
1. User swipes through marker cards
2. ScrollView snaps to nearest card
3. `onMomentumScrollEnd` detects new index
4. Map animates to center on new marker
5. Marker scales to 1.2x
6. Previous marker scales back to 1.0x

### Scenario 3: User Taps a Card
1. Card press triggers marker selection
2. Map centers on corresponding marker
3. Marker scales to 1.2x
4. ScrollView scrolls to card (if needed)

## Configuration

### Constants
```typescript
const LATITUDE_DELTA = 0.03;           // Map zoom level
const ITEM_SPACING = 10;               // Space between cards
const ITEM_PREVIEW = 10;               // Preview of next/prev card
const ITEM_WIDTH = screen.width - 2 * ITEM_SPACING - 2 * ITEM_PREVIEW;
const SNAP_WIDTH = ITEM_WIDTH + ITEM_SPACING;  // Snap interval
```

### ScrollView Props
```typescript
horizontal={true}
pagingEnabled={false}
decelerationRate="fast"
snapToInterval={ITEM_WIDTH + ITEM_SPACING}
snapToAlignment="center"
showsHorizontalScrollIndicator={false}
```

### Animation Props
```typescript
// Map centering animation
activeMapRef.current.animateToRegion({
  latitude: marker.coordinate.latitude,
  longitude: marker.coordinate.longitude,
  latitudeDelta: 0.03,
  longitudeDelta: 0.03 * ASPECT_RATIO,
}, 350);  // 350ms duration

// Marker scale animation
Animated.spring(scaleAnim, {
  toValue: isSelected ? 1.2 : 1,
  useNativeDriver: true,
  friction: 8,      // Controls bounce
  tension: 40,      // Controls speed
})
```

## Performance Optimizations

1. **Native Driver**: All animations use native driver for 60fps
2. **useCallback**: All handlers wrapped in useCallback to prevent re-renders
3. **useRef**: ScrollView and map refs prevent unnecessary re-creation
4. **Memoization**: Animated values memoized in useAnimatedRegion hook
5. **Bounds Checking**: Index validation prevents crashes and unnecessary updates

## Files Modified

### Core Files
- `/hooks/useAnimatedRegion.ts` - Enhanced with index callback and 0.03 delta
- `/components/RNMap/RNMap.tsx` - Added ScrollView and synchronization logic
- `/components/RNMap/RNMapMarker.tsx` - Added scale animation with Animated.View

### Key Changes
1. **useAnimatedRegion**: Added `onIndexChange` callback parameter
2. **RNMap**: Replaced PanResponder with ScrollView for better UX
3. **RNMapMarker**: Added spring animation for scale effect

## Usage Example

```typescript
import {RNMap} from '@components/RNMap';

const MapScreen = () => {
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>();
  
  const markers = businesses.map(business => ({
    id: business.id,
    coordinate: {
      latitude: business.latitude,
      longitude: business.longitude,
    },
    business,
    pinColor: colors.neutral.black,
  }));

  return (
    <RNMap
      initialRegion={region}
      markers={markers}
      showUserLocation={true}
      useAnimatedRegion={true}  // Enable all animated features
      onBusinessSelect={(business) => setSelectedBusinessId(business.id)}
      selectedBusinessId={selectedBusinessId}
    />
  );
};
```

## Benefits

### User Experience
- ✅ Smooth, fluid animations throughout
- ✅ Clear visual feedback on selection
- ✅ Easy navigation between businesses
- ✅ Intuitive card scrolling interface
- ✅ Automatic map centering reduces confusion

### Developer Experience
- ✅ Clean, maintainable code structure
- ✅ Reusable components and hooks
- ✅ Type-safe implementation
- ✅ Easy to extend and customize
- ✅ Well-documented behavior

### Performance
- ✅ 60fps animations with native driver
- ✅ Optimized re-renders with useCallback
- ✅ Efficient index tracking
- ✅ Smooth scrolling with snap behavior
- ✅ No jank or stuttering

## Future Enhancements

Potential improvements for future iterations:

1. **Custom Card Animations**: Add card scale/opacity on selection
2. **Gesture Handling**: Add pinch-to-zoom integration
3. **Clustering**: Group nearby markers when zoomed out
4. **Search Integration**: Filter markers based on search query
5. **Route Drawing**: Connect markers with polylines
6. **Custom Markers**: Support for different marker types/icons

## Troubleshooting

### Cards not scrolling smoothly
- Check `snapToInterval` matches `ITEM_WIDTH + ITEM_SPACING`
- Verify `decelerationRate` is set to "fast"
- Ensure `pagingEnabled` is false

### Map not centering on marker
- Verify `activeMapRef.current` is not null
- Check `animateToRegion` parameters are valid
- Ensure latitude/longitude values are correct

### Markers not scaling
- Confirm `useNativeDriver: true` is set
- Check `isSelected` prop is being passed correctly
- Verify Animated.Value is initialized properly

## Conclusion

This implementation provides a complete, production-ready animated map experience with:
- Scrollable marker cards
- Automatic centering with smooth animations
- 1.2x scale for selected markers
- Bidirectional synchronization
- Optimal performance and user experience

All features work seamlessly together to create an intuitive, engaging map interface for exploring businesses.
