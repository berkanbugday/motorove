import React, {ReactNode, useEffect, useCallback} from 'react';
import {
  StyleSheet,
  View,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
  ViewStyle,
  StyleProp,
  BackHandler,
  Platform,
  Text,
} from 'react-native';
import {colors, rs} from '../../theme';

export interface FullscreenOverlayProps {
  /**
   * Whether the overlay is visible
   */
  visible: boolean;
  /**
   * Content to display inside the overlay
   */
  children: ReactNode;
  /**
   * Function to call when the overlay is dismissed
   */
  onDismiss: () => void;
  /**
   * Animation duration in milliseconds
   */
  animationDuration?: number;
  /**
   * Whether to close the overlay when pressing the hardware back button (Android only)
   */
  closeOnBackButton?: boolean;
  /**
   * Custom style for the content container
   */
  contentContainerStyle?: StyleProp<ViewStyle>;
  /**
   * Custom style for the backdrop
   */
  backdropStyle?: StyleProp<ViewStyle>;
  /**
   * Animation type for showing/hiding the overlay
   */
  animationType?: 'fade' | 'slide' | 'none';
  /**
   * Position of the overlay content
   */
  position?: 'center' | 'top' | 'bottom';
  /**
   * Whether to block touches on the content area from propagating to the backdrop
   */
  blockContentTouches?: boolean;
  /**
   * TestID for testing
   */
  testID?: string;
  /**
   * Whether to show the close button
   */
  showCloseButton?: boolean;
  /**
   * Position of the close button
   */
  closeButtonPosition?:
    | 'top-right'
    | 'top-left'
    | 'bottom-right'
    | 'bottom-left';
  /**
   * Custom content for close button
   */
  closeButtonContent?: ReactNode;
}

export function FullscreenOverlay({
  visible,
  children,
  onDismiss,
  animationDuration = 500,
  closeOnBackButton = true,
  contentContainerStyle,
  backdropStyle,
  animationType = 'fade',
  position = 'center',
  blockContentTouches = true,
  testID,
  showCloseButton = false,
  closeButtonPosition = 'top-right',
  closeButtonContent,
}: FullscreenOverlayProps) {
  const contentAnimation = React.useRef(new Animated.Value(0)).current;
  const slideAnimation = React.useRef(
    new Animated.Value(Dimensions.get('window').height),
  ).current;

  const showOverlay = useCallback(() => {
    // Run animations concurrently
    Animated.parallel([
      Animated.timing(contentAnimation, {
        toValue: 1,
        duration: animationDuration,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnimation, {
        toValue: 0,
        duration: animationDuration,
        useNativeDriver: true,
      }),
    ]).start();
  }, [contentAnimation, slideAnimation, animationDuration]);

  const hideOverlay = useCallback(() => {
    Animated.parallel([
      Animated.timing(contentAnimation, {
        toValue: 0,
        duration: animationDuration,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnimation, {
        toValue: Dimensions.get('window').height,
        duration: animationDuration,
        useNativeDriver: true,
      }),
    ]).start();
  }, [contentAnimation, slideAnimation, animationDuration]);

  const handleBackPress = useCallback(() => {
    if (visible && closeOnBackButton) {
      onDismiss();
      return true;
    }
    return false;
  }, [visible, closeOnBackButton, onDismiss]);

  useEffect(() => {
    if (visible) {
      showOverlay();
    } else {
      hideOverlay();
    }
  }, [visible, showOverlay, hideOverlay]);

  useEffect(() => {
    if (Platform.OS === 'android' && closeOnBackButton && visible) {
      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        handleBackPress,
      );
      return () => backHandler.remove();
    }
  }, [closeOnBackButton, visible, handleBackPress]);

  // Calculate position styles
  const getPositionStyle = (): ViewStyle => {
    switch (position) {
      case 'top':
        return styles.topPosition;
      case 'bottom':
        return styles.bottomPosition;
      case 'center':
      default:
        return styles.centerPosition;
    }
  };

  // Calculate animation styles
  const getAnimationStyle = () => {
    switch (animationType) {
      case 'fade':
        return {opacity: contentAnimation};
      case 'slide':
        return {
          opacity: contentAnimation,
          transform: [
            {
              translateY:
                position === 'top'
                  ? slideAnimation.interpolate({
                      inputRange: [0, Dimensions.get('window').height],
                      outputRange: [0, -Dimensions.get('window').height],
                    })
                  : position === 'bottom'
                  ? slideAnimation
                  : slideAnimation.interpolate({
                      inputRange: [0, Dimensions.get('window').height],
                      outputRange: [0, Dimensions.get('window').height / 2],
                    }),
            },
          ],
        };
      case 'none':
      default:
        return {};
    }
  };

  // Get close button position style
  const getCloseButtonPositionStyle = (): ViewStyle => {
    switch (closeButtonPosition) {
      case 'top-left':
        return styles.closeButtonTopLeft;
      case 'bottom-right':
        return styles.closeButtonBottomRight;
      case 'bottom-left':
        return styles.closeButtonBottomLeft;
      case 'top-right':
      default:
        return styles.closeButtonTopRight;
    }
  };

  // Render close button if enabled
  const renderCloseButton = () => {
    if (!showCloseButton) {
      return null;
    }

    return (
      <TouchableOpacity
        style={[styles.closeButton, getCloseButtonPositionStyle()]}
        onPress={onDismiss}
        testID="overlay-close-button">
        {closeButtonContent ? (
          closeButtonContent
        ) : (
          <Text style={styles.closeButtonText}>✕</Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      onRequestClose={handleBackPress}
      statusBarTranslucent={true}
      animationType="none"
      testID={testID}>
      <View style={styles.container}>
        <View style={[styles.backdrop, backdropStyle]} />

        <Animated.View
          style={[
            styles.contentContainer,
            getPositionStyle(),
            getAnimationStyle(),
            contentContainerStyle,
          ]}>
          {blockContentTouches ? (
            <TouchableOpacity style={styles.contentTouchable} activeOpacity={1}>
              {children}
            </TouchableOpacity>
          ) : (
            children
          )}
          {renderCloseButton()}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'white',
  },
  contentContainer: {
    width: '100%',
    maxWidth: rs(500), // Responsive size
    borderRadius: rs(16),
    overflow: 'hidden',
  },
  contentTouchable: {
    width: '100%',
  },
  centerPosition: {
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  topPosition: {
    position: 'absolute',
    top: rs(20),
    alignSelf: 'center',
  },
  bottomPosition: {
    position: 'absolute',
    bottom: rs(20),
    alignSelf: 'center',
  },
  closeButton: {
    position: 'absolute',
    width: rs(36),
    height: rs(36),
    borderRadius: rs(18),
    backgroundColor: colors.neutral.black,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  closeButtonTopRight: {
    top: rs(10),
    right: rs(10),
  },
  closeButtonTopLeft: {
    top: rs(10),
    left: rs(10),
  },
  closeButtonBottomRight: {
    bottom: rs(10),
    right: rs(10),
  },
  closeButtonBottomLeft: {
    bottom: rs(10),
    left: rs(10),
  },
  closeButtonText: {
    fontSize: rs(16),
    color: 'white',
    fontWeight: 'bold',
  },
});
