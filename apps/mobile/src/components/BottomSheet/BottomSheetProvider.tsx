import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  ReactNode,
} from 'react';
import {StyleProp, ViewStyle} from 'react-native';
import BottomSheet, {BottomSheetRef} from './BottomSheet';

export type BottomSheetContentType = ReactNode;

export interface BottomSheetConfig {
  content: BottomSheetContentType;
  snapPoint?: 'minimal' | 'partial' | 'full';
  onClose?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  backDropOpacity?: number;
  showBackdrop?: boolean;
  closeOnBackdropPress?: boolean;
  enableGestureControl?: boolean;
  disableContentGestures?: boolean;
  maxContentHeight?: number;
  header?: ReactNode;
  headerStyle?: StyleProp<ViewStyle>;
  footer?: ReactNode;
  footerStyle?: StyleProp<ViewStyle>;
  hideHandle?: boolean;
  showCloseButton?: boolean;
  closeButtonPosition?:
    | 'top-right'
    | 'top-left'
    | 'header-left'
    | 'header-right';
  closeButtonOffset?: {top?: number; left?: number; right?: number};
  title?: string;
  subtitle?: string;
  titlePosition?: 'left' | 'center' | 'right';
}

// Global reference to store BottomSheet functions
type BottomSheetFunctions = {
  openBottomSheet: (config: BottomSheetConfig) => void;
  closeBottomSheet: () => void;
};

const bottomSheetFunctions: Partial<BottomSheetFunctions> = {};

// Create context for bottom sheet state management
interface BottomSheetContextType {
  openBottomSheet: (config: BottomSheetConfig) => void;
  closeBottomSheet: () => void;
}

const BottomSheetContext = createContext<BottomSheetContextType | undefined>(
  undefined,
);

// Hook to use bottom sheet within components
export const useBottomSheet = (): BottomSheetContextType => {
  const context = useContext(BottomSheetContext);
  if (!context) {
    throw new Error('useBottomSheet must be used within a BottomSheetProvider');
  }
  return context;
};

/**
 * BottomSheet provider component to be placed at the root of your app
 */
export const BottomSheetProvider: React.FC<{children: React.ReactNode}> = ({
  children,
}) => {
  const [bottomSheetConfig, setBottomSheetConfig] =
    useState<BottomSheetConfig | null>(null);
  const [visible, setVisible] = useState(false);
  const bottomSheetRef = useRef<BottomSheetRef>(null);

  const closeBottomSheet = useCallback(() => {
    if (bottomSheetRef.current) {
      bottomSheetRef.current.close();
    }

    // The onClose callback from the configuration will be called by the BottomSheet component
  }, []);

  const openBottomSheet = useCallback((config: BottomSheetConfig) => {
    // Set the bottom sheet config
    setBottomSheetConfig(config);
    setVisible(true);

    // Use setTimeout to ensure the bottom sheet is rendered before calling open
    setTimeout(() => {
      if (bottomSheetRef.current) {
        bottomSheetRef.current.open(config.snapPoint);
      }
    }, 0);
  }, []);

  // Update the global bottom sheet functions
  React.useEffect(() => {
    bottomSheetFunctions.openBottomSheet = openBottomSheet;
    bottomSheetFunctions.closeBottomSheet = closeBottomSheet;

    return () => {
      // Clean up when provider unmounts
      bottomSheetFunctions.openBottomSheet = undefined;
      bottomSheetFunctions.closeBottomSheet = undefined;
    };
  }, [openBottomSheet, closeBottomSheet]);

  const handleClose = useCallback(() => {
    setVisible(false);
    if (bottomSheetConfig?.onClose) {
      bottomSheetConfig.onClose();
    }
  }, [bottomSheetConfig]);

  return (
    <BottomSheetContext.Provider value={{openBottomSheet, closeBottomSheet}}>
      {children}
      {visible && bottomSheetConfig && (
        <BottomSheet
          ref={bottomSheetRef}
          initialSnap="closed"
          onClose={handleClose}
          containerStyle={bottomSheetConfig.containerStyle}
          contentStyle={bottomSheetConfig.contentStyle}
          backDropOpacity={bottomSheetConfig.backDropOpacity}
          showBackdrop={bottomSheetConfig.showBackdrop ?? true}
          closeOnBackdropPress={bottomSheetConfig.closeOnBackdropPress ?? true}
          enableGestureControl={bottomSheetConfig.enableGestureControl ?? true}
          disableContentGestures={
            bottomSheetConfig.disableContentGestures ?? true
          }
          maxContentHeight={bottomSheetConfig.maxContentHeight}
          header={bottomSheetConfig.header}
          headerStyle={bottomSheetConfig.headerStyle}
          footer={bottomSheetConfig.footer}
          footerStyle={bottomSheetConfig.footerStyle}
          hideHandle={bottomSheetConfig.hideHandle}
          showCloseButton={bottomSheetConfig.showCloseButton}
          closeButtonPosition={bottomSheetConfig.closeButtonPosition}
          closeButtonOffset={bottomSheetConfig.closeButtonOffset}
          title={bottomSheetConfig.title}
          subtitle={bottomSheetConfig.subtitle}
          titlePosition={bottomSheetConfig.titlePosition}>
          {bottomSheetConfig.content}
        </BottomSheet>
      )}
    </BottomSheetContext.Provider>
  );
};

/**
 * Open a bottom sheet
 * @param config Bottom sheet configuration
 */
export const openBottomSheet = (config: BottomSheetConfig) => {
  if (bottomSheetFunctions.openBottomSheet) {
    bottomSheetFunctions.openBottomSheet(config);
  } else {
    console.error(
      'BottomSheet error: BottomSheetProvider not found in component tree.',
    );
  }
};

/**
 * Close the currently displayed bottom sheet
 */
export const closeBottomSheet = () => {
  if (bottomSheetFunctions.closeBottomSheet) {
    bottomSheetFunctions.closeBottomSheet();
  } else {
    console.error(
      'BottomSheet error: BottomSheetProvider not found in component tree.',
    );
  }
};

// For direct import
export default {
  open: (config: BottomSheetConfig) => {
    if (bottomSheetFunctions.openBottomSheet) {
      bottomSheetFunctions.openBottomSheet(config);
    } else {
      console.error(
        'BottomSheet error: BottomSheetProvider not found in component tree.',
      );
    }
  },
  close: () => {
    if (bottomSheetFunctions.closeBottomSheet) {
      bottomSheetFunctions.closeBottomSheet();
    } else {
      console.error(
        'BottomSheet error: BottomSheetProvider not found in component tree.',
      );
    }
  },
  Provider: BottomSheetProvider,
};
