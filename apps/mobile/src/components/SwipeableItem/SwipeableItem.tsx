import React, {useState, useCallback} from 'react';
import {
  StyleSheet,
  View,
  ViewStyle,
  StyleProp,
  Text,
  TouchableOpacity,
  I18nManager,
} from 'react-native';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import {colors, spacing} from '@theme';

export interface SwipeAction {
  text: string;
  icon?: React.ReactNode;
  backgroundColor?: string;
  textColor?: string;
  onPress: () => void;
  testID?: string;
}

export interface SwipeableItemProps {
  /**
   * Child component to be rendered in the swipeable container
   */
  children: React.ReactNode;
  /**
   * Array of actions to be displayed when swiping from left to right
   */
  leftActions?: SwipeAction[];
  /**
   * Array of actions to be displayed when swiping from right to left
   */
  rightActions?: SwipeAction[];
  /**
   * Minimum threshold (in pixels) to trigger automatic opening of actions
   * @default 0.5 * action width
   */
  threshold?: number;
  /**
   * Maximum distance a swipe can travel
   * @default number of actions * 80
   */
  maxSwipeDistance?: number;
  /**
   * Animation duration in ms
   * @default 250
   */
  animationDuration?: number;
  /**
   * If true, actions will close when tapped outside
   * @default true
   */
  closeOnTap?: boolean;
  /**
   * Callback when swipe begins
   */
  onSwipeStart?: () => void;
  /**
   * Callback when swipe ends
   */
  onSwipeEnd?: () => void;
  /**
   * Callback when actions open
   */
  onOpen?: (direction: 'left' | 'right') => void;
  /**
   * Callback when actions close
   */
  onClose?: () => void;
  /**
   * Custom styles for the container
   */
  containerStyle?: StyleProp<ViewStyle>;
  /**
   * Custom styles for the content container
   */
  contentContainerStyle?: StyleProp<ViewStyle>;
  /**
   * Custom styles for the actions container
   */
  actionsContainerStyle?: StyleProp<ViewStyle>;
  /**
   * Test ID for component testing
   */
  testID?: string;
  /**
   * If true, actions will auto-close after being pressed
   * @default true
   */
  autoClose?: boolean;
  /**
   * If true, component will be disabled
   * @default false
   */
  disabled?: boolean;
}

const DEFAULT_ACTION_WIDTH = 80;
const SPRING_CONFIG = {
  damping: 20,
  stiffness: 100,
  mass: 0.5,
  overshootClamping: true,
};

export function SwipeableItem({
  children,
  leftActions = [],
  rightActions = [],
  threshold,
  maxSwipeDistance,
  closeOnTap = true,
  onSwipeStart,
  onSwipeEnd,
  onOpen,
  onClose,
  containerStyle,
  contentContainerStyle,
  actionsContainerStyle,
  testID,
  autoClose = true,
  disabled = false,
}: SwipeableItemProps) {
  const isRTL = I18nManager.isRTL;
  const translateX = useSharedValue(0);

  // Calculate max swipe distances
  const leftActionsCount = leftActions.length;
  const rightActionsCount = rightActions.length;
  const leftWidth = maxSwipeDistance
    ? Math.min(maxSwipeDistance, leftActionsCount * DEFAULT_ACTION_WIDTH)
    : leftActionsCount * DEFAULT_ACTION_WIDTH;
  const rightWidth = maxSwipeDistance
    ? Math.min(maxSwipeDistance, rightActionsCount * DEFAULT_ACTION_WIDTH)
    : rightActionsCount * DEFAULT_ACTION_WIDTH;

  // Adjust actions for RTL
  const actualLeftActions = isRTL ? rightActions : leftActions;
  const actualRightActions = isRTL ? leftActions : rightActions;
  const actualLeftWidth = isRTL ? rightWidth : leftWidth;
  const actualRightWidth = isRTL ? leftWidth : rightWidth;

  // Current state tracking
  const [openDirection, setOpenDirection] = useState<'left' | 'right' | null>(
    null,
  );

  // Reset the swipeable item to closed state
  const resetPosition = useCallback(() => {
    translateX.value = withSpring(0, SPRING_CONFIG);
    if (openDirection && onClose) {
      onClose();
    }
    setOpenDirection(null);
  }, [onClose, openDirection, translateX]);

  // Handle opening to left or right
  const openLeft = useCallback(() => {
    if (actualLeftActions.length === 0) {
      return;
    }
    translateX.value = withSpring(actualLeftWidth, SPRING_CONFIG);
    setOpenDirection('left');
    if (onOpen) {
      onOpen('left');
    }
  }, [actualLeftWidth, onOpen, translateX, actualLeftActions]);

  const openRight = useCallback(() => {
    if (actualRightActions.length === 0) {
      return;
    }
    translateX.value = withSpring(-actualRightWidth, SPRING_CONFIG);
    setOpenDirection('right');
    if (onOpen) {
      onOpen('right');
    }
  }, [actualRightWidth, onOpen, translateX, actualRightActions]);

  // Handle action press
  const handleActionPress = useCallback(
    (action: SwipeAction) => {
      action.onPress();
      if (autoClose) {
        resetPosition();
      }
    },
    [autoClose, resetPosition],
  );

  // Create pan gesture handler
  const panGesture = Gesture.Pan()
    .enabled(!disabled)
    .failOffsetY([-5, 5])
    .activeOffsetX([-5, 5])
    .onStart(() => {
      if (onSwipeStart) {
        runOnJS(onSwipeStart)();
      }
    })
    .onUpdate(event => {
      let newTranslateX = event.translationX;

      // Restrict movement based on available actions
      if (
        (newTranslateX > 0 && actualLeftActions.length === 0) ||
        (newTranslateX < 0 && actualRightActions.length === 0)
      ) {
        newTranslateX = 0;
      }

      // Apply boundaries
      newTranslateX = Math.min(
        Math.max(newTranslateX, -actualRightWidth),
        actualLeftWidth,
      );

      translateX.value = newTranslateX;
    })
    .onEnd(event => {
      // Calculate threshold based on available actions
      const calculatedLeftThreshold = threshold || actualLeftWidth * 0.5;
      const calculatedRightThreshold = threshold || actualRightWidth * 0.5;

      // Determine if swipe should open or close based on velocity and position
      const velocityThreshold = 500;
      const posX = translateX.value;
      const velocityX = event.velocityX;

      if (posX > 0) {
        // Swiping right (left actions)
        if (posX > calculatedLeftThreshold || velocityX > velocityThreshold) {
          runOnJS(openLeft)();
        } else {
          translateX.value = withSpring(0, SPRING_CONFIG);
          runOnJS(setOpenDirection)(null);
        }
      } else if (posX < 0) {
        // Swiping left (right actions)
        if (
          posX < -calculatedRightThreshold ||
          velocityX < -velocityThreshold
        ) {
          runOnJS(openRight)();
        } else {
          translateX.value = withSpring(0, SPRING_CONFIG);
          runOnJS(setOpenDirection)(null);
        }
      }

      if (onSwipeEnd) {
        runOnJS(onSwipeEnd)();
      }
    });

  // Create tap gesture handler
  const tapGesture = Gesture.Tap()
    .enabled(!disabled && closeOnTap)
    .onEnd(() => {
      if (openDirection) {
        runOnJS(resetPosition)();
      }
    });

  // Combine gestures
  const gestures = Gesture.Exclusive(panGesture, tapGesture);

  // Animated styles
  const animatedContentStyle = useAnimatedStyle(() => {
    return {
      transform: [{translateX: translateX.value}],
    };
  });

  // Render individual action button
  const renderActionButton = useCallback(
    (action: SwipeAction, index: number) => {
      const actionWidth = DEFAULT_ACTION_WIDTH;
      const actionStyle = {
        width: actionWidth,
        backgroundColor: action.backgroundColor || colors.primary.main,
      };

      return (
        <TouchableOpacity
          key={index}
          style={[styles.actionButton, actionStyle]}
          onPress={() => handleActionPress(action)}
          testID={action.testID}>
          {action.icon && <View style={styles.actionIcon}>{action.icon}</View>}
          {action.text && (
            <Text
              style={[
                styles.actionText,
                {color: action.textColor || colors.neutral.white},
              ]}
              numberOfLines={1}>
              {action.text}
            </Text>
          )}
        </TouchableOpacity>
      );
    },
    [handleActionPress],
  );

  // Handle action container layout to get actual widths
  const onLeftActionsLayout = useCallback(() => {
    // Layout handling - can be extended in the future if needed
  }, []);

  const onRightActionsLayout = useCallback(() => {
    // Layout handling - can be extended in the future if needed
  }, []);

  return (
    <GestureHandlerRootView
      style={[styles.container, containerStyle]}
      testID={testID}>
      {/* Left actions */}
      {actualLeftActions.length > 0 && (
        <View
          style={[
            styles.actionsContainer,
            styles.leftActionsContainer,
            actionsContainerStyle,
          ]}
          onLayout={onLeftActionsLayout}>
          {actualLeftActions.map((action, index) =>
            renderActionButton(action, index),
          )}
        </View>
      )}

      {/* Right actions */}
      {actualRightActions.length > 0 && (
        <View
          style={[
            styles.actionsContainer,
            styles.rightActionsContainer,
            actionsContainerStyle,
          ]}
          onLayout={onRightActionsLayout}>
          {actualRightActions.map((action, index) =>
            renderActionButton(action, index),
          )}
        </View>
      )}

      {/* Content container */}
      <GestureDetector gesture={gestures}>
        <Animated.View
          style={[
            styles.contentContainer,
            contentContainerStyle,
            animatedContentStyle,
          ]}>
          {children}
        </Animated.View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: colors.neutral.lightGrey,
  },
  contentContainer: {
    backgroundColor: colors.neutral.white,
    zIndex: 2,
  },
  actionsContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1,
  },
  leftActionsContainer: {
    left: 0,
  },
  rightActionsContainer: {
    right: 0,
  },
  actionButton: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
  },
  actionIcon: {
    marginBottom: spacing.xs,
  },
  actionText: {
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
});
