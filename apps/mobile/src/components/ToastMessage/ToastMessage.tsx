import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Animated,
  Dimensions,
  ViewStyle,
  PanResponder,
  PanResponderInstance,
} from 'react-native';
import {colors} from '@theme/colors';
import {Typography} from '@components/Typography';
import {Icon, IconName} from '@components/Icon';
import {getShadow} from '@theme/shadows';
import {radius} from '@theme/radius';
import {spacing} from '@theme/spacing';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastConfig {
  type: ToastType;
  position?: 'top' | 'bottom';
  text1?: string;
  text2?: string;
  visibilityTime?: number;
  autoHide?: boolean;
  topOffset?: number;
  bottomOffset?: number;
  onPress?: () => void;
  props?: object;
  swipeable?: boolean;
  showCloseButton?: boolean;
}

// Global reference to store toast functions
type ToastFunctions = {
  showToast: (config: ToastConfig) => void;
  hideToast: () => void;
};

const toastFunctions: Partial<ToastFunctions> = {};

// Create context for toast state management
interface ToastContextType {
  showToast: (config: ToastConfig) => void;
  hideToast: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Hook to use toast within components
export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

const getToastIcon = (type: ToastType): {name: IconName; color: string} => {
  switch (type) {
    case 'success':
      return {
        name: 'check',
        color: colors.status.success,
      };
    case 'error':
      return {
        name: 'error-filled',
        color: colors.status.error,
      };
    case 'info':
      return {
        name: 'bell-filled',
        color: colors.status.info,
      };
    case 'warning':
      return {
        name: 'bell-exclamation-filled',
        color: colors.status.warning,
      };
    default:
      return {
        name: 'bell-filled',
        color: colors.status.info,
      };
  }
};

const getToastBackgroundColor = (type: ToastType) => {
  switch (type) {
    case 'success':
      return colors.neutral.white;
    case 'error':
      return colors.neutral.white;
    case 'info':
      return colors.neutral.white;
    case 'warning':
      return colors.neutral.white;
    default:
      return colors.neutral.white;
  }
};

const getToastBorderColor = (type: ToastType) => {
  switch (type) {
    case 'success':
      return colors.status.success;
    case 'error':
      return colors.status.error;
    case 'info':
      return colors.status.info;
    case 'warning':
      return colors.status.warning;
    default:
      return colors.status.info;
  }
};

const {height: SCREEN_HEIGHT} = Dimensions.get('window');

// Swipe threshold to consider a successful swipe
const SWIPE_THRESHOLD = SCREEN_HEIGHT * 0.1; // 10% of screen height

// Static styles created outside component to prevent useInsertionEffect warnings
const toastStyles = StyleSheet.create({
  baseContainer: {
    position: 'absolute',
    left: '5%',
    width: '90%',
    borderRadius: radius.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 5,
    zIndex: 9999,
  },
  iconContainer: {
    marginRight: spacing.sm,
  },
  contentContainer: {
    flex: 1,
    marginRight: spacing.sm,
  },
  closeButton: {
    padding: spacing.xs,
  },
  touchableContent: {
    flexDirection: 'row',
    flex: 1,
  },
  text2Spacing: {
    marginTop: spacing.xs,
  },
});

export const CustomToastComponent: React.FC<{
  text1?: string;
  text2?: string;
  type?: ToastType;
  onPress?: () => void;
  onHide: () => void;
  position: 'top' | 'bottom';
  topOffset?: number;
  bottomOffset?: number;
  swipeable?: boolean;
  showCloseButton?: boolean;
}> = ({
  text1,
  text2,
  type = 'info',
  onPress,
  onHide,
  position,
  topOffset = 60,
  bottomOffset = 40,
  swipeable = true,
  showCloseButton = false,
}) => {
  const translateYAnim = useRef(
    new Animated.Value(position === 'top' ? -100 : 100),
  ).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const swipeAnim = useRef(new Animated.Value(0)).current;

  const hideToast = useCallback(() => {
    Animated.parallel([
      Animated.timing(translateYAnim, {
        toValue: position === 'top' ? -100 : 100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onHide();
    });
  }, [translateYAnim, opacityAnim, onHide, position]);

  // Handle swipe to dismiss
  const panResponder: PanResponderInstance = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => swipeable,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only capture vertical gestures that match the position
        if (position === 'top') {
          // For top toasts, only respond to upward swipes
          return swipeable && gestureState.dy < -5;
        } else {
          // For bottom toasts, only respond to downward swipes
          return swipeable && gestureState.dy > 5;
        }
      },
      onPanResponderMove: (_, gestureState) => {
        // For top toasts, only allow upward movement (negative dy)
        // For bottom toasts, only allow downward movement (positive dy)
        if (
          (position === 'top' && gestureState.dy < 0) ||
          (position === 'bottom' && gestureState.dy > 0)
        ) {
          swipeAnim.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        // Check if swipe was strong enough based on position
        const swipeDistance = Math.abs(gestureState.dy);
        const correctDirection =
          (position === 'top' && gestureState.dy < 0) ||
          (position === 'bottom' && gestureState.dy > 0);

        if (correctDirection && swipeDistance > SWIPE_THRESHOLD) {
          // Swipe was strong enough in the correct direction, dismiss the toast
          Animated.timing(swipeAnim, {
            toValue: position === 'top' ? -SCREEN_HEIGHT : SCREEN_HEIGHT,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            onHide();
          });
        } else {
          // Swipe was not strong enough or in wrong direction, snap back
          Animated.spring(swipeAnim, {
            toValue: 0,
            tension: 100,
            friction: 10,
            useNativeDriver: true,
          }).start();
        }
      },
    }),
  ).current;

  useEffect(() => {
    // Animate in
    Animated.parallel([
      Animated.timing(translateYAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    return () => {
      // Cleanup animation
      translateYAnim.setValue(position === 'top' ? -100 : 100);
      opacityAnim.setValue(0);
      swipeAnim.setValue(0);
    };
  }, [translateYAnim, opacityAnim, swipeAnim, position]);

  const icon = getToastIcon(type);

  // Dynamic styles as inline object to avoid StyleSheet.create in render
  const containerStyle: ViewStyle = {
    ...toastStyles.baseContainer,
    [position]: position === 'top' ? topOffset : bottomOffset,
    backgroundColor: getToastBackgroundColor(type),
    borderLeftColor: getToastBorderColor(type),
    ...getShadow('large'),
  };

  return (
    <Animated.View
      {...(swipeable ? panResponder.panHandlers : {})}
      style={[
        containerStyle,
        {
          transform: [{translateY: Animated.add(translateYAnim, swipeAnim)}],
          opacity: opacityAnim,
        },
      ]}>
      <TouchableOpacity
        activeOpacity={onPress ? 0.7 : 1}
        onPress={onPress}
        style={toastStyles.touchableContent}>
        <View style={toastStyles.iconContainer}>
          <Icon name={icon.name} color={icon.color} size={24} />
        </View>
        <View style={toastStyles.contentContainer}>
          {text1 ? (
            <Typography
              variant="subtitle"
              weight="medium"
              color={colors.neutral.black}>
              {text1}
            </Typography>
          ) : null}
          {text2 ? (
            <Typography
              variant="bodySmall"
              color={colors.neutral.grey}
              style={text1 ? toastStyles.text2Spacing : undefined}>
              {text2}
            </Typography>
          ) : null}
        </View>
      </TouchableOpacity>
      {showCloseButton && (
        <TouchableOpacity style={toastStyles.closeButton} onPress={hideToast}>
          <Icon name="close" color={colors.neutral.grey} size={16} />
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

/**
 * Toast provider component to be placed at the root of your app
 */
export const ToastProvider: React.FC<{children: React.ReactNode}> = ({
  children,
}) => {
  const [toast, setToast] = useState<ToastConfig | null>(null);
  const [visible, setVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const hideToast = useCallback(() => {
    setVisible(false);

    // Clear any existing timeouts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const showToast = useCallback(
    (config: ToastConfig) => {
      // Use setTimeout to defer state updates and prevent useInsertionEffect errors
      setTimeout(() => {
        // Hide existing toast first
        hideToast();

        // Set the new toast config
        setToast(config);
        setVisible(true);

        // Auto-hide if enabled
        if (config.autoHide !== false) {
          const visibilityTime = config.visibilityTime || 4000;
          timeoutRef.current = setTimeout(() => {
            hideToast();
          }, visibilityTime);
        }
      }, 0);
    },
    [hideToast],
  );

  // Update the global toast functions using useLayoutEffect to prevent timing issues
  useLayoutEffect(() => {
    toastFunctions.showToast = showToast;
    toastFunctions.hideToast = hideToast;

    return () => {
      // Clean up when provider unmounts
      toastFunctions.showToast = undefined;
      toastFunctions.hideToast = undefined;
    };
  }, [showToast, hideToast]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Define onHide as a separate callback to prevent issues with useInsertionEffect
  const handleToastHide = useCallback(() => {
    setVisible(false);
  }, []);

  return (
    <ToastContext.Provider value={{showToast, hideToast}}>
      {children}
      {visible && toast && (
        <CustomToastComponent
          text1={toast.text1}
          text2={toast.text2}
          type={toast.type}
          onPress={toast.onPress}
          onHide={handleToastHide}
          position={toast.position || 'top'}
          topOffset={toast.topOffset}
          bottomOffset={toast.bottomOffset}
          swipeable={toast.swipeable !== false}
        />
      )}
    </ToastContext.Provider>
  );
};

/**
 * Show a toast message
 * @param params Toast configuration
 */
export const showToast = (config: ToastConfig) => {
  if (toastFunctions.showToast) {
    toastFunctions.showToast(config);
  } else {
    console.error('Toast error: ToastProvider not found in component tree.');
  }
};

/**
 * Hide the currently displayed toast
 */
export const hideToast = () => {
  if (toastFunctions.hideToast) {
    toastFunctions.hideToast();
  } else {
    console.error('Toast error: ToastProvider not found in component tree.');
  }
};

// For direct import
export default {
  show: (config: ToastConfig) => {
    if (toastFunctions.showToast) {
      toastFunctions.showToast(config);
    } else {
      console.error('Toast error: ToastProvider not found in component tree.');
    }
  },
  hide: () => {
    if (toastFunctions.hideToast) {
      toastFunctions.hideToast();
    } else {
      console.error('Toast error: ToastProvider not found in component tree.');
    }
  },
  Provider: ToastProvider,
};
