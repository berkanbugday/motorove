# BottomSheet Component

A flexible bottom sheet component for React Native with gesture control, multiple snap points, and a context-based provider pattern for easy use throughout the application.

## Features

- 📱 Two snap positions: partial and full height
- 🖐 Gesture control with swipe to close
- 🎭 Backdrop with customizable opacity
- 🔄 Context-based provider pattern for easy access
- 🎬 Animated opening and closing
- 📄 Dynamic content support
- 🎚️ Control via direct imports or hook
- 🧩 Flexible content rendering

## Installation

The BottomSheet component is integrated into the application. To use it:

1. Ensure the `BottomSheetProvider` is included in your app root (typically in `App.tsx`)
2. Import the necessary components or hooks in your files

## Basic Usage

### Using Direct Imports

```tsx
import React from 'react';
import {View, Button, Text} from 'react-native';
import {openBottomSheet, closeBottomSheet} from '@components/BottomSheet';

const MyComponent = () => {
  const handleOpenBottomSheet = () => {
    openBottomSheet({
      content: (
        <View>
          <Text>My Bottom Sheet Content</Text>
          <Button title="Close" onPress={() => closeBottomSheet()} />
        </View>
      ),
      snapPoint: 'partial', // or 'full'
    });
  };

  return (
    <View>
      <Button title="Open Bottom Sheet" onPress={handleOpenBottomSheet} />
    </View>
  );
};
```

### Using the Hook

```tsx
import React from 'react';
import {View, Button, Text} from 'react-native';
import {useBottomSheet} from '@components/BottomSheet';

const MyComponent = () => {
  const {openBottomSheet, closeBottomSheet} = useBottomSheet();

  const handleOpenBottomSheet = () => {
    openBottomSheet({
      content: (
        <View>
          <Text>My Bottom Sheet Content</Text>
          <Button title="Close" onPress={() => closeBottomSheet()} />
        </View>
      ),
      snapPoint: 'full',
    });
  };

  return (
    <View>
      <Button title="Open Bottom Sheet" onPress={handleOpenBottomSheet} />
    </View>
  );
};
```

## API Reference

### BottomSheetConfig

Properties you can pass when opening a bottom sheet:

| Property               | Type                 | Default    | Description                                      |
| ---------------------- | -------------------- | ---------- | ------------------------------------------------ |
| content                | ReactNode            | (required) | Content to render inside the bottom sheet        |
| snapPoint              | 'partial' \| 'full'  | 'partial'  | Initial height of the bottom sheet               |
| onClose                | () => void           | undefined  | Callback when the bottom sheet is closed         |
| containerStyle         | StyleProp<ViewStyle> | undefined  | Additional styles for the bottom sheet container |
| contentStyle           | StyleProp<ViewStyle> | undefined  | Additional styles for the content container      |
| backDropOpacity        | number               | 0.7        | Opacity of the backdrop                          |
| showBackdrop           | boolean              | true       | Whether to show the backdrop                     |
| closeOnBackdropPress   | boolean              | true       | Whether to close on backdrop press               |
| enableGestureControl   | boolean              | true       | Whether to enable gesture controls               |
| disableContentGestures | boolean              | false      | Whether to disable gestures on content           |
| maxContentHeight       | number               | undefined  | Override the dynamic content height calculation  |

### Functions

| Function                | Description                                         |
| ----------------------- | --------------------------------------------------- |
| openBottomSheet(config) | Opens the bottom sheet with the given configuration |
| closeBottomSheet()      | Closes the currently open bottom sheet              |

### Hook

```tsx
const {openBottomSheet, closeBottomSheet} = useBottomSheet();
```

## Integration with App.tsx

The BottomSheetProvider should be included in your App.tsx:

```tsx
import React from 'react';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import BottomSheetProvider from '@components/BottomSheet/BottomSheetProvider';
import {YourApp} from './YourApp';

const App = () => {
  return (
    <SafeAreaProvider>
      <BottomSheetProvider.Provider>
        <YourApp />
      </BottomSheetProvider.Provider>
    </SafeAreaProvider>
  );
};

export default App;
```
