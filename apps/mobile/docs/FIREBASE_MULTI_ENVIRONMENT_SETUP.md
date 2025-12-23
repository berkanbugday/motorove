# Firebase Multi-Environment Setup Guide

This guide explains how to configure Firebase for multiple environments (dev, staging, prod) on both Android and iOS.

## Overview

The app supports three Firebase environments:
- **Development (dev)**: For local development and testing
- **Staging**: For pre-production testing
- **Production (prod)**: For live production app

Each environment uses a separate Firebase project with its own configuration files.

## Directory Structure

### Android
```
android/app/
├── google-services.json (generated during build)
└── src/
    ├── dev/
    │   └── google-services.json
    ├── staging/
    │   └── google-services.json
    └── prod/
        └── google-services.json
```

### iOS
```
ios/
├── GoogleService-Info.plist (generated during build)
├── Firebase/
│   ├── Dev/
│   │   └── GoogleService-Info.plist
│   ├── Staging/
│   │   └── GoogleService-Info.plist
│   └── Prod/
│       └── GoogleService-Info.plist
└── scripts/
    └── copy-firebase-config.sh
```

## Setup Instructions

### Step 1: Create Firebase Projects

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create three separate Firebase projects:
   - `motorove-dev` (or your dev project name)
   - `motorove-staging` (or your staging project name)
   - `motorove-prod` (or your prod project name)

### Step 2: Configure Android Apps

For each Firebase project, add an Android app:

#### Development
- Package name: `com.motorove.dev`
- Download `google-services.json` and place it in `android/app/src/dev/`

#### Staging
- Package name: `com.motorove.staging`
- Download `google-services.json` and place it in `android/app/src/staging/`

#### Production
- Package name: `com.motorove`
- Download `google-services.json` and place it in `android/app/src/prod/`

### Step 3: Configure iOS Apps

For each Firebase project, add an iOS app:

#### Development
- Bundle ID: `com.motorove.dev`
- Download `GoogleService-Info.plist` and place it in `ios/Firebase/Dev/`

#### Staging
- Bundle ID: `com.motorove.staging`
- Download `GoogleService-Info.plist` and place it in `ios/Firebase/Staging/`

#### Production
- Bundle ID: `com.motorove`
- Download `GoogleService-Info.plist` and place it in `ios/Firebase/Prod/`

### Step 4: Android Build Configuration

The Android build is already configured in `android/app/build.gradle`. The build system will automatically:
1. Detect the build flavor (dev, staging, or prod)
2. Copy the corresponding `google-services.json` from `src/{flavor}/` to the app root
3. The Google Services plugin will process the file during the build

**Build commands:**
```bash
# Development
cd android && ./gradlew assembleDevDebug
cd android && ./gradlew assembleDevRelease

# Staging
cd android && ./gradlew assembleStagingDebug
cd android && ./gradlew assembleStagingRelease

# Production
cd android && ./gradlew assembleProdDebug
cd android && ./gradlew assembleProdRelease
```

### Step 5: iOS Build Configuration

#### Option A: Using Xcode (Recommended)

1. Open `ios/motorove.xcworkspace` in Xcode
2. Select your target `motorove`
3. Go to **Build Phases**
4. Click **+** and select **New Run Script Phase**
5. Name it "Copy Firebase Config" (or similar)
6. **Important**: Drag this phase to run **before** "Copy Bundle Resources"
7. Add the following script:

```bash
"${SRCROOT}/scripts/copy-firebase-config.sh"
```

8. Make sure "Run script only when installing" is **unchecked**
9. Build configurations:
   - **Debug** → Uses `Firebase/Dev/GoogleService-Info.plist`
   - **Staging** → Uses `Firebase/Staging/GoogleService-Info.plist`
   - **Release** → Uses `Firebase/Prod/GoogleService-Info.plist`

#### Option B: Using Command Line

The script can also be run manually before building:

```bash
cd ios
./scripts/copy-firebase-config.sh
```

Then build with the appropriate configuration:
```bash
# Development (Debug)
xcodebuild -workspace motorove.xcworkspace \
  -scheme motoroveDev \
  -configuration Debug

# Staging
xcodebuild -workspace motorove.xcworkspace \
  -scheme motoroveStaging \
  -configuration Staging

# Production (Release)
xcodebuild -workspace motorove.xcworkspace \
  -scheme motorove \
  -configuration Release
```

### Step 6: Verify Configuration

#### Android
1. Build the app with a specific flavor
2. Check the build output for: `"Copied google-services.json from src/{flavor}/ for {variant}"`
3. Verify the `android/app/google-services.json` matches the expected environment

#### iOS
1. Build the app with a specific configuration
2. Check the build output for: `"Copied GoogleService-Info.plist from Firebase/{env}/"`
3. Verify the `ios/GoogleService-Info.plist` matches the expected environment

## Environment Variables

The app uses `react-native-config` for environment-specific variables. Make sure your `.env` files include Firebase configuration if needed:

```bash
# .env.dev
FIREBASE_API_KEY=your_dev_api_key
FIREBASE_PROJECT_ID=motorove-dev
FIREBASE_AUTH_DOMAIN=motorove-dev.firebaseapp.com
FIREBASE_MESSAGING_SENDER_ID=your_dev_sender_id
FIREBASE_APP_ID_IOS=your_dev_ios_app_id
FIREBASE_APP_ID_ANDROID=your_dev_android_app_id

# .env.staging
FIREBASE_API_KEY=your_staging_api_key
FIREBASE_PROJECT_ID=motorove-staging
# ... etc

# .env (production)
FIREBASE_API_KEY=your_prod_api_key
FIREBASE_PROJECT_ID=motorove-prod
# ... etc
```

**Note**: The native config files (`google-services.json` and `GoogleService-Info.plist`) are the primary source of truth for Firebase configuration. Environment variables are optional and mainly used for programmatic initialization if needed.

## Troubleshooting

### Android

**Issue**: Build fails with "google-services.json not found"
- **Solution**: Ensure the config file exists in `android/app/src/{flavor}/google-services.json`

**Issue**: Wrong Firebase project is being used
- **Solution**: Check that you're building with the correct flavor: `./gradlew assemble{Flavor}Debug`

**Issue**: Package name mismatch
- **Solution**: Verify the package name in `google-services.json` matches the `applicationId` in `build.gradle` for that flavor

### iOS

**Issue**: Script fails with "Firebase config file not found"
- **Solution**: Ensure the config file exists in `ios/Firebase/{Environment}/GoogleService-Info.plist`
- **Solution**: Check that the script has execute permissions: `chmod +x ios/scripts/copy-firebase-config.sh`

**Issue**: Wrong Firebase project is being used
- **Solution**: Verify you're building with the correct configuration (Debug/Staging/Release)
- **Solution**: Check the build output to see which config file was copied

**Issue**: Bundle ID mismatch
- **Solution**: Verify the Bundle ID in `GoogleService-Info.plist` matches the app's Bundle ID for that configuration

## Security Best Practices

1. **Never commit sensitive Firebase config files to public repositories**
   - Add to `.gitignore`:
     ```
     android/app/google-services.json
     ios/GoogleService-Info.plist
     ios/Firebase/**/GoogleService-Info.plist
     android/app/src/*/google-services.json
     ```

2. **Use Firebase App Check** to protect your backend resources

3. **Restrict API keys** in Firebase Console to specific app bundle IDs/package names

4. **Use environment-specific Firebase projects** to isolate data and prevent accidental production data access

## CI/CD Integration

### Android (GitHub Actions example)
```yaml
- name: Build Android APK
  run: |
    cd android
    ./gradlew assembleProdRelease
  env:
    ENVFILE: .env
```

### iOS (GitHub Actions example)
```yaml
- name: Build iOS
  run: |
    cd ios
    ./scripts/copy-firebase-config.sh
    xcodebuild -workspace motorove.xcworkspace \
      -scheme motorove \
      -configuration Release \
      -archivePath build/motorove.xcarchive \
      archive
  env:
    CONFIGURATION: Release
```

## Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [React Native Firebase](https://rnfirebase.io/)
- [Android Product Flavors](https://developer.android.com/studio/build/build-variants)
- [iOS Build Configurations](https://developer.apple.com/documentation/xcode/adding-a-build-configuration-file-to-your-project)

