# Floating Action Button (FAB) Component

A comprehensive, reusable Floating Action Button component for React Native that supports multiple variants, sizes, positions, and animations.

## Features

- Multiple visual variants (primary, secondary, success, error, custom)
- Multiple sizes (small, medium, large)
- Multiple shapes (circle, extended with label)
- Flexible positioning (bottom-right, bottom-left, top-right, top-left, or custom coordinates)
- Animation support (scale, fade, none)
- Shadow customization
- Accessibility support
- FAB Group (speed dial) support

## Basic Usage

```tsx
import React from 'react';
import {View} from 'react-native';
import {FAB} from '../components';
import {Icon} from '../components/Icon';

const MyScreen = () => {
  return (
    <View style={{flex: 1}}>
      {/* Content of your screen */}

      {/* Basic FAB */}
      <FAB
        icon={<Icon name="plus" />}
        onPress={() => console.log('FAB pressed')}
      />
    </View>
  );
};

export default MyScreen;
```

## Variants

```tsx
// Primary variant (default)
<FAB
  icon={<Icon name="plus" />}
  onPress={() => {}}
  variant="primary"
/>

// Secondary variant
<FAB
  icon={<Icon name="plus" />}
  onPress={() => {}}
  variant="secondary"
/>

// Success variant
<FAB
  icon={<Icon name="check" />}
  onPress={() => {}}
  variant="success"
/>

// Error variant
<FAB
  icon={<Icon name="close" />}
  onPress={() => {}}
  variant="error"
/>

// Custom variant with custom background color
<FAB
  icon={<Icon name="plus" />}
  onPress={() => {}}
  variant="custom"
  backgroundColor="#8A2BE2" // Purple color
  color="#FFFFFF" // White text/icon color
/>
```

## Sizes

```tsx
// Small size
<FAB
  icon={<Icon name="plus" />}
  onPress={() => {}}
  size="small"
/>

// Medium size (default)
<FAB
  icon={<Icon name="plus" />}
  onPress={() => {}}
  size="medium"
/>

// Large size
<FAB
  icon={<Icon name="plus" />}
  onPress={() => {}}
  size="large"
/>
```

## Shapes

```tsx
// Circle shape (default)
<FAB
  icon={<Icon name="plus" />}
  onPress={() => {}}
  shape="circle"
/>

// Extended shape with label
<FAB
  icon={<Icon name="plus" />}
  label="Create"
  onPress={() => {}}
  shape="extended"
/>
```

## Positions

```tsx
// Bottom right (default)
<FAB
  icon={<Icon name="plus" />}
  onPress={() => {}}
  position="bottomRight"
/>

// Bottom left
<FAB
  icon={<Icon name="plus" />}
  onPress={() => {}}
  position="bottomLeft"
/>

// Top right
<FAB
  icon={<Icon name="plus" />}
  onPress={() => {}}
  position="topRight"
/>

// Top left
<FAB
  icon={<Icon name="plus" />}
  onPress={() => {}}
  position="topLeft"
/>

// Custom position
<FAB
  icon={<Icon name="plus" />}
  onPress={() => {}}
  position="custom"
  customPosition={{
    bottom: 100,
    right: 20,
  }}
/>
```

## Animations

```tsx
// Scale animation (default)
<FAB
  icon={<Icon name="plus" />}
  onPress={() => {}}
  animationType="scale"
  visible={isVisible}
/>

// Fade animation
<FAB
  icon={<Icon name="plus" />}
  onPress={() => {}}
  animationType="fade"
  visible={isVisible}
/>

// No animation
<FAB
  icon={<Icon name="plus" />}
  onPress={() => {}}
  animationType="none"
  visible={isVisible}
/>
```

## Shadow Customization

```tsx
// Default shadow
<FAB
  icon={<Icon name="plus" />}
  onPress={() => {}}
  shadow={true}
/>

// No shadow
<FAB
  icon={<Icon name="plus" />}
  onPress={() => {}}
  shadow={false}
/>

// Small shadow
<FAB
  icon={<Icon name="plus" />}
  onPress={() => {}}
  shadow="small"
/>

// Medium shadow
<FAB
  icon={<Icon name="plus" />}
  onPress={() => {}}
  shadow="medium"
/>

// Large shadow
<FAB
  icon={<Icon name="plus" />}
  onPress={() => {}}
  shadow="large"
/>
```

## FAB Group (Speed Dial)

```tsx
import React, {useState} from 'react';
import {View} from 'react-native';
import {FABGroup} from '../components';
import {Icon} from '../components/Icon';

const MyScreen = () => {
  const [open, setOpen] = useState(false);

  return (
    <View style={{flex: 1}}>
      {/* Content of your screen */}

      {/* FAB Group (Speed Dial) */}
      <FABGroup
        open={open}
        onStateChange={setOpen}
        mainFAB={{
          icon: <Icon name="plus" />,
        }}
        actions={[
          {
            icon: <Icon name="pen" />,
            label: 'Edit',
            onPress: () => console.log('Edit pressed'),
            backgroundColor: '#4CAF50', // Green
          },
          {
            icon: <Icon name="trash" />,
            label: 'Delete',
            onPress: () => console.log('Delete pressed'),
            backgroundColor: '#F44336', // Red
          },
          {
            icon: <Icon name="share" />,
            label: 'Share',
            onPress: () => console.log('Share pressed'),
            backgroundColor: '#2196F3', // Blue
          },
        ]}
      />
    </View>
  );
};

export default MyScreen;
```

## Props

### FAB Props

| Prop               | Type                                                         | Default       | Description                                  |
| ------------------ | ------------------------------------------------------------ | ------------- | -------------------------------------------- |
| icon               | ReactNode                                                    | Required      | Icon to display in the FAB                   |
| label              | string                                                       | -             | Text label for extended FAB variant          |
| onPress            | () => void                                                   | Required      | Function to call when FAB is pressed         |
| onLongPress        | () => void                                                   | -             | Function to call when FAB is long pressed    |
| position           | 'bottomRight', 'bottomLeft', 'topRight', 'topLeft', 'custom' | 'bottomRight' | Position of the FAB on the screen            |
| customPosition     | {bottom?, top?, left?, right?}                               | -             | Custom position coordinates for the FAB      |
| size               | 'small', 'medium', 'large'                                   | 'medium'      | Size variant of the FAB                      |
| shape              | 'circle', 'extended'                                         | 'circle'      | Shape variant of the FAB                     |
| variant            | 'primary', 'secondary', 'success', 'error', 'custom'         | 'primary'     | Visual variant of the FAB                    |
| backgroundColor    | string                                                       | -             | Custom background color for the FAB          |
| color              | string                                                       | -             | Custom text/icon color for the FAB           |
| disabled           | boolean                                                      | false         | Whether the FAB is disabled                  |
| shadow             | boolean, 'small', 'medium', 'large'                          | true          | Whether to show a shadow under the FAB       |
| animationType      | 'scale', 'fade', 'none'                                      | 'scale'       | Type of animation to use when showing/hiding |
| visible            | boolean                                                      | true          | Whether the FAB is visible                   |
| style              | StyleProp<ViewStyle>                                         | -             | Additional styles for the FAB container      |
| labelStyle         | StyleProp<TextStyle>                                         | -             | Additional styles for the FAB label          |
| testID             | string                                                       | -             | Test ID for testing                          |
| accessibilityLabel | string                                                       | -             | Accessibility label for screen readers       |

### FABGroup Props

| Prop           | Type                                                         | Default              | Description                                            |
| -------------- | ------------------------------------------------------------ | -------------------- | ------------------------------------------------------ |
| mainFAB        | Omit<FABProps, 'onPress'>                                    | Required             | Main FAB props                                         |
| actions        | Array<{icon, label?, onPress, ...}>                          | Required             | Array of actions/FABs to show in the speed dial        |
| open           | boolean                                                      | false                | Whether the FAB group is open                          |
| onStateChange  | (open: boolean) => void                                      | -                    | Function to call when the open state changes           |
| position       | 'bottomRight', 'bottomLeft', 'topRight', 'topLeft', 'custom' | 'bottomRight'        | Position of the FAB group                              |
| customPosition | {bottom?, top?, left?, right?}                               | -                    | Custom position coordinates for the FAB group          |
| showLabels     | boolean                                                      | true                 | Whether to show labels next to actions                 |
| showBackdrop   | boolean                                                      | true                 | Whether to show a backdrop when the speed dial is open |
| backdropStyle  | StyleProp<ViewStyle>                                         | -                    | Style for the backdrop                                 |
| backdropColor  | string                                                       | 'rgba(0, 0, 0, 0.4)' | Color for the backdrop                                 |
| style          | StyleProp<ViewStyle>                                         | -                    | Additional styles for the FAB group container          |
| testID         | string                                                       | -                    | Test ID for testing                                    |
