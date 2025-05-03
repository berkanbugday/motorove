import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  TouchableWithoutFeedback,
  ViewStyle,
} from 'react-native';

import {FABGroupProps} from './types';
import {createFABGroupStyles, getPositionStyles, FAB_SIZES} from './FAB.styles';
import FAB from './FAB';

/**
 * FAB Group component that implements a speed dial pattern with multiple actions.
 */
const FABGroup: React.FC<FABGroupProps> = ({
  mainFAB,
  actions,
  open = false,
  onStateChange,
  position = 'bottomRight',
  customPosition,
  showLabels = true,
  showBackdrop = true,
  backdropStyle,
  backdropColor = 'rgba(0, 0, 0, 0.4)',
  style,
  testID,
}) => {
  // Local state for controlling open/closed state
  const [isOpen, setIsOpen] = useState(open);

  // Update local state when prop changes
  useEffect(() => {
    setIsOpen(open);
  }, [open]);

  // Animation value
  const [animation] = useState(new Animated.Value(isOpen ? 1 : 0));

  // Animate when open state changes
  useEffect(() => {
    Animated.timing(animation, {
      toValue: isOpen ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isOpen, animation]);

  // Toggle open/closed state
  const toggle = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    if (onStateChange) {
      onStateChange(newState);
    }
  };

  // Close the speed dial
  const close = () => {
    setIsOpen(false);
    if (onStateChange) {
      onStateChange(false);
    }
  };

  // Get position styles
  const positionStyle = getPositionStyles(
    position,
    customPosition,
  ) as ViewStyle;

  // Rotate the main FAB icon when opening/closing
  const rotateAnimation = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  // Calculate the direction in which to show actions
  const isTop = position === 'topLeft' || position === 'topRight';
  const actionDirection = isTop ? 1 : -1;

  return (
    <View
      style={[createFABGroupStyles.container, positionStyle, style]}
      testID={testID}>
      {/* Backdrop */}
      {showBackdrop && isOpen && (
        <Animated.View
          style={[
            createFABGroupStyles.backdrop,
            {
              backgroundColor: backdropColor,
              opacity: animation,
            },
            backdropStyle,
          ]}>
          <TouchableWithoutFeedback onPress={close}>
            <View style={{flex: 1}} />
          </TouchableWithoutFeedback>
        </Animated.View>
      )}

      {/* Action buttons */}
      {isOpen && (
        <Animated.View
          style={[
            createFABGroupStyles.actionsContainer,
            {
              transform: [
                {
                  translateY: animation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20 * actionDirection, 0],
                  }),
                },
              ],
              opacity: animation,
            },
          ]}>
          {actions.map((action, index) => {
            const actionAnimation = animation.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [0, 0, 1],
              extrapolate: 'clamp',
            });

            // Calculate spacing based on FAB size
            const actionSpacing = {
              marginBottom: FAB_SIZES.small.size / 2,
            };

            return (
              <Animated.View
                key={index}
                style={[
                  createFABGroupStyles.actionItem,
                  {
                    opacity: actionAnimation,
                    transform: [
                      {
                        translateY: animation.interpolate({
                          inputRange: [0, 1],
                          outputRange: [
                            20 * actionDirection,
                            0 * actionDirection,
                          ],
                          extrapolate: 'clamp',
                        }),
                      },
                    ],
                  },
                ]}>
                {/* Action label */}
                {showLabels && action.label && (
                  <Animated.View
                    style={[
                      createFABGroupStyles.actionLabel,
                      {
                        opacity: actionAnimation,
                        transform: [
                          {
                            translateX: animation.interpolate({
                              inputRange: [0, 1],
                              outputRange: [
                                position.includes('Right') ? 20 : -20,
                                0,
                              ],
                              extrapolate: 'clamp',
                            }),
                          },
                        ],
                      },
                      action.labelStyle,
                    ]}>
                    <Text
                      style={createFABGroupStyles.actionLabelText}
                      numberOfLines={1}>
                      {action.label}
                    </Text>
                  </Animated.View>
                )}

                {/* Action button */}
                <TouchableOpacity
                  onPress={() => {
                    close();
                    action.onPress();
                  }}
                  style={[actionSpacing, action.style]}
                  testID={action.testID}
                  accessibilityLabel={action.accessibilityLabel}>
                  <FAB
                    icon={action.icon}
                    size="small"
                    shape="circle"
                    variant="custom"
                    backgroundColor={action.backgroundColor}
                    color={action.color}
                    onPress={() => {
                      close();
                      action.onPress();
                    }}
                    position="custom"
                    customPosition={{}}
                    style={action.style}
                  />
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </Animated.View>
      )}

      {/* Main FAB */}
      <Animated.View
        style={{
          transform: [
            {
              rotate: mainFAB.icon ? rotateAnimation : '0deg',
            },
          ],
        }}>
        <FAB
          {...mainFAB}
          onPress={toggle}
          icon={mainFAB.icon}
          position="custom"
          customPosition={{}}
        />
      </Animated.View>
    </View>
  );
};

export default FABGroup;
