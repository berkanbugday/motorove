# Toast Component

A customizable toast notification component with animated transitions and support for different types of messages.

## Features

- Custom React implementation without external libraries
- Multiple toast types: success, error, info, warning
- Smooth animations for showing and hiding toasts
- Top or bottom positioning
- Optional callback on press
- Automatic hiding with configurable duration
- Persistent toast option

## Usage

### Basic Usage with Provider

First, wrap your app with the `ToastProvider`:

```tsx
import {ToastProvider} from '@components/Toast';

// In your App component or root component
const App = () => {
  return <ToastProvider>{/* Your app content */}</ToastProvider>;
};
```

### Using the Hook (Recommended)

The recommended way to use toasts within React components is with the `useToast` hook:

```tsx
import {useToast} from '@components/Toast';

const MyComponent = () => {
  const {showToast, hideToast} = useToast();

  const handleButtonPress = () => {
    showToast({
      type: 'success',
      text1: 'Success!',
      text2: 'Your action was completed successfully.',
    });
  };

  return <Button title="Show Toast" onPress={handleButtonPress} />;
};
```

### Using Direct Functions

For scenarios where you can't use hooks (outside of React components), use the direct functions:

```tsx
import {showToast, hideToast} from '@components/Toast';

// Show a toast
showToast({
  type: 'error',
  position: 'bottom',
  text1: 'Error Occurred',
  text2: 'Please try again later.',
  visibilityTime: 4000,
  autoHide: true,
  onPress: () => {
    console.log('Toast pressed');
  },
});

// Hide a toast programmatically
hideToast();
```

### Default Import

Alternatively, you can use the default import:

```tsx
import Toast from '@components/Toast';

// Show a toast
Toast.show({
  type: 'info',
  text1: 'Information',
  text2: 'This is an informational message.',
});

// Hide a toast
Toast.hide();
```

## API Reference

### ToastProvider

The provider component that should be placed at the root of your app.

```tsx
<ToastProvider>{children}</ToastProvider>
```

### useToast()

A React hook to access toast functionality within components.

```tsx
const {showToast, hideToast} = useToast();
```

### showToast(config)

Shows a toast message with the specified configuration.

#### Parameters

| Name             | Type                                          | Default     | Description                                                      |
| ---------------- | --------------------------------------------- | ----------- | ---------------------------------------------------------------- |
| `type`           | `'success' \| 'error' \| 'info' \| 'warning'` | `'info'`    | The type of toast to display                                     |
| `position`       | `'top' \| 'bottom'`                           | `'top'`     | The position of the toast                                        |
| `text1`          | `string`                                      | `undefined` | The main text/title of the toast                                 |
| `text2`          | `string`                                      | `undefined` | The secondary text/description of the toast                      |
| `visibilityTime` | `number`                                      | `3000`      | Duration in milliseconds to show the toast                       |
| `autoHide`       | `boolean`                                     | `true`      | Whether to hide the toast automatically                          |
| `topOffset`      | `number`                                      | `60`        | Distance from the top of the screen when position is 'top'       |
| `bottomOffset`   | `number`                                      | `40`        | Distance from the bottom of the screen when position is 'bottom' |
| `onPress`        | `() => void`                                  | `undefined` | Function to call when the toast is pressed                       |
| `props`          | `object`                                      | `undefined` | Additional props to pass to the toast                            |

### hideToast()

Hides the currently displayed toast.

```tsx
hideToast();
```

## Examples

### Success Toast

```tsx
showToast({
  type: 'success',
  text1: 'Success!',
  text2: 'Your profile has been updated.',
});
```

### Error Toast

```tsx
showToast({
  type: 'error',
  text1: 'Error',
  text2: 'Failed to connect to the server.',
  position: 'bottom',
});
```

### Info Toast

```tsx
showToast({
  type: 'info',
  text1: 'New Message',
  text2: 'You have received a new message.',
});
```

### Warning Toast

```tsx
showToast({
  type: 'warning',
  text1: 'Warning',
  text2: 'Your session will expire in 5 minutes.',
  visibilityTime: 6000,
});
```

### Persistent Toast

```tsx
showToast({
  type: 'info',
  text1: 'Notice',
  text2: 'This toast will remain visible until dismissed.',
  autoHide: false,
});
```

### Toast with Callback

```tsx
showToast({
  type: 'success',
  text1: 'Tap Me',
  text2: 'Tap this toast to trigger an action.',
  onPress: () => {
    // Handle the press event
    console.log('Toast was pressed');
  },
});
```
