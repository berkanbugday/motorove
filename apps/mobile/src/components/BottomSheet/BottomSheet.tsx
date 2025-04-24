import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  StyleProp,
  ViewStyle,
  TouchableOpacity,
  Keyboard,
  LayoutChangeEvent,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';

const {height: SCREEN_HEIGHT} = Dimensions.get('window');
const SNAP_POINTS = {
  CLOSED: 0,
  PARTIAL: SCREEN_HEIGHT * 0.5,
  FULL: SCREEN_HEIGHT * 0.8,
};
// Threshold below which the sheet will close when released
const CLOSE_THRESHOLD = SNAP_POINTS.PARTIAL * 0.3;

export interface BottomSheetProps {
  children: React.ReactNode;
  initialSnap?: 'closed' | 'partial' | 'full';
  onClose?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  backDropOpacity?: number;
  showBackdrop?: boolean;
  closeOnBackdropPress?: boolean;
  enableGestureControl?: boolean;
  disableContentGestures?: boolean;
  maxContentHeight?: number; // Optional prop to override dynamic height
}

export interface BottomSheetRef {
  open: (snapPoint?: 'partial' | 'full') => void;
  close: () => void;
}

const BottomSheet = React.forwardRef<BottomSheetRef, BottomSheetProps>(
  (
    {
      children,
      initialSnap = 'closed',
      onClose,
      containerStyle,
      contentStyle,
      backDropOpacity = 0.7,
      showBackdrop = true,
      closeOnBackdropPress = false,
      enableGestureControl = true,
      disableContentGestures = true,
      maxContentHeight,
    },
    ref,
  ) => {
    const translateY = useSharedValue(SCREEN_HEIGHT);
    const active = useSharedValue(false);
    const backdropOpacity = useSharedValue(0);
    const contextY = useSharedValue(0);
    const isScrolling = useSharedValue(false);
    // State to track if sheet is visible for proper rendering
    const [isVisible, setIsVisible] = React.useState(initialSnap !== 'closed');
    // State to track content height
    const [contentHeight, setContentHeight] = useState(0);
    // State to track current sheet position (for adapting content height to available space)
    const [currentSnapPoint, setCurrentSnapPoint] = useState<
      'partial' | 'full' | 'closed'
    >(initialSnap !== 'closed' ? initialSnap : 'closed');

    // Initialize with the appropriate snap point
    useEffect(() => {
      if (initialSnap === 'partial') {
        translateY.value = SCREEN_HEIGHT - SNAP_POINTS.PARTIAL;
        backdropOpacity.value = withTiming(backDropOpacity);
        active.value = true;
        setIsVisible(true);
        setCurrentSnapPoint('partial');
      } else if (initialSnap === 'full') {
        translateY.value = SCREEN_HEIGHT - SNAP_POINTS.FULL;
        backdropOpacity.value = withTiming(backDropOpacity);
        active.value = true;
        setIsVisible(true);
        setCurrentSnapPoint('full');
      }
    }, [initialSnap, translateY, backDropOpacity, backdropOpacity, active]);

    const handleClose = useCallback(() => {
      Keyboard.dismiss();
      translateY.value = withTiming(SCREEN_HEIGHT, {duration: 300});
      backdropOpacity.value = withTiming(0, {duration: 300});
      active.value = false;
      setCurrentSnapPoint('closed');

      // Set isVisible to false after animation completes
      setTimeout(() => {
        setIsVisible(false);
        if (onClose) {
          onClose();
        }
      }, 300);
    }, [translateY, backdropOpacity, active, onClose]);

    const handleOpen = useCallback(
      (snapPoint: 'partial' | 'full' = 'partial') => {
        setIsVisible(true);
        setCurrentSnapPoint(snapPoint);
        const snapTo =
          snapPoint === 'full' ? SNAP_POINTS.FULL : SNAP_POINTS.PARTIAL;
        translateY.value = withSpring(SCREEN_HEIGHT - snapTo);
        backdropOpacity.value = withTiming(backDropOpacity);
        active.value = true;
      },
      [translateY, backdropOpacity, backDropOpacity, active],
    );

    useImperativeHandle(
      ref,
      () => ({
        open: handleOpen,
        close: handleClose,
      }),
      [handleOpen, handleClose],
    );

    // Measure content height when layout changes
    const onContentLayout = useCallback((event: LayoutChangeEvent) => {
      const {height} = event.nativeEvent.layout;
      if (height > 0) {
        setContentHeight(height);
      }
    }, []);

    // Calculate max height based on content and current snap point
    const getContentMaxHeight = useCallback(() => {
      // If custom max height is provided, use it
      if (maxContentHeight !== undefined) {
        return {maxHeight: maxContentHeight};
      }

      // Calculate height based on content and current snap point
      if (contentHeight > 0) {
        if (currentSnapPoint === 'full') {
          // When fully open, allow more content to be visible
          const maxHeight = Math.min(contentHeight + 20, SNAP_POINTS.FULL - 50);
          return {maxHeight};
        } else if (currentSnapPoint === 'partial') {
          // When partially open, limit content height to fit in the partial view
          const maxHeight = Math.min(
            contentHeight + 20,
            SNAP_POINTS.PARTIAL - 50,
          );
          return {maxHeight};
        }
      }

      // Fallback to appropriate snap point if content height not measured yet
      return {
        maxHeight:
          currentSnapPoint === 'full'
            ? SNAP_POINTS.FULL - 50
            : SNAP_POINTS.PARTIAL - 50,
      };
    }, [contentHeight, currentSnapPoint, maxContentHeight]);

    // This gesture detects when a scroll view inside the bottom sheet is being scrolled
    const scrollGesture = Gesture.Native()
      .shouldActivateOnStart(true) // Helps with gesture detection on both platforms
      .onBegin(() => {
        isScrolling.value = true;
      })
      .onEnd(() => {
        isScrolling.value = false;
      });

    const panGesture = Gesture.Pan()
      .activeOffsetY([-20, 20]) // Use consistent active area for both platforms
      .failOffsetX([-20, 20]) // Prevent horizontal gestures from interfering
      .minPointers(1) // Ensure it works with a single finger
      .maxPointers(1) // Restrict to single finger for consistent behavior
      .onStart(() => {
        contextY.value = translateY.value;
        active.value = true;
      })
      .onUpdate(event => {
        if (!enableGestureControl) {
          return;
        }

        // If the sheet is fully expanded and content is being scrolled,
        // don't move the sheet until the scroll view reaches the top
        if (
          isScrolling.value &&
          translateY.value <= SCREEN_HEIGHT - SNAP_POINTS.FULL
        ) {
          return;
        }

        // Get the current position relative to screen
        const currentPosition = SCREEN_HEIGHT - contextY.value;
        // Calculate new position based on gesture
        let newPosition = currentPosition - event.translationY;

        // Allow dragging below partial position to trigger closing
        if (newPosition < 0) {
          newPosition = 0;
        } else if (newPosition > SNAP_POINTS.FULL) {
          newPosition = SNAP_POINTS.FULL;
        }

        // Update translateY
        translateY.value = SCREEN_HEIGHT - newPosition;

        // Adjust opacity based on position relative to close threshold
        if (newPosition < SNAP_POINTS.PARTIAL) {
          const progress = Math.max(0, newPosition / SNAP_POINTS.PARTIAL);
          backdropOpacity.value = backDropOpacity * progress;
        }
      })
      .onEnd(event => {
        if (!enableGestureControl) {
          return;
        }

        const currentPosition = SCREEN_HEIGHT - translateY.value;

        // Closing gesture (only if not scrolling)
        if (!isScrolling.value && event.velocityY > 500) {
          runOnJS(handleClose)();
          return;
        }

        // Opening gesture (fast upward swipe)
        if (event.velocityY < -500) {
          translateY.value = withSpring(SCREEN_HEIGHT - SNAP_POINTS.FULL);
          backdropOpacity.value = withTiming(backDropOpacity);
          runOnJS(setCurrentSnapPoint)('full');
          return;
        }

        // Snap to closest point or close
        // Close if dragged below 30% of PARTIAL height
        if (currentPosition < CLOSE_THRESHOLD) {
          runOnJS(handleClose)();
        } else if (
          currentPosition <
          (SNAP_POINTS.PARTIAL + SNAP_POINTS.FULL) / 2
        ) {
          translateY.value = withSpring(SCREEN_HEIGHT - SNAP_POINTS.PARTIAL);
          backdropOpacity.value = withTiming(backDropOpacity);
          runOnJS(setCurrentSnapPoint)('partial');
        } else {
          translateY.value = withSpring(SCREEN_HEIGHT - SNAP_POINTS.FULL);
          backdropOpacity.value = withTiming(backDropOpacity);
          runOnJS(setCurrentSnapPoint)('full');
        }
      });

    // Combine gestures with the correct behavior for handle area
    const handleGesture = Gesture.Simultaneous(scrollGesture, panGesture);

    const animatedBottomSheetStyle = useAnimatedStyle(() => {
      return {
        transform: [{translateY: translateY.value}],
      };
    });

    const animatedBackdropStyle = useAnimatedStyle(() => {
      return {
        opacity: backdropOpacity.value,
      };
    });

    // Don't render anything if not visible
    if (!isVisible) {
      return null;
    }

    return (
      <>
        {showBackdrop && (
          <Animated.View style={[styles.backdrop, animatedBackdropStyle]}>
            <TouchableOpacity
              style={styles.backdropTouchable}
              onPress={closeOnBackdropPress ? handleClose : undefined}
              activeOpacity={1}
            />
          </Animated.View>
        )}

        <Animated.View
          style={[
            styles.bottomSheetContainer,
            animatedBottomSheetStyle,
            containerStyle,
          ]}>
          <GestureDetector gesture={handleGesture}>
            <View style={styles.handleContainer}>
              <View style={styles.handle} />
            </View>
          </GestureDetector>

          {disableContentGestures ? (
            <View
              onLayout={onContentLayout}
              style={[
                styles.contentContainer,
                contentStyle,
                getContentMaxHeight(),
              ]}>
              {children}
            </View>
          ) : (
            <GestureDetector
              gesture={Gesture.Simultaneous(scrollGesture, panGesture)}>
              <View
                onLayout={onContentLayout}
                style={[styles.contentContainer, contentStyle]}>
                {children}
              </View>
            </GestureDetector>
          )}
        </Animated.View>
      </>
    );
  },
);

const styles = StyleSheet.create({
  bottomSheetContainer: {
    height: SCREEN_HEIGHT,
    width: '100%',
    backgroundColor: 'white',
    position: 'absolute',
    top: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    zIndex: 100,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  contentContainer: {
    flex: 1,
    padding: 10,
  },
  handleContainer: {
    paddingVertical: 10,
    width: '100%',
  },
  handle: {
    width: 40,
    height: 5,
    backgroundColor: '#00000040',
    alignSelf: 'center',
    borderRadius: 3,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'black',
    zIndex: 99,
  },
  backdropTouchable: {
    width: '100%',
    height: '100%',
  },
});

export default BottomSheet;
