# Firebase Crashlytics and Performance Monitoring

This document explains how to use Firebase Crashlytics and Performance Monitoring in the Motorove mobile app.

## Overview

Firebase Crashlytics and Performance Monitoring are automatically initialized when the app starts. The services are configured based on your environment settings:

- **Crashlytics**: Enabled when `CRASH_REPORTING_ENABLED=true` in your environment file
- **Performance**: Enabled when `ANALYTICS_ENABLED=true` in your environment file

## Setup

### Prerequisites

1. **Firebase Configuration Files**:

   - Android: Add `google-services.json` to `android/app/`
   - iOS: Add `GoogleService-Info.plist` to `ios/motorove/`

2. **Environment Variables**:
   Ensure your `.env` files include Firebase configuration:
   ```
   FIREBASE_API_KEY=your_api_key
   FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   FIREBASE_PROJECT_ID=your_project_id
   FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   FIREBASE_APP_ID_IOS=your_ios_app_id
   FIREBASE_APP_ID_ANDROID=your_android_app_id
   ```

### Native Setup

#### Android

1. The Google Services plugin is already configured in `android/build.gradle`
2. Ensure `google-services.json` is placed in `android/app/`
3. Run `cd android && ./gradlew clean` to ensure proper configuration

#### iOS

1. Run `cd ios && pod install` to install Firebase pods
2. Ensure `GoogleService-Info.plist` is added to your Xcode project
3. The Podfile already includes Crashlytics and Performance pods

## Usage

### Import the Service

```typescript
import {firebaseService} from '@services/firebase.service';
```

### Crashlytics

#### Log Custom Messages

```typescript
// Log a custom message (useful for debugging)
firebaseService.log('User navigated to Profile screen');
```

#### Record Non-Fatal Errors

```typescript
try {
  // Your code that might throw
  await someAsyncOperation();
} catch (error) {
  // Record error to Crashlytics
  firebaseService.recordError(error, 'AsyncOperationError');

  // Also handle the error normally
  console.error('Operation failed:', error);
}
```

#### Set User Identifier

Call this when a user logs in to track crashes by user:

```typescript
// When user logs in
await firebaseService.setUserId(user.id);

// When user logs out
await firebaseService.setUserId('anonymous');
```

#### Set Custom Attributes

Add custom attributes to help filter crashes:

```typescript
await firebaseService.setUserAttribute('user_type', 'premium');
await firebaseService.setUserAttribute('subscription_status', 'active');
```

### Performance Monitoring

#### Track Custom Traces

Measure the performance of specific operations:

```typescript
// Start a trace
const trace = firebaseService.startTrace('load_user_profile');

if (trace) {
  try {
    // Your operation
    await loadUserProfile();

    // Stop the trace
    await trace.stop();
  } catch (error) {
    // Stop trace even on error
    await trace.stop();
    throw error;
  }
}
```

#### Track HTTP Requests

Monitor API call performance:

```typescript
import {firebaseService} from '@services/firebase.service';
import {FirebasePerformanceTypes} from '@react-native-firebase/perf';

const httpMetric = firebaseService.startHttpMetric(
  'https://api.example.com/users',
  FirebasePerformanceTypes.HttpMethod.GET,
);

if (httpMetric) {
  try {
    const response = await fetch('https://api.example.com/users');
    httpMetric.setHttpResponseCode(response.status);
    httpMetric.setResponseContentType(
      response.headers.get('content-type') || '',
    );
    await httpMetric.stop();
  } catch (error) {
    await httpMetric.stop();
    throw error;
  }
}
```

#### Add Custom Attributes to Traces

```typescript
const trace = firebaseService.startTrace('search_operation');

if (trace) {
  trace.putAttribute('search_term', 'motorcycle');
  trace.putAttribute('filter_type', 'price');

  // Your operation
  await performSearch();

  await trace.stop();
}
```

## Integration with Error Service

You can integrate Crashlytics with the existing error service:

```typescript
import {errorService} from '@services/error.service';
import {firebaseService} from '@services/firebase.service';

try {
  // Your code
} catch (error) {
  // Record to Crashlytics
  firebaseService.recordError(error, 'OperationError');

  // Handle with error service
  await errorService.handleError(error, ErrorType.API, {
    showToast: true,
    logToSentry: true,
  });
}
```

## Testing

### Test Crashlytics

To test that Crashlytics is working, you can force a crash:

```typescript
import crashlytics from '@react-native-firebase/crashlytics';

// Force a test crash (only in development!)
if (__DEV__) {
  crashlytics().crash();
}
```

### Test Performance Monitoring

Performance traces will automatically appear in the Firebase Console after a few minutes. You can verify they're being sent by checking the Firebase Performance dashboard.

## Best Practices

1. **Don't Over-Log**: Only log meaningful events and errors
2. **Use Meaningful Names**: Use descriptive names for traces (e.g., `load_user_profile` instead of `trace1`)
3. **Set User ID Early**: Set the user ID as soon as the user logs in
4. **Handle Errors Gracefully**: Always handle errors in your code; Crashlytics is for reporting, not error handling
5. **Performance Traces**: Only trace operations that take significant time (>100ms) to avoid noise

## Environment-Specific Behavior

- **Development**: Both services are enabled if configured, but you may want to disable them for faster development
- **Staging**: Both services should be enabled to catch issues before production
- **Production**: Both services should be enabled for monitoring real user issues

## Troubleshooting

### Crashlytics Not Working

1. Verify `CRASH_REPORTING_ENABLED=true` in your environment file
2. Check that `google-services.json` (Android) or `GoogleService-Info.plist` (iOS) is properly configured
3. Ensure Firebase project has Crashlytics enabled in Firebase Console
4. Check logs for initialization errors

### Performance Monitoring Not Working

1. Verify `ANALYTICS_ENABLED=true` in your environment file
2. Check that Firebase Performance is enabled in Firebase Console
3. Wait a few minutes for data to appear in the dashboard
4. Ensure you're stopping traces properly (they won't be recorded if not stopped)

### Build Errors

- **Android**: Ensure Google Services plugin is applied in `android/app/build.gradle`
- **iOS**: Run `pod install` in the `ios` directory after adding new Firebase packages

## Additional Resources

- [Firebase Crashlytics Documentation](https://firebase.google.com/docs/crashlytics)
- [Firebase Performance Monitoring Documentation](https://firebase.google.com/docs/perf-mon)
- [React Native Firebase Documentation](https://rnfirebase.io/)
