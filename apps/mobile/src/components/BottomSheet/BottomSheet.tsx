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
  TextStyle,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import {Button} from '@components/Button';
import {colors} from '@theme/colors';
import {Caption, Subtitle} from '@components/Typography';
import {spacing} from '@theme/spacing';

const {height: SCREEN_HEIGHT} = Dimensions.get('window');
const SNAP_POINTS = {
  CLOSED: 0,
  MINIMAL: SCREEN_HEIGHT * 0.3,
  PARTIAL: SCREEN_HEIGHT * 0.5,
  FULL: SCREEN_HEIGHT * 0.9,
};
// Threshold below which the sheet will close when released
const CLOSE_THRESHOLD = SNAP_POINTS.PARTIAL * 0.3;

export interface BottomSheetProps {
  children: React.ReactNode;
  initialSnap?: 'closed' | 'minimal' | 'partial' | 'full';
  onClose?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  backDropOpacity?: number;
  showBackdrop?: boolean;
  closeOnBackdropPress?: boolean;
  enableGestureControl?: boolean;
  disableContentGestures?: boolean;
  maxContentHeight?: number; // Optional prop to override dynamic height
  header?: React.ReactNode; // Header content to display at the top of the sheet
  headerStyle?: StyleProp<ViewStyle>; // Custom style for the header container
  footer?: React.ReactNode; // Footer content to display at the bottom of the sheet
  footerStyle?: StyleProp<ViewStyle>; // Custom style for the footer container
  hideHandle?: boolean; // Option to hide the handle at the top
  showCloseButton?: boolean; // Option to show a close button
  closeButtonPosition?:
    | 'top-right'
    | 'top-left'
    | 'header-right'
    | 'header-left'
    | 'custom'; // Position for the close button
  closeButtonOffset?: {top?: number; right?: number; left?: number}; // Custom position offsets for close button

  // New properties
  title?: string; // Title text to display in the header
  titleStyle?: StyleProp<TextStyle>; // Custom style for the title
  subtitle?: string; // Subtitle text to display below the title
  subtitleStyle?: StyleProp<TextStyle>; // Custom style for the subtitle
  titlePosition?: 'left' | 'center' | 'right'; // Horizontal alignment of title and subtitle
}

export interface BottomSheetRef {
  open: (snapPoint?: 'minimal' | 'partial' | 'full') => void;
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
      header,
      headerStyle,
      footer,
      footerStyle,
      hideHandle = false,
      showCloseButton = true,
      closeButtonPosition = 'header-left',
      closeButtonOffset,
      title,
      titleStyle,
      subtitle,
      subtitleStyle,
      titlePosition = 'center',
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
      'minimal' | 'partial' | 'full' | 'closed'
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
      (snapPoint: 'minimal' | 'partial' | 'full' = 'partial') => {
        setIsVisible(true);
        setCurrentSnapPoint(snapPoint);
        let snapTo;

        switch (snapPoint) {
          case 'minimal':
            snapTo = SNAP_POINTS.MINIMAL;
            break;
          case 'full':
            snapTo = SNAP_POINTS.FULL;
            break;
          case 'partial':
          default:
            snapTo = SNAP_POINTS.PARTIAL;
            break;
        }

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
        switch (currentSnapPoint) {
          case 'full':
            return {
              maxHeight: Math.min(contentHeight + 20, SNAP_POINTS.FULL - 50),
            };
          case 'minimal':
            return {
              maxHeight: Math.min(contentHeight + 20, SNAP_POINTS.MINIMAL - 50),
            };
          case 'partial':
          default:
            return {
              maxHeight: Math.min(contentHeight + 20, SNAP_POINTS.PARTIAL - 50),
            };
        }
      }

      // Fallback to appropriate snap point if content height not measured yet
      return {
        maxHeight:
          currentSnapPoint === 'full'
            ? SNAP_POINTS.FULL - 50
            : currentSnapPoint === 'minimal'
            ? SNAP_POINTS.MINIMAL - 50
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
        // Close if dragged below 30% of MINIMAL height
        if (currentPosition < CLOSE_THRESHOLD) {
          runOnJS(handleClose)();
        }
        // Minimal
        else if (
          currentPosition <
          (SNAP_POINTS.MINIMAL + SNAP_POINTS.PARTIAL) / 2
        ) {
          translateY.value = withSpring(SCREEN_HEIGHT - SNAP_POINTS.MINIMAL);
          backdropOpacity.value = withTiming(backDropOpacity);
          runOnJS(setCurrentSnapPoint)('minimal');
        }
        // Partial
        else if (
          currentPosition <
          (SNAP_POINTS.PARTIAL + SNAP_POINTS.FULL) / 2
        ) {
          translateY.value = withSpring(SCREEN_HEIGHT - SNAP_POINTS.PARTIAL);
          backdropOpacity.value = withTiming(backDropOpacity);
          runOnJS(setCurrentSnapPoint)('partial');
        }
        // Full
        else {
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

    // Render close button based on position
    const renderCloseButton = () => {
      if (!showCloseButton) {
        return null;
      }

      // For custom position, let parent position it
      if (closeButtonPosition === 'custom') {
        return (
          <View
            style={[
              styles.closeButtonWrapper,
              {
                top: closeButtonOffset?.top ?? 10,
                right: closeButtonOffset?.right ?? undefined,
                left: closeButtonOffset?.left ?? undefined,
              },
            ]}>
            <Button
              onPress={handleClose}
              variant="text"
              size="small"
              iconName="close"
              iconSize={18}
              iconColor={colors.neutral.black}
            />
          </View>
        );
      }

      // For header positions, the close button will be rendered alongside the header
      if (
        closeButtonPosition === 'header-right' ||
        closeButtonPosition === 'header-left'
      ) {
        return null;
      }

      // For top positions
      return (
        <View
          style={[
            styles.closeButtonWrapper,
            closeButtonPosition === 'top-left'
              ? styles.closeButtonLeft
              : styles.closeButtonRight,
          ]}>
          <Button
            onPress={handleClose}
            variant="text"
            size="small"
            iconName="close"
            iconSize={18}
            iconColor={colors.neutral.black}
          />
        </View>
      );
    };

    // Render title and subtitle
    const renderTitleAndSubtitle = () => {
      if (!title && !subtitle) {
        return null;
      }

      return (
        <View
          style={[styles.titleContainer, {alignItems: getTitleAlignment()}]}>
          {title && <Subtitle style={titleStyle}>{title}</Subtitle>}
          {subtitle && (
            <Caption style={[styles.subtitle, subtitleStyle]}>
              {subtitle}
            </Caption>
          )}
        </View>
      );
    };

    // Get alignment based on titlePosition
    const getTitleAlignment = () => {
      switch (titlePosition) {
        case 'center':
          return 'center';
        case 'right':
          return 'flex-end';
        case 'left':
        default:
          return 'flex-start';
      }
    };

    // Render header with close button if position is header-right or header-left
    const renderHeaderWithCloseButton = () => {
      // If no header, title or subtitle provided, return null
      if (!header && !title && !subtitle) {
        return null;
      }

      // If there's a title/subtitle but no custom header
      if ((!header || header === null) && (title || subtitle)) {
        if (
          !showCloseButton ||
          (closeButtonPosition !== 'header-right' &&
            closeButtonPosition !== 'header-left')
        ) {
          return (
            <View style={[styles.headerContainer, headerStyle]}>
              {renderTitleAndSubtitle()}
            </View>
          );
        }

        return (
          <View
            style={[
              styles.headerContainer,
              styles.headerWithCloseButton,
              headerStyle,
            ]}>
            <View style={styles.headerButtonContainer}>
              {closeButtonPosition === 'header-left' && (
                <Button
                  onPress={handleClose}
                  variant="text"
                  size="small"
                  iconName="close"
                  iconSize={18}
                  iconColor={colors.neutral.black}
                />
              )}
            </View>
            <View
              style={[
                styles.headerContent,
                closeButtonPosition === 'header-left'
                  ? {marginLeft: 8}
                  : {marginRight: 8},
              ]}>
              {renderTitleAndSubtitle()}
            </View>
            <View style={styles.headerButtonContainer}>
              {closeButtonPosition === 'header-right' && (
                <Button
                  onPress={handleClose}
                  variant="text"
                  size="small"
                  iconName="close"
                  iconSize={18}
                  iconColor={colors.neutral.black}
                />
              )}
            </View>
          </View>
        );
      }

      // Handle custom header
      if (
        !showCloseButton ||
        (closeButtonPosition !== 'header-right' &&
          closeButtonPosition !== 'header-left')
      ) {
        return (
          <View style={[styles.headerContainer, headerStyle]}>{header}</View>
        );
      }

      return (
        <View
          style={[
            styles.headerContainer,
            styles.headerWithCloseButton,
            headerStyle,
          ]}>
          {closeButtonPosition === 'header-left' && (
            <View style={styles.headerButtonContainer}>
              <Button
                onPress={handleClose}
                variant="text"
                size="small"
                iconName="close"
                iconSize={18}
                iconColor={colors.neutral.black}
              />
            </View>
          )}
          <View
            style={[
              styles.headerContent,
              closeButtonPosition === 'header-left'
                ? {marginLeft: 8}
                : {marginRight: 8},
            ]}>
            {header}
          </View>
          {closeButtonPosition === 'header-right' && (
            <View style={styles.headerButtonContainer}>
              <Button
                onPress={handleClose}
                variant="text"
                size="small"
                iconName="close"
                iconSize={18}
                iconColor={colors.neutral.black}
              />
            </View>
          )}
        </View>
      );
    };

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
          {!hideHandle && (
            <GestureDetector gesture={handleGesture}>
              <View style={styles.handleContainer}>
                <View style={styles.handle} />
              </View>
            </GestureDetector>
          )}

          {/* Close Button */}
          {renderCloseButton()}

          {/* Header Section */}
          {renderHeaderWithCloseButton()}

          {/* Content Section */}
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

          {/* Footer Section */}
          {footer && (
            <View
              style={[
                styles.footerContainer,
                footerStyle,
                {paddingBottom: SCREEN_HEIGHT * 0.3},
              ]}>
              {footer}
            </View>
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
    backgroundColor: colors.neutral.white,
    position: 'absolute',
    top: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    zIndex: 100,
    shadowColor: colors.neutral.black,
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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  handleContainer: {
    paddingVertical: 10,
    width: '100%',
  },
  handle: {
    width: 40,
    height: 5,
    backgroundColor: colors.neutral.lightGrey,
    alignSelf: 'center',
    borderRadius: 3,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.neutral.black,
    zIndex: 99,
  },
  backdropTouchable: {
    width: '100%',
    height: '100%',
  },
  headerContainer: {
    width: '100%',
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.secondary.main,
  },
  headerWithCloseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerContent: {
    flex: 1,
  },
  footerContainer: {
    flex: 1,
    borderTopWidth: 1,
    borderTopColor: colors.secondary.main,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  closeButtonWrapper: {
    position: 'absolute',
    zIndex: 110,
  },
  closeButtonRight: {
    top: 10,
    right: 10,
  },
  closeButtonLeft: {
    top: 10,
    left: 10,
  },
  headerButtonContainer: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    width: '100%',
  },
  subtitle: {
    color: colors.neutral.grey,
  },
});

export default BottomSheet;
