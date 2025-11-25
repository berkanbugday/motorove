# Firebase Multi-Environment Quick Reference

## File Locations

### Android Config Files
- Dev: `android/app/src/dev/google-services.json`
- Staging: `android/app/src/staging/google-services.json`
- Prod: `android/app/src/prod/google-services.json`
- Generated: `android/app/google-services.json` (auto-generated during build)

### iOS Config Files
- Dev: `ios/Firebase/Dev/GoogleService-Info.plist`
- Staging: `ios/Firebase/Staging/GoogleService-Info.plist`
- Prod: `ios/Firebase/Prod/GoogleService-Info.plist`
- Generated: `ios/GoogleService-Info.plist` (auto-generated during build)

## Build Commands

### Android
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

### iOS
```bash
# Development (Debug)
xcodebuild -workspace ios/motorove.xcworkspace \
  -scheme motoroveDev \
  -configuration Debug

# Staging
xcodebuild -workspace ios/motorove.xcworkspace \
  -scheme motoroveStaging \
  -configuration Staging

# Production (Release)
xcodebuild -workspace ios/motorove.xcworkspace \
  -scheme motorove \
  -configuration Release
```

## Package Names / Bundle IDs

### Android Package Names
- Dev: `com.motorove.dev`
- Staging: `com.motorove.staging`
- Prod: `com.motorove`

### iOS Bundle IDs
- Dev: `com.motorove.dev`
- Staging: `com.motorove.staging`
- Prod: `com.motorove`

## Verification

### Check Android Config
```bash
# After building, check which config was used
cat android/app/google-services.json | grep project_id
```

### Check iOS Config
```bash
# After building, check which config was used
/usr/libexec/PlistBuddy -c "Print :PROJECT_ID" ios/GoogleService-Info.plist
```

## Troubleshooting Quick Fixes

1. **Android build fails**: Check `android/app/src/{flavor}/google-services.json` exists
2. **iOS build fails**: Run `chmod +x ios/scripts/copy-firebase-config.sh`
3. **Wrong Firebase project**: Verify you're using the correct build flavor/configuration
4. **Package/Bundle ID mismatch**: Update Firebase Console or config files to match

