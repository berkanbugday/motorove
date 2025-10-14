import React, {useState, useEffect} from 'react';
import {
  View,
  TouchableOpacity,
  Animated,
  TouchableWithoutFeedback,
  ViewStyle,
} from 'react-native';

import {FABGroupProps, FABActionDisplayMode} from './types';
import {createFABGroupStyles, getPositionStyles} from './FAB.styles';
import FAB from './FAB';
import {Typography} from '@components/Typography';

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
      duration: 250,
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

  // Rotate the main FAB icon 45 degrees when opening/closing (+ becomes X)
  const rotateAnimation = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  // Calculate the direction in which to show actions
  const isTop = position === 'topLeft' || position === 'topRight';

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

      {/* Main FAB - Render first so it's behind actions */}
      <View style={{zIndex: 1}}>
        <FAB
          {...mainFAB}
          onPress={toggle}
          icon={mainFAB.icon}
          position={position}
          customPosition={customPosition}
          shadow="large"
          iconRotation={rotateAnimation}
        />
      </View>

      {/* Action buttons - Render last so they appear on top */}
      {isOpen && actions.length > 0 && (
        <Animated.View
          style={[
            createFABGroupStyles.actionsContainer,
            {
              opacity: 1, // Temporarily remove animation
              position: 'absolute',
              bottom: 70, // Position above the main FAB
              right: 0,
            },
          ]}>
          {actions.map((action, index) => {
            // Get display mode for this action
            const displayMode: FABActionDisplayMode =
              action.displayMode || 'both';
            const shouldShowIcon =
              displayMode === 'icon' || displayMode === 'both';
            const shouldShowLabel =
              displayMode === 'label' || displayMode === 'both';

            // Calculate spacing based on FAB size and position
            const actionSpacing = {
              marginBottom: isTop ? 0 : 16,
              marginTop: isTop ? 16 : 0,
            };

            return (
              <Animated.View
                key={index}
                style={[
                  createFABGroupStyles.actionItem,
                  actionSpacing,
                  {
                    opacity: 1, // Temporarily remove animation
                    transform: [
                      {
                        scale: 1, // Temporarily remove animation
                      },
                    ],
                  },
                ]}>
                {/* Render based on display mode */}
                {displayMode === 'label' ? (
                  // Label-only mode
                  <TouchableOpacity
                    onPress={() => {
                      close();
                      action.onPress();
                    }}
                    style={[
                      createFABGroupStyles.labelOnlyButton,
                      {
                        backgroundColor: action.backgroundColor,
                      },
                      action.style,
                    ]}
                    testID={action.testID}
                    accessibilityLabel={action.accessibilityLabel}>
                    <Typography
                      style={[
                        createFABGroupStyles.labelOnlyText,
                        {
                          color: action.color,
                        },
                        action.labelStyle,
                      ]}
                      numberOfLines={1}>
                      {action.label}
                    </Typography>
                  </TouchableOpacity>
                ) : (
                  // Icon-only or both modes
                  <View style={createFABGroupStyles.actionRow}>
                    {/* Action label (for 'both' mode) */}
                    {shouldShowLabel && action.label && (
                      <View
                        style={[
                          createFABGroupStyles.actionLabel,
                          action.labelStyle,
                        ]}>
                        <Typography
                          style={createFABGroupStyles.actionLabelText}
                          numberOfLines={1}>
                          {action.label}
                        </Typography>
                      </View>
                    )}

                    {/* Action button (for 'icon' or 'both' modes) */}
                    {shouldShowIcon && (
                      <TouchableOpacity
                        onPress={() => {
                          close();
                          action.onPress();
                        }}
                        testID={action.testID}
                        accessibilityLabel={action.accessibilityLabel}>
                        <FAB
                          icon={action.icon}
                          size="small"
                          shape="circle"
                          variant="custom"
                          backgroundColor={action.backgroundColor || '#FFFFFF'}
                          color={action.color || '#666666'}
                          onPress={() => {
                            close();
                            action.onPress();
                          }}
                          position={position}
                          customPosition={customPosition}
                          style={action.style}
                          shadow="medium"
                        />
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </Animated.View>
            );
          })}
        </Animated.View>
      )}
    </View>
  );
};

export default FABGroup;
