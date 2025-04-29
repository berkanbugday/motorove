# Fastlane Setup

This directory contains Fastlane configuration for automated builds and deployments.

## Environment Setup

Create the following environment files in the `fastlane` directory:

### .env.dev

```
# Common variables
APP_NAME="motorove"

# iOS specific
IOS_APP_IDENTIFIER="com.motorove.app.dev"
IOS_SCHEME="motoroveDev"
IOS_WORKSPACE="ios/motorove.xcworkspace"
IOS_CONFIGURATION="Debug"
IOS_EXPORT_METHOD="development"

# Match (code signing)
MATCH_GIT_URL="your_certificates_repo_url_here"
MATCH_KEYCHAIN_NAME="login.keychain"
MATCH_KEYCHAIN_PASSWORD=""  # Set in CI system or local setup

# Android specific
ANDROID_KEYSTORE_PATH="android/app/keystores/motorove-dev.keystore"
ANDROID_KEYSTORE_PASSWORD=""  # Set in CI system or local setup
ANDROID_KEY_ALIAS="motorove-dev"
ANDROID_KEY_PASSWORD=""  # Set in CI system or local setup
ANDROID_VERSION_CODE=""  # Dynamically set during build
ANDROID_VERSION_NAME=""  # Dynamically set during build

# Firebase
FIREBASE_IOS_APP_ID="your_firebase_ios_app_id_here"
FIREBASE_ANDROID_APP_ID="your_firebase_android_app_id_here"
FIREBASE_TEST_GROUPS="testers,developers"

# CI specific
SKIP_GIT_CLEAN_CHECK="false"
CI="false"
```

### .env.staging

```
# Common variables
APP_NAME="motorove"

# iOS specific
IOS_APP_IDENTIFIER="com.motorove.app.staging"
IOS_SCHEME="motoroveStaging"
IOS_WORKSPACE="ios/motorove.xcworkspace"
IOS_CONFIGURATION="Release"
IOS_EXPORT_METHOD="app-store"

# Match (code signing)
MATCH_GIT_URL="your_certificates_repo_url_here"
MATCH_KEYCHAIN_NAME="login.keychain"
MATCH_KEYCHAIN_PASSWORD=""  # Set in CI system or local setup

# Android specific
ANDROID_KEYSTORE_PATH="android/app/keystores/motorove-staging.keystore"
ANDROID_KEYSTORE_PASSWORD=""  # Set in CI system or local setup
ANDROID_KEY_ALIAS="motorove-staging"
ANDROID_KEY_PASSWORD=""  # Set in CI system or local setup
ANDROID_VERSION_CODE=""  # Dynamically set during build
ANDROID_VERSION_NAME=""  # Dynamically set during build
ANDROID_TRACK="beta"  # production, beta, alpha, internal
ANDROID_RELEASE_STATUS="completed"

# Firebase
FIREBASE_IOS_APP_ID="your_firebase_ios_app_id_here"
FIREBASE_ANDROID_APP_ID="your_firebase_android_app_id_here"
FIREBASE_TEST_GROUPS="testers,stakeholders"

# Google Play
GOOGLE_PLAY_JSON_KEY_PATH="path/to/google-play-api-key.json"

# CI specific
SKIP_GIT_CLEAN_CHECK="false"
CI="false"
```

### .env.prod

```
# Common variables
APP_NAME="motorove"

# iOS specific
IOS_APP_IDENTIFIER="com.motorove.app"
IOS_SCHEME="motorove"
IOS_WORKSPACE="ios/motorove.xcworkspace"
IOS_CONFIGURATION="Release"
IOS_EXPORT_METHOD="app-store"

# Match (code signing)
MATCH_GIT_URL="your_certificates_repo_url_here"
MATCH_KEYCHAIN_NAME="login.keychain"
MATCH_KEYCHAIN_PASSWORD=""  # Set in CI system or local setup

# Android specific
ANDROID_KEYSTORE_PATH="android/app/keystores/motorove.keystore"
ANDROID_KEYSTORE_PASSWORD=""  # Set in CI system or local setup
ANDROID_KEY_ALIAS="motorove"
ANDROID_KEY_PASSWORD=""  # Set in CI system or local setup
ANDROID_VERSION_CODE=""  # Dynamically set during build
ANDROID_VERSION_NAME=""  # Dynamically set during build
ANDROID_TRACK="prod"  # prod, beta, alpha, internal
ANDROID_RELEASE_STATUS="completed"  # completed, draft, halted, inProgress

# Firebase
FIREBASE_IOS_APP_ID="your_firebase_ios_app_id_here"
FIREBASE_ANDROID_APP_ID="your_firebase_android_app_id_here"
FIREBASE_TEST_GROUPS="stakeholders"

# Google Play
GOOGLE_PLAY_JSON_KEY_PATH="path/to/google-play-api-key.json"

# CI specific
SKIP_GIT_CLEAN_CHECK="false"
CI="false"
```

## Usage Examples

### iOS

Build for dev:

```
bundle exec fastlane ios build env:dev
```

Deploy to TestFlight:

```
bundle exec fastlane ios deploy_testflight env:staging
```

Release to App Store:

```
bundle exec fastlane ios release_appstore env:prod
```

### Android

Build for dev:

```
bundle exec fastlane android build env:dev
```

Deploy to Play Store Beta:

```
bundle exec fastlane android deploy_play_beta env:staging
```

Release to Play Store:

```
bundle exec fastlane android release_playstore env:prod
```

### Cross-platform

Bump version numbers:

```
bundle exec fastlane bump_version
```

## Gemfile

Make sure the Gemfile includes the required gems:

```ruby
gem 'fastlane', '~> 2.219.0'
gem 'fastlane-plugin-firebase_app_distribution'
gem 'dotenv'
```

## Plugins

Install the Firebase App Distribution plugin:

```
bundle exec fastlane add_plugin firebase_app_distribution
```
