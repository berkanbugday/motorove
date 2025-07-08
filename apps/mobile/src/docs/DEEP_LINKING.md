# Deep Linking in Motorove Mobile App

This document explains how deep linking is configured and how to use it in the Motorove mobile app.

## Deep Link Structure

The app supports two types of deep links:

1. **Custom URL Scheme**: `motorove://`
2. **Universal Links** (iOS) / **App Links** (Android): `https://motorove.app/`

## Supported Deep Links

### Reset Password

- Custom scheme: `motorove://reset-password/:token`
- Universal/App link: `https://motorove.app/reset-password/:token`

## Configuration

### iOS Configuration

Deep linking is configured in the following files:

- `app.json`: Defines the scheme and host
- `Info.plist`: Contains the URL types configuration
- `RootNavigator.tsx`: Handles deep link routing in the app

### Android Configuration

- `app.json`: Defines the scheme and host
- `AndroidManifest.xml`: Contains the intent filter configurations
- `RootNavigator.tsx`: Handles deep link routing in the app

## Environment-Specific Bundle IDs

The app supports different bundle IDs based on the environment:

- **Development**: `com.motorove.dev`
- **Staging**: `com.motorove.staging`
- **Production**: `com.motorove.app`

To switch between environments, use the following npm scripts:

```bash
# Set to development environment
npm run set-env:dev

# Set to staging environment
npm run set-env:staging

# Set to production environment
npm run set-env:prod
```

These scripts update the `app.json` file with the appropriate bundle ID for the selected environment.

## Testing Deep Links

### Testing on iOS Simulator

```bash
xcrun simctl openurl booted "motorove://update-password/some-token"
```

### Testing on Android Emulator

```bash
adb shell am start -W -a android.intent.action.VIEW -d "motorove://update-password/some-token" com.motorove.dev
```

Replace `com.motorove.app` with the appropriate package name for your environment (e.g., `com.motorove.dev` for development).

### Testing Universal/App Links

To test universal links, you can open Safari or Chrome and navigate to:

```
https://motorove.app/reset-password/some-token
```

## Troubleshooting

### iOS

1. Verify URL schemes in Info.plist
2. Check that the app's Associated Domains capability is enabled
3. Verify the deep link handler in RootNavigator.tsx

### Android

1. Verify intent filters in AndroidManifest.xml
2. Ensure the package name matches the one in your environment
3. Check the deep link handler in RootNavigator.tsx

## Implementation Details

The deep linking is implemented using React Navigation's linking configuration in `RootNavigator.tsx`. It maps URL patterns to specific screens in the app.

For the password reset functionality, when a user clicks on a reset password link, they are directed to the UpdatePassword screen with the token from the URL.
