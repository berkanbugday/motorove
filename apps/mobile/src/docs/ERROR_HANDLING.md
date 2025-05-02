# Error Handling and Logging System

This document describes the comprehensive error handling and logging system implemented in the mobile app.

## Overview

The error handling system provides:

1. Centralized error handling through services
2. Integration with Sentry for error logging and monitoring
3. Network connectivity monitoring
4. User-friendly error messages via Toast notifications
5. Error boundaries for component-level error handling
6. Utilities for consistent error management

## Components of the System

### 1. Error Service (`error.service.ts`)

The core service responsible for handling and displaying errors:

- Categorizes errors by type (network, API, validation, etc.)
- Automatically detects network errors
- Displays user-friendly error messages
- Integrates with Sentry for error tracking

```typescript
// Example usage
import {errorService, ErrorType} from '@services/error.service';

try {
  // Some code that might throw an error
} catch (error) {
  errorService.handleError(error, ErrorType.API, {
    showToast: true,
    logToSentry: true,
    context: {additionalInfo: 'some context'},
    fallbackMessage: 'Custom error message',
  });
}
```

### 2. Logging Service (`logging.service.ts`)

Provides structured logging capabilities:

- Sends logs to Sentry with proper categorization and context
- Supports different log levels (debug, info, warning, error, fatal)
- Allows adding breadcrumbs for tracking user actions
- Provides user and context tracking

```typescript
// Example usage
import {loggingService} from '@services/logging.service';

loggingService.info('User viewed profile screen', {userId: '123'});
loggingService.error('Failed to fetch data', error, {endpoint: '/api/data'});
```

### 3. Network Service (`network.service.ts`)

Monitors network connectivity:

- Provides real-time network status updates
- Notifies listeners of connectivity changes
- Shows appropriate messages when connectivity changes

```typescript
// Example usage
import {networkService} from '@services/network.service';

// Check current network status
const isConnected = networkService.isNetworkConnected();

// Subscribe to network changes
const unsubscribe = networkService.addListener(connected => {
  if (connected) {
    // Network is available
  } else {
    // Network is unavailable
  }
});

// Remember to unsubscribe
unsubscribe();
```

### 4. Error Boundary (`ErrorBoundary.tsx`)

React component that catches and handles errors in the component tree:

- Prevents app crashes from unhandled errors
- Logs errors to Sentry
- Displays fallback UI when errors occur
- Allows recovery from errors

```tsx
// Example usage
import ErrorBoundary from '@components/ErrorBoundary';

const MyScreen = () => (
  <ErrorBoundary>
    <MyComponent />
  </ErrorBoundary>
);
```

### 5. Network Status Bar (`NetworkStatusBar.tsx`)

Visual indicator for network status:

- Appears when the device is offline
- Animates in/out based on connectivity changes
- Customizable appearance

```tsx
// Example usage
import NetworkStatusBar from '@components/NetworkAware';

const MyScreen = () => (
  <>
    <NetworkStatusBar offlineMessage="No internet connection" />
    <MyComponent />
  </>
);
```

### 6. Error Handling Hook (`useErrorHandler.ts`)

React hook for using error handling in functional components:

- Provides error handling functions
- Wraps async functions with error handling
- Shows toast messages

```tsx
// Example usage
import {useErrorHandler} from '@hooks/useErrorHandler';

const MyComponent = () => {
  const {handleError, showSuccessToast, withErrorHandling} = useErrorHandler();

  // Wrap an async function with error handling
  const fetchData = withErrorHandling(
    async () => {
      const data = await api.getData();
      return data;
    },
    {
      errorType: ErrorType.API,
      successMessage: 'Data loaded successfully',
      onSuccess: result => {
        // Do something with the result
      },
    },
  );

  return <Button onPress={fetchData} title="Fetch Data" />;
};
```

### 7. HOC for Error Handling (`withErrorHandling.tsx`)

Higher-order component that wraps screens or components with error handling:

- Adds error boundary
- Includes network status bar
- Logs component lifecycle events

```tsx
// Example usage
import withErrorHandling from '@components/withErrorHandling';

const MyScreen = () => {
  // Component implementation
};

export default withErrorHandling(MyScreen, {
  componentName: 'MyScreen',
  withNetworkStatus: true,
  offlineMessage: 'You are offline',
});
```

## Best Practices

1. **Always handle errors in async operations:**

```typescript
try {
  await someAsyncOperation();
} catch (error) {
  handleError(error);
}
```

2. **Use the appropriate error type:**

```typescript
handleError(error, ErrorType.AUTHENTICATION);
```

3. **Provide helpful context:**

```typescript
handleError(error, ErrorType.API, {
  context: {endpoint: '/api/users', params: {id: 123}},
});
```

4. **Use error boundaries for UI components:**

```tsx
<ErrorBoundary>
  <ComplexComponent />
</ErrorBoundary>
```

5. **Wrap screens with the HOC for consistent error handling:**

```tsx
export default withErrorHandling(MyScreen);
```

## Example Implementation

See the `ErrorHandlingExample.tsx` screen for a demonstration of all error handling features.

## Sentry Integration

The app uses Sentry for error monitoring. Configure the DSN in the environment variables:

```
SENTRY_DSN=https://your-sentry-dsn
```

## Toast Messages

Toast messages are used to display user-friendly error notifications. The system automatically shows toasts for errors, but you can also display them manually:

```typescript
import {errorService} from '@services/error.service';

errorService.showErrorToast('Something went wrong');
errorService.showSuccessToast('Operation completed successfully');
errorService.showInfoToast('Information message');
```
